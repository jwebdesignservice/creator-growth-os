import { DevSectionCard } from "../dev-section-card";
import { DevDonut } from "../dev-donut";
import { TRAFFIC_SOURCES } from "@/lib/dev-dashboard/analytics-data";

export function TrafficSourcesCard() {
  return (
    <DevSectionCard title="Traffic Sources">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 items-center">
        <DevDonut
          slices={TRAFFIC_SOURCES.map((s) => ({ value: s.percent, color: s.color }))}
          size={140}
          strokeWidth={18}
        />

        <ul className="space-y-2 min-w-0">
          {TRAFFIC_SOURCES.map((s) => (
            <li key={s.label} className="flex items-center gap-2.5 text-[12.5px]">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="text-[var(--dev-text-secondary)] flex-1 min-w-0 truncate">
                {s.label}
              </span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {s.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DevSectionCard>
  );
}
