"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { closeTicket } from "@/lib/support/actions";
import { cn } from "@/lib/cn";
import type {
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/support/types";

/**
 * Premium "Support tickets" table.
 *
 *  • Search + status filter + pagination all run client-side over the
 *    set the server prefetched (up to 200 tickets). That keeps every
 *    interaction instant without changing the backend contract.
 *  • Eye icon → opens the existing ticket detail page.
 *  • Trash icon → close-ticket flow. Calls the existing `closeTicket`
 *    server action (which sets status="resolved"), wrapped in a tiny
 *    inline confirm so a misclick can't permanently change state.
 *    Disabled when the ticket is already resolved / closed.
 *  • Pagination uses an ellipsis-aware page list (1, 2, 3 … 12 patterns)
 *    so the control stays compact even with hundreds of tickets.
 *  • Mobile gets horizontal scroll on the table rather than a separate
 *    card layout — keeps a single source of truth and matches the dense
 *    information UX of the reference design.
 */

const PAGE_SIZE = 10;

/* ─── Visual mappings ─────────────────────────────────────────────────── */

const PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  low:    "Low",
  medium: "Normal",
  high:   "High",
  urgent: "Urgent",
};

const PRIORITY_PILL: Record<SupportTicketPriority, string> = {
  low:    "bg-ink-100 text-ink-700",
  medium: "bg-ink-100 text-ink-700",
  high:   "bg-gold-500/15 text-gold-500",
  urgent: "bg-rose-100 text-rose-700",
};

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open:        "Open",
  waiting:     "Waiting",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

const STATUS_PILL: Record<SupportTicketStatus, string> = {
  open:        "bg-success-bg text-success",
  waiting:     "bg-gold-500/15 text-gold-500",
  in_progress: "bg-rose-100 text-rose-700",
  resolved:    "bg-success-bg text-success",
  closed:      "bg-gold-500/15 text-gold-500",
};

const STATUS_FILTERS: { value: "all" | SupportTicketStatus; label: string }[] = [
  { value: "all",         label: "All" },
  { value: "open",        label: "Open" },
  { value: "waiting",     label: "Waiting" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved" },
  { value: "closed",      label: "Closed" },
];

/* ─── Main component ──────────────────────────────────────────────────── */

export function TicketsTable({ tickets }: { tickets: SupportTicket[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [query, setQuery]                 = useState("");
  const [statusFilter, setStatusFilter]   = useState<"all" | SupportTicketStatus>("all");
  const [page, setPage]                   = useState(1);
  const [confirmId, setConfirmId]         = useState<string | null>(null);
  const [closeError, setCloseError]       = useState<string | null>(null);

  /* ── Filter + paginate (pure derivations) ───────────────────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${t.subject} ${t.publicId} ${t.topic}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tickets, query, statusFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (clampedPage - 1) * PAGE_SIZE,
    clampedPage * PAGE_SIZE,
  );

  /* ── Handlers (state mutations live here, not in effects) ───────────── */
  const handleQuery = useCallback((v: string) => {
    setQuery(v);
    setPage(1);
    setConfirmId(null);
  }, []);

  const handleStatusFilter = useCallback(
    (s: "all" | SupportTicketStatus) => {
      setStatusFilter(s);
      setPage(1);
      setConfirmId(null);
    },
    [],
  );

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    setConfirmId(null);
  }, []);

  const handleConfirmClose = (publicId: string) => {
    setCloseError(null);
    startTransition(async () => {
      const result = await closeTicket(publicId);
      if (result.ok) {
        setConfirmId(null);
        // Re-fetch the server component so the updated status flows back
        // into this client component as a fresh `tickets` prop.
        router.refresh();
      } else {
        setCloseError(result.error);
      }
    });
  };

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      {/* Back link — preserves the navigation context from the prior page */}
      <Link
        href="/support"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-rose-700 transition-colors"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        Back to Support
      </Link>

      <section className="card p-0 overflow-hidden">
        {/* ── Header row ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap p-5 sm:p-6">
          <div className="min-w-0">
            <h1 className="text-h3 sm:text-[26px] text-ink-900 leading-tight">
              Support tickets
            </h1>
            <p className="mt-1 text-[12.5px] sm:text-[13px] text-ink-500">
              Track every request you&rsquo;ve submitted and follow up on
              ongoing conversations.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 sm:flex-initial justify-end min-w-0">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-[260px] min-w-0">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[14px] text-ink-400"
                strokeWidth={2}
                aria-hidden
              />
              <label htmlFor="ticket-search" className="sr-only">
                Search tickets
              </label>
              <input
                id="ticket-search"
                type="search"
                value={query}
                onChange={(e) => handleQuery(e.target.value)}
                placeholder="Search"
                autoComplete="off"
                className="w-full h-10 pl-10 pr-3 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
              />
            </div>

            <Link
              href="/support/new"
              className="inline-flex items-center gap-1.5 h-10 px-3.5 sm:px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:bg-rose-700 text-white text-[12.5px] sm:text-[13px] font-semibold transition-colors shadow-sm shrink-0"
            >
              <Plus className="size-[15px]" strokeWidth={2.4} />
              <span className="hidden sm:inline">Create new ticket</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>

        {/* ── Status chip row ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-wrap px-5 sm:px-6 pb-4">
          {STATUS_FILTERS.map((f) => {
            const active = f.value === statusFilter;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => handleStatusFilter(f.value)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center h-7 px-2.5 rounded-full text-[11.5px] font-medium border transition-colors",
                  active
                    ? "bg-ink-900 text-cream-100 border-ink-900"
                    : "bg-white border-ink-200 text-ink-700 hover:bg-cream-100 hover:text-ink-900",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── Close error banner (transient) ──────────────────────────── */}
        {closeError && (
          <div
            role="alert"
            className="mx-5 sm:mx-6 mb-3 px-3.5 py-2.5 rounded-[10px] bg-rose-50 border border-rose-200 text-[12.5px] text-rose-700"
          >
            {closeError}
          </div>
        )}

        {/* ── Table or empty state ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState query={query} hasAny={tickets.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="border-y border-ink-100 bg-cream-100/50">
                  <Th className="w-[110px] pl-5 sm:pl-6">ID</Th>
                  <Th>Title</Th>
                  <Th className="w-[110px]">Priority</Th>
                  <Th className="w-[110px]">Status</Th>
                  <Th className="w-[120px] text-right pr-5 sm:pr-6">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {slice.map((t) => {
                  const isFinal     = t.status === "resolved" || t.status === "closed";
                  const showConfirm = confirmId === t.publicId;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-ink-100 last:border-b-0 hover:bg-cream-100/40 transition-colors"
                    >
                      {/* ID */}
                      <td className="pl-5 sm:pl-6 pr-3 py-3.5 text-[12.5px] text-ink-500 tabular-nums">
                        #{t.publicId}
                      </td>

                      {/* Title — links to the ticket detail */}
                      <td className="px-3 py-3.5">
                        <Link
                          href={`/support/tickets/${t.publicId}`}
                          className="block text-[13px] font-medium text-ink-800 hover:text-rose-700 transition-colors truncate"
                          title={t.subject}
                        >
                          {t.subject}
                        </Link>
                      </td>

                      {/* Priority pill */}
                      <td className="px-3 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 h-[22px] rounded-full text-[11px] font-semibold whitespace-nowrap",
                            PRIORITY_PILL[t.priority],
                          )}
                        >
                          {PRIORITY_LABEL[t.priority]}
                        </span>
                      </td>

                      {/* Status pill */}
                      <td className="px-3 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 h-[22px] rounded-full text-[11px] font-semibold whitespace-nowrap",
                            STATUS_PILL[t.status],
                          )}
                        >
                          {STATUS_LABEL[t.status]}
                        </span>
                      </td>

                      {/* Actions — Eye + Trash, or inline confirm */}
                      <td className="pl-3 pr-5 sm:pr-6 py-3.5">
                        {showConfirm ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="hidden md:inline text-[11.5px] text-ink-500 mr-1">
                              Close ticket?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmClose(t.publicId)}
                              disabled={pending}
                              className="inline-flex items-center h-7 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11.5px] font-semibold disabled:opacity-60 transition-colors"
                            >
                              {pending ? "Closing…" : "Yes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              disabled={pending}
                              className="inline-flex items-center h-7 px-3 rounded-full bg-white border border-ink-200 hover:bg-cream-100 text-ink-700 text-[11.5px] font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/support/tickets/${t.publicId}`}
                              aria-label={`View ticket #${t.publicId}`}
                              title="View ticket"
                              className="inline-flex items-center justify-center size-8 rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-200 transition-colors"
                            >
                              <Eye className="size-[16px]" strokeWidth={1.8} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setCloseError(null);
                                setConfirmId(t.publicId);
                              }}
                              disabled={isFinal}
                              aria-label={
                                isFinal
                                  ? `Ticket #${t.publicId} is already closed`
                                  : `Close ticket #${t.publicId}`
                              }
                              title={isFinal ? "Already closed" : "Close ticket"}
                              className={cn(
                                "inline-flex items-center justify-center size-8 rounded-full transition-colors",
                                isFinal
                                  ? "text-ink-200 cursor-not-allowed"
                                  : "text-ink-500 hover:text-rose-600 hover:bg-rose-50",
                              )}
                            >
                              <Trash2 className="size-[15px]" strokeWidth={1.9} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <Pagination
            page={clampedPage}
            totalPages={totalPages}
            totalCount={filtered.length}
            onPage={handlePageChange}
          />
        )}
      </section>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function Th({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 px-3 py-3",
        className,
      )}
    >
      {children}
    </th>
  );
}

function EmptyState({ query, hasAny }: { query: string; hasAny: boolean }) {
  // Two flavours: "you have no tickets at all" vs "your filter matches none".
  // Different copy + different CTAs keep the empty state actually helpful.
  const searching = query.length > 0 || hasAny;
  return (
    <div className="py-12 px-6 text-center">
      <div className="mx-auto size-12 rounded-full inline-flex items-center justify-center bg-cream-200 text-ink-500">
        <Inbox className="size-5" strokeWidth={1.8} />
      </div>
      <h2 className="mt-3 text-[15px] font-semibold text-ink-900">
        {searching ? "No tickets match your filters" : "No tickets yet"}
      </h2>
      <p className="mt-1 text-[12.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
        {searching
          ? "Try a different keyword or clear the status filter."
          : "When you submit a support request it'll appear here so you can track progress and replies."}
      </p>
      {!searching && (
        <div className="mt-5">
          <Link
            href="/support/new"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            <Plus className="size-[15px]" strokeWidth={2.4} />
            Submit a request
          </Link>
        </div>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  totalCount,
  onPage,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) {
    // Still show the "Showing N of N" line so the user knows the table is
    // exhaustive — but skip the page buttons since there's nothing to flip.
    return (
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 sm:px-6 py-4 border-t border-ink-100">
        <p className="text-[12px] text-ink-500 tabular-nums">
          Showing {totalCount} of {totalCount}
        </p>
      </div>
    );
  }

  const pages = buildPageList(page, totalPages);
  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx   = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <nav
      aria-label="Ticket pagination"
      className="flex items-center justify-between flex-wrap gap-3 px-5 sm:px-6 py-4 border-t border-ink-100"
    >
      <p className="text-[12px] text-ink-500 tabular-nums">
        Showing {startIdx}&ndash;{endIdx} of {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="size-3.5" strokeWidth={2.2} aria-hidden />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="inline-flex items-center justify-center size-8 text-[12.5px] text-ink-400"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={page === p ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                "inline-flex items-center justify-center size-8 rounded-full text-[12.5px] font-semibold transition-colors tabular-nums",
                page === p
                  ? "bg-gold-500 text-white"
                  : "text-ink-700 hover:bg-cream-100",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-3.5" strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    </nav>
  );
}

/**
 * Build a compact page list with ellipses, matching the visual cadence in
 * the reference design — e.g. `1 2 3 4 5 … 12` near the start, `1 … 5 6 7
 * … 12` in the middle, `1 … 8 9 10 11 12` at the end.
 */
function buildPageList(current: number, total: number): (number | "...")[] {
  const out: (number | "...")[] = [];
  const sides = 1; // pages on each side of `current`

  for (let i = 1; i <= total; i++) {
    const nearEdges = i === 1 || i === total;
    const nearCurrent = i >= current - sides && i <= current + sides;
    if (nearEdges || nearCurrent) {
      out.push(i);
    } else if (out[out.length - 1] !== "...") {
      out.push("...");
    }
  }
  return out;
}
