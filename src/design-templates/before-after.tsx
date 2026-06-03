/* Before / after ──────────────────────────────────────────────────────────────
   Transformation surfaces — an image-compare slider and a metric before→after
   delta. Creators show results ("my Reels before vs after the framework").
   Presentational (the slider handle is static at ~55%).
   ───────────────────────────────────────────────────────────────────────── */

import { MoveHorizontal, TrendingUp } from "lucide-react";

/* 1 · Image-compare slider — split panel with a draggable-looking handle. */
export function BeforeAfterSlider() {
  return (
    <div className="w-[380px] max-w-full">
      <div className="relative h-[200px] rounded-[16px] overflow-hidden border border-ink-100 select-none">
        {/* After (full, underneath) */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 p-4 flex flex-col justify-end">
          <div className="h-2.5 w-24 rounded bg-rose-400/70 mb-1.5" />
          <div className="h-2 w-32 rounded bg-rose-300/60" />
        </div>
        {/* Before (clipped to left 55%) */}
        <div className="absolute inset-0 bg-cream-200 p-4 flex flex-col justify-end" style={{ clipPath: "inset(0 45% 0 0)" }}>
          <div className="h-2.5 w-24 rounded bg-ink-300 mb-1.5" />
          <div className="h-2 w-32 rounded bg-ink-200" />
        </div>
        {/* Labels */}
        <span className="absolute top-3 left-3 h-6 px-2 rounded-full bg-ink-900/70 text-cream-50 text-[10.5px] font-bold inline-flex items-center">BEFORE</span>
        <span className="absolute top-3 right-3 h-6 px-2 rounded-full bg-rose-600 text-white text-[10.5px] font-bold inline-flex items-center">AFTER</span>
        {/* Divider + handle */}
        <div className="absolute inset-y-0" style={{ left: "55%" }}>
          <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow" />
          <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 rounded-full bg-white shadow-lg flex items-center justify-center text-ink-500">
            <MoveHorizontal className="size-4" strokeWidth={2.2} />
          </span>
        </div>
      </div>
      <p className="text-[11.5px] text-ink-400 mt-2 text-center">Drag to compare</p>
    </div>
  );
}

/* 2 · Metric before→after — the numeric transformation. */
export function BeforeAfterStats() {
  return (
    <div className="w-[380px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="text-[12px] font-semibold text-ink-500 mb-3">Average watch-through</div>
      <div className="flex items-center gap-4">
        <div className="flex-1 text-center rounded-[12px] bg-cream-100 border border-ink-100 py-3">
          <div className="text-[22px] font-bold text-ink-400 tabular-nums leading-none">18%</div>
          <div className="text-[11px] text-ink-400 mt-1 uppercase tracking-wide">Before</div>
        </div>
        <span className="size-8 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
          <TrendingUp className="size-4" strokeWidth={2.4} />
        </span>
        <div className="flex-1 text-center rounded-[12px] bg-rose-50 border border-rose-200 py-3">
          <div className="text-[22px] font-bold text-rose-700 tabular-nums leading-none">41%</div>
          <div className="text-[11px] text-rose-500 mt-1 uppercase tracking-wide">After</div>
        </div>
      </div>
      <div className="text-center mt-3 text-[12.5px] font-semibold text-emerald-700">+128% improvement</div>
    </div>
  );
}
