import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { SUPPORT_TIMELINE_EVENTS } from "@/lib/dev-dashboard/mock-data";
import type {
  SupportTimelineEvent,
  SupportTimelineKind,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const AVATAR_TONE: Record<SupportTimelineEvent["authorTone"], string> = {
  blue:    "bg-[var(--dev-accent-soft)]   text-[var(--dev-accent-text)]   border-[var(--dev-accent-border)]",
  green:   "bg-[var(--dev-success-soft)]  text-[var(--dev-success-text)]  border-[var(--dev-success-border)]",
  amber:   "bg-[var(--dev-warning-soft)]  text-[var(--dev-warning-text)]  border-[var(--dev-warning-border)]",
  violet:  "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/30",
  rose:    "bg-[var(--dev-chart-rose)]/12   text-[var(--dev-chart-rose)]   border-[var(--dev-chart-rose)]/30",
  cyan:    "bg-[var(--dev-chart-cyan)]/12   text-[var(--dev-chart-cyan)]   border-[var(--dev-chart-cyan)]/30",
  neutral: "bg-[var(--dev-surface-elev)]    text-[var(--dev-text-secondary)] border-[var(--dev-border)]",
};

const KIND_PILL: Record<SupportTimelineKind, string> = {
  "internal-note": "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  "sla-update":    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  "client-reply":  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  "reply":         "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border border-[var(--dev-border)]",
};

const KIND_LABEL: Record<SupportTimelineKind, string> = {
  "internal-note": "Internal Note",
  "sla-update":    "SLA Update",
  "client-reply":  "Client Reply",
  "reply":         "Reply",
};

type Props = {
  data?: SupportTimelineEvent[];
  ticketId?: string | null;
};

export function CommunicationTimelineCard({ data, ticketId }: Props) {
  const events = data ?? SUPPORT_TIMELINE_EVENTS;
  const viewAllHref = ticketId
    ? `/dev/support?ticket=${encodeURIComponent(ticketId)}&view=timeline`
    : "/dev/support?view=timeline";

  return (
    <DevSectionCard title="Communication Timeline">
      {events.length === 0 ? (
        <p className="text-[12.5px] text-[var(--dev-text-muted)] py-6 text-center">
          No timeline events yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((evt) => (
            <li
              key={evt.id}
              className="flex gap-3 p-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)]"
            >
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center size-8 rounded-full border text-[11px] font-semibold tabular-nums",
                  AVATAR_TONE[evt.authorTone],
                )}
                aria-hidden
              >
                {evt.authorInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[12.5px] font-semibold text-[var(--dev-text-primary)]">
                    {evt.authorName}
                  </span>
                  <span className="text-[11px] text-[var(--dev-text-muted)]">
                    ({evt.authorRole})
                  </span>
                  <span className={cn("inline-flex items-center px-1.5 h-[18px] rounded text-[10px] font-semibold whitespace-nowrap", KIND_PILL[evt.kind])}>
                    {KIND_LABEL[evt.kind]}
                  </span>
                  <span className="ml-auto text-[11px] text-[var(--dev-text-muted)] tabular-nums shrink-0">
                    {evt.timeLabel}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {evt.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={viewAllHref}
        scroll={false}
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View full timeline
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
