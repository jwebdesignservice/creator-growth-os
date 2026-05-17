import { ChevronLeft, ChevronRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DevStatusBadge } from "../dev-status-badge";
import {
  RECENT_ANALYTICS_EVENTS,
  RECENT_EVENTS_PAGINATION,
} from "@/lib/dev-dashboard/analytics-data";

export function RecentEventsTable() {
  const p = RECENT_EVENTS_PAGINATION;

  return (
    <DevSectionCard
      title="Recent Analytics Events"
      contentClassName="flex flex-col gap-4"
    >
      <p className="text-[12.5px] text-[var(--dev-text-secondary)] -mt-2">
        Latest tracked events across the platform.
      </p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Time</Th>
              <Th>Event</Th>
              <Th>Source</Th>
              <Th>User</Th>
              <Th>Route</Th>
              <Th>Device</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ANALYTICS_EVENTS.map((e) => (
              <tr
                key={e.id}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px]"
              >
                <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">
                  {e.time}
                </Td>
                <Td className="text-[var(--dev-text-primary)] font-mono whitespace-nowrap">
                  {e.event}
                </Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{e.source}</Td>
                <Td className="text-[var(--dev-text-secondary)] font-mono whitespace-nowrap">
                  {e.user}
                </Td>
                <Td className="text-[var(--dev-text-secondary)] font-mono whitespace-nowrap">
                  {e.route}
                </Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{e.device}</Td>
                <Td className="whitespace-nowrap">
                  <DevStatusBadge tone="success">Tracked</DevStatusBadge>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: showing-range + pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 -mb-1">
        <div className="text-[12px] text-[var(--dev-text-muted)] tabular-nums">
          Showing {p.showingFrom} to {p.showingTo} of {p.total.toLocaleString()} events
        </div>
        <Pagination current={p.currentPage} last={p.lastPage} />
      </div>
    </DevSectionCard>
  );
}

/* ── Pagination — visual-only (no router wiring); compact premium styling ── */
function Pagination({ current, last }: { current: number; last: number }) {
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <PageButton aria-label="Previous page" disabled={current === 1}>
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </PageButton>
      <PageButton active>{current}</PageButton>
      <PageButton>{current + 1}</PageButton>
      <PageButton>{current + 2}</PageButton>
      <span className="px-1.5 text-[12px] text-[var(--dev-text-muted)] select-none">…</span>
      <PageButton>{last}</PageButton>
      <PageButton aria-label="Next page">
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  active = false,
  disabled = false,
  ...rest
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-[8px] text-[12px] font-medium tabular-nums transition-colors";
  const tone = active
    ? "bg-[var(--dev-accent)] text-white"
    : disabled
      ? "text-[var(--dev-text-faint)] cursor-not-allowed"
      : "bg-[var(--dev-surface)] border border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)]";
  return (
    <button type="button" disabled={disabled} className={base + " " + tone} {...rest}>
      {children}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="font-semibold py-2 px-2 align-middle">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={"py-2.5 px-2 align-middle " + className}>{children}</td>;
}
