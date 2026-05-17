import { Copy, Building2, Clock3 } from "lucide-react";
import type {
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketSummary,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

/* Status / priority palettes match the queue table on /dev/support so the
 * detail page reads like a continuation of the same product. */
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

const PRIORITY_PILL: Record<SupportTicketPriority, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const ASSIGNEE_TONE_BG: Record<SupportTicketSummary["assignee"]["tone"], string> = {
  blue:   "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  green:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  amber:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  violet: "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/30",
  rose:   "bg-[var(--dev-chart-rose)]/12  text-[var(--dev-chart-rose)]  border-[var(--dev-chart-rose)]/30",
  cyan:   "bg-[var(--dev-chart-cyan)]/12  text-[var(--dev-chart-cyan)]  border-[var(--dev-chart-cyan)]/30",
};

/* Visual structure
   ────────────────
   Instead of one long auto-fit row of fields, the bar is split into three
   operational groups separated by vertical dividers at xl:

     Identity        │  Client / Context        │  Status & Risk
     ID + Subject    │  Client · Support ID     │  Status + Priority pills
     Category        │  Assignee                │  SLA deadline + remaining
                     │                          │  Account Plan

   The "Status & Risk" group emphasizes the two fields a support agent
   acts on first — Priority and Time remaining — by using slightly larger
   type and a warm-toned highlight on the countdown. */
export function TicketSummaryBar({ data }: { data: SupportTicketSummary }) {
  return (
    <section className="dev-card p-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1.1fr] gap-y-5 lg:gap-y-0">
        {/* ── Group 1 — Identity ─────────────────────────────────────── */}
        <Group title="Identity">
          <Field label="Ticket ID">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono text-[13px] text-[var(--dev-text-primary)] font-semibold">
                {data.id}
              </span>
              <Copy className="size-3 text-[var(--dev-text-muted)]" strokeWidth={1.8} aria-hidden />
            </span>
          </Field>
          <Field label="Subject" emphasized>
            <span className="text-[13.5px] text-[var(--dev-text-primary)] font-semibold leading-snug">
              {data.subject}
            </span>
          </Field>
          <Field label="Category">
            <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium">
              {data.category}
            </span>
          </Field>
        </Group>

        {/* ── Group 2 — Client / Context ─────────────────────────────── */}
        <Group title="Client" withDivider>
          <Field label="Client">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--dev-text-primary)] font-medium">
              {data.client}
              <span
                className="size-1.5 rounded-full bg-[var(--dev-success-text)]"
                aria-label="Online"
              />
            </span>
          </Field>
          <Field label="Client Support ID">
            <span className="font-mono text-[12px] text-[var(--dev-text-secondary)]">
              {data.clientSupportId}
            </span>
          </Field>
          <Field label="Assignee">
            <span className="inline-flex items-center gap-2">
              <span className={cn(
                "size-6 rounded-full inline-flex items-center justify-center border text-[10px] font-semibold shrink-0",
                ASSIGNEE_TONE_BG[data.assignee.tone],
              )}>
                {data.assignee.initials}
              </span>
              <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">
                {data.assignee.name}
              </span>
            </span>
          </Field>
        </Group>

        {/* ── Group 3 — Status & Risk (where agents act) ─────────────── */}
        <Group title="Status & Risk" withDivider>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={cn(
              "inline-flex items-center px-2 h-[24px] rounded-md text-[11.5px] font-semibold",
              STATUS_PILL[data.status],
            )}>
              {STATUS_LABEL[data.status]}
            </span>
            <span className={cn(
              "inline-flex items-center px-2 h-[24px] rounded-md text-[11.5px] font-semibold",
              PRIORITY_PILL[data.priority],
            )}>
              {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)} Priority
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <Field label="SLA deadline">
              <span className="text-[12px] text-[var(--dev-text-primary)] tabular-nums">
                {data.slaDeadline}
              </span>
            </Field>
            <Field label="Time remaining" emphasized>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--dev-warning-text)] font-semibold tabular-nums">
                <Clock3 className="size-3.5" strokeWidth={2} aria-hidden />
                {data.slaRemaining} left
              </span>
            </Field>
            <Field label="Account Plan">
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--dev-text-primary)] font-medium">
                <Building2 className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} />
                {data.accountPlan}
              </span>
            </Field>
            <Field label="Last update">
              <span className="text-[12px] text-[var(--dev-text-secondary)] tabular-nums">
                {data.lastUpdatedAt}
              </span>
            </Field>
          </div>
        </Group>
      </div>

      {/* Footer line — created timestamp kept here so we don't drop any
          information from the previous design. Small, unobtrusive. */}
      <div className="mt-4 pt-3 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--dev-text-muted)] tabular-nums">
        <span>
          <span className="font-semibold text-[var(--dev-text-secondary)] mr-1">Created</span>
          {data.createdAt}
        </span>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Layout primitives — local to this card.
   ───────────────────────────────────────────────────────────────────────── */

function Group({
  title,
  children,
  withDivider,
}: {
  title: string;
  children: React.ReactNode;
  withDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0",
        // Hairline divider between groups on desktop.
        withDivider && "lg:pl-6 lg:border-l lg:border-[var(--dev-border-soft)]",
        // Tighter inner gap between groups visually; bigger on small.
        !withDivider && "lg:pr-6",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-3">
        {title}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  emphasized,
  className,
}: {
  label: string;
  children: React.ReactNode;
  emphasized?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[10px] uppercase tracking-wider text-[var(--dev-text-muted)] font-medium mb-1">
        {label}
      </div>
      <div className={cn(emphasized ? "" : "truncate")}>{children}</div>
    </div>
  );
}
