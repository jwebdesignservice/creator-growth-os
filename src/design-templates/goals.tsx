/* Goals ───────────────────────────────────────────────────────────────────
   Creator growth goals — a goal card (target + progress + deadline) and a
   circular goal ring. Creator-facing.
   ───────────────────────────────────────────────────────────────────── */

import { Target, CalendarDays } from "lucide-react";

export function GoalCard() {
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-[11px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Target className="size-5" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-ink-900">Reach 50k followers</h3>
            <span className="chip chip-rose">On track</span>
          </div>
          <p className="text-[12px] text-ink-500 mt-0.5 inline-flex items-center gap-1">
            <CalendarDays className="size-3" strokeWidth={2} />
            Due Aug 1
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] mb-1.5">
          <span className="text-ink-500 tabular-nums">42,180 / 50,000</span>
          <span className="font-semibold text-ink-900 tabular-nums">84%</span>
        </div>
        <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
          <div className="h-full bg-rose-500 rounded-full" style={{ width: "84%" }} />
        </div>
      </div>
    </div>
  );
}

export function GoalRing() {
  const pct = 84;
  const size = 120;
  const sw = 10;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="card p-5 w-[200px] flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} className="fill-none stroke-cream-200" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} className="fill-none stroke-rose-500" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-h3 text-ink-900 tabular-nums leading-none">84%</span>
          <span className="text-[10.5px] text-ink-500 mt-0.5">to goal</span>
        </div>
      </div>
      <span className="text-[12.5px] font-medium text-ink-700 mt-2">Followers goal</span>
    </div>
  );
}
