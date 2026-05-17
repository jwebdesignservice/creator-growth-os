import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { SUPPORT_ESCALATIONS } from "@/lib/dev-dashboard/mock-data";
import type {
  SupportEscalationRow,
  SupportTicketPriority,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const PRIORITY_DOT: Record<SupportTicketPriority, string> = {
  high:   "bg-[var(--dev-danger)]",
  medium: "bg-[var(--dev-warning)]",
  low:    "bg-[var(--dev-accent)]",
};

const PRIORITY_PILL: Record<SupportTicketPriority, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  high:   "High",
  medium: "Medium",
  low:    "Low",
};

type Props = {
  data?: SupportEscalationRow[];
};

export function EscalationsCard({ data }: Props) {
  const rows = data ?? SUPPORT_ESCALATIONS;
  return (
    <DevSectionCard
      title="Escalations & SLA Risk"
      trailing={
        <span className="inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold bg-[var(--dev-danger-soft)] text-[var(--dev-danger-text)] border border-[var(--dev-danger-border)] tabular-nums">
          {rows.length}
        </span>
      }
    >
      {rows.length === 0 ? (
        <p className="text-[12.5px] text-[var(--dev-text-muted)] py-6 text-center">
          No active escalations. Healthy SLAs.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.ticketId} className="relative">
              <Link
                href={`/dev/support?ticket=${encodeURIComponent(row.ticketId)}`}
                scroll={false}
                className="block pl-4 pr-3 py-2.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] hover:bg-[var(--dev-surface)] hover:border-[var(--dev-border-strong)] transition-colors"
              >
                <span
                  className={cn("absolute left-2.5 top-3 inline-block size-2 rounded-full", PRIORITY_DOT[row.priority])}
                  aria-hidden
                />
                <div className="flex items-start gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11.5px] text-[var(--dev-text-muted)]">
                        {row.ticketId}
                      </span>
                      <span className="text-[12.5px] font-medium text-[var(--dev-text-primary)] truncate">
                        {row.subject}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[var(--dev-text-muted)]">
                      <span>{row.escalationState}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn("inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-semibold whitespace-nowrap", PRIORITY_PILL[row.priority])}>
                      {PRIORITY_LABEL[row.priority]}
                    </span>
                    <span className="text-[11px] text-[var(--dev-text-muted)] tabular-nums whitespace-nowrap">
                      {row.timeAtRisk}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dev/support?status=escalated"
        scroll={false}
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View all escalations
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
