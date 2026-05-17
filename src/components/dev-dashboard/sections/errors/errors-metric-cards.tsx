import { ArrowUp, ArrowDown } from "lucide-react";
import { DevSparkline } from "../../dev-sparkline";
import { ERRORS_METRIC_CARDS } from "@/lib/dev-dashboard/mock-data";
import type { ErrorsMetricCard, ErrorMetricTone } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const TONE_COLOR: Record<ErrorMetricTone, string> = {
  red:    "var(--dev-danger)",
  orange: "var(--dev-warning)",
  green:  "var(--dev-success)",
  blue:   "var(--dev-chart-blue)",
  amber:  "var(--dev-warning)",
};

const ICON_TILE: Record<ErrorMetricTone, string> = {
  red:    "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  orange: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  green:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  blue:   "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  amber:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
};

const BADGE_TONE: Record<NonNullable<ErrorsMetricCard["badge"]>["tone"], string> = {
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  info:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  neutral: "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border-[var(--dev-border)]",
};

export function ErrorsMetricCards({ data }: { data?: ErrorsMetricCard[] }) {
  const cards = data ?? ERRORS_METRIC_CARDS;
  return (
    <section
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))" }}
    >
      {cards.map((m) => (
        <Tile key={m.key} metric={m} />
      ))}
    </section>
  );
}

function Tile({ metric }: { metric: ErrorsMetricCard }) {
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
            "size-7 rounded-[8px] inline-flex items-center justify-center border shrink-0",
            ICON_TILE[metric.tone],
          )}
        >
          <Icon className="size-[15px]" strokeWidth={1.9} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-[26px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {metric.value}
        </div>
        <div className="flex flex-col items-end text-right shrink-0">
          {metric.badge ? (
            <span
              className={cn(
                "inline-flex items-center px-1.5 h-[20px] rounded-md text-[10.5px] font-semibold border whitespace-nowrap",
                BADGE_TONE[metric.badge.tone],
              )}
            >
              {metric.badge.label}
            </span>
          ) : (
            <span className={cn("inline-flex items-center gap-0.5 text-[11.5px] font-semibold tabular-nums leading-none", deltaColor)}>
              <DeltaIcon className="size-3" strokeWidth={2.5} />
              {metric.delta}
            </span>
          )}
          {metric.badge ? (
            <span className={cn("mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums leading-none", deltaColor)}>
              <DeltaIcon className="size-3" strokeWidth={2.5} />
              {metric.delta} {metric.baseline}
            </span>
          ) : (
            <span className="mt-1 text-[10.5px] text-[var(--dev-text-muted)] leading-none">
              {metric.baseline}
            </span>
          )}
        </div>
      </div>

      <div className="-mx-1 mt-auto">
        <DevSparkline
          data={metric.series}
          color={color}
          gradientId={`err-spark-${metric.key}`}
          height={48}
        />
      </div>
    </div>
  );
}
