"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  LineChart,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { PerformanceEntry } from "@/lib/performance/queries";

type MetricKey = "followers" | "reach" | "engagement_rate" | "posts_published";
type RangeKey = "7d" | "14d" | "30d" | "90d";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "reach", label: "Reach" },
  { key: "engagement_rate", label: "Engagement" },
  { key: "posts_published", label: "Posts" },
];

/**
 * Each range defines an actual calendar window in days. We filter logs by
 * `week_start` falling inside `[endpoint - windowDays, endpoint]`, where
 * `endpoint = max(today, latestEntry)`. This is what users expect — "May 11
 * is 6 days before May 17, so it must be in the 14-day trend."
 */
const RANGES: { key: RangeKey; pill: string; title: string; windowDays: number }[] = [
  { key: "7d",  pill: "7D",  title: "7-Day Trend",  windowDays: 7  },
  { key: "14d", pill: "14D", title: "14-Day Trend", windowDays: 14 },
  { key: "30d", pill: "30D", title: "30-Day Trend", windowDays: 30 },
  { key: "90d", pill: "90D", title: "90-Day Trend", windowDays: 90 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function entryMs(e: PerformanceEntry): number {
  return new Date(e.week_start + "T00:00:00Z").getTime();
}

type Props = {
  entries: PerformanceEntry[];
};

export function TrendChart({ entries }: Props) {
  const [metric, setMetric] = useState<MetricKey>("followers");
  const [range, setRange] = useState<RangeKey>("7d");

  const config = RANGES.find((r) => r.key === range)!;
  const total = entries.length;

  // Snapshot "now" at mount via useState initializer — Date.now() is impure
  // and would otherwise be flagged by react-hooks/purity (and could cause
  // subtle re-render churn on any client re-render).
  const [todayMs] = useState(() => Date.now());

  // Anchor the window endpoint at max(today, latest entry) so future-dated
  // logs aren't accidentally excluded and the most recent log always
  // sits inside the window.
  const latestMs = total > 0 ? Math.max(...entries.map(entryMs)) : todayMs;
  const endpointMs = Math.max(todayMs, latestMs);
  const cutoffMs = endpointMs - config.windowDays * DAY_MS;

  // Entries that fall inside the calendar window, oldest-first for plotting.
  const inWindow = entries.filter((e) => {
    const t = entryMs(e);
    return t >= cutoffMs && t <= endpointMs;
  });
  const ordered = [...inWindow].sort((a, b) => entryMs(a) - entryMs(b));

  // Most-recent entry overall (newest-first server query → index 0). Used by
  // the "no logs in this window" state to tell the user when they last logged.
  const mostRecentEntry = total > 0 ? entries[0] : null;

  return (
    <section className="card p-5">
      <Header
        title={config.title}
        range={range}
        onRangeChange={setRange}
        metric={metric}
        onMetricChange={setMetric}
      />

      {total === 0 ? (
        <NoDataState />
      ) : ordered.length >= 2 ? (
        <ChartWithInsight
          ordered={ordered}
          metric={metric}
          rangePill={config.pill}
        />
      ) : ordered.length === 1 ? (
        <SingleValueState
          entry={ordered[0]}
          metric={metric}
          windowDays={config.windowDays}
        />
      ) : (
        <SparseWindowState
          mostRecentEntry={mostRecentEntry!}
          totalCount={total}
          rangeLabel={config.title}
          windowDays={config.windowDays}
          endpointMs={endpointMs}
        />
      )}
    </section>
  );
}

/* ── Header (title + controls) ───────────────────────────────────────────── */

function Header({
  title,
  range,
  onRangeChange,
  metric,
  onMetricChange,
}: {
  title: string;
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  metric: MetricKey;
  onMetricChange: (m: MetricKey) => void;
}) {
  return (
    <header className="flex items-start justify-between gap-3 flex-wrap mb-4">
      <h3 className="text-h4 text-ink-900">{title}</h3>

      <div className="flex items-center gap-2 flex-wrap">
        <div
          role="tablist"
          aria-label="Trend range"
          className="inline-flex items-center gap-0.5 p-0.5 rounded-[10px] bg-cream-100 border border-ink-100"
        >
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onRangeChange(r.key)}
                className={cn(
                  "inline-flex items-center h-7 px-2.5 rounded-[8px] text-[11.5px] font-semibold transition-colors cursor-pointer",
                  active
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-ink-500 hover:text-ink-900",
                )}
              >
                {r.pill}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {METRICS.map((m) => {
            const active = metric === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onMetricChange(m.key)}
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
      </div>
    </header>
  );
}

/* ── Chart with summary insight ──────────────────────────────────────────── */

function ChartWithInsight({
  ordered,
  metric,
  rangePill,
}: {
  ordered: PerformanceEntry[];
  metric: MetricKey;
  rangePill: string;
}) {
  const values = ordered.map((e) => Number(e[metric] ?? 0));
  const dates = ordered.map((e) => e.week_start);

  const first = values[0];
  const last = values[values.length - 1];
  const change = computeChange(first, last, metric);

  return (
    <>
      <InsightBar
        currentLabel="Current"
        currentValue={formatValue(metric, last)}
        changeLabel={`${rangePill} change`}
        change={change}
        metric={metric}
      />
      <ChartCanvas values={values} dates={dates} metric={metric} />
    </>
  );
}

function InsightBar({
  currentLabel,
  currentValue,
  changeLabel,
  change,
  metric,
}: {
  currentLabel: string;
  currentValue: string;
  changeLabel: string;
  change: ChangeInfo;
  metric: MetricKey;
}) {
  const TrendIcon =
    change.direction === "up" ? ArrowUp :
    change.direction === "down" ? ArrowDown :
    Minus;

  // Higher is better for all four metrics — green when up, warning-rose when down.
  const tone =
    change.direction === "up"   ? "text-success" :
    change.direction === "down" ? "text-rose-600" :
    "text-ink-500";

  const trendLabel =
    change.direction === "up" ? "Up" :
    change.direction === "down" ? "Down" :
    "Flat";

  return (
    <div className="rounded-[12px] border border-ink-100 bg-cream-100/60 px-4 py-3 mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      <div className="flex flex-col">
        <span className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">
          {currentLabel}
        </span>
        <span className="text-[18px] font-semibold text-ink-900 leading-tight tabular-nums">
          {currentValue}
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">
          {changeLabel}
        </span>
        <span className={cn("inline-flex items-center gap-1 text-[14.5px] font-semibold tabular-nums leading-tight", tone)}>
          <TrendIcon className="size-3.5" strokeWidth={2.5} />
          {formatChange(change, metric)}
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">
          Trend
        </span>
        <span className={cn("text-[14.5px] font-semibold leading-tight", tone)}>
          {trendLabel}
        </span>
      </div>
    </div>
  );
}

/* ── Chart canvas (real SVG with tooltip + y-labels) ─────────────────────── */

const CHART_W = 720;
const CHART_H = 180;
const PAD = { top: 16, right: 16, bottom: 28, left: 16 };

function ChartCanvas({
  values,
  dates,
  metric,
}: {
  values: number[];
  dates: string[];
  metric: MetricKey;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  // Pick a "nice" y-max so the line never touches the top edge.
  const rawMax = Math.max(1, ...values);
  const niceMax = niceCeiling(rawMax * 1.05);

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const stepX = innerW / Math.max(1, values.length - 1);

  const points = useMemo(
    () => values.map((v, i) => {
      const x = PAD.left + i * stepX;
      const y = PAD.top + (1 - v / niceMax) * innerH;
      return { x, y, v, date: dates[i] };
    }),
    [values, dates, stepX, niceMax, innerH],
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${CHART_H - PAD.bottom} L ${points[0].x.toFixed(2)} ${CHART_H - PAD.bottom} Z`;

  // 5 evenly-spaced y-ticks: 0, 25%, 50%, 75%, 100% of niceMax.
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => p * niceMax);

  // X-axis labels: show all if ≤ 4 points, else first / mid / last.
  const xLabelIndices: number[] =
    values.length <= 4
      ? values.map((_, i) => i)
      : Array.from(new Set([0, Math.floor((values.length - 1) / 2), values.length - 1]));

  const hoveredPoint = hovered != null ? points[hovered] : null;
  const tooltipLeftPercent = hoveredPoint ? (hoveredPoint.x / CHART_W) * 100 : 0;
  const hoveredPrev = hovered != null && hovered > 0 ? values[hovered - 1] : null;
  const hoveredChange =
    hoveredPoint && hoveredPrev !== null
      ? computeChange(hoveredPrev, hoveredPoint.v, metric)
      : null;

  return (
    <div className="flex" onPointerLeave={() => setHovered(null)}>
      {/* Y-axis labels — rendered as DOM so they aren't stretched by the SVG */}
      <div
        className="flex flex-col-reverse justify-between pr-2 text-[10.5px] text-ink-500 tabular-nums shrink-0"
        style={{ height: 200, paddingTop: (PAD.top / CHART_H) * 200, paddingBottom: (PAD.bottom / CHART_H) * 200 }}
        aria-hidden
      >
        {yTicks.map((t, i) => (
          <span key={i} className="leading-none">
            {formatValue(metric, t)}
          </span>
        ))}
      </div>

      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="w-full h-[200px] block"
          role="img"
          aria-label={`Trend chart, ${formatValue(metric, last(values))} latest`}
        >
          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = PAD.top + p * innerH;
            return (
              <line
                key={i}
                x1={PAD.left}
                x2={CHART_W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--ink-100)"
                strokeDasharray={p === 1 ? undefined : "3 3"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Filled area */}
          <path d={areaPath} fill="var(--rose-100)" fillOpacity="0.55" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--rose-500)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Hover guide line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              x2={hoveredPoint.x}
              y1={PAD.top}
              y2={CHART_H - PAD.bottom}
              stroke="var(--rose-300)"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Dots */}
          {points.map((p, i) => {
            const isActive = i === hovered;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isActive ? 5 : 4}
                fill="white"
                stroke="var(--rose-500)"
                strokeWidth={isActive ? 2.5 : 2}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* X-axis date labels */}
          {xLabelIndices.map((idx) => {
            const p = points[idx];
            if (!p) return null;
            const label = formatShortDate(p.date);
            // Anchor first/last labels so they don't clip past the edges.
            const anchor =
              idx === 0 ? "start" :
              idx === values.length - 1 ? "end" :
              "middle";
            return (
              <text
                key={idx}
                x={p.x}
                y={CHART_H - 8}
                textAnchor={anchor}
                fontSize="10"
                fill="var(--ink-500)"
              >
                {label}
              </text>
            );
          })}

          {/* Invisible hit-areas for hover / focus / touch — wide columns
              centered on each data point so the user doesn't need pixel
              precision to trigger a tooltip. */}
          {points.map((p, i) => {
            const halfWidth = stepX / 2;
            const x = Math.max(0, p.x - halfWidth);
            const w = Math.min(CHART_W - x, stepX || innerW);
            return (
              <rect
                key={i}
                x={x}
                y={0}
                width={w}
                height={CHART_H}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${formatLongDate(p.date)}: ${formatValue(metric, p.v)}`}
                onPointerEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((cur) => (cur === i ? null : cur))}
                onTouchStart={() => setHovered(i)}
                className="cursor-pointer focus:outline-none"
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `clamp(72px, ${tooltipLeftPercent}%, calc(100% - 72px))`,
              top: `${(hoveredPoint.y / CHART_H) * 100}%`,
              marginTop: -12,
            }}
            role="tooltip"
          >
            <div className="bg-white rounded-[10px] border border-ink-100 shadow-md px-3 py-2 min-w-[140px]">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold mb-0.5">
                {formatLongDate(hoveredPoint.date)}
              </div>
              <div className="text-[12.5px] text-ink-700">
                {metricLabel(metric)}
              </div>
              <div className="text-[15px] text-ink-900 font-semibold tabular-nums leading-tight">
                {formatValue(metric, hoveredPoint.v)}
              </div>
              {hoveredChange && (
                <div className={cn(
                  "mt-1 text-[11.5px] font-medium tabular-nums",
                  hoveredChange.direction === "up"   && "text-success",
                  hoveredChange.direction === "down" && "text-rose-600",
                  hoveredChange.direction === "flat" && "text-ink-500",
                )}>
                  {formatChange(hoveredChange, metric)} vs previous log
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single-value state (exactly 1 entry inside the selected window) ────── */

function SingleValueState({
  entry,
  metric,
  windowDays,
}: {
  entry: PerformanceEntry;
  metric: MetricKey;
  windowDays: number;
}) {
  const value = Number(entry[metric] ?? 0);
  return (
    <div className="rounded-[14px] bg-cream-100/60 border border-dashed border-ink-200 px-6 py-8 flex flex-col items-center text-center">
      <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
        {metricLabel(metric)} · {formatLongDate(entry.week_start)}
      </div>
      <div className="text-h1 text-ink-900 leading-none mb-2 tabular-nums">
        {formatValue(metric, value)}
      </div>
      <p className="text-[13px] text-ink-500 max-w-sm leading-relaxed">
        Only one log in the last {windowDays} days. Log another entry to see your trend.
      </p>
    </div>
  );
}

/* ── Zero-entries state ──────────────────────────────────────────────────── */

function NoDataState() {
  return (
    <div className="rounded-[14px] bg-cream-100/60 border border-dashed border-ink-200 px-6 py-8 flex flex-col items-center text-center">
      <div className="size-11 rounded-full bg-rose-100 inline-flex items-center justify-center mb-3">
        <LineChart className="size-5 text-rose-600" strokeWidth={2} />
      </div>
      <h4 className="text-h5 text-ink-900 mb-1">
        No performance data yet
      </h4>
      <p className="text-[13px] text-ink-500 max-w-sm leading-relaxed">
        Start logging weekly performance to see your trends here.
      </p>
    </div>
  );
}

/* ── Sparse-window state (no logs inside the selected window) ────────────
   The user has logged before, but none of those entries fall inside the
   selected calendar window. We tell them when they last logged and how
   long ago that was so they understand what's missing. */

function SparseWindowState({
  mostRecentEntry,
  totalCount,
  rangeLabel,
  windowDays,
  endpointMs,
}: {
  mostRecentEntry: PerformanceEntry;
  totalCount: number;
  rangeLabel: string;
  windowDays: number;
  endpointMs: number;
}) {
  const recentMs = entryMs(mostRecentEntry);
  const daysSinceRecent = Math.max(0, Math.round((endpointMs - recentMs) / DAY_MS));
  const dayWord = daysSinceRecent === 1 ? "day" : "days";
  const logWord = totalCount === 1 ? "log" : "logs";

  return (
    <div className="rounded-[14px] bg-cream-100/60 border border-dashed border-ink-200 px-6 py-8 flex flex-col items-center text-center">
      <div className="size-11 rounded-full bg-rose-100 inline-flex items-center justify-center mb-3">
        <LineChart className="size-5 text-rose-600" strokeWidth={2} />
      </div>

      <h4 className="text-h5 text-ink-900 mb-1">
        No logs in the last {windowDays} days
      </h4>
      <p className="text-[13px] text-ink-500 max-w-sm mb-4 leading-relaxed">
        Your most recent log was{" "}
        <span className="font-semibold text-ink-900">
          {formatLongDate(mostRecentEntry.week_start)}
        </span>{" "}
        ({daysSinceRecent} {dayWord} ago).
      </p>

      <p className="text-[13px] text-ink-700">
        You have {totalCount} weekly {logWord} total — log this week to start your {rangeLabel}.
      </p>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

type ChangeInfo = {
  direction: "up" | "down" | "flat";
  /** Signed absolute delta (current - previous). */
  absolute: number;
  /** Signed percent change. `null` when previous is 0. */
  percent: number | null;
};

function computeChange(prev: number, curr: number, _metric: MetricKey): ChangeInfo {
  void _metric;
  const absolute = curr - prev;
  const percent = prev === 0 ? (curr === 0 ? 0 : null) : ((curr - prev) / prev) * 100;
  const direction: ChangeInfo["direction"] =
    Math.abs(absolute) < 1e-9 ? "flat" :
    absolute > 0 ? "up" : "down";
  return { direction, absolute, percent };
}

function formatChange(c: ChangeInfo, metric: MetricKey): string {
  // Posts are small integers — show the absolute delta so "+2" reads
  // clearer than "+50%". Everything else uses percent change.
  if (metric === "posts_published") {
    const sign = c.absolute > 0 ? "+" : "";
    return `${sign}${Math.round(c.absolute)}`;
  }
  if (c.percent === null) {
    const sign = c.absolute > 0 ? "+" : "";
    return `${sign}${formatValue(metric, c.absolute)}`;
  }
  const sign = c.percent > 0 ? "+" : "";
  // 1 decimal place when small, integer when ≥10.
  const rounded = Math.abs(c.percent) >= 10
    ? Math.round(c.percent)
    : Math.round(c.percent * 10) / 10;
  return `${sign}${rounded}%`;
}

function formatValue(metric: MetricKey, v: number): string {
  if (metric === "engagement_rate") return `${v.toFixed(1)}%`;
  if (metric === "posts_published") return Math.round(v).toString();
  return formatCompact(v);
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return Math.round(n).toString();
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

function formatLongDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function metricLabel(m: MetricKey): string {
  return METRICS.find((x) => x.key === m)?.label ?? "";
}

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

/** Round v up to a "nice" axis ceiling (1, 2, 5 × 10^n). */
function niceCeiling(v: number): number {
  if (v <= 1) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const head = v / pow;
  let nice: number;
  if (head <= 1) nice = 1;
  else if (head <= 2) nice = 2;
  else if (head <= 5) nice = 5;
  else nice = 10;
  return nice * pow;
}
