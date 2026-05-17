import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, Inbox } from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getMyTicketByPublicId, getTicketMessages } from "@/lib/support/queries";
import { PageShell } from "@/components/app-shell/page-shell";
import { UserTicketRealtime } from "@/components/support/user-ticket-realtime";
import { UserTicketReplyForm } from "@/components/support/user-ticket-reply-form";
import { ticketStatusLabel, ticketMeta } from "../../support-panel";
import { SUPPORT_TOPICS, SUPPORT_PRIORITY_OPTIONS, SUPPORT_PAGE_OPTIONS } from "../../mock-data";
import type { SupportTicketTopic } from "@/lib/support/types";
import { cn } from "@/lib/cn";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `#${id} · Support · Creator Growth OS` };
}

export default async function TicketDetailPage({ params }: Props) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { id } = await params;
  const ticket = await getMyTicketByPublicId(id);
  if (!ticket) notFound();

  const messages = await getTicketMessages(ticket.id);
  const status = ticketStatusLabel(ticket.status);
  const topic = SUPPORT_TOPICS.find((t) => t.key === (ticket.topic as SupportTicketTopic));
  const pageLabel = SUPPORT_PAGE_OPTIONS.find((o) => o.value === ticket.pageAffected)?.label ?? ticket.pageAffected;
  const priorityLabel = SUPPORT_PRIORITY_OPTIONS.find((o) => o.value === ticket.priority)?.label ?? ticket.priority;

  return (
    <PageShell>
      <div className="max-w-[var(--container-content)] space-y-5">
        {/* Invisible Realtime watcher — refreshes this page when the dev
            posts a reply on the other side. Same channel pattern as the
            dev-side <SupportRealtime />, but scoped to this single ticket. */}
        <UserTicketRealtime ticketId={ticket.id} />

        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-rose-700 transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} />
          All tickets
        </Link>

        <header className="card p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-display text-[22px] sm:text-[26px] text-ink-900 leading-tight">
                {ticket.subject}
              </h1>
              <p className="mt-1 text-[12.5px] text-ink-500 tabular-nums">
                #{ticket.publicId} <span className="text-ink-300">•</span> {ticketMeta(ticket)}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2.5 h-[24px] rounded-full text-[11.5px] font-semibold whitespace-nowrap",
                STATUS_PILL[status],
              )}
            >
              {status}
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-ink-100">
            <Pair label="Topic" value={topic?.label.replace(/\n/g, " ") ?? ticket.topic} />
            <Pair label="Page or area" value={pageLabel || "—"} />
            <Pair label="Priority" value={priorityLabel} />
            <Pair label="Device / Browser" value={ticket.device || "—"} />
            {ticket.ticketRef && <Pair label="Reference" value={ticket.ticketRef} />}
            {ticket.attachmentName && (
              <Pair
                label="Attachment"
                value={
                  <span className="inline-flex items-center gap-2 text-ink-700">
                    <FileText className="size-3.5 text-ink-400" strokeWidth={1.9} />
                    <span className="truncate">{ticket.attachmentName}</span>
                  </span>
                }
              />
            )}
          </dl>
        </header>

        <section className="card p-5 sm:p-6 space-y-3">
          <h2 className="text-[14px] font-semibold text-ink-900">Description</h2>
          <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </section>

        <section className="card p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-ink-900">Conversation</h2>
          {messages.length === 0 ? (
            <div className="rounded-[12px] bg-cream-100 border border-cream-300 px-4 py-5 text-center">
              <div className="mx-auto size-10 rounded-full inline-flex items-center justify-center bg-cream-200 text-ink-500">
                <Inbox className="size-4" strokeWidth={1.9} />
              </div>
              <p className="mt-2 text-[12.5px] text-ink-500 leading-snug">
                No replies yet. We’ll email you as soon as a team member responds.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "rounded-[12px] px-4 py-3 text-[13px] leading-relaxed",
                    m.author === "support"
                      ? "bg-rose-50 border border-rose-100 text-ink-900"
                      : m.author === "system"
                        ? "bg-cream-100 border border-cream-300 text-ink-700"
                        : "bg-white border border-ink-100 text-ink-900",
                  )}
                >
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-500 mb-1">
                    {m.author === "support" ? "Support" : m.author === "system" ? "System" : "You"}
                    <span className="ml-2 normal-case font-medium text-ink-400 tabular-nums">
                      · {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* User reply composer — wires the existing addTicketMessage
            action. Disabled on closed tickets so the user can't keep
            posting to a finalized thread (resolved still allows reply
            in case the resolution didn't actually fix it). */}
        <UserTicketReplyForm
          ticketId={ticket.id}
          disabled={ticket.status === "closed"}
        />
      </div>
    </PageShell>
  );
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] text-ink-900 break-words">{value}</dd>
    </div>
  );
}

const STATUS_PILL: Record<
  ReturnType<typeof ticketStatusLabel>,
  string
> = {
  Open:          "bg-rose-100 text-rose-700",
  Waiting:       "bg-[#FBE5C7] text-[#9A6A22]",
  "In Progress": "bg-rose-100 text-rose-700",
  Resolved:      "bg-success-bg text-success",
  Closed:        "bg-ink-100 text-ink-500",
};
