"use client";

import type { AuthEventDevice, AuthEventRow, AuthEventStatusKind } from "@/lib/dev-dashboard/types";
import { useAuthEventDetail } from "./auth-event-detail-modal";
import { cn } from "@/lib/cn";

/* Style maps duplicated here (instead of imported from the parent table) so
   this client bundle stays self-contained and doesn't pull in server-only
   code from the wrapper. */
const DEVICE_TINT: Record<AuthEventDevice, string> = {
  Desktop: "text-[var(--dev-text-secondary)]",
  Mobile:  "text-[var(--dev-accent-text)]",
  Tablet:  "text-[var(--dev-chart-violet)]",
};

const STATUS_PILL: Record<AuthEventStatusKind, string> = {
  success: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  tracked: "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

export function AuthEventsTableRows({ rows }: { rows: AuthEventRow[] }) {
  const { open } = useAuthEventDetail();

  return (
    <>
      {rows.map((row) => (
        <tr
          key={row.id}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${row.event} at ${row.time}`}
          onClick={() => open(row)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open(row);
            }
          }}
          className="border-t border-[var(--dev-border-soft)] text-[12.5px] hover:bg-[var(--dev-surface-soft)] focus:bg-[var(--dev-surface-soft)] focus:outline-none focus:ring-1 focus:ring-[var(--dev-accent-border)] transition-colors cursor-pointer"
        >
          <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">
            {row.time}
          </Td>
          <Td>
            <span className="font-mono text-[12px] text-[var(--dev-text-primary)] whitespace-nowrap">
              {row.event}
            </span>
          </Td>
          <Td className="text-[var(--dev-text-primary)] whitespace-nowrap">{row.user}</Td>
          <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{row.provider}</Td>
          <Td>
            <span className="font-mono text-[12px] text-[var(--dev-text-secondary)] whitespace-nowrap">
              {row.route}
            </span>
          </Td>
          <Td className={cn("font-medium whitespace-nowrap", DEVICE_TINT[row.device])}>
            {row.device}
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
        </tr>
      ))}
    </>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}
