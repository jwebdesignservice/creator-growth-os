import { ArrowUp, ArrowDown } from "lucide-react";
import { DevSparkline } from "../../dev-sparkline";
import { USERS_METRIC_CARDS } from "@/lib/dev-dashboard/mock-data";
import type { UsersMetricCard, UsersMetricTone } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const SERIES_COLOR: Record<UsersMetricTone, string> = {
  blue:  "var(--dev-chart-blue)",
  green: "var(--dev-chart-green)",
  amber: "var(--dev-chart-amber)",
};

export function UsersMetricCards() {
  return (
    <section
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))" }}
    >
      {USERS_METRIC_CARDS.map((m) => (
        <Tile key={m.key} metric={m} />
      ))}
    </section>
  );
}

function Tile({ metric }: { metric: UsersMetricCard }) {
  const color = SERIES_COLOR[metric.tone];
  const deltaUp = metric.deltaDirection === "up";
  const deltaPositive = metric.deltaIsGood;
  const deltaColor = deltaPositive
    ? "text-[var(--dev-success-text)]"
    : "text-[var(--dev-danger-text)]";
  const DeltaIcon = deltaUp ? ArrowUp : ArrowDown;

  return (
    <div className="dev-card p-4 flex flex-col gap-2.5 min-h-[148px]">
      <div className="text-[12px] text-[var(--dev-text-muted)] font-medium leading-tight">
        {metric.label}
      </div>

      <div className="text-[28px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
        {metric.value}
      </div>

      <div className={cn("inline-flex items-center gap-1 text-[11.5px] font-medium leading-none tabular-nums", deltaColor)}>
        <DeltaIcon className="size-3" strokeWidth={2.5} />
        <span className="font-semibold">{metric.delta}</span>
        <span className="text-[var(--dev-text-muted)] font-medium">{metric.baseline}</span>
      </div>

      <div className="-mx-1 mt-auto">
        <DevSparkline
          data={metric.series}
          color={color}
          gradientId={`users-spark-${metric.key}`}
          height={40}
        />
      </div>
    </div>
  );
}
