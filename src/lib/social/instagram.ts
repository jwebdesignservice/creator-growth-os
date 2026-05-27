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

    // Step 4: persist back to social_accounts.
    const providerData = {
      ...(row.provider_data ?? {}),
      ig_business_account_id: igUserId,
      page_id: pageWithIg.id,
      page_name: pageWithIg.name,
      page_access_token: pageToken,
      profile_picture_url: profile.profile_picture_url ?? null,
      media_count: profile.media_count ?? null,
      follows_count: profile.follows_count ?? null,
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

    // Step 5: upsert a performance_entries row for the current week so
    // the KPI tiles auto-update. We only fill `followers` here; other
    // metrics (reach, engagement) are left to manual entry until we
    // hook up the IG insights endpoint.
    if (followers !== null) {
      await svc.from("performance_entries").upsert(
        {
          user_id: userId,
          week_start: currentMonday(),
          followers,
        },
        { onConflict: "user_id,week_start" },
      );
    }

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
