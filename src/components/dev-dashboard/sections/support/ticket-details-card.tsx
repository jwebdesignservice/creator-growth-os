import { ArrowUpRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { SUPPORT_TICKET_DETAILS } from "@/lib/dev-dashboard/mock-data";
import type {
  SupportTicketDetails,
  SupportTicketPriority,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";
import { EditNotesForm } from "./edit-notes-form";
import { EscalateButton } from "./escalate-button";
import { StatusMenu } from "./status-menu";
import { AssignMenu } from "./assign-menu";
import { CsatRatingWidget } from "./csat-rating-widget";

type AssignableUser = { id: string; label: string };

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
  data?: SupportTicketDetails | null;
  assignableUsers?: AssignableUser[];
};

export function TicketDetailsCard({ data, assignableUsers = [] }: Props) {
  // Treat undefined as "use default mock", explicit null as "no selection".
  const t: SupportTicketDetails | null =
    data === undefined ? SUPPORT_TICKET_DETAILS : data;

  if (!t) {
    return (
      <DevSectionCard title="Ticket Details" contentClassName="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-[12.5px] text-[var(--dev-text-muted)] text-center px-4">
          Select a ticket from the queue to see its details, reproduction notes, SLA,
          and internal notes here.
        </p>
      </DevSectionCard>
    );
  }

  return (
    <DevSectionCard
      title="Ticket Details"
      trailing={
        <span className={cn("inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap", PRIORITY_PILL[t.priority])}>
          {PRIORITY_LABEL[t.priority]} Priority
        </span>
      }
      contentClassName="flex flex-col gap-4"
    >
      {/* Title + ID summary */}
      <div>
        <h4 className="text-[17px] font-semibold text-[var(--dev-text-primary)] leading-snug">
          {t.title}
        </h4>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[var(--dev-text-muted)]">
          <span>
            Ticket ID: <span className="font-mono text-[var(--dev-text-secondary)]">{t.id}</span>
          </span>
          <span aria-hidden>•</span>
          <span>
            Client Support ID:{" "}
            <span className="font-mono text-[var(--dev-text-secondary)]">{t.clientSupportId}</span>
          </span>
        </div>
      </div>

      {/* Account / status / source / assignee — clickable status + assignee */}
      <div className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] divide-y divide-[var(--dev-border-soft)]">
        <Row label="Account / Workspace">
          <span className="font-mono text-[12px] text-[var(--dev-text-primary)]">
            {t.account} (<span className="text-[var(--dev-text-secondary)]">{t.workspace}</span>)
          </span>
        </Row>
        <Row label="Status">
          <StatusMenu ticketPublicId={t.id} currentStatus={t.status} />
        </Row>
        <Row label="Assigned To">
          <AssignMenu
            ticketPublicId={t.id}
            currentAssigneeName={t.assigneeName}
            currentAssigneeId={t.assigneeUserId}
            assignableUsers={assignableUsers}
          />
        </Row>
        <Row label="Source">
          <span className="text-[12.5px] text-[var(--dev-text-primary)]">{t.source}</span>
        </Row>
      </div>

      {/* Issue summary */}
      <Block label="Issue Summary">
        <p className="text-[12.5px] text-[var(--dev-text-primary)] leading-relaxed whitespace-pre-wrap">
          {t.issueSummary}
        </p>
      </Block>

      {/* Reproduction notes */}
      {t.reproductionNotes.length > 0 && (
        <Block label="Reproduction Notes">
          <ol className="space-y-1.5 text-[12.5px] text-[var(--dev-text-primary)] leading-relaxed">
            {t.reproductionNotes.map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="shrink-0 inline-flex items-center justify-center size-5 rounded-md bg-[var(--dev-surface-elev)] border border-[var(--dev-border)] text-[10.5px] font-semibold text-[var(--dev-text-muted)] tabular-nums">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {/* SLA / affected area */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="SLA Deadline" value={t.slaDeadline} muted>
          <span
            className={cn(
              "mt-1 inline-flex items-center px-1.5 h-[19px] rounded-md text-[10.5px] font-semibold whitespace-nowrap",
              t.slaTimeLeft === "Breached"
                ? "bg-[var(--dev-danger-soft)] text-[var(--dev-danger-text)] border border-[var(--dev-danger-border)]"
                : t.slaTimeLeft === "No SLA"
                  ? "bg-[var(--dev-surface-elev)] text-[var(--dev-text-muted)] border border-[var(--dev-border)]"
                  : "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
            )}
          >
            {t.slaTimeLeft}
          </span>
        </MiniStat>
        <MiniStat label="Affected Area" value={t.affectedArea} />
      </div>

      {/* Internal notes — interactive */}
      <Block label="Internal Notes">
        <EditNotesForm ticketId={t.id} initialNotes={t.internalNotes} />
      </Block>

      {/* CSAT — only after the ticket is resolved */}
      {t.status === "resolved" && (
        <CsatRatingWidget ticketPublicId={t.id} initialRating={t.csatRating} />
      )}

      {/*
        Footer actions.
        "Open Full Ticket" is the PRIMARY CTA on the triage overview —
        it takes the operator to /dev/support/[ticketId] where the full
        conversation, reply composer, internal investigation and
        workflow live. Escalate sits as the secondary action.
      */}
      <div className="mt-auto pt-3 border-t border-[var(--dev-border-soft)] flex flex-wrap items-center justify-between gap-2">
        <a
          href={`/dev/support/${encodeURIComponent(t.id)}`}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_12px_rgba(79,141,224,0.22)]"
        >
          Open Full Ticket
          <ArrowUpRight className="size-3.5" strokeWidth={2} />
        </a>
        <EscalateButton ticketId={t.id} alreadyEscalated={t.status === "escalated"} />
      </div>
    </DevSectionCard>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-[11.5px] text-[var(--dev-text-muted)] font-medium">{label}</span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  muted,
  children,
}: {
  label: string;
  value: string;
  muted?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] p-2.5">
      <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1">
        {label}
      </div>
      <div
        className={cn(
          "text-[12.5px] font-medium tabular-nums leading-tight",
          muted ? "text-[var(--dev-text-secondary)]" : "text-[var(--dev-text-primary)]",
        )}
      >
        {value}
      </div>
      {children}
    </div>
  );
}
