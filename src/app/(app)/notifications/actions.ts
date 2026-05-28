"use server";

// ─────────────────────────────────────────────────────────────────────────────
// Notification server actions
// Called from client components in the notifications UI.
// All mutations verify auth and rely on RLS as a second enforcement layer.
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences, NotificationSummary } from "@/lib/notifications/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ─────────────────────────────────────────────────────────────────────────────
// markNotificationRead
// Marks a single notification as read. Silently ignored if the notification
// doesn't belong to the current user (RLS rejects the update).
// ─────────────────────────────────────────────────────────────────────────────

export async function markNotificationRead(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({
      status:     "read",
      read_at:    new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)  // belt-and-suspenders: RLS also enforces this
    .eq("status", "unread"); // only update if currently unread

  revalidatePath("/notifications");
}

// ─────────────────────────────────────────────────────────────────────────────
// markAllNotificationsRead
// ─────────────────────────────────────────────────────────────────────────────

export async function markAllNotificationsRead(): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  const now = new Date().toISOString();
  await supabase
    .from("notifications")
    .update({ status: "read", read_at: now, updated_at: now })
    .eq("user_id", user.id)
    .eq("status", "unread");

  revalidatePath("/notifications");
}

// ─────────────────────────────────────────────────────────────────────────────
// archiveNotification
// Soft-deletes a notification (status = 'archived'). The notification is
// hidden from all queries but remains in the DB for audit purposes.
// ─────────────────────────────────────────────────────────────────────────────

export async function archiveNotification(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/notifications");
}

// ─────────────────────────────────────────────────────────────────────────────
// saveNotificationPreferences
// Upserts the user's notification_preferences row.
// Returns { ok: true } on success so the client can show a saved state.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveNotificationPreferences(
  prefs: Partial<Omit<NotificationPreferences, "user_id" | "updated_at">>,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("[notifications] saveNotificationPreferences:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// getDropdownNotifications
// Fetches the top-5 highest-priority notifications for the bell dropdown.
// Called client-side (via "use server") when the dropdown opens.
// Returns a lightweight shape so the response payload stays small.
// ─────────────────────────────────────────────────────────────────────────────

export async function getDropdownNotifications(): Promise<
  Array<NotificationSummary & { live: boolean }>
> {
  const { supabase, user } = await requireUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, category, type, status, created_at, action_url, metadata")
    .eq("user_id", user.id)
    .neq("status", "archived")
    .or(
      "expires_at.is.null,expires_at.gt." + new Date().toISOString(),
    )
    .order("created_at", { ascending: false })
    .order("priority",   { ascending: true  })
    .limit(5);

  if (error) {
    console.error("[notifications] getDropdownNotifications:", error.message);
    return [];
  }

  return (data ?? []).map((n) => ({
    ...n,
    metadata: (n.metadata ?? {}) as Record<string, unknown>,
    live:
      n.type === "live_event" ||
      (n.metadata as Record<string, unknown>)?.live === true,
  }));
}
