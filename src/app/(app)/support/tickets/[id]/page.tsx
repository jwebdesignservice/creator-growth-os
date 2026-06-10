import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Cpu,
  Download,
  FileText,
  Inbox,
  Mail,
  Paperclip,
  Ticket,
  User,
  CheckCircle2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { getMyTicketByPublicId, getTicketMessages } from "@/lib/support/queries";
import { PageShell } from "@/components/app-shell/page-shell";
import { UserTicketRealtime } from "@/components/support/user-ticket-realtime";
import { UserTicketReplyForm } from "@/components/support/user-ticket-reply-form";
import {
  SUPPORT_TOPICS,
  SUPPORT_PAGE_OPTIONS,
} from "../../mock-data";
import type {
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketTopic,
} from "@/lib/support/types";
import { CloseTicketButton, CopyLinkButton } from "./ticket-actions";
import { cn } from "@/lib/cn";

/**
 * Single-ticket detail page.
 *
 * Premium two-column layout — main column carries the read + reply flow
 * (description / attachment / conversation / composer), sidebar carries the
 * status timeline + a compact key/value Details card.
 *
 * All backend stays untouched:
 *  • Auth + fetch:  `getShellContext`, `getMyTicketByPublicId`,
 *                   `getTicketMessages` — same as before.
 *  • Close action:  existing `closeTicket` server action wired through
 *                   `<CloseTicketButton />` (see ./ticket-actions).
 *  • Realtime:      existing `<UserTicketRealtime />` watcher.
 *  • Reply:         existing `<UserTicketReplyForm />`.
 *
 * The composer is disabled when the ticket is `closed` (preserves the
 * prior behavior); `resolved` still lets the user follow up in case the
 * fix didn't take.
 */

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `#${id} · Support` };
}

/* ─── Visual mappings ─────────────────────────────────────────────────── */

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open:        "Open",
  waiting:     "Waiting",
  in_progress: "In progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

// Status→color mapping shared with the /support hub (TICKET_PILL in
// support/page.tsx) so the same ticket reads identically on both surfaces.
const STATUS_PILL: Record<SupportTicketStatus, string> = {
  open:        "bg-rose-100 text-rose-700",
  waiting:     "bg-gold-500/15 text-gold-500",
  in_progress: "bg-rose-50 text-rose-600",
  resolved:    "bg-success-bg text-success",
  closed:      "bg-cream-200 text-ink-500",
};

const PRIORITY_PILL: Record<SupportTicketPriority, string> = {
  low:    "bg-ink-100 text-ink-700",
  medium: "bg-ink-100 text-ink-700",
  high:   "bg-gold-500/15 text-gold-500",
  urgent: "bg-rose-100 text-rose-700",
};

const PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  low:    "Low",
  medium: "Normal",
  high:   "High",
  urgent: "Urgent",
};

/* ─── Page ────────────────────────────────────────────────────────────── */

export default async function TicketDetailPage({ params }: Props) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { id } = await params;
  const ticket = await getMyTicketByPublicId(id);
  if (!ticket) notFound();

  const messages      = await getTicketMessages(ticket.id);

  // The attachment lives in the private `support-attachments` bucket — mint a
  // short-lived signed URL so the owner can actually open/download what they
  // sent (previously the file was shown by name only, with no way to view it).
  let attachmentUrl: string | null = null;
  if (ticket.attachmentPath) {
    const supabase = await createClient();
    const { data: signed } = await supabase.storage
      .from("support-attachments")
      .createSignedUrl(ticket.attachmentPath, 60 * 10);
    attachmentUrl = signed?.signedUrl ?? null;
  }

  const status        = STATUS_LABEL[ticket.status];
  const topic         = SUPPORT_TOPICS.find((t) => t.key === (ticket.topic as SupportTicketTopic));
  const pageLabel     = SUPPORT_PAGE_OPTIONS.find((o) => o.value === ticket.pageAffected)?.label ?? ticket.pageAffected ?? "—";
  const priorityLabel = PRIORITY_LABEL[ticket.priority];
  const isFinal       = ticket.status === "resolved" || ticket.status === "closed";
  const TopicIcon     = topic?.icon ?? Inbox;
  const topicLabel    = topic?.label.replace(/\n/g, " ") ?? ticket.topic;

  return (
    <PageShell>
      <div className="max-w-[var(--container-content)] space-y-5">
        {/* Invisible watcher — refreshes the page when the dev posts a reply
            or flips status on the other side. Same channel pattern as the
            dev-side <SupportRealtime />, scoped to this single ticket. */}
        <UserTicketRealtime ticketId={ticket.id} />

        {/* Back to list */}
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-rose-700 transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
          All tickets
        </Link>

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <header className="card overflow-hidden">
          {/* Top band — soft brand-tinted gradient so the hero reads as
              the primary surface without competing with the body cards. */}
          <div className="bg-gradient-to-br from-cream-100 via-white to-rose-50/30 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4 sm:mb-5">
              <div className="flex items-center gap-2 text-[12px] text-ink-500 min-w-0">
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center size-8 rounded-[10px] bg-white border border-ink-100 text-ink-700 shadow-soft shrink-0"
                >
                  <Ticket className="size-[15px]" strokeWidth={1.8} />
                </span>
                <span className="font-semibold text-ink-900 text-[13.5px] tabular-nums">
                  #{ticket.publicId}
                </span>
                <CopyLinkButton />
                <span aria-hidden className="text-ink-300 hidden sm:inline">·</span>
                <span className="hidden sm:inline">
                  Created {relative(ticket.createdAt)}
                </span>
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <>
                    <span aria-hidden className="text-ink-300 hidden md:inline">·</span>
                    <span className="hidden md:inline">
                      Updated {relative(ticket.updatedAt)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 h-[28px] rounded-full text-[12px] font-semibold whitespace-nowrap",
                    STATUS_PILL[ticket.status],
                  )}
                >
                  {status}
                </span>
                <CloseTicketButton publicId={ticket.publicId} disabled={isFinal} />
              </div>
            </div>

            <h1 className="text-h3 sm:text-[30px] lg:text-[34px] text-ink-900 leading-tight tracking-tight">
              {ticket.subject}
            </h1>
          </div>

          {/* Quick-stats strip */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 border-t border-ink-100 divide-x divide-ink-100">
            <StatTile
              label="Priority"
              value={
                <span
                  className={cn(
                    "inline-flex items-center px-2 h-[22px] rounded-full text-[11px] font-semibold",
                    PRIORITY_PILL[ticket.priority],
                  )}
                >
                  {priorityLabel}
                </span>
              }
            />
            <StatTile
              label="Topic"
              value={
                <span className="inline-flex items-center gap-1.5 text-ink-900 truncate">
                  <TopicIcon className="size-[14px] text-ink-500 shrink-0" strokeWidth={1.9} aria-hidden />
                  <span className="truncate">{topicLabel}</span>
                </span>
              }
            />
            <StatTile label="Page area" value={<span className="text-ink-900 truncate">{pageLabel}</span>} />
            <StatTile label="Channel" value={<span className="text-ink-900">In-app</span>} />
          </dl>
        </header>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Main column */}
          <div className="space-y-5 min-w-0">
            {/* Description */}
            <section className="card p-5 sm:p-6 space-y-3">
              <h2 className="text-[14px] font-semibold text-ink-900">Description</h2>
              <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </section>

            {/* Attachment — only when one was submitted */}
            {ticket.attachmentName && (
              <section className="card p-5 sm:p-6">
                <h2 className="text-[14px] font-semibold text-ink-900 mb-3">
                  Attachment
                </h2>
                <div className="flex items-center gap-3 p-3.5 rounded-[12px] bg-cream-100 border border-ink-100">
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center size-10 rounded-[10px] bg-white border border-ink-100 shrink-0"
                  >
                    <FileText className="size-4 text-ink-500" strokeWidth={1.8} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900 truncate">
                      {ticket.attachmentName}
                    </p>
                    {ticket.attachmentSize !== null && ticket.attachmentSize !== undefined && (
                      <p className="text-[11.5px] text-ink-500 tabular-nums">
                        {formatBytes(ticket.attachmentSize)}
                      </p>
                    )}
                  </div>
                  {attachmentUrl ? (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-semibold text-ink-700 hover:bg-cream-50 transition-colors shrink-0"
                    >
                      <Download className="size-3.5" strokeWidth={2} aria-hidden />
                      Download
                    </a>
                  ) : (
                    <span className="text-[11.5px] text-ink-500 shrink-0 hidden sm:inline">
                      Sent with request
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* Conversation */}
            <section className="card p-5 sm:p-6 space-y-4">
              <header className="flex items-center justify-between gap-2">
                <h2 className="text-[14px] font-semibold text-ink-900">
                  Conversation
                </h2>
                <span className="text-[11.5px] text-ink-500 tabular-nums">
                  {messages.length} {messages.length === 1 ? "message" : "messages"}
                </span>
              </header>

              {messages.length === 0 ? (
                <div className="rounded-[12px] bg-cream-100 border border-cream-300 px-4 py-7 text-center">
                  <div
                    aria-hidden
                    className="mx-auto size-10 rounded-full inline-flex items-center justify-center bg-cream-200 text-ink-500"
                  >
                    <Inbox className="size-4" strokeWidth={1.9} />
                  </div>
                  <p className="mt-2 text-[12.5px] text-ink-500 leading-snug max-w-sm mx-auto">
                    No replies yet. We&rsquo;ll email you as soon as a team
                    member responds.
                  </p>
                </div>
              ) : (
                <ol className="space-y-3">
                  {messages.map((m) => (
                    <MessageItem key={m.id} message={m} />
                  ))}
                </ol>
              )}
            </section>

            {/* Reply composer — disabled only on closed (resolved stays open
                in case the user needs to follow up). */}
            <UserTicketReplyForm
              ticketId={ticket.id}
              disabled={ticket.status === "closed"}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-4 self-start">
            {/* Status timeline */}
            <section className="card p-5">
              <h2 className="text-[13.5px] font-semibold text-ink-900 mb-4">
                Status
              </h2>
              <ol className="space-y-1">
                <TimelineNode
                  state="done"
                  title="Request received"
                  subtitle={absoluteShort(ticket.createdAt)}
                  icon={Mail}
                />
                <TimelineNode
                  state={isFinal ? "done" : "current"}
                  title={isFinal ? "Reviewed" : "In review"}
                  subtitle={
                    isFinal
                      ? "Our team has reviewed your request."
                      : ticket.status === "waiting"
                        ? "Waiting on your response."
                        : "Our team is investigating."
                  }
                  icon={ClipboardList}
                />
                <TimelineNode
                  state={isFinal ? "done" : "upcoming"}
                  title={isFinal ? "Resolved" : "Resolution"}
                  subtitle={
                    ticket.resolvedAt
                      ? absoluteShort(ticket.resolvedAt)
                      : "We'll email you with an update or solution."
                  }
                  icon={CheckCircle2}
                  isLast
                />
              </ol>
            </section>

            {/* Details */}
            <section className="card p-5 space-y-3.5">
              <h2 className="text-[13.5px] font-semibold text-ink-900">
                Details
              </h2>
              <dl className="space-y-3">
                <DetailRow
                  icon={User}
                  label="Assigned to"
                  value={
                    ticket.assignedToEmail ? (
                      <span className="text-ink-900 break-all">
                        {ticket.assignedToEmail}
                      </span>
                    ) : (
                      <span className="text-ink-500 italic">Unassigned</span>
                    )
                  }
                />
                <DetailRow icon={Cpu} label="Device" value={ticket.device || "—"} />
                <DetailRow icon={Calendar} label="Created" value={absoluteFull(ticket.createdAt)} />
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <DetailRow icon={Clock} label="Last updated" value={absoluteFull(ticket.updatedAt)} />
                )}
                {ticket.ticketRef && (
                  <DetailRow icon={Paperclip} label="Reference" value={ticket.ticketRef} />
                )}
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-5 min-w-0">
      <dt className="text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">
        {label}
      </dt>
      <dd className="mt-1.5 text-[13px] font-medium text-ink-900 min-w-0">
        {value}
      </dd>
    </div>
  );
}

function MessageItem({ message }: { message: SupportTicketMessage }) {
  const isSupport = message.author === "support";
  const isSystem  = message.author === "system";
  const authorLabel = isSupport ? "Support" : isSystem ? "System" : "You";

  const cardTone = isSupport
    ? "bg-rose-50/60 border-rose-100"
    : isSystem
      ? "bg-cream-100 border-cream-300"
      : "bg-white border-ink-100";

  const initialTone = isSupport
    ? "bg-rose-200 text-rose-700"
    : isSystem
      ? "bg-ink-200 text-ink-700"
      : "bg-ink-900 text-cream-100";

  return (
    <li className={cn("rounded-[12px] border p-4", cardTone)}>
      <div className="flex items-center gap-2 mb-2">
        <span
          aria-hidden
          className={cn(
            "inline-flex items-center justify-center size-6 rounded-full text-[10.5px] font-bold",
            initialTone,
          )}
        >
          {authorLabel.charAt(0)}
        </span>
        <span className="text-[12px] font-semibold text-ink-900">{authorLabel}</span>
        <span className="text-[11.5px] text-ink-400 tabular-nums">
          · {relative(message.createdAt)}
        </span>
      </div>
      <p className="text-[13px] text-ink-800 leading-relaxed whitespace-pre-wrap">
        {message.body}
      </p>
    </li>
  );
}

function TimelineNode({
  state,
  title,
  subtitle,
  icon: Icon,
  isLast,
}: {
  state: "done" | "current" | "upcoming";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  isLast?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 relative pb-3 last:pb-0">
      {!isLast && (
        <span
          aria-hidden
          className={cn(
            "absolute left-[15px] top-[34px] bottom-[2px] w-px",
            state === "done" ? "bg-success/40" : "bg-ink-100",
          )}
        />
      )}
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center size-8 rounded-full shrink-0 relative z-[1] ring-2",
          state === "done"
            ? "bg-success-bg text-success ring-success/15"
            : state === "current"
              ? "bg-rose-100 text-rose-700 ring-rose-200/40"
              : "bg-cream-100 text-ink-400 ring-ink-100/40",
        )}
      >
        <Icon className="size-[14px]" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={cn(
            "text-[12.5px] font-semibold",
            state === "upcoming" ? "text-ink-500" : "text-ink-900",
          )}
        >
          {title}
        </p>
        <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
          {subtitle}
        </p>
      </div>
    </li>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="inline-flex items-center justify-center size-7 rounded-[8px] bg-cream-100 text-ink-500 shrink-0"
      >
        <Icon className="size-[13px]" strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0">
        <dt className="text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">
          {label}
        </dt>
        <dd className="mt-0.5 text-[12.5px] text-ink-900 break-words">
          {value}
        </dd>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "1 day ago";
  if (d < 30) return `${d} days ago`;
  const mo = Math.floor(d / 30);
  return `${mo} mo ago`;
}

function absoluteShort(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
  });
}

function absoluteFull(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    year:    "numeric",
    hour:    "numeric",
    minute:  "2-digit",
  });
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
