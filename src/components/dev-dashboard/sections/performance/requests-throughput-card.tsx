import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { PerfThroughputChart } from "@/lib/dev-dashboard/types";
import { ChartHoverOverlay, type HoverSeries } from "./chart-hover-overlay";

const CHART_W = 720;
const CHART_H = 200;
const PAD_Y = 8;
const LINE_COLOR = "var(--dev-chart-blue)";
const PREV_COLOR = "var(--dev-text-muted)";

type Props = {
  chart: PerfThroughputChart;
  compareChart?: PerfThroughputChart | null;
};

export function RequestsThroughputCard({ chart, compareChart }: Props) {
  const { values, xLabels, yLabels, yMax } = chart;

  const hoverSeries: HoverSeries[] = [
    { label: "Requests / Min", color: LINE_COLOR, values, format: kFormat },
  ];
  if (compareChart) {
    hoverSeries.push({
      label: "Previous period", color: PREV_COLOR, values: compareChart.values, format: kFormat,
    });
  }

  return (
    <DevSectionCard
      title="Requests Throughput"
      trailing={<CardSelect label="Metric" value="Requests / Min" />}
    >
      {compareChart && (
        <ul className="flex flex-wrap items-center gap-4 mb-3">
          <li className="inline-flex items-center gap-1.5 text-[12px] text-[var(--dev-text-secondary)]">
            <span className="size-2 rounded-full" style={{ background: LINE_COLOR }} aria-hidden />
            Current period
          </li>
          <li className="inline-flex items-center gap-1.5 text-[12px] text-[var(--dev-text-muted)]">
            <span className="inline-block w-4 h-px border-t border-dashed border-[var(--dev-text-muted)]" aria-hidden />
            Previous period
          </li>
        </ul>
      )}

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
                <linearGradient id="perf-throughput-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={LINE_COLOR} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={LINE_COLOR} stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d={areaPath(values, yMax, CHART_W, CHART_H, PAD_Y)} fill="url(#perf-throughput-grad)" />

              {/* Compare period: dashed line behind current. */}
              {compareChart && (
                <path
                  d={linePath(compareChart.values, yMax, CHART_W, CHART_H, PAD_Y)}
                  fill="none"
                  stroke={PREV_COLOR}
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              <path
                d={linePath(values, yMax, CHART_W, CHART_H, PAD_Y)}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Data point dots */}
              {values.map((v, i) => {
                const stepX = values.length > 1 ? CHART_W / (values.length - 1) : 0;
                const inner = CHART_H - PAD_Y * 2;
                const x = i * stepX;
                const y = PAD_Y + (1 - v / yMax) * inner;
                return <circle key={i} cx={x} cy={y} r={2.2} fill={LINE_COLOR} />;
              })}
            </svg>

            <ChartHoverOverlay
              buckets={values.length}
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
          View throughput breakdown
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

function linePath(values: number[], yMax: number, w: number, h: number, padY: number): string {
  if (values.length === 0) return "";
  const stepX = values.length > 1 ? w / (values.length - 1) : 0;
  const inner = h - padY * 2;
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = padY + (1 - v / yMax) * inner;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function areaPath(values: number[], yMax: number, w: number, h: number, padY: number): string {
  const line = linePath(values, yMax, w, h, padY);
  if (!line) return "";
  return `${line} L ${w.toFixed(2)} ${h.toFixed(2)} L 0 ${h.toFixed(2)} Z`;
}

function kFormat(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return Math.round(v).toString();
}
