import { ChevronLeft, ChevronRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import {
  RECENT_DB_EVENTS,
  RECENT_DB_EVENTS_TOTAL,
  RECENT_DB_EVENTS_TOTAL_PAGES,
} from "@/lib/dev-dashboard/mock-data";
import type { DbEventRow, DbEventStatusKind, DbEventType } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<DbEventStatusKind, string> = {
  success: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  info:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const TYPE_TINT: Record<DbEventType, string> = {
  SELECT:    "text-[var(--dev-accent-text)]",
  INSERT:    "text-[var(--dev-success-text)]",
  UPDATE:    "text-[var(--dev-warning-text)]",
  DELETE:    "text-[var(--dev-danger-text)]",
  RPC:       "text-[var(--dev-chart-violet)]",
  UPLOAD:    "text-[var(--dev-chart-cyan)]",
  MIGRATION: "text-[var(--dev-chart-amber)]",
  OTHER:     "text-[var(--dev-text-secondary)]",
};

export function RecentDatabaseEventsTable({
  rows,
  total,
  totalPages,
}: {
  rows?: DbEventRow[];
  total?: number;
  totalPages?: number;
}) {
  const data = rows ?? RECENT_DB_EVENTS;
  const totalCount = total ?? RECENT_DB_EVENTS_TOTAL;
  const pages = totalPages ?? RECENT_DB_EVENTS_TOTAL_PAGES;

  return (
    <DevSectionCard
      title="Recent Database Events"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Latest queries, RLS denials, RPCs, and storage activity.
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[1000px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Time</Th>
              <Th>Event</Th>
              <Th>Table / Source</Th>
              <Th>Type</Th>
              <Th className="text-right">Duration</Th>
              <Th>Status</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] transition-colors"
              >
                <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">
                  {row.time}
                </Td>
                <Td>
                  <span className="font-mono text-[12px] text-[var(--dev-text-primary)] whitespace-nowrap">
                    {row.event}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-[12px] text-[var(--dev-text-secondary)] whitespace-nowrap">
                    {row.source}
                  </span>
                </Td>
                <Td
                  className={cn(
                    "font-mono text-[11.5px] font-semibold whitespace-nowrap",
                    TYPE_TINT[row.type],
                  )}
                >
                  {row.type}
                </Td>
                <Td className="text-right tabular-nums text-[var(--dev-text-primary)] font-semibold whitespace-nowrap">
                  {row.duration}
                </Td>
                <Td>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap",
                      STATUS_PILL[row.statusKind],
                    )}
                  >
                    {row.statusLabel}
                  </span>
                </Td>
                <Td className="text-[var(--dev-text-secondary)]">
                  {row.details}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing 1 to {data.length} of {totalCount.toLocaleString()} database events
        </span>
        <Pagination totalPages={pages} currentPage={1} />
      </div>
    </DevSectionCard>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("font-semibold py-2 px-2.5 align-middle whitespace-nowrap", className)}>
      {children}
    </th>
  );
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
