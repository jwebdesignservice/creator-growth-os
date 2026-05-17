import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { TicketSummaryBar } from "@/components/dev-dashboard/sections/support/ticket-details/ticket-summary-bar";
import { ClientSubmissionCard } from "@/components/dev-dashboard/sections/support/ticket-details/client-submission-card";
import { InternalInvestigationCard } from "@/components/dev-dashboard/sections/support/ticket-details/internal-investigation-card";
import { ClientProfileDetailCard } from "@/components/dev-dashboard/sections/support/ticket-details/client-profile-detail-card";
import { TicketMetadataCard } from "@/components/dev-dashboard/sections/support/ticket-details/ticket-metadata-card";
import { ConversationThread } from "@/components/dev-dashboard/sections/support/ticket-details/conversation-thread";
import { EscalationWorkflowCard } from "@/components/dev-dashboard/sections/support/ticket-details/escalation-workflow-card";
import { RelatedIssuesCard } from "@/components/dev-dashboard/sections/support/ticket-details/related-issues-card";
import { SlaRiskCard } from "@/components/dev-dashboard/sections/support/ticket-details/sla-risk-card";
import { AssignMenu } from "@/components/dev-dashboard/sections/support/ticket-details/assign-menu";
import { ChangeStatusMenu } from "@/components/dev-dashboard/sections/support/ticket-details/change-status-menu";
import { EscalateMenu } from "@/components/dev-dashboard/sections/support/ticket-details/escalate-menu";
import { ToastProvider } from "@/components/dev-dashboard/sections/support/ticket-details/toast-provider";
import { KeyboardShortcutsOverlay } from "@/components/dev-dashboard/sections/support/ticket-details/keyboard-shortcuts-overlay";
import { parseConversationFilter } from "@/components/dev-dashboard/sections/support/ticket-details/conversation-filter";
import {
  getAssignableUsers,
  getDevTicketDetailByPublicId,
} from "@/lib/dev-support/queries";
import {
  DEV_ESCALATION_OPTIONS,
  type DevEscalationState,
} from "@/lib/dev-support/types";

type PageProps = {
  params:       Promise<{ ticketId: string }>;
  searchParams: Promise<{ conv?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { ticketId } = await params;
  return { title: `${ticketId.toUpperCase()} · Support · Dev Dashboard` };
}

export default async function DevSupportTicketDetailPage({ params, searchParams }: PageProps) {
  const [{ ticketId }, sp] = await Promise.all([params, searchParams]);
  const convFilter = parseConversationFilter(sp.conv);

  const [data, assignableUsers] = await Promise.all([
    getDevTicketDetailByPublicId(ticketId),
    getAssignableUsers(),
  ]);

  const publicId = data.summary.id;
  // The DB stores escalation_state as one of the DEV_ESCALATION_OPTIONS
  // values (or null). The detail bundle smushes the value into
  // workflow.escalationStatus — derive the strict union back out for the
  // EscalateMenu so its "active option" highlight is accurate.
  const currentEscalation: DevEscalationState | null =
    DEV_ESCALATION_OPTIONS.find((o) => o === data.workflow.escalationStatus) ?? null;

  return (
    <ToastProvider>
      <KeyboardShortcutsOverlay />
      <div className="space-y-5">
      <DevPageHeader
        title="Ticket Details"
        subtitle="Review the submitted issue, communication history, internal notes, and resolution workflow."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Tertiary: navigation back — ghost-style so it doesn't compete
                with operational actions. */}
            <Link
              href="/dev/support"
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-[10px] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.9} />
              <span className="hidden sm:inline">Back to queue</span>
              <span className="sm:hidden">Back</span>
            </Link>

            {/* Visual separator between navigation and operational actions. */}
            <span aria-hidden className="hidden sm:block w-px h-5 bg-[var(--dev-border)] mx-0.5" />

            {/* Secondary cluster — neutral surface buttons. */}
            <AssignMenu ticketPublicId={publicId} assignableUsers={assignableUsers} />
            <ChangeStatusMenu ticketPublicId={publicId} />

            {/* Warning-toned secondary — visible, not dominant. The menu's
                trigger styling is set inside the component itself. */}
            <EscalateMenu ticketPublicId={publicId} currentEscalation={currentEscalation} />

            {/* Primary CTA — taller, with a subtle glow so it reads as the
                end-of-row action. Stretches to full width on phones so it
                stays the obvious tap target. */}
            <a
              href="#reply-composer"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[13px] font-semibold transition-colors shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_12px_rgba(79,141,224,0.25)] w-full sm:w-auto"
            >
              <Send className="size-3.5" strokeWidth={2} />
              Reply to Client
            </a>
          </div>
        }
      />

      <TicketSummaryBar data={data.summary} />

      {/*
        Main 12-col layout.
        LEFT (8 cols): Client Submission → Internal Investigation →
        Escalation & Workflow → Conversation Thread.
        RIGHT (4 cols): Client Profile → SLA Risk → Ticket Metadata →
        Related Issues. Operational order: who the client is, then the
        clock, then how they're set up, then linked context.
        Below xl, the right column drops underneath the left so each panel
        remains readable.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4 min-w-0">
          <ClientSubmissionCard         data={data.submission} />
          <InternalInvestigationCard    data={data.investigation} />
          <EscalationWorkflowCard       data={data.workflow} />
          <div id="reply-composer" className="scroll-mt-24">
            <ConversationThread
              data={data.conversation}
              ticketPublicId={publicId}
              filter={convFilter}
            />
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4 min-w-0">
          <ClientProfileDetailCard      data={data.clientProfile} />
          <SlaRiskCard                  data={data.slaRisk} />
          <TicketMetadataCard           data={data.metadata} />
          <RelatedIssuesCard            data={data.relatedIssues} />
        </div>
      </div>
      </div>
    </ToastProvider>
  );
}
