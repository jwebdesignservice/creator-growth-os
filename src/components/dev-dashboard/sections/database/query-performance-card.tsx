import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { sparklinePath } from "@/lib/dev-dashboard/dev-utils";
import { DB_QUERY_PERF_CHART } from "@/lib/dev-dashboard/mock-data";
import type { DbQueryPerfChart } from "@/lib/dev-dashboard/types";

const CHART_W = 700;
const CHART_H = 200;

export function QueryPerformanceCard({ data }: { data?: DbQueryPerfChart }) {
  const { series, xLabels, yLabels, yMax } = data ?? DB_QUERY_PERF_CHART;

  const lines = series.map((s) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    path: pathAgainstMax(s.values, yMax, CHART_W, CHART_H, 6),
  }));

  return (
    <DevSectionCard
      title="Query Performance Over Time"
      trailing={
        <div className="flex flex-wrap items-center gap-2">
          <CardSelect label="Metric" value="Query Latency" />
          <CardSelect label="Granularity" value="Hourly" />
          <Link
            href="/dev/performance"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
          >
            View query analytics
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
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
            <span className="size-2 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pr-3 py-1 text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
          {yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 min-w-0">
          <div className="relative h-[200px]">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col-reverse justify-between pointer-events-none">
              {yLabels.map((_, i) => (
                <div key={i} className="border-t border-dashed border-[var(--dev-border-soft)] h-0" />
              ))}
            </div>

            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              width="100%"
              height={CHART_H}
              preserveAspectRatio="none"
              aria-hidden
              className="relative"
            >
              {lines.map((l) => (
                <path
                  key={l.key}
                  d={l.path}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
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

function CardSelect({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-8 px-2.5 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] transition-colors"
    >
      <span className="text-[10px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
        {label}
      </span>
      <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium">{value}</span>
      <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
    </button>
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
