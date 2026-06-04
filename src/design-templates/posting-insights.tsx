/* Posting insights ────────────────────────────────────────────────────────
   Content-strategy helpers — a "best time to post" engagement heatmap
   (days × time-of-day) and a format-performance breakdown. Creator-facing
   posting optimisation.
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
