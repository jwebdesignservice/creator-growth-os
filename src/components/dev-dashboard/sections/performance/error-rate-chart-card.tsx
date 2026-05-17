import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { PerfErrorRateChart } from "@/lib/dev-dashboard/types";
import { ChartHoverOverlay, type HoverSeries } from "./chart-hover-overlay";

const CHART_W = 320;
const CHART_H = 160;
const PAD_Y = 8;
const LINE_COLOR = "var(--dev-danger)";
const PREV_COLOR = "var(--dev-text-muted)";

type Props = {
  chart: PerfErrorRateChart;
  compareChart?: PerfErrorRateChart | null;
};

export function ErrorRateChartCard({ chart, compareChart }: Props) {
  const { values, xLabels, yLabels, yMax } = chart;

  const hoverSeries: HoverSeries[] = [
    { label: "Error rate", color: LINE_COLOR, values, format: (v) => `${v.toFixed(2)}%` },
  ];
  if (compareChart) {
    hoverSeries.push({
      label: "Previous period",
      color: PREV_COLOR,
      values: compareChart.values,
      format: (v) => `${v.toFixed(2)}%`,
    });
  }

  return (
    <DevSectionCard title="Error Rate Over Time">
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
                <linearGradient id="perf-error-rate-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={LINE_COLOR} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={LINE_COLOR} stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d={areaPath(values, yMax, CHART_W, CHART_H, PAD_Y)} fill="url(#perf-error-rate-grad)" />

              {/* Compare period: dashed gray line. */}
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
                strokeWidth={1.6}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Data point dots */}
              {values.map((v, i) => {
                const stepX = values.length > 1 ? CHART_W / (values.length - 1) : 0;
                const inner = CHART_H - PAD_Y * 2;
                const x = i * stepX;
                const y = PAD_Y + (1 - v / yMax) * inner;
                return <circle key={i} cx={x} cy={y} r={1.8} fill={LINE_COLOR} />;
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
          href="/dev/errors"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View error analytics
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    </DevSectionCard>
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
