// Server-side reads for the social-OAuth UI.

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PROVIDERS, isConfigured, type ProviderKey } from "./providers";

export type SocialConnection = {
  platform: ProviderKey;
  label: string;
  /** "connected" once we have a non-null access_token. */
  connectionStatus: "not_connected" | "connected" | "setup_pending";
  /** Public handle to show in the UI when connected. */
  handle: string | null;
  displayName: string | null;
  profileUrl: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  followerCount: number | null;
  syncStatus: "idle" | "syncing" | "error" | null;
  syncError: string | null;
  /** Most recent insights diagnostic, if the platform tracks one. */
  insightsStatus: string | null;
  /** Whether the env vars are set for this provider. */
  configured: boolean;
};

/**
 * Build the per-platform list shown on the Performance page.
 * Always returns all 6 providers — never connected ones show up as
 * "not_connected" (or "setup_pending" if env credentials are missing).
 */
export async function getSocialConnections(): Promise<SocialConnection[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Render the card even when unauthenticated (just gives a safe empty state)
    return Object.values(PROVIDERS).map((p) => ({
      platform: p.key,
      label: p.label,
      connectionStatus: "not_connected" as const,
      handle: null,
      displayName: null,
      profileUrl: null,
      connectedAt: null,
      lastSyncedAt: null,
      followerCount: null,
      syncStatus: null,
      syncError: null,
      insightsStatus: null,
      configured: isConfigured(p),
    }));
  }

  const { data: rows } = await supabase
    .from("social_accounts")
    .select(
      "platform, handle, display_name, profile_url, access_token, connected_at, last_synced_at, follower_count, sync_status, sync_error, provider_data",
    )
    .eq("user_id", user.id);

  const byPlatform = new Map<string, NonNullable<typeof rows>[number]>();
  for (const r of rows ?? []) byPlatform.set(r.platform, r);

  return Object.values(PROVIDERS).map((p) => {
    const row = byPlatform.get(p.key);
    const configured = isConfigured(p);
    const connected = Boolean(row?.access_token);
    const insightsStatus =
      (row?.provider_data as Record<string, unknown> | null | undefined)?.[
        "insights_last_status"
      ];
    return {
      platform: p.key,
      label: p.label,
      connectionStatus: connected
        ? "connected"
        : configured
          ? "not_connected"
          : "setup_pending",
      handle: row?.handle ?? null,
      displayName: row?.display_name ?? null,
      profileUrl: row?.profile_url ?? null,
      connectedAt: row?.connected_at ?? null,
      lastSyncedAt: row?.last_synced_at ?? null,
      followerCount: row?.follower_count ?? null,
      syncStatus:
        (row?.sync_status as SocialConnection["syncStatus"]) ?? null,
      syncError: row?.sync_error ?? null,
      insightsStatus:
        typeof insightsStatus === "string" ? insightsStatus : null,
      configured,
    };
  });
}
