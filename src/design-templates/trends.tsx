/* Trend stats ─────────────────────────────────────────────────────────────
   KPI cards with an embedded sparkline + delta — the dashboard/performance
   stat-with-trend combo (stats + charts in one tile).
   ───────────────────────────────────────────────────────────────────── */

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";

function MiniSpark({ up = true }: { up?: boolean }) {
  const data = up ? [8, 10, 9, 13, 12, 16, 15, 20] : [20, 17, 18, 14, 15, 11, 12, 9];
  const w = 96;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <polyline points={`0,${h} ${pts} ${w},${h}`} className={cn(up ? "fill-emerald-100/60" : "fill-rose-100/60", "stroke-none")} />
      <polyline points={pts} fill="none" className={cn(up ? "stroke-emerald-500" : "stroke-rose-500")} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function TrendStatCard() {
  return (
    <div className="card p-5 w-[240px]">
      <div className="text-[12px] text-ink-500">Engagement rate</div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="text-h2 text-ink-900 tabular-nums leading-none">5.7%</div>
        <MiniSpark up />
      </div>
      <span className="inline-flex items-center gap-0.5 mt-3 text-[11.5px] font-semibold text-emerald-700">
        <TrendingUp className="size-3.5" strokeWidth={2.4} />
        +1.1% vs last week
      </span>
    </div>
  );
}

export function TrendStatRow() {
  const items: { label: string; value: string; delta: string; up: boolean }[] = [
    { label: "Followers", value: "12.4K", delta: "+8.2%", up: true },
    { label: "Watch time", value: "1.2K h", delta: "+14%", up: true },
    { label: "Unfollows", value: "76", delta: "-5%", up: false },
  ];
  return (
    <div className="grid grid-cols-3 gap-4 w-[720px] max-w-full">
      {items.map((it) => (
        <div key={it.label} className="card p-5">
          <div className="text-[12px] text-ink-500">{it.label}</div>
          <div className="flex items-end justify-between gap-2 mt-1">
            <div className="text-h3 text-ink-900 tabular-nums leading-none">{it.value}</div>
            <MiniSpark up={it.up} />
          </div>
          <span className={cn("inline-flex items-center gap-0.5 mt-3 text-[11.5px] font-semibold", it.up ? "text-emerald-700" : "text-rose-700")}>
            {it.up ? <TrendingUp className="size-3.5" strokeWidth={2.4} /> : <TrendingDown className="size-3.5" strokeWidth={2.4} />}
            {it.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
