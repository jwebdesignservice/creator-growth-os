import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RowActionsMenu } from "./row-actions-menu";
import { DevSectionCard } from "../../dev-section-card";
import {
  SUPPORT_QUEUE_ROWS,
  SUPPORT_QUEUE_PAGINATION,
} from "@/lib/dev-dashboard/mock-data";
import type {
  SupportQueuePagination,
  SupportQueueRow,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/dev-dashboard/types";
import {
  buildSupportSearch,
  type SupportFilterState,
} from "@/lib/dev-dashboard/support-filters";
import { cn } from "@/lib/cn";

const PRIORITY_PILL: Record<SupportTicketPriority, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const STATUS_PILL: Record<SupportTicketStatus, string> = {
  "open":           "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  "in-progress":    "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border border-[var(--dev-chart-violet)]/30",
  "investigating":  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  "waiting-client": "bg-[var(--dev-chart-amber)]/15 text-[var(--dev-chart-amber)] border border-[var(--dev-chart-amber)]/30",
  "escalated":      "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  "resolved":       "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
};

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  "open":           "Open",
  "in-progress":    "In Progress",
  "investigating":  "Investigating",
  "waiting-client": "Waiting Client",
  "escalated":      "Escalated",
  "resolved":       "Resolved",
};

const PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  high:   "High",
  medium: "Medium",
  low:    "Low",
};

const ASSIGNEE_TONE: Record<SupportQueueRow["assigneeTone"], string> = {
  blue:   "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  green:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  amber:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  violet: "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/30",
  rose:   "bg-[var(--dev-chart-rose)]/12  text-[var(--dev-chart-rose)]  border-[var(--dev-chart-rose)]/30",
  cyan:   "bg-[var(--dev-chart-cyan)]/12  text-[var(--dev-chart-cyan)]  border-[var(--dev-chart-cyan)]/30",
};

type Props = {
  rows?: SupportQueueRow[];
  pagination?: SupportQueuePagination;
  filters?: SupportFilterState;
};

export function TicketQueueTable({ rows, pagination, filters }: Props) {
  const data = rows ?? SUPPORT_QUEUE_ROWS;
  const pg = pagination ?? SUPPORT_QUEUE_PAGINATION;
  const selectedId = filters?.ticket ?? data[0]?.id ?? null;

  const hrefFor = (next: Partial<SupportFilterState>): string => {
    const params = buildSupportSearch({ ...(filters ?? {}), ...next });
    const s = params.toString();
    return s ? `?${s}` : "/dev/support";
  };

  return (
    <DevSectionCard
      title="Ticket Queue"
      trailing={
        <span className="inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border border-[var(--dev-border)] tabular-nums">
          {pg.total}
        </span>
      }
      contentClassName="flex flex-col"
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[920px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Ticket ID</Th>
              <Th>Client</Th>
              <Th>Subject</Th>
              <Th>Category</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Assigned To</Th>
              <Th>Last Update</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[12.5px] text-[var(--dev-text-muted)]">
                  No tickets match the current filters.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isSelected = row.id === selectedId;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-t border-[var(--dev-border-soft)] text-[12.5px] transition-colors",
                      isSelected
                        ? "bg-[var(--dev-accent-softer)]"
                        : "hover:bg-[var(--dev-surface-soft)]",
                    )}
                    aria-selected={isSelected ? true : undefined}
                  >
                    <Td className="whitespace-nowrap">
                      <Link
                        href={hrefFor({ ticket: row.id })}
                        scroll={false}
                        className="font-mono text-[12px] text-[var(--dev-accent-text)] font-medium hover:underline whitespace-nowrap"
                      >
                        {row.id}
                      </Link>
                    </Td>
                    <Td className="text-[var(--dev-text-primary)] font-medium whitespace-nowrap">{row.client}</Td>
                    <Td>
                      <Link
                        href={hrefFor({ ticket: row.id })}
                        scroll={false}
                        className="text-[var(--dev-text-primary)] hover:text-[var(--dev-accent-text)] transition-colors"
                      >
                        {row.subject}
                      </Link>
                    </Td>
                    <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.category}</Td>
                    <Td>
                      <Pill className={PRIORITY_PILL[row.priority]}>{PRIORITY_LABEL[row.priority]}</Pill>
                    </Td>
                    <Td>
                      <Pill className={STATUS_PILL[row.status]}>{STATUS_LABEL[row.status]}</Pill>
                    </Td>
                    <Td>
                      <div className="inline-flex items-center gap-2 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center size-6 rounded-full border text-[10px] font-semibold tabular-nums",
                            ASSIGNEE_TONE[row.assigneeTone],
                          )}
                          aria-hidden
                        >
                          {row.assigneeInitials}
                        </span>
                        <span className="text-[12.5px] text-[var(--dev-text-secondary)]">{row.assigneeName}</span>
                      </div>
                    </Td>
                    <Td className="text-[var(--dev-text-muted)] tabular-nums whitespace-nowrap">{row.lastUpdate}</Td>
                    <Td className="text-right">
                      <RowActionsMenu
                        ticketPublicId={row.id}
                        status={row.status}
                        priority={row.priority}
                        selectHref={hrefFor({ ticket: row.id })}
                      />
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing {pg.showingFrom} to {pg.showingTo} of {pg.total.toLocaleString()} tickets
        </span>
        <Pagination current={pg.currentPage} total={pg.totalPages} hrefFor={hrefFor} />
      </div>
    </DevSectionCard>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function Pagination({
  current,
  total,
  hrefFor,
}: {
  current: number;
  total: number;
  hrefFor: (next: Partial<SupportFilterState>) => string;
}) {
  // Compact page strip — show the first 3 pages, an ellipsis, then the last.
  const pages: (number | "…")[] = [1, 2, 3];
  if (total > 4) pages.push("…", total);
  else if (total === 4) pages.push(4);

  return (
    <div className="inline-flex items-center gap-1">
      <PageLink href={hrefFor({ page: Math.max(1, current - 1) })} aria-label="Previous page" disabled={current <= 1}>
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </PageLink>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="inline-flex items-center justify-center min-w-[28px] h-7 text-[12px] text-[var(--dev-text-muted)]"
          >
            …
          </span>
        ) : (
          <PageLink key={p} href={hrefFor({ page: p })} active={p === current}>
            {p}
          </PageLink>
        ),
      )}
      <PageLink href={hrefFor({ page: Math.min(total, current + 1) })} aria-label="Next page" disabled={current >= total}>
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </PageLink>
    </div>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; active?: boolean; disabled?: boolean }) {
  const className = cn(
    "inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-[12px] font-medium tabular-nums transition-colors",
    active
      ? "bg-[var(--dev-accent)] text-white"
      : "bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)]",
    disabled && "opacity-40 cursor-not-allowed hover:text-[var(--dev-text-secondary)] pointer-events-none",
  );
  if (disabled) {
    return (
      <span {...rest} aria-disabled className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} {...rest} className={className}>
      {children}
    </Link>
  );
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap", className)}>
      {children}
    </span>
  );
}
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("font-semibold py-2 px-2.5 align-middle whitespace-nowrap", className)}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}
