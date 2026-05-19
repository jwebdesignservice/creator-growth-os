import { ArrowUp, ArrowDown } from "lucide-react";
import { DevSparkline } from "../../dev-sparkline";
import { DATABASE_METRIC_CARDS } from "@/lib/dev-dashboard/mock-data";
import type { DatabaseMetricCard, DatabaseMetricTone } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const TONE_COLOR: Record<DatabaseMetricTone, string> = {
  blue:   "var(--dev-chart-blue)",
  green:  "var(--dev-chart-green)",
  amber:  "var(--dev-warning)",
  orange: "var(--dev-chart-amber)",
  red:    "var(--dev-danger)",
};

const ICON_TILE: Record<DatabaseMetricTone, string> = {
  blue:   "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  green:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  amber:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  orange: "bg-[var(--dev-chart-amber)]/15 text-[var(--dev-chart-amber)] border-[var(--dev-chart-amber)]/30",
  red:    "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
};

const STATUS_PILL: Record<DatabaseMetricTone, string> = {
  blue:   "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  green:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  amber:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  orange: "bg-[var(--dev-chart-amber)]/15 text-[var(--dev-chart-amber)] border border-[var(--dev-chart-amber)]/30",
  red:    "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

export function DatabaseMetricCards({ data }: { data?: DatabaseMetricCard[] }) {
  const cards = data ?? DATABASE_METRIC_CARDS;
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

function Tile({ metric }: { metric: DatabaseMetricCard }) {
  const Icon = metric.icon;
  const color = TONE_COLOR[metric.tone];
  const hasDelta = typeof metric.delta === "string" && metric.delta.length > 0;
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
          aria-hidden
        >
          <Icon className="size-[15px]" strokeWidth={1.9} />
        </div>
      </div>

      <div className="text-[26px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
        {metric.value}
      </div>

      {/* Either a status pill + note (e.g. "Database Status") or a delta row. */}
      {metric.statusLabel ? (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-semibold w-fit",
              STATUS_PILL[metric.tone],
            )}
          >
            <span
              className="size-1.5 rounded-full bg-current opacity-80 mr-1.5"
              aria-hidden
            />
            {metric.statusLabel}
          </span>
          {metric.note && (
            <span className="text-[11px] text-[var(--dev-text-muted)] leading-snug">
              {metric.note}
            </span>
          )}
        </div>
      ) : hasDelta ? (
        <div className={cn("inline-flex items-center gap-1 text-[11.5px] font-medium leading-none tabular-nums", deltaColor)}>
          <DeltaIcon className="size-3" strokeWidth={2.5} />
          <span className="font-semibold">{metric.delta}</span>
          <span className="text-[var(--dev-text-muted)] font-medium">{metric.baseline}</span>
        </div>
      ) : null}

      <div className="-mx-1 mt-auto">
        <DevSparkline
          data={metric.series}
          color={color}
          gradientId={`db-spark-${metric.key}`}
          height={42}
        />
      </div>
    </div>
  );
}
