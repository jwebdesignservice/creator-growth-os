"use server";

import { revalidatePath } from "next/cache";
import { requireDevClient } from "./require-dev";
import type {
  DevNotificationCategory,
  DevNotificationSeverity,
} from "./dev-notifications-queries";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for the dev-notifications system.
   Every action passes through requireDevClient(); RLS is the second
   layer of defense (per migration 0013_dev_notifications.sql).
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult = { ok: true } | { ok: false; error: string };

/* ─── Single row: mark read ──────────────────────────────────────────── */

export async function markDevNotificationRead(id: string): Promise<ActionResult> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { supabase } = guard;

  if (!id) return { ok: false, error: "Missing id." };

  const { error } = await supabase
    .from("dev_notifications")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "unread");

  if (error) {
    console.error("[dev-notifications] markRead:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dev/notifications");
  revalidatePath("/dev");
  return { ok: true };
}

/* ─── Mark all unread → read ─────────────────────────────────────────── */

export async function markAllDevNotificationsRead(opts?: {
  category?: DevNotificationCategory;
  severity?: DevNotificationSeverity;
}): Promise<ActionResult> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { supabase } = guard;

  let q = supabase
    .from("dev_notifications")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("status", "unread");

  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.severity) q = q.eq("severity", opts.severity);

  const { error } = await q;
  if (error) {
    console.error("[dev-notifications] markAllRead:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dev/notifications");
  revalidatePath("/dev");
  return { ok: true };
}

/* ─── Archive (soft-delete) ──────────────────────────────────────────── */

export async function archiveDevNotification(id: string): Promise<ActionResult> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { supabase } = guard;

  if (!id) return { ok: false, error: "Missing id." };

  const { error } = await supabase
    .from("dev_notifications")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[dev-notifications] archive:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dev/notifications");
  revalidatePath("/dev");
  return { ok: true };
}
