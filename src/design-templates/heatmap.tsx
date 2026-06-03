/* Heatmap ─────────────────────────────────────────────────────────────────
   Activity visualisations — a contribution-style heatmap grid and a weekly
   activity bar. Mirrors src/components/missions/activity-bar.tsx and the
   streak/engagement patterns.
   ───────────────────────────────────────────────────────────────────── */

import { cn } from "@/lib/cn";

export function ContributionHeatmap() {
  const weeks = 16;
  // Deterministic pseudo-pattern (no Math.random — keeps SSR/CSR identical).
  const level = (d: number, w: number) => (d * 3 + w * 7 + (w % 5)) % 5;
  const tone = ["bg-cream-200", "bg-rose-200", "bg-rose-300", "bg-rose-400", "bg-rose-600"];
  const dayLabels = ["M", "", "W", "", "F", "", ""];
  return (
    <div className="card p-5 w-[460px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-ink-900">Posting activity</h3>
        <span className="text-[12px] text-ink-500">Last 16 weeks</span>
      </div>
      <div className="flex gap-1.5">
        <div className="flex flex-col gap-1 pr-1 text-[9px] text-ink-400">
          {dayLabels.map((l, i) => (
            <span key={i} className="h-3 leading-3">{l}</span>
          ))}
        </div>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1 flex-1">
              {Array.from({ length: 7 }).map((_, d) => (
                <span key={d} className={cn("aspect-square rounded-[3px]", tone[level(d, w)])} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10.5px] text-ink-400">
        <span>Less</span>
        {tone.map((t, i) => (
          <span key={i} className={cn("size-2.5 rounded-[2px]", t)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export function WeeklyActivity() {
  const counts = [3, 5, 2, 6, 4, 7, 1];
  const DAY = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(1, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className="card p-4 w-[300px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-ink-900">Mission Activity</div>
        <span className="text-[11.5px] text-ink-500 font-medium">{total} this week</span>
      </div>
      <div className="flex items-end gap-1.5 h-36">
        {counts.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={cn("w-full rounded-md", c > 0 ? "bg-rose-400" : "bg-cream-200")} style={{ height: `${(c / max) * 112 + 6}px` }} />
            <span className="text-[10px] text-ink-500 font-medium">{DAY[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
