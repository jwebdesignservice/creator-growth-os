import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  ExternalLink,
  HardDrive,
  Info,
  Lock,
  Monitor,
  Server,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { LiveLogLevel, LiveLogRow } from "@/lib/dev-dashboard/types";
import { buildLogsSearch, type LogsFilters } from "@/lib/dev-dashboard/logs-filters";
import { cn } from "@/lib/cn";

const LEVEL_PILL: Record<LiveLogLevel, string> = {
  INFO:  "bg-[var(--dev-accent-soft)]   text-[var(--dev-accent-text)]   border border-[var(--dev-accent-border)]",
  WARN:  "bg-[var(--dev-warning-soft)]  text-[var(--dev-warning-text)]  border border-[var(--dev-warning-border)]",
  ERROR: "bg-[var(--dev-danger-soft)]   text-[var(--dev-danger-text)]   border border-[var(--dev-danger-border)]",
  DEBUG: "bg-[var(--dev-surface-elev)]  text-[var(--dev-text-secondary)] border border-[var(--dev-border)]",
};

const LEVEL_DOT: Record<LiveLogLevel, string> = {
  INFO:  "bg-[var(--dev-accent-text)]",
  WARN:  "bg-[var(--dev-warning-text)]",
  ERROR: "bg-[var(--dev-danger-text)]",
  DEBUG: "bg-[var(--dev-text-muted)]",
};

/* Icon per service — keeps the table scannable like the reference image. */
const SERVICE_ICON: Record<string, LucideIcon> = {
  frontend:      Monitor,
  database:      Database,
  notifications: Bell,
  auth:          Lock,
  "backend-api": Server,
  storage:       HardDrive,
  payments:      CreditCard,
};

type Props = {
  rows:        LiveLogRow[];
  total:       number;
  totalPages:  number;
  currentPage: number;
  selectedId:  string | null;
  filters:     LogsFilters;
};

export function LiveLogStreamTable({ rows, total, totalPages, currentPage, selectedId, filters }: Props) {
  const from = rows.length === 0 ? 0 : (currentPage - 1) * 8 + 1;
  const to   = from === 0 ? 0 : from + rows.length - 1;

  return (
    <DevSectionCard
      title="Live Log Stream"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Real-time structured logs from platform services
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Time</Th>
              <Th>Level</Th>
              <Th>Service</Th>
              <Th>Source</Th>
              <Th>Message</Th>
              <Th>Trace ID</Th>
              <Th>User</Th>
              <Th>Route</Th>
              <Th className="text-right">Duration</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[12.5px] text-[var(--dev-text-muted)]">
                  No log events match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <LogRow
                  key={row.id}
                  row={row}
                  selected={row.id === selectedId}
                  selectHref={`/dev/logs${buildLogsSearch({ ...filters, selectedId: row.id })}`}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Showing {from} to {to} of {total.toLocaleString()} results
        </span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dev-success-text)]">
            <span className="relative inline-flex size-2">
              <span className="absolute inline-flex size-2 rounded-full bg-[var(--dev-success)] opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--dev-success)]" />
            </span>
            Live
          </span>
          <Pagination totalPages={totalPages} currentPage={currentPage} filters={filters} />
        </div>
      </div>
    </DevSectionCard>
  );
}

function LogRow({
  row,
  selected,
  selectHref,
}: {
  row: LiveLogRow;
  selected: boolean;
  selectHref: string;
}) {
  const ServiceIcon = SERVICE_ICON[row.service] ?? Info;

  return (
    <tr
      aria-selected={selected || undefined}
      className={cn(
        "border-t border-[var(--dev-border-soft)] text-[12.5px] transition-colors cursor-pointer",
        selected
          ? "bg-[var(--dev-accent-soft)] outline outline-1 outline-[var(--dev-accent-border)]"
          : "hover:bg-[var(--dev-surface-soft)]",
      )}
    >
      <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap font-mono text-[12px]">
        <Link
          href={selectHref}
          scroll={false}
          aria-label={`Select log ${row.id}`}
          className="block focus:outline-none focus-visible:underline"
        >
          {row.time}
        </Link>
      </Td>
      <Td>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-1.5 h-[20px] rounded-md text-[10.5px] font-semibold tracking-wider whitespace-nowrap",
            LEVEL_PILL[row.level],
          )}
        >
          <span className={cn("size-1.5 rounded-full", LEVEL_DOT[row.level])} aria-hidden />
          {row.level}
        </span>
      </Td>
      <Td>
        <span className="inline-flex items-center gap-1.5 text-[var(--dev-text-primary)] whitespace-nowrap">
          <ServiceIcon className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} aria-hidden />
          {row.service}
        </span>
      </Td>
      <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.source}</Td>
      <Td className="text-[var(--dev-text-primary)]">{row.message}</Td>
      <Td>
        <a
          href="#"
          aria-label={`View trace ${row.traceId}`}
          className="inline-flex items-center gap-1 font-mono text-[12px] text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors whitespace-nowrap"
        >
          {row.traceId}
          <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
        </a>
      </Td>
      <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.user ?? "—"}</Td>
      <Td>
        <span className="font-mono text-[12px] text-[var(--dev-text-secondary)] whitespace-nowrap">
          {row.route}
        </span>
      </Td>
      <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
        {row.duration}
      </Td>
    </tr>
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
  return <td className={cn("py-2.5 px-2.5 align-middle", className)}>{children}</td>;
}

function Pagination({
  totalPages,
  currentPage,
  filters,
}: {
  totalPages: number;
  currentPage: number;
  filters: LogsFilters;
}) {
  const hrefFor = (p: number) =>
    `/dev/logs${buildLogsSearch({ ...filters, page: p })}`;
  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPages, currentPage + 1);
  const showEllipsisGap = totalPages > currentPage + 3;

  return (
    <nav className="inline-flex items-center gap-1" aria-label="Pagination">
      <PageLink href={hrefFor(prev)} disabled={currentPage === 1} aria-label="Previous page">
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </PageLink>
      <PageLink href={hrefFor(currentPage)} active>
        {currentPage}
      </PageLink>
      {currentPage + 1 <= totalPages && (
        <PageLink href={hrefFor(currentPage + 1)}>{currentPage + 1}</PageLink>
      )}
      {currentPage + 2 <= totalPages && (
        <PageLink href={hrefFor(currentPage + 2)}>{currentPage + 2}</PageLink>
      )}
      {showEllipsisGap && (
        <span className="px-2 text-[12px] text-[var(--dev-text-muted)]" aria-hidden>…</span>
      )}
      {totalPages > currentPage + 2 && (
        <PageLink href={hrefFor(totalPages)}>{totalPages}</PageLink>
      )}
      <PageLink href={hrefFor(next)} disabled={currentPage === totalPages} aria-label="Next page">
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  children,
  href,
  active = false,
  disabled = false,
  ...rest
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
  disabled?: boolean;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  const className = cn(
    "inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-[8px] text-[12.5px] font-medium border transition-colors",
    active
      ? "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white"
      : disabled
        ? "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-faint)] pointer-events-none"
        : "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)]",
  );
  if (disabled) {
    return <span className={className} aria-disabled>{children}</span>;
  }
  return (
    <Link href={href} scroll={false} className={className} {...rest}>
      {children}
    </Link>
  );
}
