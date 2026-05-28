// ─────────────────────────────────────────────────────────────────────────────
// Notification system — read-only server queries
// All functions use the anon/user Supabase client so RLS is enforced.
// Call these only from Server Components or Server Actions.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/server";
import type {
  NotificationFilter,
  NotificationGroup,
  NotificationPreferences,
  NotificationSummary,
  NotificationWithGroup,
} from "./types";
import { DEFAULT_PREFERENCES as DEFAULTS } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeGroup(createdAt: string): NotificationGroup {
  const created     = new Date(createdAt);
  const now         = new Date();
  const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart   = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 7);

  if (created >= todayStart) return "today";
  if (created >= weekStart)  return "week";
  return "earlier";
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserNotifications
// Returns all non-archived notifications for the user, grouped and sorted
// by priority (1 = most urgent) within each group.
// An optional filter narrows to a specific category or to unread-only.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserNotifications(
  userId: string,
  filter: NotificationFilter = "all",
): Promise<NotificationWithGroup[]> {
  const supabase = await createClient();

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "archived")
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false })
    .order("priority",   { ascending: true  });

  if (filter === "unread") {
    query = query.eq("status", "unread");
  } else if (filter !== "all") {
    query = query.eq("category", filter);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("[notifications] getUserNotifications:", error.message);
    return [];
  }

  return (data ?? []).map((n) => ({ ...n, group: computeGroup(n.created_at) }));
}

// ─────────────────────────────────────────────────────────────────────────────
// getUnreadCount
// Single COUNT query — cheap, used in the shell context for the bell badge.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "unread")
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

  if (error) {
    console.warn("[notifications] getUnreadCount:", error.message);
    return 0;
  }
  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// getNotificationSummaries
// Fetches the top-N highest-priority notifications for the bell dropdown.
// Returns a lightweight shape (no body text) to keep the payload small.
// ─────────────────────────────────────────────────────────────────────────────

export async function getNotificationSummaries(
  userId: string,
  limit = 5,
): Promise<NotificationSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, category, type, status, created_at, action_url, metadata")
    .eq("user_id", userId)
    .neq("status", "archived")
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false })
    .order("priority",   { ascending: true  })
    .limit(limit);

  if (error) {
    console.warn("[notifications] getNotificationSummaries:", error.message);
    return [];
  }
  return (data ?? []) as NotificationSummary[];
}

// ─────────────────────────────────────────────────────────────────────────────
// getNotificationPreferences
// Returns the user's preferences row, or synthesised defaults if the row
// doesn't exist yet (edge case: user pre-dates the migration).
// ─────────────────────────────────────────────────────────────────────────────

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Table may not exist yet (pre-migration) — fall through to defaults
    console.warn("[notifications] getNotificationPreferences:", error.message);
  }

  if (data) return data as NotificationPreferences;

  // Synthesise a default row so the UI always has something to render
  return {
    user_id:    userId,
    updated_at: new Date().toISOString(),
    ...DEFAULTS,
  };
}
