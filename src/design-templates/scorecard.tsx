/* Scorecard ───────────────────────────────────────────────────────────────────
   Coaching summary — a weekly creator scorecard that grades performance areas
   (letter grades + trend) rather than showing raw numbers. Complements `stats`
   / `performance` with a digestible "how am I doing?" view. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Trend = "up" | "down" | "flat";
const AREAS: { label: string; grade: string; trend: Trend; tone: string }[] = [
  { label: "Content quality", grade: "A",  trend: "up",   tone: "bg-emerald-100 text-emerald-700" },
  { label: "Consistency",     grade: "B+", trend: "up",   tone: "bg-amber-100 text-amber-700" },
  { label: "Engagement",      grade: "A−", trend: "flat", tone: "bg-emerald-100 text-emerald-700" },
  { label: "Audience growth", grade: "B",  trend: "down", tone: "bg-amber-100 text-amber-700" },
];

function TrendIcon({ t }: { t: Trend }) {
  if (t === "up") return <TrendingUp className="size-3.5 text-emerald-500" strokeWidth={2.2} />;
  if (t === "down") return <TrendingDown className="size-3.5 text-rose-500" strokeWidth={2.2} />;
  return <Minus className="size-3.5 text-ink-300" strokeWidth={2.2} />;
}

/* 1 · Weekly scorecard — overall grade + per-area breakdown. */
export function WeeklyScorecard() {
  return (
    <div className="w-[400px] max-w-full rounded-[18px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">This week</div>
          <h3 className="text-[16px] font-bold text-ink-900">Creator scorecard</h3>
        </div>
        <div className="size-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex flex-col items-center justify-center shrink-0">
          <span className="text-[20px] font-bold leading-none">A−</span>
          <span className="text-[8.5px] uppercase tracking-wide opacity-80">Overall</span>
        </div>
      </div>
      <ul className="divide-y divide-ink-100">
        {AREAS.map((a) => (
          <li key={a.label} className="flex items-center gap-3 py-2.5">
            <span className="flex-1 text-[13px] text-ink-700">{a.label}</span>
            <TrendIcon t={a.trend} />
            <span className={cn("inline-flex items-center justify-center min-w-9 h-7 px-2 rounded-[8px] text-[13px] font-bold tabular-nums", a.tone)}>
              {a.grade}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-emerald-700">
        <Sparkles className="size-3.5" strokeWidth={2} fill="currentColor" />
        Up from B+ last week — keep it up!
      </div>
    </div>
  );
}

/* 2 · Compact grade chip row — a one-line summary strip. */
export function GradeStrip() {
  return (
    <div className="w-[400px] max-w-full rounded-[14px] border border-ink-100 bg-cream-50 px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="size-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[14px] font-bold inline-flex items-center justify-center shrink-0">A−</span>
      <span className="text-[13px] font-semibold text-ink-900">This week&apos;s grade</span>
      <div className="flex items-center gap-1.5 ml-auto flex-wrap">
        {AREAS.map((a) => (
          <span key={a.label} className={cn("inline-flex items-center justify-center min-w-7 h-6 px-1.5 rounded-[7px] text-[11.5px] font-bold", a.tone)}>
            {a.grade}
          </span>
        ))}
      </div>
    </div>
  );
}
