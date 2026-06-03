/* Rating input ────────────────────────────────────────────────────────────────
   Collect feedback — an interactive star-rating prompt (rate a lesson/program)
   and a quick helpful / not-helpful thumbs prompt. Distinct from `ratings`
   (which displays results); this is the input side. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Star, ThumbsUp, ThumbsDown, Send, CheckCircle2 } from "lucide-react";

/* 1 · Star-rating prompt — pick a score + optional note. */
export function StarRatingInput() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 text-center shadow-card">
      <h3 className="text-[14.5px] font-bold text-ink-900">How was this lesson?</h3>
      <p className="text-[12.5px] text-ink-500 mt-0.5 mb-3.5">Your rating helps other creators.</p>
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" aria-label={`Rate ${i + 1} star${i ? "s" : ""}`} className="rounded-md transition-transform cursor-pointer hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
            <Star
              className={i < 4 ? "size-8 text-amber-400" : "size-8 text-ink-200 hover:text-amber-300"}
              fill={i < 4 ? "currentColor" : "none"}
              strokeWidth={i < 4 ? 0 : 1.8}
            />
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add a comment (optional)"
        className="w-full h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13px] text-center outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
      />
      <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
        <Send className="size-3.5" strokeWidth={2} /> Submit rating
      </button>
    </div>
  );
}

/* 2 · Helpful prompt — quick binary feedback. */
export function FeedbackPrompt() {
  return (
    <div className="w-[360px] max-w-full rounded-[14px] border border-ink-100 bg-cream-50 px-5 py-4 flex items-center gap-4 flex-wrap">
      <span className="text-[13.5px] font-semibold text-ink-900 flex-1 min-w-0">Was this answer helpful?</span>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold transition-colors cursor-pointer hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2">
          <ThumbsUp className="size-3.5" strokeWidth={2} /> Yes
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold transition-colors cursor-pointer hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          <ThumbsDown className="size-3.5" strokeWidth={2} /> No
        </button>
      </div>
    </div>
  );
}

/* 3 · Submitted — the thank-you success state after rating. */
export function RatingSubmitted() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-emerald-200 bg-emerald-50/50 p-6 text-center shadow-card">
      <span className="mx-auto size-12 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center mb-3 ring-8 ring-emerald-50">
        <CheckCircle2 className="size-6" strokeWidth={2} />
      </span>
      <div className="flex items-center justify-center gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 text-amber-400" fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <h3 className="text-[14.5px] font-bold text-ink-900">Thanks for the feedback!</h3>
      <p className="text-[12.5px] text-ink-500 mt-0.5">Your rating helps other creators find this lesson.</p>
    </div>
  );
}
