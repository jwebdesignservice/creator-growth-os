import { DevDonut } from "../../dev-donut";
import { QA_METRIC_CARDS } from "@/lib/dev-dashboard/mock-data";
import type { QaMetricCard, QaMetricTone } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const ICON_TILE: Record<QaMetricTone, string> = {
  blue:  "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  green: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  amber: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  red:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
};

const NOTE_TONE: Record<QaMetricCard["noteTone"], string> = {
  success: "text-[var(--dev-success-text)]",
  warning: "text-[var(--dev-warning-text)]",
  danger:  "text-[var(--dev-danger-text)]",
  neutral: "text-[var(--dev-text-muted)]",
};

export function QaMetricCards({ data }: { data?: QaMetricCard[] }) {
  const cards = data ?? QA_METRIC_CARDS;
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

function Tile({ metric }: { metric: QaMetricCard }) {
  const Icon = metric.icon;
  const isDonut = typeof metric.donutPercent === "number";

  return (
    <div className="dev-card p-4 flex items-center gap-4 min-h-[112px]">
      {/* Glyph — donut for the readiness card, otherwise a colored icon tile */}
      {isDonut ? (
        <DevDonut
          slices={[
            { value: metric.donutPercent!, color: "var(--dev-accent)" },
            { value: 100 - metric.donutPercent!, color: "var(--dev-surface-elev)" },
          ]}
          size={64}
          strokeWidth={8}
          trackColor="var(--dev-surface-elev)"
        >
          <span className="text-[12px] font-semibold text-[var(--dev-text-primary)] tabular-nums">
            {metric.donutPercent}%
          </span>
        </DevDonut>
      ) : (
        <div
          className={cn(
            "size-12 rounded-full inline-flex items-center justify-center border shrink-0",
            ICON_TILE[metric.tone],
          )}
        >
          <Icon className="size-[22px]" strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-[var(--dev-text-muted)] font-medium mb-1 truncate">
          {metric.label}
        </div>
        <div className="text-[28px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {metric.value}
        </div>
        <div className={cn("mt-1.5 text-[11.5px] font-medium leading-none tabular-nums", NOTE_TONE[metric.noteTone])}>
          {metric.note}
        </div>
      </div>
    </div>
  );
}
