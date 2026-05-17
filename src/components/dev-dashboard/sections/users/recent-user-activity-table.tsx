import { ChevronLeft, ChevronRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import {
  RECENT_USER_ACTIVITY,
  RECENT_USER_ACTIVITY_TOTAL,
  RECENT_USER_ACTIVITY_TOTAL_PAGES,
} from "@/lib/dev-dashboard/mock-data";
import type { UserActivityPlan, UserActivityStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<UserActivityStatus, string> = {
  Active:    "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Trialing:  "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  Flagged:   "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Suspended: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

const PLAN_TINT: Record<UserActivityPlan, string> = {
  Free:  "text-[var(--dev-text-secondary)]",
  Trial: "text-[var(--dev-accent-text)]",
  Basic: "text-[var(--dev-chart-violet)]",
  Pro:   "text-[var(--dev-chart-green)]",
};

export function RecentUserActivityTable() {
  return (
    <DevSectionCard
      title="Recent User Activity"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Latest high-signal user events and account changes across the platform.
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[920px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Time</Th>
              <Th>Event</Th>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Source</Th>
              <Th>Region</Th>
            </tr>
          </thead>
          <tbody>
            {RECENT_USER_ACTIVITY.map((row) => (
              <tr key={row.id} className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] transition-colors">
                <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">{row.time}</Td>
                <Td>
                  <span className="font-mono text-[12px] text-[var(--dev-text-primary)] whitespace-nowrap">
                    {row.event}
                  </span>
                </Td>
                <Td className="text-[var(--dev-text-primary)] whitespace-nowrap">{row.user}</Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.email}</Td>
                <Td className={cn("font-medium whitespace-nowrap", PLAN_TINT[row.plan])}>
                  {row.plan}
                </Td>
                <Td>
                  <span className={cn("inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap", STATUS_PILL[row.status])}>
                    {row.status}
                  </span>
                </Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.source}</Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.region}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing 1 to {RECENT_USER_ACTIVITY.length} of {RECENT_USER_ACTIVITY_TOTAL.toLocaleString()} user events
        </span>
        <Pagination totalPages={RECENT_USER_ACTIVITY_TOTAL_PAGES} currentPage={1} />
      </div>
    </DevSectionCard>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("font-semibold py-2 px-2.5 align-middle whitespace-nowrap", className)}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}

function Pagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  return (
    <nav className="inline-flex items-center gap-1" aria-label="Pagination">
      <PageButton aria-label="Previous page">
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </PageButton>
      <PageButton active>{currentPage}</PageButton>
      <PageButton>{currentPage + 1}</PageButton>
      <PageButton>{currentPage + 2}</PageButton>
      <span className="px-2 text-[12px] text-[var(--dev-text-muted)]">…</span>
      <PageButton>{totalPages}</PageButton>
      <PageButton aria-label="Next page">
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  active,
  ...rest
}: { children: React.ReactNode; active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-[8px] text-[12.5px] font-medium border transition-colors",
        active
          ? "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white"
          : "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)]",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
