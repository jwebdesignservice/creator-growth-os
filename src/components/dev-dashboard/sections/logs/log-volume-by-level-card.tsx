import { DevSectionCard } from "../../dev-section-card";
import type { LogVolumeChart } from "@/lib/dev-dashboard/types";

const CHART_W = 360;
const CHART_H = 160;
const PAD_Y = 6;

/**
 * Stacked-area chart of log volume by level (INFO / WARN / ERROR) over the
 * last 30 minutes. Values are stacked bottom-up so the visual height of each
 * band represents its share of total volume in that slot.
 */
export function LogVolumeByLevelCard({ chart }: { chart: LogVolumeChart }) {
  const { series, xLabels, yLabels, yMax } = chart;

  // Build a running cumulative sum so each successive series is drawn on top
  // of the previous one (true stacked-area, not overlapping lines).
  const stacked = stackSeries(series.map((s) => s.values));
  const bands = series.map((s, i) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    upper: stacked[i],
    lower: i === 0 ? new Array(s.values.length).fill(0) : stacked[i - 1],
  }));

  return (
    <DevSectionCard title="Log Volume by Level">
      {/* Legend */}
      <ul className="flex flex-wrap items-center gap-4 mb-3">
        {series.map((s) => (
          <li
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--dev-text-secondary)]"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pr-2.5 py-1 text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
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
              <defs>
                {bands.map((b) => (
                  <linearGradient
                    key={b.key}
                    id={`logvol-${b.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={b.color} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={b.color} stopOpacity="0.05" />
                  </linearGradient>
                ))}
              </defs>

              {/* Render top-down so lower bands aren't covered. */}
              {[...bands].reverse().map((b) => (
                <path
                  key={`band-${b.key}`}
                  d={bandPath(b.upper, b.lower, yMax, CHART_W, CHART_H, PAD_Y)}
                  fill={`url(#logvol-${b.key})`}
                  stroke={b.color}
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
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

/* ── Path helpers ─────────────────────────────────────────────────────────── */

function stackSeries(seriesValues: number[][]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < seriesValues.length; i++) {
    const prev = i === 0 ? new Array(seriesValues[i].length).fill(0) : out[i - 1];
    out.push(seriesValues[i].map((v, idx) => v + prev[idx]));
  }
  return out;
}

/* Draw a closed band between upper and lower polylines. */
function bandPath(
  upper: number[],
  lower: number[],
  yMax: number,
  w: number,
  h: number,
  padY: number,
): string {
  if (upper.length === 0) return "";
  const stepX = upper.length > 1 ? w / (upper.length - 1) : 0;
  const inner = h - padY * 2;
  const toY = (v: number) => padY + (1 - v / yMax) * inner;

  const top = upper
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(2)} ${toY(v).toFixed(2)}`)
    .join(" ");
  const bottom = lower
    .map(
      (v, i) =>
        `L ${((lower.length - 1 - i) * stepX).toFixed(2)} ${toY(lower[lower.length - 1 - i]).toFixed(2)}`,
    )
    .join(" ");

  return `${top} ${bottom} Z`;
}
