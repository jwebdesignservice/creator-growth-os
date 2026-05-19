import { DevSectionCard } from "../../dev-section-card";
import { DB_RLS_POLICIES } from "@/lib/dev-dashboard/mock-data";
import type { DbRlsPolicyRow, DbRlsPolicyStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<DbRlsPolicyStatus, string> = {
  Healthy:    "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Warning:    "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Review:     "bg-[var(--dev-chart-amber)]/15 text-[var(--dev-chart-amber)] border border-[var(--dev-chart-amber)]/30",
  Restricted: "bg-[var(--dev-chart-violet)]/15 text-[var(--dev-chart-violet)] border border-[var(--dev-chart-violet)]/30",
};

const STATUS_DOT: Record<DbRlsPolicyStatus, string> = {
  Healthy:    "bg-[var(--dev-success-text)]",
  Warning:    "bg-[var(--dev-warning-text)]",
  Review:     "bg-[var(--dev-chart-amber)]",
  Restricted: "bg-[var(--dev-chart-violet)]",
};

export function RlsMonitorCard({ data }: { data?: DbRlsPolicyRow[] }) {
  const rows = data ?? DB_RLS_POLICIES;
  return (
    <DevSectionCard title="RLS / Policy Monitor">
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-3 text-[12.5px]">
            <span
              className="font-mono text-[12px] text-[var(--dev-text-primary)] flex-1 min-w-0 truncate"
            >
              {r.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0",
                STATUS_PILL[r.status],
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", STATUS_DOT[r.status])}
                aria-hidden
              />
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
