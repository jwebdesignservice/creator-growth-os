// ─────────────────────────────────────────────────────────────────────────────
// Notification system — shared TypeScript types
// Mirrors the Supabase schema defined in 0004_notifications.sql exactly.
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationStatus   = "unread" | "read" | "archived";
export type NotificationCategory = "task" | "program" | "community" | "event" | "system";
export type NotificationType =
  | "task_assigned"
  | "task_due"
  | "task_completed"
  | "milestone_reached"
  | "posting_plan_updated"
  | "post_reminder"
  | "tutorial_unlocked"
  | "program_available"
  | "community_reply"
  | "chat_mention"
  | "coach_message"
  | "live_event"
  | "upgrade_recommendation"
  | "billing_update"
  | "announcement";

// ── Grouping (computed from created_at in queries.ts) ─────────────────────────
export type NotificationGroup  = "today" | "week" | "earlier";
export type NotificationFilter = "all" | "unread" | NotificationCategory;

// ── Core DB row ───────────────────────────────────────────────────────────────
export interface Notification {
  id:           string;
  user_id:      string;
  title:        string;
  body:         string | null;
  type:         NotificationType;
  category:     NotificationCategory;
  priority:     number;            // 1 (most urgent) → 5 (least urgent)
  status:       NotificationStatus;
  action_label: string | null;
  action_url:   string | null;
  metadata:     Record<string, unknown>;
  read_at:      string | null;
  expires_at:   string | null;
  created_at:   string;
  updated_at:   string;
}

// ── With server-computed group ────────────────────────────────────────────────
export interface NotificationWithGroup extends Notification {
  group: NotificationGroup;
}

// ── Preferences row ───────────────────────────────────────────────────────────
export interface NotificationPreferences {
  user_id:               string;
  inapp_tasks:           boolean;
  inapp_programs:        boolean;
  inapp_community:       boolean;
  inapp_events:          boolean;
  inapp_system:          boolean;
  email_digest:          boolean;
  email_alerts:          boolean;
  email_product_updates: boolean;
  updated_at:            string;
}

// ── Lightweight summary used by the bell dropdown ─────────────────────────────
export interface NotificationSummary {
  id:          string;
  title:       string;
  category:    NotificationCategory;
  type:        NotificationType;
  status:      NotificationStatus;
  created_at:  string;
  action_url:  string | null;
  metadata:    Record<string, unknown>;
}

// ── Payload passed to createNotification() / service helpers ─────────────────
export interface CreateNotificationPayload {
  title:        string;
  body?:        string;
  type:         NotificationType;
  category:     NotificationCategory;
  priority?:    number;
  action_label?: string;
  action_url?:  string;
  metadata?:    Record<string, unknown>;
  expires_at?:  string;
}

// ── Default preferences returned when a row doesn't exist yet ─────────────────
export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, "user_id" | "updated_at"> = {
  inapp_tasks:           true,
  inapp_programs:        true,
  inapp_community:       true,
  inapp_events:          true,
  inapp_system:          false,
  email_digest:          true,
  email_alerts:          false,
  email_product_updates: true,
};
