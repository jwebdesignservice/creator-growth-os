import Link from "next/link";
import { DevSectionCard } from "../../dev-section-card";
import {
  GROUPED_ERRORS,
  GROUPED_ERRORS_TOTAL,
  GROUPED_ERRORS_TOTAL_PAGES,
} from "@/lib/dev-dashboard/mock-data";
import { ERRORS_PAGE_SIZE, type ErrorsFilterState } from "@/lib/dev-dashboard/errors-filters";
import type { ErrorSeverity, ErrorStatus, GroupedErrorRow } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";
import { GroupedErrorsPagination } from "./grouped-errors-pagination";

const SEVERITY_PILL: Record<ErrorSeverity, string> = {
  critical: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  high:     "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  medium:   "bg-[var(--dev-chart-amber)]/15 text-[var(--dev-chart-amber)] border border-[var(--dev-chart-amber)]/30",
  low:      "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const STATUS_PILL: Record<ErrorStatus, string> = {
  open:          "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  investigating: "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  resolved:      "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
};

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = {
  rows?: GroupedErrorRow[];
  total?: number;
  totalPages?: number;
  filters?: ErrorsFilterState;
};

export function GroupedErrorsTable({ rows, total, totalPages, filters }: Props) {
  const data = rows ?? GROUPED_ERRORS;
  const totalCount = total ?? GROUPED_ERRORS_TOTAL;
  const pages = totalPages ?? GROUPED_ERRORS_TOTAL_PAGES;
  const page = filters?.page ?? 1;

  // Range copy: "Showing 1 to 8 of 1,284 grouped errors".
  const start = data.length === 0 ? 0 : (page - 1) * ERRORS_PAGE_SIZE + 1;
  const end = (page - 1) * ERRORS_PAGE_SIZE + data.length;

  return (
    <DevSectionCard
      title="Grouped Errors"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Errors are grouped by fingerprint to reduce duplicate noise.
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[1080px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Error ID</Th>
              <Th>Message</Th>
              <Th>Source</Th>
              <Th>Route</Th>
              <Th>Severity</Th>
              <Th>Status</Th>
              <Th className="text-right">Occurrences</Th>
              <Th className="text-right">Affected Users</Th>
              <Th>Release</Th>
              <Th>Last Seen</Th>
              <Th>Owner</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-10 text-center text-[12.5px] text-[var(--dev-text-muted)]">
                  No errors match the current filters.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] transition-colors">
                  <Td>
                    <span className="font-mono text-[12px] text-[var(--dev-text-secondary)]">
                      {row.id}
                    </span>
                  </Td>
                  <Td className="text-[var(--dev-text-primary)]">{row.message}</Td>
                  <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.source}</Td>
                  <Td>
                    <span className="font-mono text-[12px] text-[var(--dev-text-secondary)]">
                      {row.route}
                    </span>
                  </Td>
                  <Td>
                    <Pill className={SEVERITY_PILL[row.severity]}>{titleCase(row.severity)}</Pill>
                  </Td>
                  <Td>
                    <Pill className={STATUS_PILL[row.status]}>{titleCase(row.status)}</Pill>
                  </Td>
                  <Td className="text-right text-[var(--dev-text-primary)] tabular-nums">{row.occurrences}</Td>
                  <Td className="text-right text-[var(--dev-text-primary)] tabular-nums">{row.affectedUsers}</Td>
                  <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">{row.release}</Td>
                  <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">{row.lastSeen}</Td>
                  <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.owner}</Td>
                  <Td>
                    {/* Detail page intentionally not built in this pass — link kept
                        for forward-compat so a future /dev/errors/[id] picks it up. */}
                    <Link
                      href={{ pathname: `/dev/errors/${row.id.toLowerCase()}` }}
                      className="text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors whitespace-nowrap"
                    >
                      View details
                    </Link>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing {start} to {end} of {totalCount.toLocaleString()} grouped errors
        </span>
        <GroupedErrorsPagination
          totalPages={pages}
          currentPage={page}
          filters={filters}
        />
      </div>
    </DevSectionCard>
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
