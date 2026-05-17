import { MoreHorizontal, MessageCircle, Repeat, NotebookPen, Bot } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type {
  SupportConversationEntry,
  SupportConversationKind,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";
import { ReplyComposer } from "./reply-composer";
import {
  ConversationFilterBar,
  type ConversationFilter,
} from "./conversation-filter";
import { LiveRelativeTime } from "./live-relative-time";

/* Per-kind visual config — keeps the avatar tile, label, and icon
 * consistent across the thread. */
const KIND_LABEL: Record<SupportConversationKind, string> = {
  "client-reply":   "Client Reply",
  "support-reply":  "Support Reply",
  "internal-note":  "Internal Note",
  "system-update":  "System Update",
};

const KIND_ICON: Record<SupportConversationKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "client-reply":   MessageCircle,
  "support-reply":  Repeat,
  "internal-note":  NotebookPen,
  "system-update":  Bot,
};

const KIND_TONE: Record<SupportConversationKind, string> = {
  "client-reply":   "bg-[var(--dev-accent-soft)]   text-[var(--dev-accent-text)]   border-[var(--dev-accent-border)]",
  "support-reply":  "bg-[var(--dev-success-soft)]  text-[var(--dev-success-text)]  border-[var(--dev-success-border)]",
  "internal-note":  "bg-[var(--dev-warning-soft)]  text-[var(--dev-warning-text)]  border-[var(--dev-warning-border)]",
  "system-update":  "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/30",
};

const KIND_LABEL_TONE: Record<SupportConversationKind, string> = {
  "client-reply":  "text-[var(--dev-accent-text)]",
  "support-reply": "text-[var(--dev-success-text)]",
  "internal-note": "text-[var(--dev-warning-text)]",
  "system-update": "text-[var(--dev-chart-violet)]",
};

/** Map filter pill → conversation-kind whitelist. */
const FILTER_TO_KINDS: Record<ConversationFilter, ReadonlySet<SupportConversationKind>> = {
  all:      new Set(["client-reply", "support-reply", "internal-note", "system-update"]),
  messages: new Set(["client-reply", "support-reply"]),
  notes:    new Set(["internal-note"]),
  system:   new Set(["system-update"]),
};

type Props = {
  data: SupportConversationEntry[];
  ticketPublicId: string;
  /** Server-resolved active filter. */
  filter: ConversationFilter;
};

export function ConversationThread({ data, ticketPublicId, filter }: Props) {
  const allowed = FILTER_TO_KINDS[filter];
  const filtered = data.filter((e) => allowed.has(e.kind));

  return (
    <DevSectionCard
      title="Conversation Thread"
      trailing={<ConversationFilterBar value={filter} />}
    >
      {filtered.length === 0 ? (
        <p className="px-2 py-6 text-center text-[12.5px] text-[var(--dev-text-muted)]">
          No entries match the current filter.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <li key={entry.id} className="relative">
              <ConversationRow entry={entry} />
            </li>
          ))}
        </ul>
      )}

      <ReplyComposer ticketPublicId={ticketPublicId} />
    </DevSectionCard>
  );
}

function ConversationRow({ entry }: { entry: SupportConversationEntry }) {
  const Icon = KIND_ICON[entry.kind];
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "size-9 rounded-full inline-flex items-center justify-center border shrink-0",
          KIND_TONE[entry.kind],
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </div>

      <div className="flex-1 min-w-0 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] px-3 py-2.5">
        <header className="flex items-center justify-between gap-3 mb-1">
          <div className="inline-flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className={cn("text-[11.5px] font-semibold uppercase tracking-wider", KIND_LABEL_TONE[entry.kind])}>
              {KIND_LABEL[entry.kind]}
            </span>
            <span className="text-[11.5px] text-[var(--dev-text-muted)]">·</span>
            <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">
              {entry.authorName}
              {entry.authorContext && (
                <span className="text-[var(--dev-text-muted)] font-normal"> ({entry.authorContext})</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {entry.createdAtIso ? (
              <LiveRelativeTime
                iso={entry.createdAtIso}
                fallback={entry.timeLabel}
                className="text-[11.5px] text-[var(--dev-text-muted)] tabular-nums"
              />
            ) : (
              <span className="text-[11.5px] text-[var(--dev-text-muted)] tabular-nums">
                {entry.timeLabel}
              </span>
            )}
            <button
              type="button"
              aria-label="More actions"
              className="size-6 inline-flex items-center justify-center rounded-md text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-elev)] transition-colors"
            >
              <MoreHorizontal className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        </header>
        <p className="text-[13px] text-[var(--dev-text-secondary)] leading-relaxed whitespace-pre-wrap">
          {entry.message}
        </p>
      </div>
    </div>
  );
}
