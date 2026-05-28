"use client";

import { useEffect, useRef } from "react";
import { syncPlatform } from "@/lib/social/actions";
import type { SocialConnection } from "@/lib/social/queries";

/**
 * Invisible mount-time auto-syncer.
 *
 * On every Performance page load, walks the list of connected platforms
 * and fires a silent sync for any whose `last_synced_at` is older than
 * STALE_HOURS. The sync server action revalidates `/performance` on
 * completion, so the KPI tiles and connection cards refresh themselves
 * without the user having to click anything or hit F5.
 *
 * Renders nothing. Fires only once per mount via the ref guard — if the
 * user navigates away and back within the same session, a new mount
 * triggers a re-check (which will then be skipped by the freshness gate
 * unless the data is genuinely stale again).
 */

const STALE_HOURS = 6;

export function AutoSyncOnMount({
  connections,
}: {
  connections: SocialConnection[];
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const cutoff = Date.now() - STALE_HOURS * 60 * 60 * 1000;
    const stale = connections.filter((c) => {
      if (c.connectionStatus !== "connected") return false;
      if (!c.lastSyncedAt) return true; // never synced → sync
      return new Date(c.lastSyncedAt).getTime() < cutoff;
    });

    for (const c of stale) {
      // Fire-and-forget. The server action calls revalidatePath() on
      // success so the page re-fetches its data automatically.
      syncPlatform(c.platform).catch((err) => {
        // Log only — auto-sync failures should never disrupt page UX.
        console.warn(`[auto-sync] ${c.platform} failed:`, err);
      });
    }
  }, [connections]);

  return null;
}
