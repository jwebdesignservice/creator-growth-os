/* Gauges ──────────────────────────────────────────────────────────────────
   Single-metric dials for creator scores — a half-circle readiness gauge
   and a goal-progress meter with a target marker. Distinct from the full
   DonutRing in Charts. (Creator-facing, e.g. monetization readiness & goals.)
   ───────────────────────────────────────────────────────────────────── */

import { cn } from "@/lib/cn";

export function ScoreGauge() {
  const pct = 78;
  const r = 50;
  const len = Math.PI * r;
  const dash = (pct / 100) * len;
  return (
    <div className="card p-5 w-[240px] flex flex-col items-center">
      <svg width={140} height={84} viewBox="0 0 140 84" aria-hidden>
        <path d="M20 70 A50 50 0 0 1 120 70" fill="none" className="stroke-cream-200" strokeWidth={12} strokeLinecap="round" />
        <path d="M20 70 A50 50 0 0 1 120 70" fill="none" className="stroke-rose-500" strokeWidth={12} strokeLinecap="round" strokeDasharray={`${dash} ${len}`} />
      </svg>
      <div className="-mt-7 text-center">
        <div className="text-h2 text-ink-900 tabular-nums leading-none">78</div>
        <div className="text-[11.5px] text-ink-500 mt-1">Monetization readiness</div>
      </div>
      <span className="chip chip-rose mt-2">Building</span>
    </div>
  );
}

export function GoalMeter() {
  const current = 42;
  const target = 50;
  const pct = Math.round((current / target) * 100);
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13.5px] font-bold text-ink-900">Followers goal</h3>
        <span className="text-[12.5px] font-semibold text-rose-600 tabular-nums">{current}K / {target}K</span>
      </div>
      <div className="relative h-3 rounded-full bg-cream-200 overflow-hidden">
        <div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-[11.5px] text-ink-400">
        <span>{pct}% there</span>
        <span>8K to go · ~6 weeks</span>
      </div>
    </div>
  );
}
