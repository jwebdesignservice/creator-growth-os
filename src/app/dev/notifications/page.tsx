import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { NotificationsFilterBar } from "@/components/dev-dashboard/sections/notifications/notifications-filter-bar";
import { NotificationsList } from "@/components/dev-dashboard/sections/notifications/notifications-list";
import { DevSectionCard } from "@/components/dev-dashboard/dev-section-card";
import {
  getDevNotificationsForPage,
  type DevNotificationFilters,
  type DevNotificationCategory,
  type DevNotificationSeverity,
  type DevNotificationStatus,
} from "@/lib/dev-dashboard/dev-notifications-queries";

export const metadata = { title: "Notifications · Dev Dashboard" };
export const dynamic  = "force-dynamic";
export const revalidate = 0;

type Search = Promise<Record<string, string | string[] | undefined>>;

const CATEGORY_VALUES: readonly DevNotificationCategory[] = [
  "incident", "deploy", "security", "billing", "system", "audit",
];
const SEVERITY_VALUES: readonly DevNotificationSeverity[] = [
  "critical", "high", "medium", "low", "info",
];
const STATUS_VALUES: readonly (DevNotificationStatus | "all")[] = [
  "all", "unread", "read", "archived",
];

function parseFilters(sp: Record<string, string | string[] | undefined>): DevNotificationFilters {
  const get = (k: string): string => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] ?? "" : v ?? "";
  };
  const category = get("category") as DevNotificationCategory;
  const severity = get("severity") as DevNotificationSeverity;
  const status   = (get("status") || "all") as DevNotificationStatus | "all";
  return {
    category: CATEGORY_VALUES.includes(category) ? category : "",
    severity: SEVERITY_VALUES.includes(severity) ? severity : "",
    status:   STATUS_VALUES.includes(status)     ? status   : "all",
    q:        get("q"),
  };
}

export default async function DevNotificationsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp      = await searchParams;
  const filters = parseFilters(sp);
  const data    = await getDevNotificationsForPage(filters);

  return (
    <div className="space-y-5">
      <DevPageHeader
        title="Notifications"
        subtitle="Operational signals, incidents and audit events for the dev team"
      />

      {/* Top stat strip — counts by category */}
      <section
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11rem), 1fr))" }}
      >
        <StatTile label="All"      value={data.totalAll}    tone="neutral" />
        <StatTile label="Unread"   value={data.unreadCount} tone="accent"  />
        <StatTile label="Incidents" value={data.byCategory.incident} tone="danger" />
        <StatTile label="Security"  value={data.byCategory.security} tone="warning" />
        <StatTile label="Billing"   value={data.byCategory.billing}  tone="info" />
        <StatTile label="Audit"     value={data.byCategory.audit}    tone="muted" />
      </section>

      {/* Filter / control row */}
      <NotificationsFilterBar filters={filters} unreadCount={data.unreadCount} />

      {/* Grouped list */}
      <DevSectionCard
        title="Notifications"
        trailing={
          <span className="text-[12px] text-[var(--dev-text-muted)] tabular-nums">
            Showing {data.items.length} of {data.totalAll}
          </span>
        }
      >
        <NotificationsList items={data.items} />
      </DevSectionCard>
    </div>
  );
}

/* ─── Stat tile ──────────────────────────────────────────────────────── */

type Tone = "neutral" | "accent" | "danger" | "warning" | "info" | "muted";

const TONE_CHIP: Record<Tone, string> = {
  neutral: "bg-[var(--dev-surface-elev)] text-[var(--dev-text-primary)] border-[var(--dev-border)]",
  accent:  "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  info:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  muted:   "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border-[var(--dev-border)]",
};

function StatTile({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return (
    <div className="dev-card p-4 flex items-center justify-between gap-3 min-h-[80px]">
      <div className="min-w-0">
        <div className="text-[11.5px] text-[var(--dev-text-muted)] font-medium uppercase tracking-wider mb-1">
          {label}
        </div>
        <div className="text-[24px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {value.toLocaleString()}
        </div>
      </div>
      <span
        className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md text-[11px] font-semibold border ${TONE_CHIP[tone]}`}
        aria-hidden
      >
        ●
      </span>
    </div>
  );
}
