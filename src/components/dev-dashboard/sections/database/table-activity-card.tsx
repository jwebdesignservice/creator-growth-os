import { DevSectionCard } from "../../dev-section-card";
import { DB_TABLE_ACTIVITY } from "@/lib/dev-dashboard/mock-data";
import type { DbTableActivityRow, DbTableActivityStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<DbTableActivityStatus, string> = {
  "Healthy":       "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  "High activity": "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  "Warning":       "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  "Critical":      "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

const STATUS_DOT: Record<DbTableActivityStatus, string> = {
  "Healthy":       "bg-[var(--dev-success-text)]",
  "High activity": "bg-[var(--dev-accent-text)]",
  "Warning":       "bg-[var(--dev-warning-text)]",
  "Critical":      "bg-[var(--dev-danger-text)]",
};

export function TableActivityCard({ data }: { data?: DbTableActivityRow[] }) {
  const rows = data ?? DB_TABLE_ACTIVITY;
  return (
    <DevSectionCard
      title="Table Activity"
      trailing={
        <span className="text-[12px] text-[var(--dev-text-muted)]">
          Last 24 hours
        </span>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Table</Th>
              <Th className="text-right">Reads</Th>
              <Th className="text-right">Writes</Th>
              <Th className="text-right">Row Count</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.table}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] transition-colors"
              >
                <Td>
                  <span className="font-mono text-[12px] text-[var(--dev-text-primary)] whitespace-nowrap">
                    {r.table}
                  </span>
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {r.reads.toLocaleString()}
                </Td>
                <Td className="text-right text-[var(--dev-text-primary)] tabular-nums whitespace-nowrap">
                  {r.writes.toLocaleString()}
                </Td>
                <Td className="text-right text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">
                  {r.rowCount.toLocaleString()}
                </Td>
                <Td>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap",
                      STATUS_PILL[r.status],
                    )}
                  >
                    <span
                      className={cn("size-1.5 rounded-full", STATUS_DOT[r.status])}
                      aria-hidden
                    />
                    {r.status}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
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
  return <td className={cn("py-2.5 px-2.5 align-middle", className)}>{children}</td>;
}
