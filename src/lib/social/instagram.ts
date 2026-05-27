// Instagram Graph API sync.
//
// Once the OAuth flow has stored a user access token in social_accounts,
// this module:
//   1. Exchanges the short-lived token for a long-lived one (~60 days).
//   2. Calls GET /me/accounts to enumerate the user's Facebook Pages.
//   3. Picks the first Page that has a linked Instagram Business Account.
//   4. Fetches the Instagram profile (username, followers, media count)
//      and writes it back to social_accounts.
//   5. Upserts a performance_entries row for the current week so the
//      Performance page KPI tiles auto-populate from real data.
//
// Errors are caught and stored on social_accounts.sync_error so the UI
// can surface them. The sync_status column reflects in-flight state.

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientCredentials, PROVIDERS } from "./providers";

const GRAPH = "https://graph.facebook.com/v18.0";

type FbPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
};

type IgProfile = {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
};

/** Compute Monday of the current ISO week as YYYY-MM-DD. */
function currentMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon, …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/**
 * Exchange a short-lived user access token for a long-lived one.
 * Long-lived tokens last ~60 days; short-lived ones last ~1 hour.
 * Idempotent — passing a long-lived token returns another long-lived one.
 */
async function exchangeForLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  expires_in?: number;
} | null> {
  const creds = getClientCredentials(PROVIDERS.instagram);
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

async function fetchPages(userToken: string): Promise<FbPage[]> {
  const url = new URL(`${GRAPH}/me/accounts`);
  url.searchParams.set("access_token", userToken);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`me/accounts failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { data?: FbPage[] };
  return body.data ?? [];
}

async function fetchIgProfile(igUserId: string, pageToken: string): Promise<IgProfile> {
  const url = new URL(`${GRAPH}/${igUserId}`);
  url.searchParams.set(
    "fields",
    "id,username,name,profile_picture_url,followers_count,follows_count,media_count",
  );
  url.searchParams.set("access_token", pageToken);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`IG profile fetch failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as IgProfile;
}

// ── Account-level insights (reach, profile views) ─────────────────────
//
// Graph API v22+ requires `metric_type=total_value` for many account
// insights (incl. profile_views), and the response format switched from
// a `values: [{value, end_time}]` array to a single `total_value: {value}`.
// We request total_value for both metrics so the call works on both v18
// and v22+ behavior.

type InsightsResponse = {
  data?: Array<{
    name: string;
    period?: string;
    total_value?: { value: number };
    values?: Array<{ value: number; end_time?: string }>;
  }>;
  error?: { message?: string; code?: number; type?: string };
};

type InsightsResult =
  | { ok: true; reach: number; profileViews: number }
  | { ok: false; metaMessage: string | null; status: number };

async function fetchInsightsTotals(
  igUserId: string,
  pageToken: string,
  sinceMs: number,
  untilMs: number,
): Promise<InsightsResult> {
  const url = new URL(`${GRAPH}/${igUserId}/insights`);
  url.searchParams.set("metric", "reach,profile_views");
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
    // fall through with empty parsed
  }

  if (!res.ok) {
    const metaMessage = parsed.error?.message ?? null;
    // Full body to server logs only — never to the UI.
    console.warn(
      "[instagram-sync] insights HTTP",
      res.status,
      metaMessage ?? text.slice(0, 300),
    );
    return { ok: false, status: res.status, metaMessage };
  }

  let reach = 0;
  let profileViews = 0;
  for (const entry of parsed.data ?? []) {
    // Prefer total_value (v22+ shape) but fall back to summing daily
    // values for forward+backward compatibility.
    const total =
      entry.total_value?.value ??
      (entry.values ?? []).reduce((acc, v) => acc + (v.value ?? 0), 0);
    if (entry.name === "reach") reach = total;
    if (entry.name === "profile_views") profileViews = total;
  }
  return { ok: true, reach, profileViews };
}

// ── Recent media for engagement + post count ─────────────────────────

type MediaItem = {
  id: string;
  timestamp: string; // ISO8601
  like_count?: number;
  comments_count?: number;
  media_type?: string;
};

/**
 * Fetch the most recent 25 media posts (Instagram's default page size).
 * Used to compute engagement rate + how many posts went up this week.
 * Returns [] on failure so a media-less account doesn't break the sync.
 */
async function fetchRecentMedia(
  igUserId: string,
  pageToken: string,
): Promise<MediaItem[]> {
  const url = new URL(`${GRAPH}/${igUserId}/media`);
  url.searchParams.set(
    "fields",
    "id,timestamp,like_count,comments_count,media_type",
  );
  url.searchParams.set("limit", "25");
  url.searchParams.set("access_token", pageToken);

  const res = await fetch(url);
  if (!res.ok) {
    console.warn("[instagram-sync] media fetch failed:", res.status, await res.text());
    return [];
  }
  const body = (await res.json()) as { data?: MediaItem[] };
  return body.data ?? [];
}

/**
 * Run a sync for the given user's Instagram connection. Updates
 * social_accounts in-place and upserts a performance_entries row.
 *
 * Returns { ok: true } on success or { ok: false, error: string } —
 * the error is also persisted to social_accounts.sync_error so the UI
 * can read it without an additional roundtrip.
 */
export async function syncInstagramAccount(
  userId: string,
): Promise<{ ok: true; followerCount: number | null } | { ok: false; error: string }> {
  const svc = createServiceClient();

  // Mark syncing for the UI's optimistic state.
  await svc
    .from("social_accounts")
    .update({ sync_status: "syncing", sync_error: null })
    .eq("user_id", userId)
    .eq("platform", "instagram");

  // Pull the existing row.
  const { data: row, error: rowErr } = await svc
    .from("social_accounts")
    .select("access_token, refresh_token, provider_data")
    .eq("user_id", userId)
    .eq("platform", "instagram")
    .maybeSingle();

  if (rowErr || !row?.access_token) {
    const error = rowErr?.message ?? "No Instagram connection found.";
    await markFailed(userId, error);
    return { ok: false, error };
  }

  try {
    // Step 1: long-lived token. We re-do this on every sync as Meta
    // accepts long→long exchanges and it simplifies the code path.
    const longLived = await exchangeForLongLivedToken(row.access_token);
    let userToken = row.access_token;
    let tokenExpiresAt: string | null = null;
    if (longLived?.access_token) {
      userToken = longLived.access_token;
      tokenExpiresAt = longLived.expires_in
        ? new Date(Date.now() + longLived.expires_in * 1000).toISOString()
        : null;
    }

    // Step 2: enumerate the Facebook Pages this user manages.
    const pages = await fetchPages(userToken);
    const pageWithIg = pages.find((p) => p.instagram_business_account?.id);
    if (!pageWithIg || !pageWithIg.instagram_business_account) {
      throw new Error(
        "No Instagram Business or Creator account linked to a Facebook Page was found. " +
          "Make sure your IG account is professional and linked to a Page in the Facebook Page Settings.",
      );
    }
    const igUserId = pageWithIg.instagram_business_account.id;
    const pageToken = pageWithIg.access_token;

    // Step 3: fetch IG profile.
    const profile = await fetchIgProfile(igUserId, pageToken);
    const followers = profile.followers_count ?? null;
    const handle = profile.username ?? null;
    const displayName = profile.name ?? null;
    const profileUrl = handle ? `https://instagram.com/${handle}` : null;

    // Step 5: aggregate this week's insights + media engagement.
    //
    // Window: start of current ISO week (Monday 00:00 local) → now.
    // Reach + profile_views come from /insights summed across days in
    // the window. Engagement_rate is computed from likes+comments on
    // media posted within the window divided by current follower count.
    const weekStart = new Date(`${currentMonday()}T00:00:00Z`).getTime();
    const now = Date.now();

    const insightsResult = await fetchInsightsTotals(igUserId, pageToken, weekStart, now);
    const insights = insightsResult.ok ? insightsResult : null;
    const media = await fetchRecentMedia(igUserId, pageToken);

    // Short, user-friendly diagnostic line. Raw API responses go to the
    // server console only (see fetchInsightsTotals) — never to the UI.
    const insightsDiagnostic: string = insightsResult.ok
      ? insightsResult.reach === 0 && insightsResult.profileViews === 0
        ? "No reach yet this week — will populate as your account has activity."
        : "ok"
      : insightsResult.status === 400
        ? "Insights data unavailable — Meta API rejected the request."
        : insightsResult.status === 403 || insightsResult.status === 401
          ? "Insights access denied — try reconnecting Instagram."
          : `Insights temporarily unavailable (HTTP ${insightsResult.status}).`;

    // Posts published this week + their engagement totals.
    let postsThisWeek = 0;
    let likesThisWeek = 0;
    let commentsThisWeek = 0;
    for (const m of media) {
      const t = new Date(m.timestamp).getTime();
      if (t >= weekStart && t <= now) {
        postsThisWeek += 1;
        likesThisWeek += m.like_count ?? 0;
        commentsThisWeek += m.comments_count ?? 0;
      }
    }
    const engagement = likesThisWeek + commentsThisWeek;
    const engagementRate =
      followers && followers > 0 && engagement > 0
        ? Math.min(100, (engagement / followers) * 100)
        : null;

    // Step 6: persist everything back to social_accounts, including the
    // insights diagnostic so the UI can show it if reach is empty.
    const providerData = {
      ...(row.provider_data ?? {}),
      ig_business_account_id: igUserId,
      page_id: pageWithIg.id,
      page_name: pageWithIg.name,
      page_access_token: pageToken,
      profile_picture_url: profile.profile_picture_url ?? null,
      media_count: profile.media_count ?? null,
      follows_count: profile.follows_count ?? null,
      insights_last_status: insightsDiagnostic,
      insights_last_checked_at: new Date().toISOString(),
    };

    await svc
      .from("social_accounts")
      .update({
        access_token: userToken,
        token_expires_at: tokenExpiresAt,
        provider_user_id: igUserId,
        handle,
        display_name: displayName,
        profile_url: profileUrl,
        follower_count: followers ?? 0,
        provider_data: providerData,
        last_synced_at: new Date().toISOString(),
        sync_status: "idle",
        sync_error: null,
      })
      .eq("user_id", userId)
      .eq("platform", "instagram");

    // Step 7: upsert performance_entries with everything we got. Null
    // fields are omitted so we don't clobber any value the user has
    // already entered manually for that week.
    const entryUpdates: Record<string, unknown> = {
      user_id: userId,
      week_start: currentMonday(),
    };
    if (followers !== null) entryUpdates.followers = followers;
    if (insights?.reach != null) entryUpdates.reach = insights.reach;
    if (insights?.profileViews != null) entryUpdates.profile_visits = insights.profileViews;
    if (postsThisWeek > 0) entryUpdates.posts_published = postsThisWeek;
    if (engagementRate !== null) {
      // performance_entries.engagement_rate is numeric(5,2) — round to 2dp.
      entryUpdates.engagement_rate = Number(engagementRate.toFixed(2));
    }

    await svc
      .from("performance_entries")
      .upsert(entryUpdates, { onConflict: "user_id,week_start" });

    return { ok: true, followerCount: followers };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[instagram-sync] failed:", message);
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
    .eq("platform", "instagram");
}
