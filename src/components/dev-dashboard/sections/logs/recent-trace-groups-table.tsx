import { ExternalLink, MoreHorizontal } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { TraceGroupRow, TraceGroupStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_DOT: Record<TraceGroupStatus, string> = {
  OK:    "bg-[var(--dev-success-text)]",
  Warn:  "bg-[var(--dev-warning-text)]",
  Error: "bg-[var(--dev-danger-text)]",
};

const STATUS_TEXT: Record<TraceGroupStatus, string> = {
  OK:    "text-[var(--dev-success-text)]",
  Warn:  "text-[var(--dev-warning-text)]",
  Error: "text-[var(--dev-danger-text)]",
};

export function RecentTraceGroupsTable({ rows }: { rows: TraceGroupRow[] }) {
  return (
    <DevSectionCard
      title="Recent Trace Groups"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Latest distributed traces across services
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Trace ID</Th>
              <Th>Service Count</Th>
              <Th>Status</Th>
              <Th className="text-right">Duration</Th>
              <Th>Last Seen</Th>
              <Th className="w-[40px]" aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] transition-colors"
              >
                <Td>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors whitespace-nowrap"
                  >
                    {row.traceId}
                    <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
                  </a>
                </Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">
                  {row.serviceCount} services
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
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {row.duration}
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-1.5 text-[var(--dev-text-secondary)] whitespace-nowrap">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        row.lastSeen === "Just now"
                          ? "bg-[var(--dev-success-text)]"
                          : "bg-[var(--dev-text-muted)]",
                      )}
                      aria-hidden
                    />
                    {row.lastSeen}
                  </span>
                </Td>
                <Td className="text-right">
                  <button
                    type="button"
                    aria-label={`Actions for trace ${row.traceId}`}
                    className="inline-flex items-center justify-center size-7 rounded-[8px] text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-elev)] transition-colors"
                  >
                    <MoreHorizontal className="size-4" strokeWidth={2} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DevSectionCard>
  );
}

function Th({
  children,
  className = "",
  ...rest
}: { children?: React.ReactNode; className?: string } & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("font-semibold py-2 px-2.5 align-middle whitespace-nowrap", className)}
      {...rest}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}
