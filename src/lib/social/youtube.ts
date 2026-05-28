// YouTube Data API v3 sync.
//
// After OAuth, social_accounts has:
//   access_token  → expires in ~1 hour
//   refresh_token → long-lived, given because providers.ts requests
//                   access_type=offline + prompt=consent on the
//                   authorize URL.
// This module:
//   1. Refreshes the access token using refresh_token if expired.
//   2. GET /channels?mine=true → channel id, snippet, statistics
//      (subscriberCount, viewCount, videoCount), uploads playlist id.
//   3. Lists the uploads playlist → most recent video IDs.
//   4. GET /videos?id=...&part=snippet,statistics → per-video stats.
//   5. Filters videos published this week → sums views, likes,
//      comments → posts_published count + engagement rate.
//   6. Writes back to social_accounts + upserts performance_entries
//      with platform='youtube'.

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientCredentials, PROVIDERS } from "./providers";

const YT_API = "https://www.googleapis.com/youtube/v3";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";

type ChannelResource = {
  id: string;
  snippet?: {
    title?: string;
    customUrl?: string;
    thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
  };
  statistics?: {
    subscriberCount?: string; // numeric string from Google
    viewCount?: string;
    videoCount?: string;
  };
  contentDetails?: {
    relatedPlaylists?: { uploads?: string };
  };
};

type PlaylistItemResource = {
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
};

type VideoResource = {
  id: string;
  snippet?: { publishedAt?: string; title?: string };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

function currentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in?: number;
} | null> {
  const creds = getClientCredentials(PROVIDERS.youtube);
  if (!creds) return null;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
  });
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    console.warn("[youtube-sync] token refresh failed:", res.status, await res.text());
    return null;
  }
  return (await res.json()) as { access_token: string; expires_in?: number };
}

async function fetchChannel(accessToken: string): Promise<ChannelResource | null> {
  const url = new URL(`${YT_API}/channels`);
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("mine", "true");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`channels.list failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { items?: ChannelResource[] };
  return body.items?.[0] ?? null;
}

async function fetchRecentUploads(
  uploadsPlaylistId: string,
  accessToken: string,
  maxResults = 25,
): Promise<PlaylistItemResource[]> {
  const url = new URL(`${YT_API}/playlistItems`);
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("playlistId", uploadsPlaylistId);
  url.searchParams.set("maxResults", String(maxResults));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    console.warn("[youtube-sync] playlistItems failed:", res.status);
    return [];
  }
  const body = (await res.json()) as { items?: PlaylistItemResource[] };
  return body.items ?? [];
}

async function fetchVideoStats(
  videoIds: string[],
  accessToken: string,
): Promise<VideoResource[]> {
  if (videoIds.length === 0) return [];
  const url = new URL(`${YT_API}/videos`);
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", videoIds.join(","));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    console.warn("[youtube-sync] videos.list failed:", res.status);
    return [];
  }
  const body = (await res.json()) as { items?: VideoResource[] };
  return body.items ?? [];
}

export async function syncYouTubeAccount(
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
    .eq("platform", "youtube");

  const { data: row, error: rowErr } = await svc
    .from("social_accounts")
    .select(
      "access_token, refresh_token, token_expires_at, provider_data",
    )
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .maybeSingle();

  if (rowErr || !row?.access_token) {
    const error = rowErr?.message ?? "No YouTube connection found.";
    await markFailed(userId, error);
    return { ok: false, error };
  }

  try {
    // 1. Refresh access token if expired or close to expiring (60s buffer).
    let accessToken = row.access_token;
    let tokenExpiresAt = row.token_expires_at;
    const expiry = row.token_expires_at
      ? new Date(row.token_expires_at).getTime()
      : 0;
    const needsRefresh = expiry && expiry - Date.now() < 60_000;
    if (needsRefresh && row.refresh_token) {
      const refreshed = await refreshAccessToken(row.refresh_token);
      if (refreshed?.access_token) {
        accessToken = refreshed.access_token;
        tokenExpiresAt = refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
          : tokenExpiresAt;
      }
    }

    // 2. Channel info.
    const channel = await fetchChannel(accessToken);
    if (!channel) {
      throw new Error(
        "No YouTube channel found on this Google account. Create a channel in YouTube Studio to enable analytics.",
      );
    }

    const followers = Number(channel.statistics?.subscriberCount ?? 0);
    const totalViews = Number(channel.statistics?.viewCount ?? 0);
    const totalVideos = Number(channel.statistics?.videoCount ?? 0);
    const handle = channel.snippet?.customUrl ?? channel.snippet?.title ?? null;
    const displayName = channel.snippet?.title ?? null;
    const pictureUrl =
      channel.snippet?.thumbnails?.medium?.url ??
      channel.snippet?.thumbnails?.default?.url ??
      null;
    const profileUrl = channel.snippet?.customUrl
      ? `https://youtube.com/${channel.snippet.customUrl}`
      : `https://youtube.com/channel/${channel.id}`;

    // 3. Recent uploads → filter to this week.
    const weekStart = new Date(`${currentMonday()}T00:00:00Z`).getTime();
    const now = Date.now();

    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    let postsThisWeek = 0;
    let weekViews = 0;
    let weekLikes = 0;
    let weekComments = 0;

    if (uploadsPlaylistId) {
      const playlistItems = await fetchRecentUploads(
        uploadsPlaylistId,
        accessToken,
        25,
      );
      // Pre-filter by publish date — saves an API quota unit if all old.
      const recentIds = playlistItems
        .filter((it) => {
          const ts = it.contentDetails?.videoPublishedAt;
          if (!ts) return false;
          const t = new Date(ts).getTime();
          return t >= weekStart && t <= now;
        })
        .map((it) => it.contentDetails!.videoId!)
        .filter((id): id is string => !!id);

      if (recentIds.length > 0) {
        const videos = await fetchVideoStats(recentIds, accessToken);
        for (const v of videos) {
          postsThisWeek += 1;
          weekViews += Number(v.statistics?.viewCount ?? 0);
          weekLikes += Number(v.statistics?.likeCount ?? 0);
          weekComments += Number(v.statistics?.commentCount ?? 0);
        }
      }
    }

    // 4. Engagement rate — on YouTube, the standard creator-economy formula
    // is (likes + comments) / views * 100 for the period in question.
    const engagement = weekLikes + weekComments;
    const engagementRate =
      weekViews > 0 ? Math.min(100, (engagement / weekViews) * 100) : null;

    // 5. Insights diagnostic (matches the IG/FB pattern).
    const insightsDiagnostic =
      postsThisWeek === 0
        ? "No uploads this week — metrics will populate as you publish."
        : "ok";

    // 6. Persist to social_accounts.
    const providerData = {
      ...(row.provider_data ?? {}),
      channel_id: channel.id,
      uploads_playlist_id: uploadsPlaylistId ?? null,
      total_views: totalViews,
      total_videos: totalVideos,
      picture_url: pictureUrl,
      insights_last_status: insightsDiagnostic,
      insights_last_checked_at: new Date().toISOString(),
    };

    await svc
      .from("social_accounts")
      .update({
        access_token: accessToken,
        token_expires_at: tokenExpiresAt,
        provider_user_id: channel.id,
        handle,
        display_name: displayName,
        profile_url: profileUrl,
        follower_count: followers,
        provider_data: providerData,
        last_synced_at: new Date().toISOString(),
        sync_status: "idle",
        sync_error: null,
      })
      .eq("user_id", userId)
      .eq("platform", "youtube");

    // 7. performance_entries(platform='youtube') for the current week.
    const entryUpdates: Record<string, unknown> = {
      user_id: userId,
      week_start: currentMonday(),
      platform: "youtube",
      followers,
    };
    if (weekViews > 0) {
      entryUpdates.reach = weekViews; // best proxy on YT
      entryUpdates.views = weekViews;
    }
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
    console.error("[youtube-sync] failed:", message);
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
    .eq("platform", "youtube");
}
