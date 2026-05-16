import { DevSparkline } from "../dev-sparkline";
import { METRIC_CARDS } from "@/lib/dev-dashboard/mock-data";
import { formatDelta } from "@/lib/dev-dashboard/dev-utils";
import type { MetricCard, MetricTone } from "@/lib/dev-dashboard/types";

const TONE_COLOR: Record<MetricTone, string> = {
  blue:   "var(--dev-chart-blue)",
  green:  "var(--dev-chart-green)",
  red:    "var(--dev-chart-red)",
  amber:  "var(--dev-chart-amber)",
  purple: "var(--dev-chart-purple)",
  cyan:   "var(--dev-chart-cyan)",
};

export function MetricCards() {
  return (
    <section
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))" }}
    >
      {METRIC_CARDS.map((m) => (
        <Tile key={m.key} metric={m} />
      ))}
    </section>
  );
}

function Tile({ metric }: { metric: MetricCard }) {
  const color = TONE_COLOR[metric.tone];
  const isErrorRate = metric.key === "error-rate";
  // For error rate + response time, lower is better, so a negative delta is good.
  const lowerIsBetter = isErrorRate || metric.key === "avg-response";
  const isPositive = lowerIsBetter ? metric.delta < 0 : metric.delta >= 0;
  const deltaColor = isPositive ? "text-[var(--dev-success-text)]" : "text-[var(--dev-danger-text)]";

  // Response time shows a value-with-unit split (182 ms) like the image.
  const showMsUnit = metric.key === "avg-response";

  return (
    <div className="dev-card p-4 flex flex-col gap-3 min-h-[150px]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)] font-medium">
          {metric.label}
        </span>
        <span className={"text-[11.5px] font-semibold tabular-nums " + deltaColor}>
          {formatDelta(metric.delta, metric.deltaUnit ?? "")}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-[28px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {metric.value}
          {showMsUnit && <span className="ml-0.5 text-[14px] text-[var(--dev-text-secondary)] font-medium">ms</span>}
        </div>
        <div className="text-[11px] text-[var(--dev-text-muted)] text-right leading-tight">
          {metric.deltaBaseline}
        </div>
      </div>
      <div className="-mx-1">
        <DevSparkline
          data={metric.series}
          color={color}
          gradientId={`spark-${metric.key}`}
          height={48}
        />
      </div>
    </div>
  );
}
