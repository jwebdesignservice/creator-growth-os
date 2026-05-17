"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────────────────────────────────
   Browser subscription helper for the dev_notifications table.

   Wraps Supabase Realtime so the bell dropdown + page can react to live
   INSERT / UPDATE events without re-fetching. Channel naming is scoped
   to "dev-notifications" so multiple subscribers (bell + page) share
   the same channel — Supabase coalesces under the hood.

   The DB row shape mirrors `public.dev_notifications` exactly. Consumers
   typically map this into the UI-facing `DevNotification` shape via the
   helpers in dev-notifications-queries.ts.
   ───────────────────────────────────────────────────────────────────────── */

export type DevNotificationDbRow = {
  id:            string;
  occurred_at:   string;
  title:         string;
  body:          string | null;
  category:      string;
  severity:      string;
  status:        string;
  source:        string | null;
  trace_id:      string | null;
  action_label:  string | null;
  action_url:    string | null;
  metadata:      Record<string, unknown>;
  read_at:       string | null;
  archived_at:   string | null;
  created_at:    string;
};

export type DevNotificationsRealtimeHandlers = {
  /** Fired when a new notification arrives. */
  onInsert?: (row: DevNotificationDbRow) => void;
  /** Fired when an existing notification's status / metadata changes
   *  (e.g. another tab marked it read, or a dedup hit bumped it). */
  onUpdate?: (row: DevNotificationDbRow) => void;
  /** Fired when a notification is hard-deleted (retention prune). */
  onDelete?: (id: string) => void;
};

/**
 * Subscribe to live changes on the dev_notifications table.
 * Returns an `unsubscribe()` function that must be called on unmount.
 * RLS still applies — a non-dev viewer simply receives nothing.
 */
export function subscribeDevNotifications(
  handlers: DevNotificationsRealtimeHandlers,
): () => void {
  const supabase = createClient();
  const channel: RealtimeChannel = supabase
    .channel("dev-notifications")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "dev_notifications" },
      (payload) => handlers.onInsert?.(payload.new as DevNotificationDbRow),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "dev_notifications" },
      (payload) => handlers.onUpdate?.(payload.new as DevNotificationDbRow),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "dev_notifications" },
      (payload) => {
        const id = (payload.old as Partial<DevNotificationDbRow>)?.id;
        if (id) handlers.onDelete?.(id);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * React hook wrapper around `subscribeDevNotifications`. The latest
 * handlers reference is kept in a ref so consumers don't need to
 * memoize their callbacks — the channel itself stays mounted for the
 * component's full lifetime.
 */
export function useDevNotificationsRealtime(
  handlers: DevNotificationsRealtimeHandlers,
): void {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const unsub = subscribeDevNotifications({
      onInsert: (row) => ref.current.onInsert?.(row),
      onUpdate: (row) => ref.current.onUpdate?.(row),
      onDelete: (id)  => ref.current.onDelete?.(id),
    });
    return unsub;
  }, []);
}
