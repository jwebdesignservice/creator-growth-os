// TikTok Display API sync.
//
// After OAuth, social_accounts has:
//   access_token   → expires in ~24 hours
//   refresh_token  → ~365 days
// This module:
//   1. Refreshes the access token via /v2/oauth/token if expired
//      (TikTok uses `client_key` instead of the standard `client_id`).
//   2. GET /v2/user/info/ with fields=open_id,follower_count,
//      following_count,likes_count,video_count,etc. — the analytics
//      we get from `user.info.stats` scope.
//   3. Writes back to social_accounts + performance_entries.
//
// Limitation: without the video.list scope (separate review process),
// we only get TOTAL counts, not per-week breakdowns. So we populate
// followers + provider_data totals, but reach / engagement_rate /
// posts_published on performance_entries stay NULL until the user
// upgrades to partner-tier access.

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientCredentials, PROVIDERS } from "./providers";

const TIKTOK_OAUTH = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_INFO = "https://open.tiktokapis.com/v2/user/info/";

type UserInfoResponse = {
  data?: {
    user?: {
      open_id?: string;
      union_id?: string;
      avatar_url?: string;
      display_name?: string;
      bio_description?: string;
      profile_deep_link?: string;
      is_verified?: boolean;
      follower_count?: number;
      following_count?: number;
      likes_count?: number;
      video_count?: number;
    };
  };
  error?: { code?: string; message?: string };
};

function currentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<
  | { access_token: string; expires_in?: number; refresh_token?: string }
  | null
> {
  const creds = getClientCredentials(PROVIDERS.tiktok);
  if (!creds) return null;
  const body = new URLSearchParams({
    client_key: creds.clientId, // TikTok-specific
    client_secret: creds.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TIKTOK_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    console.warn(
      "[tiktok-sync] token refresh failed:",
      res.status,
      await res.text(),
    );
    return null;
  }
  return (await res.json()) as {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
  };
}

async function fetchUserInfo(accessToken: string): Promise<UserInfoResponse> {
  // Two-pass fetch: try the full field set (requires user.info.stats);
  // if TikTok rejects with scope_not_authorized (common in Sandbox or
  // while user.info.stats is pending review), fall back to the basic
  // fields that user.info.basic alone unlocks. This lets the sync
  // succeed end-to-end as soon as a user connects, even before TikTok
  // approves the stats scope.
  const STATS_FIELDS =
    "open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count";
  const BASIC_FIELDS =
    "open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified";

  const fetchWith = async (fields: string) => {
    const url = new URL(TIKTOK_USER_INFO);
    url.searchParams.set("fields", fields);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  };

  let resp = await fetchWith(STATS_FIELDS);
  // 401 with scope_not_authorized → retry without the stats fields.
  if (!resp.ok && resp.status === 401 && resp.text.includes("scope_not_authorized")) {
    resp = await fetchWith(BASIC_FIELDS);
  }
  if (!resp.ok) {
    throw new Error(`user/info failed: ${resp.status} ${resp.text.slice(0, 300)}`);
  }
  return JSON.parse(resp.text) as UserInfoResponse;
}

export async function syncTikTokAccount(
  userId: string,
): Promise<
  | { ok: true; followerCount: number | null }
  | { ok: false; error: string }
> {
  const svc = createServiceClient();

  await svc
    .from("social_accounts")
    .update({ sync_status: "syncing", sync_error: null })
    .eq("user_id", userId)
    .eq("platform", "tiktok");

  const { data: row, error: rowErr } = await svc
    .from("social_accounts")
    .select("access_token, refresh_token, token_expires_at, provider_data")
    .eq("user_id", userId)
    .eq("platform", "tiktok")
    .maybeSingle();

  if (rowErr || !row?.access_token) {
    const error = rowErr?.message ?? "No TikTok connection found.";
    await markFailed(userId, error);
    return { ok: false, error };
  }

  try {
    // 1. Refresh access token if close to expiry (60s buffer).
    let accessToken = row.access_token;
    let tokenExpiresAt = row.token_expires_at;
    let refreshToken = row.refresh_token;

    const expiry = row.token_expires_at
      ? new Date(row.token_expires_at).getTime()
      : 0;
    const needsRefresh = expiry && expiry - Date.now() < 60_000;
    if (needsRefresh && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (refreshed?.access_token) {
        accessToken = refreshed.access_token;
        tokenExpiresAt = refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
          : tokenExpiresAt;
        if (refreshed.refresh_token) {
          refreshToken = refreshed.refresh_token;
        }
      }
    }

    // 2. User info (snapshot stats).
    const info = await fetchUserInfo(accessToken);
    const user = info.data?.user;
    if (!user) {
      throw new Error(
        "TikTok user info missing — check scopes and account state.",
      );
    }

    const followers = user.follower_count ?? null;
    const totalLikes = user.likes_count ?? null;
    const totalVideos = user.video_count ?? null;
    const handle = user.display_name ?? null;
    const displayName = user.display_name ?? null;
    const pictureUrl = user.avatar_url ?? null;
    const profileUrl =
      user.profile_deep_link ?? (handle ? `https://tiktok.com/@${handle}` : null);

    // 3. Diagnostic for the UI.
    const insightsDiagnostic =
      totalVideos != null && totalVideos === 0
        ? "Account has no videos yet — post a TikTok to start tracking."
        : "ok";

    // 4. Persist to social_accounts.
    const providerData = {
      ...(row.provider_data ?? {}),
      open_id: user.open_id,
      union_id: user.union_id,
      total_likes: totalLikes,
      total_videos: totalVideos,
      following_count: user.following_count,
      is_verified: user.is_verified,
      picture_url: pictureUrl,
      insights_last_status: insightsDiagnostic,
      insights_last_checked_at: new Date().toISOString(),
    };

    await svc
      .from("social_accounts")
      .update({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        provider_user_id: user.open_id,
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
      .eq("platform", "tiktok");

    // 5. performance_entries(platform='tiktok') for the current week.
    // user.info.stats only gives lifetime totals — we cannot compute
    // per-week reach/engagement without video.list scope. Followers are
    // a current-state snapshot so they go in.
    const entryUpdates: Record<string, unknown> = {
      user_id: userId,
      week_start: currentMonday(),
      platform: "tiktok",
    };
    if (followers !== null) entryUpdates.followers = followers;

    await svc
      .from("performance_entries")
      .upsert(entryUpdates, { onConflict: "user_id,week_start,platform" });

    return { ok: true, followerCount: followers };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[tiktok-sync] failed:", message);
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
    .eq("platform", "tiktok");
}
