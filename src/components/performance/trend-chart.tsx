"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { PerformanceEntry } from "@/lib/performance/queries";

type MetricKey = "followers" | "reach" | "engagement_rate" | "posts_published";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "reach", label: "Reach" },
  { key: "engagement_rate", label: "Engagement" },
  { key: "posts_published", label: "Posts" },
];

type Props = {
  entries: PerformanceEntry[];
};

export function TrendChart({ entries }: Props) {
  const [metric, setMetric] = useState<MetricKey>("followers");

  // Convert to oldest-first for plotting
  const ordered = [...entries].reverse();
  const values = ordered.map((e) => Number(e[metric] ?? 0));
  const hasData = values.some((v) => v > 0);

  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-[19px] text-ink-900">
          12-Week Trend
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          {METRICS.map((m) => {
            const active = metric === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetric(m.key)}
                className={cn(
                  "inline-flex items-center h-8 px-3 rounded-[8px] text-[12px] font-medium border cursor-pointer transition-colors",
                  active
                    ? "bg-rose-600 border-rose-600 text-white"
                    : "bg-white border-ink-100 text-ink-700 hover:bg-cream-100",
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </header>

      {!hasData ? (
        <div className="h-[160px] flex items-center justify-center text-[13px] text-ink-500">
          Log a few weekly entries to see your trend appear here.
        </div>
      ) : (
        <ChartCanvas values={values} weeks={ordered.map((e) => e.week_start)} />
      )}
    </section>
  );
}

function ChartCanvas({ values, weeks }: { values: number[]; weeks: string[] }) {
  const width = 720;
  const height = 180;
  const pad = { top: 16, right: 16, bottom: 24, left: 32 };

  const max = Math.max(1, ...values);
  const stepX = (width - pad.left - pad.right) / Math.max(1, values.length - 1);

  const points = values
    .map((v, i) => {
      const x = pad.left + i * stepX;
      const y =
        height -
        pad.bottom -
        (v / max) * (height - pad.top - pad.bottom);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-[200px]"
      role="img"
      aria-label="Trend chart"
    >
      {/* Y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = pad.top + p * (height - pad.top - pad.bottom);
        return (
          <line
            key={i}
            x1={pad.left}
            x2={width - pad.right}
            y1={y}
            y2={y}
            stroke="var(--ink-100)"
            strokeDasharray={p === 1 ? undefined : "3 3"}
          />
        );
      })}
      {/* Filled area */}
      <polyline
        points={`${pad.left},${height - pad.bottom} ${points} ${width - pad.right},${height - pad.bottom}`}
        fill="var(--rose-100)"
        fillOpacity="0.6"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--rose-500)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {values.map((v, i) => {
        const x = pad.left + i * stepX;
        const y =
          height -
          pad.bottom -
          (v / max) * (height - pad.top - pad.bottom);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="white"
            stroke="var(--rose-500)"
            strokeWidth={2}
          />
        );
      })}
      {/* X-axis labels (first, middle, last) */}
      {[0, Math.floor(values.length / 2), values.length - 1].map((idx) => {
        const w = weeks[idx];
        if (!w) return null;
        const d = new Date(w + "T00:00:00Z");
        const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        const x = pad.left + idx * stepX;
        return (
          <text
            key={idx}
            x={x}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-500)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
