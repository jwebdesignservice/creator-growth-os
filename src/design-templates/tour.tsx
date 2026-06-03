/* Product tour ────────────────────────────────────────────────────────────────
   First-run guidance — a spotlight coachmark popover that points at a new
   feature, and a tour step card with progress. Complements `onboarding`
   (which is full-screen) with the in-context layer. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Sparkles, ArrowRight, X } from "lucide-react";

/* 1 · Coachmark — a popover pinned to a feature, with a pointer. */
export function Coachmark() {
  return (
    <div className="w-[300px] max-w-full relative">
      {/* Pointer */}
      <div className="absolute -top-1.5 left-8 size-3 rotate-45 bg-ink-900" aria-hidden />
      <div className="rounded-[14px] bg-ink-900 text-cream-50 p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wide">
            <Sparkles className="size-2.5" strokeWidth={2.5} fill="currentColor" /> New
          </span>
          <button type="button" aria-label="Dismiss" className="rounded text-cream-50/60 cursor-pointer transition-colors hover:text-cream-50 active:text-cream-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/50">
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
        <div className="text-[14px] font-bold mt-2">Resumable uploads</div>
        <p className="text-[12.5px] text-cream-50/75 leading-relaxed mt-1">
          Drop a 35 GB lesson video — it picks up right where it left off if your connection blips.
        </p>
        <div className="flex items-center justify-between mt-3.5">
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-rose-400" />
            <span className="size-1.5 rounded-full bg-cream-50/30" />
            <span className="size-1.5 rounded-full bg-cream-50/30" />
          </div>
          <button type="button" className="inline-flex items-center gap-1 h-8 px-3 rounded-[9px] bg-white text-ink-900 text-[12.5px] font-bold transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900">
            Next <ArrowRight className="size-3.5" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2 · Tour step card — a larger guided step with skip. */
export function TourStep() {
  return (
    <div className="w-[360px] max-w-full rounded-[18px] bg-white border border-ink-100 shadow-card overflow-hidden">
      <div className="h-24 bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 flex items-center justify-center">
        <Sparkles className="size-8 text-rose-500" strokeWidth={1.7} />
      </div>
      <div className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-500 mb-1">Step 2 of 4</div>
        <h3 className="text-[16px] font-bold text-ink-900">Plan your first week</h3>
        <p className="text-[13px] text-ink-500 mt-1 leading-relaxed">
          Drag content ideas onto the calendar. We&apos;ll remind you when it&apos;s time to post.
        </p>
        <div className="flex items-center justify-between mt-5">
          <button type="button" className="rounded px-1 -mx-1 text-[13px] font-medium text-ink-400 cursor-pointer transition-colors hover:text-ink-700 active:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">Skip tour</button>
          <div className="flex items-center gap-2">
            <button type="button" className="h-9 px-3.5 rounded-[10px] border border-ink-200 text-ink-700 text-[13px] font-semibold transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2">Back</button>
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
              Next <ArrowRight className="size-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
