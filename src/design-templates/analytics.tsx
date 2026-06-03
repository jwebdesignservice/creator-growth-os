/* Analytics ─────────────────────────────────────────────────────────────
   The "This Week's Overview" analytics panel: range tabs + platform filter,
   delta stat rows with direction indicators, and an interactive-looking
   line chart with a hover tooltip. Plus a trend-chart card with the honest
   connect-social empty state. Pure presentational mirrors of
   src/components/dashboard/this-weeks-overview.tsx + performance/trend-chart.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Eye,
  Clapperboard,
  ChevronDown,
  ArrowRight,
  LineChart as LineChartIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const RANGES = ["This Week", "Last 7 Days", "Last 30 Days"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Analytics panel — tabs + filter, delta rows, line chart with tooltip.
// ─────────────────────────────────────────────────────────────────────────────

type StatRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: number; // % change; 0 → flat
};

export function AnalyticsPanel() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("This Week");

  const rows: StatRow[] = [
    { icon: Users, label: "Followers Gained", value: "+1,820", delta: 12.4 },
    { icon: Heart, label: "Engagement Rate", value: "5.8%", delta: 3.1 },
    { icon: Eye, label: "Profile Visits", value: "9,240", delta: -2.4 },
    { icon: Clapperboard, label: "Content Published", value: "8", delta: 0 },
  ];

  // Line chart geometry
  const series = [28, 34, 30, 42, 48, 44, 60];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const w = 520;
  const h = 180;
  const pad = 16;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    return { x, y, v };
  });
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const peak = pts[pts.length - 1];

  return (
    <div className="card p-6 w-[860px] max-w-full">
      <header className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h3 className="text-h4 text-ink-900">This Week&apos;s Overview</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Track what&apos;s working. Tune what&apos;s not.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Range tabs */}
          <div className="inline-flex items-center rounded-[10px] bg-cream-100 p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "h-8 px-3 rounded-[8px] text-[12.5px] font-semibold transition-colors",
                  range === r ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Platform filter */}
          <div className="relative">
            <span className="inline-flex items-center gap-2 h-9 pl-3 pr-8 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700">
              All Platforms
            </span>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Delta stat rows */}
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-3 rounded-[12px] border border-ink-100 p-3">
              <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <r.icon className="size-[18px]" strokeWidth={1.9} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-ink-500">{r.label}</div>
                <div className="text-[16px] font-bold text-ink-900 tabular-nums leading-tight">{r.value}</div>
              </div>
              <Delta delta={r.delta} />
            </li>
          ))}
        </ul>

        {/* Line chart with tooltip */}
        <div className="relative rounded-[14px] border border-ink-100 bg-cream-50/40 p-3">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" aria-hidden>
            {/* gridlines */}
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2)} y2={pad + g * (h - pad * 2)} stroke="var(--ink-100)" strokeWidth="1" />
            ))}
            <polygon points={`${pad},${h - pad} ${line} ${w - pad},${h - pad}`} fill="var(--rose-500)" opacity="0.08" />
            <polyline points={line} fill="none" stroke="var(--rose-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.5 : 3} fill="white" stroke="var(--rose-500)" strokeWidth="2" />
            ))}
          </svg>
          {/* tooltip on the peak point */}
          <div
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${(peak.x / w) * 100}%`, top: `${(peak.y / h) * 100}%` }}
          >
            <div className="mb-2 rounded-[10px] bg-ink-900 text-white px-2.5 py-1.5 shadow-lg text-center whitespace-nowrap">
              <div className="text-[10px] text-white/70">Sunday</div>
              <div className="text-[12.5px] font-bold tabular-nums">+60 followers</div>
            </div>
          </div>
          <div className="flex justify-between px-2 mt-1">
            {days.map((d) => (
              <span key={d} className="text-[10.5px] text-ink-400 font-medium">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Delta({ delta }: { delta: number }) {
  if (delta === 0) {
    return <span className="text-[12px] font-semibold text-ink-400 shrink-0">—</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[12px] font-semibold shrink-0 tabular-nums",
        up ? "text-emerald-600" : "text-rose-600",
      )}
    >
      {up ? <TrendingUp className="size-3.5" strokeWidth={2.4} /> : <TrendingDown className="size-3.5" strokeWidth={2.4} />}
      {up ? "+" : ""}
      {delta}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend chart · empty state — the honest "connect a platform" prompt the
// performance trend chart shows before any data exists.
// ─────────────────────────────────────────────────────────────────────────────

export function TrendChartEmpty() {
  return (
    <div className="card p-6 w-[420px] max-w-full">
      <h3 className="text-h4 text-ink-900 mb-1">Audience Trend</h3>
      <p className="text-[12.5px] text-ink-500 mb-5">Followers, reach and engagement over time.</p>
      <div className="rounded-[14px] border-2 border-dashed border-ink-200 bg-cream-50/40 py-12 px-6 flex flex-col items-center text-center">
        <span className="size-12 rounded-full bg-cream-100 text-ink-400 inline-flex items-center justify-center mb-3">
          <LineChartIcon className="size-5" strokeWidth={1.8} />
        </span>
        <p className="text-[13.5px] font-semibold text-ink-900">No data to chart yet</p>
        <p className="text-[12px] text-ink-500 mt-0.5 mb-4 max-w-xs">
          Connect a social account to start tracking your growth over time.
        </p>
        <span className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold">
          Connect account <ArrowRight className="size-3.5" strokeWidth={2.4} />
        </span>
      </div>
    </div>
  );
}
