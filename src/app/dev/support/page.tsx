import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { SupportMetricCards } from "@/components/dev-dashboard/sections/support/support-metric-cards";
import { SupportFilterBar } from "@/components/dev-dashboard/sections/support/support-filter-bar";
import { TicketQueueTable } from "@/components/dev-dashboard/sections/support/ticket-queue-table";
import { TicketDetailsCard } from "@/components/dev-dashboard/sections/support/ticket-details-card";
import { ClientProfileCard } from "@/components/dev-dashboard/sections/support/client-profile-card";
import { EscalationsCard } from "@/components/dev-dashboard/sections/support/escalations-card";
import { SlaPerformanceCard } from "@/components/dev-dashboard/sections/support/sla-performance-card";
import { CreateTicketModal } from "@/components/dev-dashboard/sections/support/create-ticket-modal";
import { ExportTicketsButton } from "@/components/dev-dashboard/sections/support/export-tickets-button";
import { SupportRealtime } from "@/components/dev-dashboard/sections/support/support-realtime";
import { ActiveFilterChips } from "@/components/dev-dashboard/sections/support/active-filter-chips";
import {
  parseSupportFilters,
  type SupportRawSearchParams,
} from "@/lib/dev-dashboard/support-filters";
import {
  getClientProfileForTicket,
  getEscalations,
  getSelectedTicket,
  getSlaSummary,
  getSupportFilterOptions,
  getSupportMetrics,
  getSupportQueue,
} from "@/lib/dev-dashboard/support-queries";

export const metadata = { title: "Support · Dev Dashboard" };

type PageProps = {
  searchParams: Promise<SupportRawSearchParams>;
};

/* Safe-default helper: each query layer is wrapped so a single rejection
   never collapses the whole page render. The route-segment error.tsx is
   still the safety net if something throws outside the query layer.   */
async function safe<T>(p: Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await p;
  } catch (err) {
    console.error(`[/dev/support] ${label} failed:`, err);
    return fallback;
  }
}

export default async function DevSupportPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseSupportFilters(raw);

  // Fan-out: all reads are independent and run in parallel.
  // The full conversation + reply workflow lives on /dev/support/[ticketId]
  // (rendered by ConversationThread there), so we no longer fetch the
  // ticket timeline on the overview — keeps this page focused on triage.
  //
  // Each query is wrapped in `safe()` so a single failing call (e.g. an
  // unapplied migration causing a missing-column error somewhere deep in
  // the query layer) degrades to a sensible empty state for that one
  // section instead of 500-ing the whole page.
  const [
    metrics,
    queue,
    selectedTicket,
    clientProfile,
    escalations,
    slaSummary,
    filterOptions,
  ] = await Promise.all([
    safe(getSupportMetrics(),                  { data: [],    usedFallback: true }, "metrics"),
    safe(getSupportQueue(filters),             {
      data: {
        rows: [],
        pagination: { showingFrom: 0, showingTo: 0, total: 0, currentPage: 1, totalPages: 1 },
      },
      usedFallback: true,
    }, "queue"),
    safe(getSelectedTicket(filters.ticket),    { data: null,  usedFallback: true }, "selectedTicket"),
    safe(getClientProfileForTicket(filters.ticket), { data: null, usedFallback: true }, "clientProfile"),
    safe(getEscalations(),                     { data: [],    usedFallback: true }, "escalations"),
    safe(getSlaSummary(),                      {
      data: { totalTickets: 0, metPercent: 0, buckets: [] },
      usedFallback: true,
    }, "slaSummary"),
    safe(getSupportFilterOptions(),            { categories: [], assignees: [] },    "filterOptions"),
  ]);

  return (
    <div className="space-y-[var(--mobile-section-gap)] sm:space-y-5">
      {/* Invisible Realtime watcher — subscribes to support_tickets +
          support_ticket_messages and triggers router.refresh() on any
          change. Lets user submissions appear in the dev queue without
          requiring a manual page reload. */}
      <SupportRealtime />

      <DevPageHeader
        title="Support"
        subtitle="Manage client support tickets, escalations, and resolution workflows"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CreateTicketModal />
            <ExportTicketsButton />
          </div>
        }
      />

      {/* 1. Top metric strip — 6 cards */}
      <SupportMetricCards data={metrics.data} />

      {/* 2. Filter / control row (URL-driven) */}
      <SupportFilterBar options={filterOptions} />

      {/* 2b. Active filter chips — renders nothing when no filters applied */}
      <ActiveFilterChips assignableUsers={filterOptions.assignees} />

      {/*
        ROW 1 — TRIAGE WORKSPACE.
        Queue dominates (8/12) — this is a queue-first triage page.
        Selected Ticket Preview (4/12) is a *scan-and-decide* card, not
        a resolution surface: it shows enough for the operator to know
        whether to open the full ticket. The full conversation + reply
        composer live on /dev/support/[ticketId] — the preview's
        primary CTA "Open Full Ticket" links straight there.

        Responsive ladder:
          mobile (<xl)  : stack (queue first, preview below)
          xl+   (≥1280) : Queue 8 / Preview 4
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-[var(--mobile-grid-gap)] sm:gap-4">
        <div className="xl:col-span-8 min-w-0">
          <TicketQueueTable
            rows={queue.data.rows}
            pagination={queue.data.pagination}
            filters={filters}
          />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <TicketDetailsCard
            data={selectedTicket.data}
            assignableUsers={filterOptions.assignees}
          />
        </div>
      </div>

      {/*
        ROW 2 — RISK + CONTEXT.
        Team/account-level signals that help the operator prioritize the
        queue without opening every ticket: which tickets are escalated
        or near SLA breach (left), who the selected ticket's client is
        (middle), how the team is performing against SLAs overall (right).

        No per-ticket conversation/reply surfaces here — those belong on
        the deep ticket page. This keeps the overview as a true triage
        dashboard rather than a half-baked resolution cockpit.

        Responsive ladder:
          mobile (<lg)  : single column stack
          lg (1024–1279): 2-up — Escalations full row, Client Context + SLA 2-up below
          xl+ (≥1280)   : 3-up — Escalations 5 / Client Context 4 / SLA Performance 3
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--mobile-grid-gap)] sm:gap-4">
        <div className="lg:col-span-12 xl:col-span-5 min-w-0">
          <EscalationsCard data={escalations.data} />
        </div>
        <div className="lg:col-span-7 xl:col-span-4 min-w-0">
          <ClientProfileCard data={clientProfile.data} />
        </div>
        <div className="lg:col-span-5 xl:col-span-3 min-w-0">
          <SlaPerformanceCard data={slaSummary.data} />
        </div>
      </div>
    </div>
  );
}
