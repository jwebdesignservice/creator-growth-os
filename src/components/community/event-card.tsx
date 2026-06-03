import { CalendarDays, Clock, Video, Users } from "lucide-react";
import { eventKindLabel, eventJoinCta } from "@/lib/community/event-kinds";
import type { CommunityEvent } from "@/lib/community/queries";

/**
 * Member-facing event card — styled to match the Tutorial Library cards: a
 * media-top tile (gradient cover with badges + a date "hero" + duration badge)
 * over a body with title, description, when/host meta, and a prominent join CTA
 * that opens the host's meeting link. Pure presentational.
 */
export function EventCard({ event: e }: { event: CommunityEvent }) {
  const date = new Date(e.starts_at);
  const isLive = e.kind === "live";

  return (
    <div className="card overflow-hidden hover:shadow-card hover:border-rose-200 transition-all flex flex-col">
      {/* Cover — admin image (if any) behind the date hero + badges */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-rose-100/60 via-cream-200 to-rose-100/30">
        {e.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.cover_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* type + live badges (top-left) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="chip chip-rose text-[10px]">
            {eventKindLabel(e.kind)}
          </span>
          {isLive && (
            <span className="chip bg-white/85 text-rose-700 text-[10px] inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* date hero (center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center size-16 rounded-2xl bg-white/85 backdrop-blur shadow-soft text-rose-700">
            <span className="text-[10px] font-bold uppercase tracking-wide text-rose-500 leading-none">
              {date.toLocaleString(undefined, { month: "short" })}
            </span>
            <span className="text-[26px] font-bold leading-none mt-0.5">
              {date.getDate()}
            </span>
          </div>
        </div>

        {/* duration (bottom-right) */}
        <span className="absolute bottom-2 right-2 rounded-md bg-ink-900/85 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums leading-none">
          {e.duration_min} min
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 flex-1 flex flex-col">
        <h3 className="text-[14px] font-semibold text-ink-900 leading-snug line-clamp-2">
          {e.title}
        </h3>
        {e.description && (
          <p className="mt-1.5 text-[12px] text-ink-500 leading-snug line-clamp-2">
            {e.description}
          </p>
        )}

        <div className="mt-2 text-[12px] text-ink-500 flex items-center gap-x-2 gap-y-1 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5 text-ink-400" strokeWidth={2} />
            {date.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5 text-ink-400" strokeWidth={2} />
            {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
          {e.host_name && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{e.host_name}</span>
            </>
          )}
        </div>

        {e.joined_count > 0 && (
          <div className="mt-1.5 text-[11.5px] text-ink-400 inline-flex items-center gap-1">
            <Users className="size-3" strokeWidth={2} />
            {e.joined_count} going
          </div>
        )}

        {/* CTA pinned to the bottom so cards align */}
        <div className="mt-auto pt-3">
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
      </div>
    </div>
  );
}
