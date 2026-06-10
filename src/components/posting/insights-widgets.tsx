/* Posting insights widgets ────────────────────────────────────────────────
   Local copies of the analytics widgets the posting Insights dashboard
   renders — "best time to post" heatmap, format-performance bars, a
   contribution-style posting-activity heatmap and an audience-retention
   cohort grid. Originally drafted in the /design gallery library
   (src/design-templates/{posting-insights,heatmap,funnels}.tsx); copied
   here so the production posting page has no dependency on that scratch
   directory. Rendered output is identical.
   ───────────────────────────────────────────────────────────────────── */

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function BestTimeHeatmap({ className }: { className?: string }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = ["6a", "9a", "12p", "3p", "6p", "9p"];
  const level = (d: number, h: number) => (d * 2 + h * 3 + (h % 4)) % 5;
  const tone = ["bg-cream-200", "bg-rose-200", "bg-rose-300", "bg-rose-400", "bg-rose-600"];
  return (
    <div className={cn("card p-5 w-[420px] max-w-full", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-h5 text-ink-900">Best time to post</h3>
        <span className="chip chip-rose">Peak: Sat 6p</span>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 pr-1 w-7 shrink-0">
          {days.map((d) => (
            <span key={d} className="h-5 text-[9px] text-ink-400 leading-5">{d}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {days.map((d, di) => (
            <div key={d} className="grid grid-cols-6 gap-1">
              {buckets.map((b, hi) => (
                <span key={b} className={cn("h-5 rounded-[3px]", tone[level(di, hi)])} />
              ))}
            </div>
          ))}
          <div className="grid grid-cols-6 gap-1 mt-0.5">
            {buckets.map((b) => (
              <span key={b} className="text-[9px] text-ink-400 text-center">{b}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-ink-100 text-[12px] text-ink-500 leading-snug">
        Darker = more engagement. Your strongest window is{" "}
        <span className="font-semibold text-ink-700">Sat 6&nbsp;PM</span>.
      </div>
    </div>
  );
}

export function FormatPerformance({ className }: { className?: string }) {
  const fmts = [
    { name: "Reels", pct: 88, tone: "bg-violet-500" },
    { name: "Carousels", pct: 64, tone: "bg-sky-500" },
    { name: "Stories", pct: 41, tone: "bg-amber-500" },
    { name: "Posts", pct: 28, tone: "bg-rose-400" },
  ];
  return (
    <div className={cn("card p-5 w-[340px] max-w-full", className)}>
      <h3 className="text-h5 text-ink-900 mb-1">Format performance</h3>
      <p className="text-[11.5px] text-ink-400 mb-4">Avg engagement rate by format</p>
      <div className="space-y-3.5">
        {fmts.map((f) => (
          <div key={f.name} className="flex items-center gap-3">
            <span className="text-[12px] text-ink-700 w-20 shrink-0">{f.name}</span>
            <div className="flex-1 h-2.5 rounded-full bg-cream-200 overflow-hidden">
              <div className={"h-full rounded-full " + f.tone} style={{ width: `${f.pct}%` }} />
            </div>
            <span className="text-[12px] font-semibold text-ink-900 tabular-nums w-9 text-right shrink-0">
              {f.pct}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-ink-100 flex items-start gap-2 text-[12px] text-ink-500 leading-snug">
        <Sparkles className="size-3.5 text-rose-500 shrink-0 mt-0.5" strokeWidth={2} />
        <span>
          <span className="font-semibold text-ink-700">Reels</span> outperform Posts ~3× —
          prioritise them in your plan.
        </span>
      </div>
    </div>
  );
}

export function ContributionHeatmap({ className }: { className?: string }) {
  const weeks = 16;
  // Deterministic pseudo-pattern (no Math.random — keeps SSR/CSR identical).
  const level = (d: number, w: number) => (d * 3 + w * 7 + (w % 5)) % 5;
  const tone = ["bg-cream-200", "bg-rose-200", "bg-rose-300", "bg-rose-400", "bg-rose-600"];
  const dayLabels = ["M", "", "W", "", "F", "", ""];
  return (
    <div className={cn("card p-5 w-[460px] max-w-full", className)}>
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

export function RetentionCohort({ className }: { className?: string }) {
  const rows = [
    { label: "May 1", cells: [100, 68, 52, 44, 38] },
    { label: "May 8", cells: [100, 71, 55, 47] },
    { label: "May 15", cells: [100, 66, 50] },
    { label: "May 22", cells: [100, 72] },
    { label: "May 29", cells: [100] },
  ];
  const tone = (v: number) =>
    v >= 80 ? "bg-rose-600 text-white" : v >= 55 ? "bg-rose-400 text-white" : v >= 40 ? "bg-rose-300 text-rose-700" : "bg-rose-100 text-rose-700";
  return (
    <div className={cn("card p-5 w-[420px] max-w-full", className)}>
      <h3 className="text-h5 text-ink-900 mb-4">Audience retention</h3>
      <div className="flex gap-1 mb-1 pl-12 text-[10px] text-ink-400">
        {["W0", "W1", "W2", "W3", "W4"].map((w) => (
          <span key={w} className="flex-1 text-center">{w}</span>
        ))}
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-1">
            <span className="w-11 text-[10.5px] text-ink-500 shrink-0">{r.label}</span>
            <div className="flex gap-1 flex-1">
              {[0, 1, 2, 3, 4].map((c) => (
                <span key={c} className={cn("flex-1 h-8 rounded-[5px] inline-flex items-center justify-center text-[10.5px] font-semibold tabular-nums", r.cells[c] != null ? tone(r.cells[c]) : "bg-cream-100")}>
                  {r.cells[c] != null ? `${r.cells[c]}%` : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
