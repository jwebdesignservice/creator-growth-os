import { Monitor, Smartphone, Tablet } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DEVICE_BREAKDOWN } from "@/lib/dev-dashboard/analytics-data";
import type { DeviceRow } from "@/lib/dev-dashboard/analytics-data";

const DEVICE_ICON = {
  Desktop: Monitor,
  Mobile:  Smartphone,
  Tablet:  Tablet,
} as const;

export function DeviceBreakdownCard() {
  return (
    <DevSectionCard title="Device Breakdown">
      <ul className="space-y-3.5">
        {DEVICE_BREAKDOWN.map((row) => (
          <DeviceRowItem key={row.device} row={row} />
        ))}
      </ul>
    </DevSectionCard>
  );
}

function DeviceRowItem({ row }: { row: DeviceRow }) {
  const Icon = DEVICE_ICON[row.device];
  const isUp = row.delta.startsWith("+");
  const deltaColor = isUp
    ? "text-[var(--dev-success-text)]"
    : "text-[var(--dev-danger-text)]";

  return (
    <li className="flex items-center gap-3">
      <Icon
        className="size-[18px] text-[var(--dev-text-secondary)] shrink-0"
        strokeWidth={1.8}
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[12.5px] mb-1.5">
          <span className="text-[var(--dev-text-primary)] font-medium">{row.device}</span>
          <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
            {row.percent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--dev-accent)]"
            style={{ width: `${row.percent}%` }}
          />
        </div>
      </div>
      <span className={"text-[11.5px] font-semibold tabular-nums shrink-0 " + deltaColor}>
        {row.delta}
      </span>
    </li>
  );
}
