import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { sparklineAreaPath, sparklinePath } from "@/lib/dev-dashboard/dev-utils";
import { TRAFFIC_TRENDS } from "@/lib/dev-dashboard/analytics-data";

/* Chart dimensions — width is the viewBox, the SVG itself scales to 100% */
const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;

export function TrafficTrendsCard() {
  const { xLabels, yLabels, series } = TRAFFIC_TRENDS;

  return (
    <DevSectionCard
      title="Traffic & Usage Trends"
      trailing={
        <div className="hidden md:flex items-center gap-2.5">
          <ControlSelect label="Metric" value="Page Views" />
          <ControlSelect label="Granularity" value="Daily" />
          <Link
            href="/dev/analytics"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
          >
            View full analytics
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      }
    >
      {/* Legend */}
      <ul className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mb-3">
        {series.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--dev-text-secondary)]">
            <span
              className="size-2 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.label}
          </li>
        ))}
      </ul>

      {/* Chart body — Y axis + plot */}
      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pr-3 py-1 text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
          {yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        {/* Plot */}
        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: CHART_HEIGHT }}>
            {/* Horizontal gridlines */}
            <div
              className="absolute inset-0 flex flex-col-reverse justify-between pointer-events-none"
              aria-hidden
            >
              {yLabels.map((_, i) => (
                <div
                  key={i}
                  className="border-t border-dashed border-[var(--dev-border-soft)] h-0"
                />
              ))}
            </div>

            {/* SVG: stack one gradient area + one line per series */}
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              width="100%"
              height={CHART_HEIGHT}
              preserveAspectRatio="none"
              className="relative"
              aria-hidden
            >
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`trend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>

              {/* Area fills */}
              {series.map((s) => (
                <path
                  key={`area-${s.key}`}
                  d={sparklineAreaPath(s.points, CHART_WIDTH, CHART_HEIGHT, 6)}
                  fill={`url(#trend-${s.key})`}
                />
              ))}

              {/* Lines */}
              {series.map((s) => (
                <path
                  key={`line-${s.key}`}
                  d={sparklinePath(s.points, CHART_WIDTH, CHART_HEIGHT, 6)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}

              {/* Data point dots — small markers on each series */}
              {series.map((s) =>
                s.points.map((v, i) => {
                  const stepX = s.points.length > 1 ? CHART_WIDTH / (s.points.length - 1) : 0;
                  const min = Math.min(...s.points);
                  const max = Math.max(...s.points);
                  const range = max - min || 1;
                  const x = i * stepX;
                  const y = 6 + (1 - (v - min) / range) * (CHART_HEIGHT - 12);
                  return (
                    <circle
                      key={`dot-${s.key}-${i}`}
                      cx={x}
                      cy={y}
                      r={2.4}
                      fill={s.color}
                    />
                  );
                }),
              )}
            </svg>
          </div>

          {/* X axis */}
          <div className="mt-2 flex justify-between text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
            {xLabels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </DevSectionCard>
  );
}

/* ── Small select-style control used inside the card header ───────────────
   Visual-only: no popover wired up — matches the static look of similar
   "Last 30 days" / "All traffic" controls elsewhere on the page.            */
function ControlSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-[8px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] text-[var(--dev-text-primary)] font-medium transition-colors"
      >
        {value}
        <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
      </button>
    </div>
  );
}
