import { ArrowUp, ArrowDown } from "lucide-react";
import { DevSparkline } from "../../dev-sparkline";
import { SUPPORT_METRIC_CARDS } from "@/lib/dev-dashboard/mock-data";
import type { SupportMetricCard, SupportMetricTone } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const TONE_COLOR: Record<SupportMetricTone, string> = {
  blue:   "var(--dev-chart-blue)",
  red:    "var(--dev-danger)",
  green:  "var(--dev-success)",
  amber:  "var(--dev-warning)",
  violet: "var(--dev-chart-violet)",
};

const ICON_TILE: Record<SupportMetricTone, string> = {
  blue:   "bg-[var(--dev-accent-soft)]    text-[var(--dev-accent-text)]    border-[var(--dev-accent-border)]",
  red:    "bg-[var(--dev-danger-soft)]    text-[var(--dev-danger-text)]    border-[var(--dev-danger-border)]",
  green:  "bg-[var(--dev-success-soft)]   text-[var(--dev-success-text)]   border-[var(--dev-success-border)]",
  amber:  "bg-[var(--dev-warning-soft)]   text-[var(--dev-warning-text)]   border-[var(--dev-warning-border)]",
  violet: "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)]  border-[var(--dev-chart-violet)]/30",
};

export function SupportMetricCards({ data }: { data?: SupportMetricCard[] }) {
  const cards = data ?? SUPPORT_METRIC_CARDS;
  // Explicit responsive ladder: 2-up mobile, 3-up tablet, 6-up desktop.
  // Auto-fit used to land 6 cards as "5 + 1 hanging" between 1280–1440px;
  // pinning to grid-cols-6 at xl guarantees a single clean row of six.
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((m) => (
        <Tile key={m.key} metric={m} />
      ))}
    </section>
  );
}

function Tile({ metric }: { metric: SupportMetricCard }) {
  const Icon = metric.icon;
  const color = TONE_COLOR[metric.tone];
  const deltaUp = metric.deltaDirection === "up";
  const deltaPositive = metric.deltaIsGood;
  const deltaColor = deltaPositive
    ? "text-[var(--dev-success-text)]"
    : "text-[var(--dev-danger-text)]";
  const DeltaIcon = deltaUp ? ArrowUp : ArrowDown;

  return (
    <div className="dev-card p-4 flex flex-col gap-2.5 min-h-[156px]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] text-[var(--dev-text-muted)] font-medium leading-tight">
          {metric.label}
        </span>
        <div
          className={cn(
            "size-8 rounded-[8px] inline-flex items-center justify-center border shrink-0",
            ICON_TILE[metric.tone],
          )}
        >
          <Icon className="size-[16px]" strokeWidth={1.9} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-[26px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {metric.value}
        </div>
        <div className="flex flex-col items-end text-right shrink-0">
          <span className={cn("inline-flex items-center gap-0.5 text-[11.5px] font-semibold tabular-nums leading-none", deltaColor)}>
            <DeltaIcon className="size-3" strokeWidth={2.5} />
            {metric.delta}
          </span>
          <span className="mt-1 text-[10.5px] text-[var(--dev-text-muted)] leading-none">
            {metric.baseline}
          </span>
        </div>
      </div>

      <div className="-mx-1 mt-auto">
        <DevSparkline
          data={metric.series}
          color={color}
          gradientId={`support-spark-${metric.key}`}
          height={48}
        />
      </div>
    </div>
  );
}
