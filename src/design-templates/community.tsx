/* Community ──────────────────────────────────────────────────────────────
   Community surfaces — a space card, a discussion row, and a reaction bar.
   Mirrors src/components/community/{space-card,discussion-list}.tsx and the
   chat reactions. Presentational only.
   ───────────────────────────────────────────────────────────────────── */

import { Users, ArrowRight, MessageCircle, SmilePlus } from "lucide-react";

export function SpaceCard() {
  return (
    <div className="card p-5 w-[300px] max-w-full group">
      <div className="size-12 rounded-[12px] bg-gradient-to-br from-rose-100 via-cream-200 to-cream-300 mb-4" />
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-h4 text-ink-900 leading-tight">Wins &amp; milestones</h3>
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
          Featured
        </span>
      </div>
      <p className="text-[13px] text-ink-500 leading-snug mb-4 line-clamp-2">
        Celebrate progress and cheer each other on — big wins or small steps.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-500 inline-flex items-center gap-1.5">
          <Users className="size-3.5 text-ink-400" strokeWidth={2} />
          1,248 members
        </span>
        <span className="text-[12.5px] font-medium text-rose-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Open
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

export function DiscussionRow() {
  return (
    <div className="card p-5 w-[480px] max-w-full">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold text-[14px] shrink-0">
          A
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-[13.5px] font-medium text-ink-900">Amelia Park</span>
            <span className="text-[11.5px] text-ink-400">·</span>
            <span className="text-[11.5px] text-ink-500">Wins &amp; milestones</span>
            <span className="text-[11.5px] text-ink-400">·</span>
            <span className="text-[11.5px] text-ink-500">2h ago</span>
          </div>
          <h4 className="text-h5 text-ink-900 leading-snug mb-1">Hit 10k followers this week 🎉</h4>
          <p className="text-[13.5px] text-ink-700 leading-relaxed line-clamp-3 mb-3">
            Consistency really paid off — posting the daily reels from the Launchpad
            program changed everything. Thank you all for the feedback along the way!
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-rose-600 transition-colors"
          >
            <MessageCircle className="size-3.5" strokeWidth={2} />
            14 replies
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReactionBar() {
  const reactions = [
    { e: "👍", n: 8, mine: true },
    { e: "🔥", n: 5, mine: false },
    { e: "❤️", n: 3, mine: false },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {reactions.map((r, i) => (
        <span
          key={i}
          className={
            "inline-flex items-center gap-1 h-7 px-2 rounded-full border text-[12px] font-medium " +
            (r.mine ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-ink-100 text-ink-500")
          }
        >
          <span className="text-[13px] leading-none">{r.e}</span>
          {r.n}
        </span>
      ))}
      <button
        type="button"
        aria-label="Add reaction"
        className="size-7 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
      >
        <SmilePlus className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
