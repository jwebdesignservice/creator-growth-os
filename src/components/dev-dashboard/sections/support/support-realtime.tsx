"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────────────────────────────────
   SupportRealtime — invisible watcher that mounts inside /dev/support.

   Subscribes to the two support tables and triggers `router.refresh()`
   whenever a row changes:
     • support_tickets         — new submits, status updates, escalations
     • support_ticket_messages — new replies from either side

   Migration 0017 adds both tables to the `supabase_realtime` publication.
   Without it the channel still mounts but never receives events.

   We debounce refreshes to a tight 250 ms window so a burst of inserts
   (e.g. a script seeding 20 rows) only re-renders the page once.
   ───────────────────────────────────────────────────────────────────────── */

export function SupportRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    }

    const channel = supabase
      .channel("dev-support-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_ticket_messages" },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
