import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { Sparkline } from "./sparkline";
import { MultiDonut } from "./donut";
import { cn } from "@/lib/cn";

type Metric = {
  label: string;
  value: string;
  delta: number;        // percentage; sign drives icon
  series: number[];
};

type PlatformSlice = {
  label: string;
  percent: number;
  color: string;
};

export function PerformanceOverview({
  metrics,
  platformMix,
}: {
  metrics: Metric[];
  platformMix: PlatformSlice[];
}) {
  return (
    <section className="card p-[var(--space-card-padding)]">
      <header className="flex items-center justify-between mb-5">
        <h3 className="font-display text-[20px] text-ink-900">
          Performance Overview
        </h3>
        <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] bg-cream-100 border border-ink-100 text-[12.5px] font-medium text-ink-700 hover:bg-cream-200">
          This Week
          <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,280px)] gap-[var(--space-grid-gap)] items-center">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-[var(--space-grid-gap-sm)]">
          {metrics.map((m) => (
            <MetricTile key={m.label} metric={m} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-5">
          <MultiDonut
            slices={platformMix.map((p) => ({ value: p.percent, color: p.color }))}
            size={140}
            strokeWidth={20}
          >
            <span className="text-[11px] text-ink-500">Total</span>
            <span className="text-[16px] font-semibold text-ink-900">100%</span>
          </MultiDonut>

          <ul className="space-y-2">
            {platformMix.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-[12px]">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="text-ink-700 flex-1">{p.label}</span>
                <span className="text-ink-900 font-semibold tabular-nums">
                  {p.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MetricTile({ metric }: { metric: Metric }) {
  const up = metric.delta >= 0;
  return (
    <div>
      <div className="text-[12px] text-ink-500 mb-1">{metric.label}</div>
      <div className="text-[20px] font-semibold text-ink-900 leading-none">
        {metric.value}
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-0.5 text-[11.5px] font-medium mt-1",
          up ? "text-success" : "text-rose-600",
        )}
      >
        {up ? (
          <ArrowUp className="size-3" strokeWidth={2.5} />
        ) : (
          <ArrowDown className="size-3" strokeWidth={2.5} />
        )}
        {Math.abs(metric.delta)}%
      </div>
      <Sparkline data={metric.series} className="mt-2" />
    </div>
  );
}
