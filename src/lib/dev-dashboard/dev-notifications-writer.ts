import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  DevNotificationCategory,
  DevNotificationSeverity,
} from "./dev-notifications-queries";

/* ─────────────────────────────────────────────────────────────────────────
   Server-only producer helper for the dev-notifications system.

   Routes every write through the SQL function `public.notify_dev_event`,
   which owns the dedup window and severity-promotion rules. Application
   server actions, API routes, and background jobs can call `notifyDev()`
   freely — duplicates within 5 minutes will collapse rather than spam.

   The bulk of system events (errors, auth) are wired in 0014 as DB
   triggers, so most of the time you don't need to call this helper —
   it's here for the one-off, code-level signals (deploys, admin
   actions, third-party webhook arrivals) that don't have a matching
   row in another dev_* table.

   Usage:
     await notifyDev({
       title:    "Deploy v1.4.3 succeeded",
       category: "deploy",
       severity: "info",
       source:   "deploy-runner",
       actionLabel: "View deployment",
       actionUrl:   "/dev/deployments",
       dedupKey: "deploy:" + commitSha,    // optional, collapses repeats
     });
   ───────────────────────────────────────────────────────────────────────── */

export type NotifyDevInput = {
  title:        string;
  category:     DevNotificationCategory;
  severity?:    DevNotificationSeverity;
  body?:        string;
  source?:      string;
  traceId?:     string;
  actionLabel?: string;
  actionUrl?:   string;
  /** Stable key per "kind of event" — used by the DB dedup window. Omit
   *  for one-off events you always want to surface. */
  dedupKey?:    string;
  metadata?:    Record<string, unknown>;
};

export type NotifyDevResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Write a dev notification through the canonical SQL writer. Fire-and-
 * forget at most call sites — failures are logged but never thrown so
 * notification plumbing can never break a primary code path.
 */
export async function notifyDev(input: NotifyDevInput): Promise<NotifyDevResult> {
  if (!input.title || !input.category) {
    return { ok: false, error: "title and category are required" };
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("notify_dev_event", {
      p_title:        input.title,
      p_category:     input.category,
      p_severity:     input.severity ?? "info",
      p_body:         input.body         ?? null,
      p_source:       input.source       ?? null,
      p_trace_id:     input.traceId      ?? null,
      p_action_label: input.actionLabel  ?? null,
      p_action_url:   input.actionUrl    ?? null,
      p_dedup_key:    input.dedupKey     ?? null,
      p_metadata:     input.metadata     ?? {},
    });

    if (error) {
      console.error("[dev-notifications] notify_dev_event:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data as string };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[dev-notifications] notifyDev (caught):", message);
    return { ok: false, error: message };
  }
}

/**
 * Same as `notifyDev` but never returns — useful at hot call sites
 * (e.g. middleware, request handlers) where you absolutely don't want
 * notification I/O to influence the primary response time. Errors are
 * still logged.
 */
export function notifyDevFireAndForget(input: NotifyDevInput): void {
  // Deliberately ignore the returned promise. Service role + RPC keep
  // it fast (single round-trip), but we don't await it.
  void notifyDev(input).catch((err) => {
    console.error("[dev-notifications] fire-and-forget:", err);
  });
}
