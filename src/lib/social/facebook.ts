// Facebook Pages sync.
//
// Once OAuth has stored a user access token in social_accounts, this
// module:
//   1. Exchanges short-lived → long-lived (~60-day) user token.
//   2. Calls /me/accounts to enumerate the user's Facebook Pages.
//   3. Picks the Page with the largest fan_count (cheapest "primary"
//      heuristic — store all of them in provider_data for future
//      selectors).
//   4. Fetches the Page's name, fan_count (followers), picture.
//   5. Calls /{page_id}/insights for the current week to pull:
//        - page_impressions_unique → "reach"
//        - page_post_engagements   → total engagement actions
//          (likes + comments + shares + reactions across all posts)
//   6. Counts posts published this week from /me/posts.
//   7. Writes back to social_accounts + upserts performance_entries
//      with platform='facebook' so the dashboard aggregates IG + FB
//      cleanly via the multi-platform query layer.

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientCredentials, PROVIDERS } from "./providers";

const GRAPH = "https://graph.facebook.com/v18.0";

type FbPage = {
  id: string;
  name: string;
  access_token: string;
  fan_count?: number;
  picture?: { data?: { url?: string } };
};

type InsightsResponse = {
  data?: Array<{
    name: string;
    period?: string;
    total_value?: { value: number };
    values?: Array<{ value: number; end_time?: string }>;
  }>;
  error?: { message?: string; code?: number; type?: string };
};

type PostsResponse = {
  data?: Array<{ id: string; created_time: string }>;
};

/** YYYY-MM-DD of the Monday of the current ISO week. */
function currentMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon, …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function exchangeForLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  expires_in?: number;
} | null> {
  const creds = getClientCredentials(PROVIDERS.facebook);
  if (!creds) return null;
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", creds.clientId);
  url.searchParams.set("client_secret", creds.clientSecret);
  url.searchParams.set("fb_exchange_token", shortToken);
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as { access_token: string; expires_in?: number };
}

/**
 * Pull the user's managed Pages with fan_count + picture + page token.
 * Returns sorted by fan_count desc so the "primary" Page is index 0.
 */
async function fetchPages(userToken: string): Promise<FbPage[]> {
  const url = new URL(`${GRAPH}/me/accounts`);
  url.searchParams.set("access_token", userToken);
  url.searchParams.set(
    "fields",
    "id,name,access_token,fan_count,picture.type(large)",
  );
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`me/accounts failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { data?: FbPage[] };
  const pages = body.data ?? [];
  return [...pages].sort((a, b) => (b.fan_count ?? 0) - (a.fan_count ?? 0));
}

async function fetchPageInsights(
  pageId: string,
  pageToken: string,
  sinceMs: number,
  untilMs: number,
): Promise<
  | { ok: true; reach: number; engagementActions: number }
  | { ok: false; status: number; metaMessage: string | null }
> {
  const url = new URL(`${GRAPH}/${pageId}/insights`);
  url.searchParams.set("metric", "page_impressions_unique,page_post_engagements");
  url.searchParams.set("metric_type", "total_value");
  url.searchParams.set("period", "day");
  url.searchParams.set("since", String(Math.floor(sinceMs / 1000)));
  url.searchParams.set("until", String(Math.floor(untilMs / 1000)));
  url.searchParams.set("access_token", pageToken);

  const res = await fetch(url);
  const text = await res.text();
  let parsed: InsightsResponse = {};
  try {
    parsed = JSON.parse(text) as InsightsResponse;
  } catch {
    // ignore — handled below
  }
  if (!res.ok) {
    console.warn(
      "[facebook-sync] insights HTTP",
      res.status,
      parsed.error?.message ?? text.slice(0, 300),
    );
    return {
      ok: false,
      status: res.status,
      metaMessage: parsed.error?.message ?? null,
    };
  }

  let reach = 0;
  let engagementActions = 0;
  for (const entry of parsed.data ?? []) {
    const total =
      entry.total_value?.value ??
      (entry.values ?? []).reduce((acc, v) => acc + (v.value ?? 0), 0);
    if (entry.name === "page_impressions_unique") reach = total;
    if (entry.name === "page_post_engagements") engagementActions = total;
  }
  return { ok: true, reach, engagementActions };
}

/** Count posts published by the Page within [since, until]. */
async function countPostsInWindow(
  pageId: string,
  pageToken: string,
  sinceMs: number,
  untilMs: number,
): Promise<number> {
  const url = new URL(`${GRAPH}/${pageId}/posts`);
  url.searchParams.set("fields", "id,created_time");
  url.searchParams.set("since", String(Math.floor(sinceMs / 1000)));
  url.searchParams.set("until", String(Math.floor(untilMs / 1000)));
  url.searchParams.set("limit", "100");
  url.searchParams.set("access_token", pageToken);

  const res = await fetch(url);
  if (!res.ok) {
    console.warn("[facebook-sync] posts fetch failed:", res.status);
    return 0;
  }
  const body = (await res.json()) as PostsResponse;
  return (body.data ?? []).length;
}

export async function syncFacebookAccount(
  userId: string,
): Promise<
  | { ok: true; followerCount: number | null }
  | { ok: false; error: string }
> {
  const svc = createServiceClient();

  // Mark syncing for the UI's optimistic state.
  await svc
    .from("social_accounts")
    .update({ sync_status: "syncing", sync_error: null })
    .eq("user_id", userId)
    .eq("platform", "facebook");

  const { data: row, error: rowErr } = await svc
    .from("social_accounts")
    .select("access_token, refresh_token, provider_data")
    .eq("user_id", userId)
    .eq("platform", "facebook")
    .maybeSingle();

  if (rowErr || !row?.access_token) {
    const error = rowErr?.message ?? "No Facebook connection found.";
    await markFailed(userId, error);
    return { ok: false, error };
  }

  try {
    // 1. Long-lived token (~60 days).
    const longLived = await exchangeForLongLivedToken(row.access_token);
    let userToken = row.access_token;
    let tokenExpiresAt: string | null = null;
    if (longLived?.access_token) {
      userToken = longLived.access_token;
      tokenExpiresAt = longLived.expires_in
        ? new Date(Date.now() + longLived.expires_in * 1000).toISOString()
        : null;
    }

    // 2. Pages the user manages, sorted by fan_count desc.
    const pages = await fetchPages(userToken);
    if (pages.length === 0) {
      throw new Error(
        "No Facebook Pages found on this account. Create or join a Page in your Facebook settings to enable analytics.",
      );
    }
    const primary = pages[0];
    const pageToken = primary.access_token;

    // 3. Profile fields.
    const followers = primary.fan_count ?? null;
    const handle = primary.name;
    const pictureUrl = primary.picture?.data?.url ?? null;
    const profileUrl = `https://facebook.com/${primary.id}`;

    // 4. Insights for the current week.
    const weekStart = new Date(`${currentMonday()}T00:00:00Z`).getTime();
    const now = Date.now();
    const insightsResult = await fetchPageInsights(
      primary.id,
      pageToken,
      weekStart,
      now,
    );
    const insights = insightsResult.ok ? insightsResult : null;

    // 5. Posts this week.
    const postsThisWeek = await countPostsInWindow(
      primary.id,
      pageToken,
      weekStart,
      now,
    );

    // 6. Engagement rate: total engagement actions / followers * 100.
    let engagementRate: number | null = null;
    if (insights && followers && followers > 0 && insights.engagementActions > 0) {
      engagementRate = Math.min(
        100,
        (insights.engagementActions / followers) * 100,
      );
    }

    // 7. Persist to social_accounts.
    const providerData = {
      ...(row.provider_data ?? {}),
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        fan_count: p.fan_count ?? 0,
      })),
      primary_page_id: primary.id,
      primary_page_name: primary.name,
      page_access_token: pageToken,
      picture_url: pictureUrl,
      insights_last_status: insightsResult.ok
        ? insightsResult.reach === 0 && insightsResult.engagementActions === 0
          ? "No reach yet this week — will populate as your Page has activity."
          : "ok"
        : insightsResult.status === 400
          ? "Insights data unavailable — Meta API rejected the request."
          : insightsResult.status === 403 || insightsResult.status === 401
            ? "Insights access denied — try reconnecting Facebook."
            : `Insights temporarily unavailable (HTTP ${insightsResult.status}).`,
      insights_last_checked_at: new Date().toISOString(),
    };

    await svc
      .from("social_accounts")
      .update({
        access_token: userToken,
        token_expires_at: tokenExpiresAt,
        provider_user_id: primary.id,
        handle,
        display_name: primary.name,
        profile_url: profileUrl,
        follower_count: followers ?? 0,
        provider_data: providerData,
        last_synced_at: new Date().toISOString(),
        sync_status: "idle",
        sync_error: null,
      })
      .eq("user_id", userId)
      .eq("platform", "facebook");

    // 8. performance_entries for this week, platform='facebook'.
    const entryUpdates: Record<string, unknown> = {
      user_id: userId,
      week_start: currentMonday(),
      platform: "facebook",
    };
    if (followers !== null) entryUpdates.followers = followers;
    if (insights?.reach != null) entryUpdates.reach = insights.reach;
    if (postsThisWeek > 0) entryUpdates.posts_published = postsThisWeek;
    if (engagementRate !== null) {
      entryUpdates.engagement_rate = Number(engagementRate.toFixed(2));
    }

    await svc
      .from("performance_entries")
      .upsert(entryUpdates, { onConflict: "user_id,week_start,platform" });

    return { ok: true, followerCount: followers };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[facebook-sync] failed:", message);
    await markFailed(userId, message);
    return { ok: false, error: message };
  }
}

async function markFailed(userId: string, error: string): Promise<void> {
  const svc = createServiceClient();
  await svc
    .from("social_accounts")
    .update({
      sync_status: "error",
      sync_error: error.slice(0, 500),
    })
    .eq("user_id", userId)
    .eq("platform", "facebook");
}
