"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import {
  buildPerformanceSearch,
  type PerformanceFilters,
  type ServiceSortKey,
  type SortDirection,
} from "@/lib/dev-dashboard/performance-filters";
import type { ServicePerfRow, ServicePerfStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_DOT: Record<ServicePerfStatus, string> = {
  Healthy:  "bg-[var(--dev-success-text)]",
  Degraded: "bg-[var(--dev-warning-text)]",
  Down:     "bg-[var(--dev-danger-text)]",
};

const STATUS_TEXT: Record<ServicePerfStatus, string> = {
  Healthy:  "text-[var(--dev-success-text)]",
  Degraded: "text-[var(--dev-warning-text)]",
  Down:     "text-[var(--dev-danger-text)]",
};

type Props = {
  rows: ServicePerfRow[];
  filters: PerformanceFilters;
};

/**
 * Sortable service overview. Sort state lives in the URL (?sb=&sd=) so
 * the server re-renders with the rows already sorted; this client component
 * is only here to navigate on header click. Default sort is `service asc`.
 */
export function ServicePerformanceTable({ rows, filters }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function onSort(key: ServiceSortKey) {
    let nextDir: SortDirection;
    if (filters.sortBy === key) {
      nextDir = filters.sortDir === "asc" ? "desc" : "asc";
    } else {
      // Numeric columns default to descending (biggest first); text columns ascending.
      nextDir = isNumericKey(key) ? "desc" : "asc";
    }
    const url = `/dev/performance${buildPerformanceSearch({ ...filters, sortBy: key, sortDir: nextDir })}`;
    startTransition(() => router.push(url, { scroll: false }));
  }

  return (
    <DevSectionCard
      title="Service Performance Overview"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Latest per-service performance snapshot
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[1080px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <SortableTh label="Service"        sortKey="service"   filters={filters} onSort={onSort} />
              <SortableTh label="Requests / Min" sortKey="rpm"       filters={filters} onSort={onSort} align="right" />
              <SortableTh label="p50 (ms)"       sortKey="p50"       filters={filters} onSort={onSort} align="right" />
              <SortableTh label="p95 (ms)"       sortKey="p95"       filters={filters} onSort={onSort} align="right" />
              <SortableTh label="p99 (ms)"       sortKey="p99"       filters={filters} onSort={onSort} align="right" />
              <SortableTh label="Error Rate"     sortKey="errorRate" filters={filters} onSort={onSort} align="right" />
              <SortableTh label="Apdex"          sortKey="apdex"     filters={filters} onSort={onSort} align="right" />
              <SortableTh label="CPU"            sortKey="cpu"       filters={filters} onSort={onSort} align="right" />
              <SortableTh label="Memory"         sortKey="memory"    filters={filters} onSort={onSort} align="right" />
              <SortableTh label="Status"         sortKey="status"    filters={filters} onSort={onSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] transition-colors"
              >
                <Td>
                  <Link
                    href={`/dev/performance${buildPerformanceSearch({ ...filters, service: row.service })}`}
                    className="font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors whitespace-nowrap"
                  >
                    {row.service}
                  </Link>
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.requestsPerMin === null ? "—" : row.requestsPerMin.toLocaleString()}
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.p50Ms} ms
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.p95Ms} ms
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.p99Ms} ms
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.errorRatePercent.toFixed(2)}%
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.apdex.toFixed(2)}
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.cpuPercent}%
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.memoryPercent}%
                </Td>
                <Td>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap",
                      STATUS_TEXT[row.status],
                    )}
                  >
                    <span
                      className={cn("size-2 rounded-full", STATUS_DOT[row.status])}
                      aria-hidden
                    />
                    {row.status}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing 1 to {rows.length} of {rows.length} services
        </span>
        <Pagination totalPages={1} currentPage={1} />
      </div>
    </DevSectionCard>
  );
}

function isNumericKey(k: ServiceSortKey): boolean {
  return k !== "service" && k !== "status";
}

function SortableTh({
  label,
  sortKey,
  filters,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: ServiceSortKey;
  filters: PerformanceFilters;
  onSort: (k: ServiceSortKey) => void;
  align?: "left" | "right";
}) {
  const active = filters.sortBy === sortKey;
  const Icon = !active ? ArrowUpDown : filters.sortDir === "asc" ? ArrowUp : ArrowDown;
  const ariaSort: React.AriaAttributes["aria-sort"] =
    active ? (filters.sortDir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn(
        "font-semibold py-2 px-2.5 align-middle whitespace-nowrap",
        align === "right" && "text-right",
      )}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-[var(--dev-text-primary)] transition-colors",
          active && "text-[var(--dev-text-primary)]",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon
          className={cn("size-3", active ? "opacity-100" : "opacity-50")}
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}

function Pagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  return (
    <nav className="inline-flex items-center gap-1" aria-label="Pagination">
      <PageButton aria-label="Previous page" disabled>
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </PageButton>
      <PageButton active>{currentPage}</PageButton>
      <PageButton aria-label="Next page" disabled={currentPage >= totalPages}>
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
          : "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)] disabled:opacity-40 disabled:hover:text-[var(--dev-text-secondary)] disabled:hover:border-[var(--dev-border)]",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
