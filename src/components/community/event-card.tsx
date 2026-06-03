import { CalendarDays, Clock, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { eventKindLabel, eventJoinCta } from "@/lib/community/event-kinds";
import type { CommunityEvent } from "@/lib/community/queries";

/**
 * A single member-facing event card: type badge + date chip, title +
 * description, when (date · time · duration), host, and a prominent full-width
 * join CTA that opens the host's meeting link (e.g. Google Meet). Pure
 * presentational — safe in both server pages and previews.
 */
export function EventCard({ event: e }: { event: CommunityEvent }) {
  const date = new Date(e.starts_at);
  const isLive = e.kind === "live";

  return (
    <li className="card p-5 flex flex-col gap-3">
      {/* type badge + date chip */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "chip inline-flex items-center gap-1.5",
            isLive ? "chip-rose" : "bg-cream-100 text-ink-700",
          )}
        >
          {isLive && (
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
          )}
          {eventKindLabel(e.kind)}
        </span>
        <div className="flex flex-col items-center justify-center size-12 rounded-[12px] bg-rose-50 text-rose-700 border border-rose-100 shrink-0">
          <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
            {date.toLocaleString(undefined, { month: "short" })}
          </span>
          <span className="text-[16px] font-bold leading-tight">
            {date.getDate()}
          </span>
        </div>
      </div>

      {/* title + description */}
      <div className="flex-1 min-w-0">
        <h3 className="text-h5 text-ink-900 leading-snug">{e.title}</h3>
        {e.description && (
          <p className="text-[13px] text-ink-500 leading-relaxed mt-1 line-clamp-2">
            {e.description}
          </p>
        )}
      </div>

      {/* when */}
      <div className="flex items-center gap-2.5 flex-wrap text-[12px] text-ink-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" strokeWidth={2} />
          {date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" strokeWidth={2} />
          {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
        <span aria-hidden>·</span>
        <span>{e.duration_min} min</span>
      </div>

      {/* host + prominent join CTA */}
      <div className="mt-1 pt-3 border-t border-ink-100 space-y-2.5">
        <div className="text-[12px] text-ink-500 truncate">
          {e.host_name ? (
            <>
              Hosted by{" "}
              <span className="font-medium text-ink-700">{e.host_name}</span>
            </>
          ) : (
            "Community event"
          )}
          {e.joined_count > 0 && (
            <span className="text-ink-400"> · {e.joined_count} going</span>
          )}
        </div>
        {e.url ? (
          <a
            href={e.url}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
          >
            <Video className="size-4" strokeWidth={2} />
            {eventJoinCta(e.kind)}
          </a>
        ) : (
          <div className="flex w-full items-center justify-center h-10 rounded-[10px] bg-cream-100 text-ink-400 text-[12.5px] font-medium">
            Join link coming soon
          </div>
        )}
      </div>
    </li>
  );
}
