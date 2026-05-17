import { DevSectionCard } from "../../dev-section-card";
import {
  RECENT_AUTH_EVENTS,
  RECENT_AUTH_EVENTS_TOTAL,
  RECENT_AUTH_EVENTS_TOTAL_PAGES,
} from "@/lib/dev-dashboard/mock-data";
import type { AuthEventRow } from "@/lib/dev-dashboard/types";
import { AUTH_EVENTS_PAGE_SIZE, type AuthFilterState } from "@/lib/dev-dashboard/auth-filters";
import { cn } from "@/lib/cn";
import { AuthEventsPagination } from "./auth-events-pagination";
import { AuthEventsTableRows } from "./auth-events-table-rows";

type Props = {
  rows?: AuthEventRow[];
  total?: number;
  totalPages?: number;
  filters?: AuthFilterState;
};

export function RecentAuthEventsTable({ rows, total, totalPages, filters }: Props) {
  const data = rows ?? RECENT_AUTH_EVENTS;
  const totalCount = total ?? RECENT_AUTH_EVENTS_TOTAL;
  const pages = totalPages ?? RECENT_AUTH_EVENTS_TOTAL_PAGES;
  const page = filters?.page ?? 1;

  const start = data.length === 0 ? 0 : (page - 1) * AUTH_EVENTS_PAGE_SIZE + 1;
  const end = (page - 1) * AUTH_EVENTS_PAGE_SIZE + data.length;

  return (
    <DevSectionCard
      title="Recent Auth Events"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Latest authentication-related events across the platform.
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Time</Th>
              <Th>Event</Th>
              <Th>User</Th>
              <Th>Provider</Th>
              <Th>Route</Th>
              <Th>Device</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] text-[var(--dev-text-muted)]">
                  No auth events match the current filters.
                </td>
              </tr>
            ) : (
              <AuthEventsTableRows rows={data} />
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing {start} to {end} of {totalCount.toLocaleString()} auth events
        </span>
        <AuthEventsPagination
          totalPages={pages}
          currentPage={page}
          filters={filters}
        />
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
