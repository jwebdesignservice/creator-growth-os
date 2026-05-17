import "server-only";
import { requireDevClient } from "./require-dev";

/* ─────────────────────────────────────────────────────────────────────────
   Read queries for the dev-notifications system. Powers:
     • the bell dropdown in the dev topbar (compact recent + unread count)
     • the full /dev/notifications page (grouped list + filters + counts)
   All access enforced server-side via requireDevClient() + RLS.
   ───────────────────────────────────────────────────────────────────────── */

type DevSupabase = Extract<
  Awaited<ReturnType<typeof requireDevClient>>,
  { ok: true }
>["supabase"];

export type DevNotificationCategory =
  | "incident" | "deploy" | "security" | "billing" | "system" | "audit";

export type DevNotificationSeverity =
  | "critical" | "high" | "medium" | "low" | "info";

export type DevNotificationStatus = "unread" | "read" | "archived";

export type DevNotificationGroup = "today" | "week" | "earlier";

/** Display-ready row used by both the dropdown and the full page. */
export type DevNotification = {
  id:          string;
  occurredAt:  string;        // ISO
  title:       string;
  body:        string | null;
  category:    DevNotificationCategory;
  severity:    DevNotificationSeverity;
  status:      DevNotificationStatus;
  source:      string | null;
  traceId:     string | null;
  actionLabel: string | null;
  actionUrl:   string | null;
  /** Relative "Just now" / "5m ago" — computed once at fetch time. */
  whenLabel:   string;
  /** Server-computed bucket for grouped rendering. */
  group:       DevNotificationGroup;
};

type DbRow = {
  id:            string;
  occurred_at:   string;
  title:         string;
  body:          string | null;
  category:      DevNotificationCategory;
  severity:      DevNotificationSeverity;
  status:        DevNotificationStatus;
  source:        string | null;
  trace_id:      string | null;
  action_label:  string | null;
  action_url:    string | null;
};

/* ─── Bell-dropdown bundle ───────────────────────────────────────────── */

export type DevNotificationsBellBundle = {
  unreadCount: number;
  items:       DevNotification[];   // top N most recent (read + unread)
};

const BELL_LIMIT = 6;

export async function getDevNotificationsForBell(): Promise<DevNotificationsBellBundle> {
  const guard = await requireDevClient();
  if (!guard.ok) return { unreadCount: 0, items: [] };
  const { supabase } = guard;

  const [unreadRes, itemsRes] = await Promise.all([
    countUnread(supabase),
    supabase
      .from("dev_notifications")
      .select("*")
      .neq("status", "archived")
      .order("occurred_at", { ascending: false })
      .limit(BELL_LIMIT),
  ]);

  if (itemsRes.error) {
    console.warn("[dev-notifications] bell items:", itemsRes.error.message);
    return { unreadCount: unreadRes, items: [] };
  }

  return {
    unreadCount: unreadRes,
    items:       (itemsRes.data as DbRow[] ?? []).map(toDevNotification),
  };
}

/* ─── Full-page bundle ───────────────────────────────────────────────── */

export type DevNotificationFilters = {
  category: DevNotificationCategory | "";
  severity: DevNotificationSeverity | "";
  status:   DevNotificationStatus | "all";
  q:        string;
};

export const DEFAULT_DEV_NOTIFICATIONS_FILTERS: DevNotificationFilters = {
  category: "",
  severity: "",
  status:   "all",
  q:        "",
};

export type DevNotificationsPageBundle = {
  items:        DevNotification[];
  totalAll:     number;
  unreadCount:  number;
  byCategory:   Record<DevNotificationCategory, number>;
  bySeverity:   Record<DevNotificationSeverity, number>;
};

export async function getDevNotificationsForPage(
  filters: DevNotificationFilters,
): Promise<DevNotificationsPageBundle> {
  const guard = await requireDevClient();
  if (!guard.ok) {
    return {
      items:       [],
      totalAll:    0,
      unreadCount: 0,
      byCategory:  emptyCategoryMap(),
      bySeverity:  emptySeverityMap(),
    };
  }
  const { supabase } = guard;

  // Build the main filtered list query
  let q = supabase
    .from("dev_notifications")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (filters.status === "all") {
    q = q.neq("status", "archived");
  } else {
    q = q.eq("status", filters.status);
  }
  if (filters.category) q = q.eq("category", filters.category);
  if (filters.severity) q = q.eq("severity", filters.severity);
  if (filters.q) {
    q = q.or(`title.ilike.%${filters.q}%,body.ilike.%${filters.q}%,source.ilike.%${filters.q}%`);
  }

  const [listRes, totalRes, unreadRes, categoryAgg, severityAgg] = await Promise.all([
    q,
    supabase.from("dev_notifications").select("*", { count: "exact", head: true }).neq("status", "archived"),
    countUnread(supabase),
    aggregateBy(supabase, "category"),
    aggregateBy(supabase, "severity"),
  ]);

  if (listRes.error) {
    console.warn("[dev-notifications] page list:", listRes.error.message);
  }

  return {
    items:       (listRes.data as DbRow[] ?? []).map(toDevNotification),
    totalAll:    totalRes.count ?? 0,
    unreadCount: unreadRes,
    byCategory:  { ...emptyCategoryMap(), ...categoryAgg as Record<DevNotificationCategory, number> },
    bySeverity:  { ...emptySeverityMap(), ...severityAgg as Record<DevNotificationSeverity, number> },
  };
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

async function countUnread(supabase: DevSupabase): Promise<number> {
  const { count, error } = await supabase
    .from("dev_notifications")
    .select("*", { count: "exact", head: true })
    .eq("status", "unread");
  if (error) {
    console.warn("[dev-notifications] countUnread:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function aggregateBy(
  supabase: DevSupabase,
  column: "category" | "severity",
): Promise<Record<string, number>> {
  // No GROUP BY in PostgREST — pull the column for active rows and bucket
  // in JS. Cheap at expected volumes (<10k notifications visible).
  const { data, error } = await supabase
    .from("dev_notifications")
    .select(column)
    .neq("status", "archived")
    .limit(5000);
  if (error || !data) return {};
  const out: Record<string, number> = {};
  for (const row of data as Record<string, string>[]) {
    const key = row[column];
    if (!key) continue;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function emptyCategoryMap(): Record<DevNotificationCategory, number> {
  return { incident: 0, deploy: 0, security: 0, billing: 0, system: 0, audit: 0 };
}
function emptySeverityMap(): Record<DevNotificationSeverity, number> {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

function toDevNotification(r: DbRow): DevNotification {
  return {
    id:          r.id,
    occurredAt:  r.occurred_at,
    title:       r.title,
    body:        r.body,
    category:    r.category,
    severity:    r.severity,
    status:      r.status,
    source:      r.source,
    traceId:     r.trace_id,
    actionLabel: r.action_label,
    actionUrl:   r.action_url,
    whenLabel:   formatRelative(r.occurred_at),
    group:       bucketFor(r.occurred_at),
  };
}

function bucketFor(iso: string): DevNotificationGroup {
  const now        = Date.now();
  const ts         = new Date(iso).getTime();
  const today0     = new Date();
  today0.setHours(0, 0, 0, 0);
  if (ts >= today0.getTime())          return "today";
  if (ts >= now - 7 * 24 * 60 * 60_000) return "week";
  return "earlier";
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 10_000)            return "Just now";
  if (ms < 60_000)            return `${Math.round(ms / 1000)}s ago`;
  if (ms < 60 * 60_000)       return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 24 * 60 * 60_000)  return `${Math.round(ms / (60 * 60_000))}h ago`;
  return `${Math.round(ms / (24 * 60 * 60_000))}d ago`;
}
