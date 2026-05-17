"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────────────────────────────────
   UserTicketRealtime — invisible watcher for /support/tickets/[id].

   Mirror of the dev-side <SupportRealtime />: subscribes to changes
   on the user's own ticket so a dev reply shows up live without a
   manual refresh. Scoped to a single ticket via a server filter so
   we don't get firehose updates from other users' rows.

   The filter uses the ticket UUID (not the public_id) because that's
   the FK target on support_ticket_messages.ticket_id.
   ───────────────────────────────────────────────────────────────────────── */

export function UserTicketRealtime({ ticketId }: { ticketId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!ticketId) return;
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    }

    const channel = supabase
      .channel(`support-ticket-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "support_ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "support_tickets",
          filter: `id=eq.${ticketId}`,
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [router, ticketId]);

  return null;
}
