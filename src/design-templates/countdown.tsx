/* Countdown ───────────────────────────────────────────────────────────────────
   Launch / limited-offer timers — the digit-block countdown and a "doors close"
   urgency banner. For course launches, cohort enrollment windows, and flash
   sales. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Timer, Zap, ArrowRight } from "lucide-react";

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="size-14 rounded-[12px] bg-ink-900 text-cream-50 flex items-center justify-center text-[24px] font-bold tabular-nums">
        {value}
      </div>
      <span className="text-[10.5px] uppercase tracking-wide text-ink-400 mt-1.5">{label}</span>
    </div>
  );
}

/* 1 · Digit-block countdown. */
export function CountdownTimer() {
  return (
    <div className="w-[360px] max-w-full text-center">
      <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-rose-600 mb-3">
        <Timer className="size-4" strokeWidth={2} />
        Enrollment closes in
      </div>
      <div className="flex items-center justify-center gap-2.5">
        <Unit value="02" label="Days" />
        <span className="text-[22px] font-bold text-ink-300 -mt-4">:</span>
        <Unit value="14" label="Hours" />
        <span className="text-[22px] font-bold text-ink-300 -mt-4">:</span>
        <Unit value="37" label="Mins" />
        <span className="text-[22px] font-bold text-ink-300 -mt-4">:</span>
        <Unit value="09" label="Secs" />
      </div>
    </div>
  );
}

/* 2 · Urgency banner — countdown + CTA in one strip. */
export function LaunchBanner() {
  return (
    <div className="w-[480px] max-w-full rounded-[16px] bg-gradient-to-r from-rose-600 to-rose-500 text-white p-5 flex items-center gap-4 flex-wrap shadow-card">
      <span className="size-11 rounded-[12px] bg-white/15 inline-flex items-center justify-center shrink-0">
        <Zap className="size-5" strokeWidth={2} fill="currentColor" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold leading-tight">Doors close tonight</div>
        <div className="text-[12.5px] text-rose-50/90 mt-0.5">Join the spring cohort before enrollment ends.</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {["02", "14", "37"].map((v, i) => (
          <span key={i} className="inline-flex flex-col items-center">
            <span className="min-w-9 h-9 px-1.5 rounded-[8px] bg-white/15 flex items-center justify-center text-[15px] font-bold tabular-nums">{v}</span>
          </span>
        ))}
      </div>
      <button type="button" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-white text-rose-700 text-[13px] font-bold shrink-0 transition-colors cursor-pointer hover:bg-cream-50 active:bg-cream-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600">
        Enroll now <ArrowRight className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}
