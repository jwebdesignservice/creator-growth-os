"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Info } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { sparklinePath, sparklineAreaPath } from "@/lib/dev-dashboard/dev-utils";
import { ERROR_TRENDS_METRIC_OPTIONS, type ErrorTrendsMetric } from "@/lib/dev-dashboard/errors-filters";
import { ERROR_TRENDS_CHART } from "@/lib/dev-dashboard/mock-data";
import type { ErrorTrendChart } from "@/lib/dev-dashboard/types";

const CHART_W = 600;
const CHART_H = 200;

/**
 * Error trends area chart with a client-side metric switcher. The chart
 * data is the same shape regardless of metric — we transform the series
 * locally so the page doesn't need to re-fetch on every switch.
 */
export function ErrorTrendsCard({ data }: { data?: ErrorTrendChart }) {
  const chart = data ?? ERROR_TRENDS_CHART;
  const [metric, setMetric] = useState<ErrorTrendsMetric>("total");
  const [menuOpen, setMenuOpen] = useState(false);

  const values = useMemo(() => {
    switch (metric) {
      case "users":    return chart.series.map((p) => Math.round(p.value * 1.6));
      case "critical": return chart.series.map((p) => Math.round(p.value * 0.12));
      case "total":
      default:         return chart.series.map((p) => p.value);
    }
  }, [chart.series, metric]);

  const line = sparklinePath(values, CHART_W, CHART_H, 6);
  const area = sparklineAreaPath(values, CHART_W, CHART_H, 6);
  const deployX = chart.deployMarkerAt * CHART_W;

  // Subsample x-axis labels to seven ticks so the axis breathes.
  const xLabels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "12 AM"];

  // Recompute y-axis labels for the chosen metric so the chart isn't
  // showing "0 / 500 / 1K / 1.5K / 2K" while plotting affected users.
  const maxValue = Math.max(...values, 1);
  const niceMax = niceCeiling(maxValue);
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((t) => formatYTick(niceMax * t));

  const activeLabel = ERROR_TRENDS_METRIC_OPTIONS.find((o) => o.value === metric)?.label ?? "Total Errors";

  return (
    <DevSectionCard
      title={
        <span className="inline-flex items-center gap-1.5">
          Error Trends
          <Info className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.8} />
        </span>
      }
      trailing={
        <Link
          href="/dev/analytics"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View full analytics
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <div className="flex items-center justify-end mb-2 relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          onBlur={() => window.setTimeout(() => setMenuOpen(false), 120)}
          className="inline-flex items-center gap-2 h-8 px-2.5 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] transition-colors"
        >
          <span className="text-[11px] text-[var(--dev-text-muted)] uppercase tracking-wider font-semibold">
            Metric
          </span>
          <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium">
            {activeLabel}
          </span>
          <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
        </button>
        {menuOpen && (
          <ul
            role="listbox"
            className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] shadow-xl py-1"
          >
            {ERROR_TRENDS_METRIC_OPTIONS.map((o) => {
              const active = o.value === metric;
              return (
                <li key={o.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      // Use onMouseDown so it fires before onBlur closes the menu.
                      e.preventDefault();
                      setMetric(o.value);
                      setMenuOpen(false);
                    }}
                    className={
                      "w-full text-left px-3 py-1.5 text-[12.5px] transition-colors " +
                      (active
                        ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                        : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]")
                    }
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex">
        <div className="flex flex-col-reverse justify-between pr-3 py-1 text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
          {yLabels.map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative h-[200px]">
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
              className="relative"
              aria-hidden
            >
              <defs>
                <linearGradient id="err-trends-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--dev-danger)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--dev-danger)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#err-trends-grad)" />
              <path
                d={line}
                fill="none"
                stroke="var(--dev-danger)"
                strokeWidth={1.6}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>

            <div
              className="absolute top-0 bottom-0 border-l border-dashed border-[var(--dev-text-faint)] pointer-events-none"
              style={{ left: `${chart.deployMarkerAt * 100}%` }}
            />
            <div
              className="absolute -top-0.5 text-[10.5px] font-medium text-[var(--dev-text-muted)] whitespace-nowrap pointer-events-none"
              style={{ left: `calc(${chart.deployMarkerAt * 100}% - 70px)` }}
            >
              Latest Deploy
            </div>
            <span aria-hidden className="hidden" data-x={deployX} />
          </div>

          <div className="mt-2 flex justify-between text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
            {xLabels.map((l, i) => (
              <span key={`${l}-${i}`}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </DevSectionCard>
  );
}

function niceCeiling(v: number): number {
  if (v <= 10) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const head = Math.ceil(v / pow);
  return head * pow;
}

function formatYTick(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`;
  return String(Math.round(v));
}
