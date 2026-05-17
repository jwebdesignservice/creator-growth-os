import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { sparklinePath } from "@/lib/dev-dashboard/dev-utils";
import type { PerfLatencyChart } from "@/lib/dev-dashboard/types";
import { ChartHoverOverlay, type HoverSeries } from "./chart-hover-overlay";

const CHART_W = 720;
const CHART_H = 200;
const PAD_Y = 8;

type Props = {
  chart: PerfLatencyChart;
  /** Optional same-shape chart from the previous period — drawn as dashed overlays. */
  compareChart?: PerfLatencyChart | null;
};

export function ResponseTimeChartCard({ chart, compareChart }: Props) {
  const { series, xLabels, yLabels, yMax } = chart;

  // Build hover series in the same order as the main lines.
  const hoverSeries: HoverSeries[] = series.map((s) => ({
    label: s.label,
    color: s.color,
    values: s.values,
    format: (v) => `${Math.round(v)} ms`,
  }));
  // If comparing, append the prior-period values as dimmer "(prev)" lines
  // so the tooltip reads as a single source of truth instead of two charts.
  if (compareChart) {
    compareChart.series.forEach((s, i) => {
      hoverSeries.push({
        label: `${series[i]?.label ?? s.label} (prev)`,
        color: s.color,
        values: s.values,
        format: (v) => `${Math.round(v)} ms`,
      });
    });
  }

  return (
    <DevSectionCard
      title="Response Time Over Time"
      trailing={
        <div className="flex flex-wrap items-center gap-2">
          <CardSelect label="Metric" value="Response Time" />
          <CardSelect label="View" value="Line" />
        </div>
      }
    >
      {/* Legend */}
      <ul className="flex flex-wrap items-center gap-4 mb-3">
        {series.map((s) => (
          <li
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[12px] text-[var(--dev-text-secondary)]"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.label}
          </li>
        ))}
        {compareChart && (
          <li className="inline-flex items-center gap-1.5 text-[12px] text-[var(--dev-text-muted)]">
            <span className="inline-block w-4 h-px border-t border-dashed border-[var(--dev-text-muted)]" aria-hidden />
            Previous period
          </li>
        )}
      </ul>

      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pr-3 py-1 text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
          {yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        {/* Plot */}
        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: CHART_H }}>
            {/* Gridlines */}
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

            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              width="100%"
              height={CHART_H}
              preserveAspectRatio="none"
              className="relative"
              aria-hidden
            >
              {/* Compare-period lines first so the current period sits on top. */}
              {compareChart?.series.map((s) => (
                <path
                  key={`cmp-${s.key}`}
                  d={pathAgainstMax(s.values, yMax, CHART_W, CHART_H, PAD_Y)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={1.2}
                  strokeOpacity={0.55}
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {series.map((s) => (
                <path
                  key={`line-${s.key}`}
                  d={pathAgainstMax(s.values, yMax, CHART_W, CHART_H, PAD_Y)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}

              {/* Data point dots (current period only — keeps things calm). */}
              {series.map((s) =>
                s.values.map((v, i) => {
                  const stepX = s.values.length > 1 ? CHART_W / (s.values.length - 1) : 0;
                  const inner = CHART_H - PAD_Y * 2;
                  const x = i * stepX;
                  const y = PAD_Y + (1 - v / yMax) * inner;
                  return (
                    <circle
                      key={`dot-${s.key}-${i}`}
                      cx={x}
                      cy={y}
                      r={2.2}
                      fill={s.color}
                    />
                  );
                }),
              )}
            </svg>

            {/* Hover overlay — vertical guide + tooltip with values per series. */}
            <ChartHoverOverlay
              buckets={series[0]?.values.length ?? 0}
              height={CHART_H}
              yMax={yMax}
              padY={PAD_Y}
              series={hoverSeries}
              xLabels={xLabels}
            />
          </div>

          {/* X axis */}
          <div className="mt-2 flex justify-between text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
            {xLabels.map((l, i) => (
              <span key={`${l}-${i}`}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)]">
        <Link
          href="/dev/analytics"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View full performance analytics
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    </DevSectionCard>
  );
}

function CardSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] text-[var(--dev-text-primary)] font-medium transition-colors"
      >
        {value}
        <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
      </button>
    </div>
  );
}

/** Build an SVG path against an explicit y-max so multiple series share scale. */
function pathAgainstMax(values: number[], yMax: number, w: number, h: number, padY = 0): string {
  if (values.length === 0) return "";
  const stepX = values.length > 1 ? w / (values.length - 1) : 0;
  const inner = h - padY * 2;

  if (Math.max(...values) === Math.min(...values)) {
    return sparklinePath(values, w, h, padY);
  }
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = padY + (1 - v / yMax) * inner;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
