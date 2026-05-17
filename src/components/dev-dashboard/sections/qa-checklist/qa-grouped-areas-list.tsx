import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { QA_GROUPED_AREAS } from "@/lib/dev-dashboard/mock-data";
import { buildQaSearch, type QaFilterState } from "@/lib/dev-dashboard/qa-filters";
import type {
  QaAreaStatusCounts,
  QaBlockerSeverity,
  QaCheckResultRow,
  QaCheckStatus,
  QaGroupedAreaWithChecks,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";
import { QaCheckStatusMenu } from "./qa-check-status-menu";

/**
 * Grouped QA area rows that occupy the entire left column of the page.
 *
 * Rows can expand inline to reveal the underlying check items via a URL
 * search param (`expanded=core,auth`). Server-driven expand means the
 * shareable URL describes the entire page state and there's no client-side
 * collapse animation to maintain.
 */
type Props = {
  data?: QaGroupedAreaWithChecks[];
  /** Current page filter state — used to build per-row toggle links that
   *  preserve the rest of the URL. */
  filters: QaFilterState;
};

export function QaGroupedAreasList({ data, filters }: Props) {
  const rows: QaGroupedAreaWithChecks[] =
    data ?? QA_GROUPED_AREAS.map((a) => ({ ...a, checks: [] }));

  const expandedSet = new Set(filters.expanded);

  return (
    <section className="dev-card overflow-hidden">
      <ul>
        {rows.map((row, i) => {
          const isExpanded = expandedSet.has(row.key);
          const toggleHref = toggleExpandedHref(filters, row.key);
          return (
            <li
              key={row.key}
              className={
                i === 0
                  ? ""
                  : "border-t border-[var(--dev-border-soft)]"
              }
            >
              <GroupRow row={row} expanded={isExpanded} toggleHref={toggleHref} />
              {isExpanded && row.checks.length > 0 && (
                <ChecksList checks={row.checks} />
              )}
              {isExpanded && row.checks.length === 0 && (
                <div className="px-12 py-3 text-[12.5px] text-[var(--dev-text-muted)]">
                  No checks match the current filters in this area.
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function toggleExpandedHref(filters: QaFilterState, key: string): string {
  const set = new Set(filters.expanded);
  if (set.has(key)) set.delete(key); else set.add(key);
  const next: Partial<QaFilterState> = { ...filters, expanded: Array.from(set) };
  const params = buildQaSearch(next);
  return `?${params.toString()}`;
}

/* ── Group summary row ───────────────────────────────────────────────────── */

function GroupRow({
  row,
  expanded,
  toggleHref,
}: {
  row: QaGroupedAreaWithChecks;
  expanded: boolean;
  toggleHref: string;
}) {
  const percent = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Link
        href={toggleHref}
        scroll={false}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${row.title}`}
        aria-expanded={expanded}
        className="size-6 inline-flex items-center justify-center rounded-md text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors shrink-0"
      >
        <Chevron className="size-4" strokeWidth={2} />
      </Link>

      <Link
        href={toggleHref}
        scroll={false}
        className="flex-1 min-w-0 hover:text-[var(--dev-text-primary)] transition-colors"
      >
        <span className="text-[13.5px] text-[var(--dev-text-primary)] font-medium truncate">
          {row.letter}. {row.title}
        </span>
      </Link>

      <span className="text-[12.5px] text-[var(--dev-text-secondary)] tabular-nums font-medium w-12 text-right shrink-0">
        {row.completed}/{row.total}
      </span>

      <div
        className="hidden md:block w-[180px] h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden shrink-0"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${row.title} progress`}
      >
        <div
          className="h-full rounded-full bg-[var(--dev-accent)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <StatusCounts counts={row.counts} />

      <Link
        href={toggleHref}
        scroll={false}
        aria-hidden
        tabIndex={-1}
        className="size-6 inline-flex items-center justify-center text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] transition-colors shrink-0"
      >
        <Chevron className="size-4" strokeWidth={2} />
      </Link>
    </div>
  );
}

function StatusCounts({ counts }: { counts: QaAreaStatusCounts }) {
  return (
    <div className="flex items-center gap-3 text-[12px] tabular-nums shrink-0" aria-label="Status counts">
      <CountItem ariaLabel={`${counts.passed} passed`}        dotColor="var(--dev-success-text)">{counts.passed}</CountItem>
      <CountItem ariaLabel={`${counts.needsReview} need review`} dotColor="var(--dev-warning-text)">{counts.needsReview}</CountItem>
      <CountItem ariaLabel={`${counts.blockers} blockers`}    dotColor="var(--dev-danger-text)" >{counts.blockers}</CountItem>
      <CountItem ariaLabel={`${counts.pending} pending`}      dotColor="var(--dev-text-faint)"  >{counts.pending}</CountItem>
    </div>
  );
}

function CountItem({
  children,
  dotColor,
  ariaLabel,
}: {
  children: React.ReactNode;
  dotColor: string;
  ariaLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[var(--dev-text-secondary)]" aria-label={ariaLabel}>
      <span className="size-1.5 rounded-full" style={{ background: dotColor }} />
      {children}
    </span>
  );
}

/* ── Expanded checks list ────────────────────────────────────────────────── */

const SEVERITY_PILL: Record<QaBlockerSeverity, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border border-[var(--dev-border)]",
};

function ChecksList({ checks }: { checks: QaCheckResultRow[] }) {
  return (
    <ul className="border-t border-[var(--dev-border-soft)] bg-[var(--dev-surface-soft)]/40">
      {checks.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 pl-12 pr-4 py-2.5 border-t border-[var(--dev-border-soft)] first:border-t-0 text-[12.5px]"
        >
          <span className="flex-1 min-w-0 text-[var(--dev-text-primary)] truncate">
            {c.title}
          </span>
          {c.ownerTeam && (
            <span className="text-[11px] text-[var(--dev-text-muted)] whitespace-nowrap">
              {c.ownerTeam}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center px-1.5 h-[20px] rounded-md text-[10.5px] font-semibold whitespace-nowrap",
              SEVERITY_PILL[c.severity],
            )}
            title={`Severity: ${c.severity}`}
            aria-label={`Severity ${c.severity}`}
          >
            {c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}
          </span>
          <QaCheckStatusMenu checkResultId={c.id} status={c.status as QaCheckStatus} />
        </li>
      ))}
    </ul>
  );
}
