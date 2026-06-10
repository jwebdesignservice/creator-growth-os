"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, LineChart } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Admin metrics chart — top section of /admin.

   • Metric dropdown (7 options).
   • Two date inputs (from / to) — clamped to each other.
   • Granularity toggle (Daily / Weekly / Monthly) — re-buckets the series.
   • Interactive SVG chart with hover tooltip + Y-axis labels.

   All computation lives client-side off the 90-day series passed in from
   the server, so switching metric/range/granularity is instant.
   ───────────────────────────────────────────────────────────────────────── */

export type AdminMetricKey =
  | "revenue"
  | "earnings"
  | "course_sales"
  | "new_signups"
  | "active_students"
  | "lesson_completions"
  | "course_completions";

export type AdminMetricPoint = { date: string; value: number };
export type AdminMetricsSeries = Record<AdminMetricKey, AdminMetricPoint[]>;

type Granularity = "daily" | "weekly" | "monthly";

type MetricConfig = {
  key: AdminMetricKey;
  label: string;
  format: (n: number) => string;
  /** Hint shown when the underlying data isn't connected yet. */
  unavailable?: boolean;
};

const METRICS: MetricConfig[] = [
  { key: "revenue",            label: "Revenue",            format: fmtUSD, unavailable: true  },
  { key: "earnings",           label: "Earnings",           format: fmtUSD, unavailable: true  },
  { key: "course_sales",       label: "Course Sales",       format: fmtInt, unavailable: true  },
  { key: "new_signups",        label: "New Signups",        format: fmtInt                      },
  { key: "active_students",    label: "Active Students",    format: fmtInt                      },
  { key: "lesson_completions", label: "Lesson Completions", format: fmtInt                      },
  { key: "course_completions", label: "Course Completions", format: fmtInt, unavailable: true  },
];

export function AdminMetricsChart({ series }: { series: AdminMetricsSeries }) {
  const allDates = series.new_signups.map((p) => p.date);
  const lastDate = allDates[allDates.length - 1] ?? new Date().toISOString().slice(0, 10);
  const firstDate = allDates[0] ?? lastDate;
  const default30From = allDates[Math.max(0, allDates.length - 30)] ?? firstDate;

  const [metric, setMetric] = useState<AdminMetricKey>("new_signups");
  const [from, setFrom] = useState(default30From);
  const [to, setTo] = useState(lastDate);
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const metricCfg = METRICS.find((m) => m.key === metric)!;

  const filtered = useMemo(
    () => (series[metric] ?? []).filter((p) => p.date >= from && p.date <= to),
    [series, metric, from, to],
  );
  const grouped = useMemo(
    () => groupSeries(filtered, granularity),
    [filtered, granularity],
  );

  const total = grouped.reduce((sum, p) => sum + p.value, 0);
  const hasAnyValue = total > 0;

  return (
    <section className="card p-5 sm:p-6">
      {/* Controls */}
      <div className="flex items-center gap-2.5 flex-wrap mb-5">
        <MetricSelect value={metric} onChange={setMetric} />
        <DateInput
          value={from}
          onChange={setFrom}
          min={firstDate}
          max={to}
          aria-label="From date"
        />
        <DateInput
          value={to}
          onChange={setTo}
          min={from}
          max={lastDate}
          aria-label="To date"
        />
        <GranularityToggle value={granularity} onChange={setGranularity} />

        {/* Quick summary */}
        <div className="ml-auto flex items-baseline gap-2">
          <span className="text-[11.5px] uppercase tracking-wider text-ink-400 font-semibold">
            Total
          </span>
          <span className="text-[18px] font-bold text-ink-900 tabular-nums">
            {metricCfg.format(total)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <MetricChart
        data={grouped}
        format={metricCfg.format}
        empty={!hasAnyValue}
        unavailable={metricCfg.unavailable && !hasAnyValue}
        metricLabel={metricCfg.label}
      />
    </section>
  );
}

/* ─── Metric dropdown ────────────────────────────────────────────────────── */

function MetricSelect({
  value,
  onChange,
}: {
  value: AdminMetricKey;
  onChange: (v: AdminMetricKey) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AdminMetricKey)}
        className="appearance-none h-9 pl-3 pr-9 rounded-[10px] bg-white border border-ink-100 text-[13px] font-medium text-ink-900 hover:bg-cream-100 transition-colors cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 min-w-[160px] lg:min-w-[180px]"
      >
        {METRICS.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-500 pointer-events-none"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

/* ─── Date input ─────────────────────────────────────────────────────────── */

function DateInput({
  value,
  onChange,
  min,
  max,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  "aria-label"?: string;
}) {
  return (
    <label className="relative inline-flex items-center h-9 rounded-[10px] bg-white border border-ink-100 hover:bg-cream-100 transition-colors cursor-pointer pl-3 pr-2.5">
      <Calendar className="size-3.5 text-ink-500 mr-2 shrink-0" strokeWidth={2} aria-hidden />
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value || min || max || value)}
        className="bg-transparent outline-none text-[13px] font-medium text-ink-900 cursor-pointer [color-scheme:light]"
        {...rest}
      />
    </label>
  );
}

/* ─── Granularity toggle ─────────────────────────────────────────────────── */

function GranularityToggle({
  value,
  onChange,
}: {
  value: Granularity;
  onChange: (v: Granularity) => void;
}) {
  const items: Granularity[] = ["daily", "weekly", "monthly"];
  return (
    <div
      role="tablist"
      aria-label="Granularity"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-[10px] bg-cream-100 border border-ink-100"
    >
      {items.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(g)}
            className={cn(
              "inline-flex items-center h-8 px-3.5 rounded-[8px] text-[12.5px] font-semibold capitalize transition-colors cursor-pointer",
              active
                ? "bg-ink-900 text-cream-100 shadow-sm"
                : "text-ink-500 hover:text-ink-900",
            )}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Chart ──────────────────────────────────────────────────────────────── */

const W = 720;
const H = 260;
const PAD = { t: 14, r: 14, b: 28, l: 14 };

function MetricChart({
  data,
  format,
  empty,
  unavailable,
  metricLabel,
}: {
  data: { label: string; value: number }[];
  format: (n: number) => string;
  empty: boolean;
  unavailable: boolean | undefined;
  metricLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0 || (empty && unavailable)) {
    return (
      <div className="rounded-[14px] bg-cream-100/60 border border-dashed border-ink-200 flex flex-col items-center justify-center text-center min-h-[260px] px-6">
        <span className="size-10 rounded-full bg-rose-100 inline-flex items-center justify-center mb-3">
          <LineChart className="size-5 text-rose-600" strokeWidth={2} />
        </span>
        <p className="text-[13.5px] font-semibold text-ink-900 mb-1">
          {unavailable ? `${metricLabel} not connected yet` : `No ${metricLabel.toLowerCase()} in this range`}
        </p>
        <p className="text-[12.5px] text-ink-500 max-w-xs leading-snug">
          {unavailable
            ? "Wire the corresponding data source to light this metric up."
            : "Try a wider date range or switch metric."}
        </p>
      </div>
    );
  }

  const values = data.map((p) => p.value);
  const { max: niceMax, ticks } = niceAxis(Math.max(1, ...values));

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const single = values.length === 1;
  const stepX = single ? 0 : innerW / (values.length - 1);

  const pts = values.map((v, i) => ({
    x: single ? PAD.l + innerW / 2 : PAD.l + i * stepX,
    y: PAD.t + (1 - v / niceMax) * innerH,
    v,
    label: data[i].label,
  }));

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    pts.length >= 2
      ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD.b} L ${pts[0].x.toFixed(1)} ${H - PAD.b} Z`
      : "";
  const hp = hover != null ? pts[hover] : null;

  return (
    <div className="flex min-w-0" onPointerLeave={() => setHover(null)}>
      {/* Y-axis labels */}
      <div
        className="flex flex-col-reverse justify-between pr-2 text-[10.5px] text-ink-400 tabular-nums shrink-0"
        style={{
          height: 260,
          paddingTop: (PAD.t / H) * 260,
          paddingBottom: (PAD.b / H) * 260,
        }}
        aria-hidden
      >
        {ticks.map((t, i) => (
          <span key={i} className="leading-none">
            {format(t)}
          </span>
        ))}
      </div>

      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[260px] block"
          role="img"
          aria-label={`${metricLabel} trend`}
        >
          <defs>
            <linearGradient id="adminMetricGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose-400)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--rose-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t, i) => {
            const y = PAD.t + (1 - t / niceMax) * innerH;
            return (
              <line
                key={i}
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="var(--ink-100)"
                strokeDasharray={i === 0 ? undefined : "3 3"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {area && <path d={area} fill="url(#adminMetricGrad)" />}
          {pts.length >= 2 && (
            <path
              d={line}
              fill="none"
              stroke="var(--rose-500)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {hp && (
            <line
              x1={hp.x}
              x2={hp.x}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="var(--rose-300)"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === hover ? 5 : single ? 5 : 3.5}
              fill="var(--rose-500)"
              stroke="white"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {pts.map((p, i) => {
            const show =
              pts.length <= 10 ||
              i === 0 ||
              i === pts.length - 1 ||
              i === Math.floor((pts.length - 1) / 2);
            if (!show) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={H - 8}
                textAnchor={
                  single
                    ? "middle"
                    : i === 0
                      ? "start"
                      : i === pts.length - 1
                        ? "end"
                        : "middle"
                }
                fontSize="11"
                fill="var(--ink-400)"
              >
                {p.label}
              </text>
            );
          })}

          {pts.map((p, i) => {
            const hw = (stepX || innerW) / 2;
            const x = Math.max(0, p.x - hw);
            const w = Math.min(W - x, stepX || innerW);
            return (
              <rect
                key={i}
                x={x}
                y={0}
                width={w}
                height={H}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${p.label}: ${format(p.v)}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((cur) => (cur === i ? null : cur))}
                onTouchStart={() => setHover(i)}
                className="cursor-pointer focus:outline-none focus-visible:stroke-rose-400 focus-visible:stroke-2"
              />
            );
          })}
        </svg>

        {hp && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `clamp(60px, ${(hp.x / W) * 100}%, calc(100% - 60px))`,
              top: `${(hp.y / H) * 100}%`,
              marginTop: -10,
            }}
            role="tooltip"
          >
            <div className="bg-white rounded-[10px] border border-ink-100 shadow-md px-3 py-2 text-center min-w-[112px]">
              <div className="text-[11.5px] font-semibold text-ink-900 leading-tight">
                {hp.label}
              </div>
              <div className="text-[13px] font-bold text-rose-600 tabular-nums mt-0.5">
                {format(hp.v)}
              </div>
              <div className="text-[10.5px] text-ink-400 mt-0.5">{metricLabel}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function groupSeries(
  points: AdminMetricPoint[],
  gran: Granularity,
): { label: string; value: number }[] {
  if (points.length === 0) return [];
  if (gran === "daily") {
    return points.map((p) => ({ label: fmtDay(p.date), value: p.value }));
  }
  const buckets = new Map<string, { label: string; sortKey: number; value: number }>();
  for (const p of points) {
    const d = new Date(p.date + "T00:00:00Z");
    let key: string;
    let sortKey: number;
    let label: string;
    if (gran === "weekly") {
      const monday = startOfWeek(d);
      key = monday.toISOString().slice(0, 10);
      sortKey = monday.getTime();
      label = fmtDay(key);
    } else {
      // monthly
      const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      sortKey = monthStart.getTime();
      label = monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    }
    const ex = buckets.get(key) ?? { label, sortKey, value: 0 };
    ex.value += p.value;
    buckets.set(key, ex);
  }
  return Array.from(buckets.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ label, value }) => ({ label, value }));
}

function startOfWeek(d: Date): Date {
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
}

function fmtDay(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtUSD(n: number): string {
  if (Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `$${Math.round(n).toLocaleString()}`;
}

function niceAxis(max: number): { max: number; ticks: number[] } {
  const target = Math.max(1, max);
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  const steps: number[] = [];
  for (const p of [pow, pow * 10]) {
    for (const m of [0.5, 1, 2, 2.5, 5]) steps.push(m * p);
  }
  steps.sort((a, b) => a - b);
  const step =
    steps.find((s) => Math.ceil(target / s) <= 4) ?? steps[steps.length - 1];
  const niceMax = Math.ceil(target / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + 1e-9; v += step) ticks.push(Math.round(v));
  return { max: niceMax, ticks };
}
