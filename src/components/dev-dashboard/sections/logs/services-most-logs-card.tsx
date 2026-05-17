import { DevSectionCard } from "../../dev-section-card";
import type { ServiceLogVolumeRow } from "@/lib/dev-dashboard/types";

export function ServicesMostLogsCard({ services }: { services: ServiceLogVolumeRow[] }) {
  const top = services[0]?.percent ?? 1;

  return (
    <DevSectionCard title="Services Generating Most Logs">
      <ul className="space-y-2.5">
        {services.map((s) => {
          // Scale relative to the top service so the leader fills the bar
          // and the rest read proportionally — better visual rhythm than
          // scaling against 100% when nothing dominates.
          const widthPct = (s.percent / top) * 100;
          return (
            <li key={s.key} className="flex items-center gap-3 text-[12.5px]">
              <span className="flex-1 min-w-0 truncate text-[var(--dev-text-secondary)] font-mono text-[12px]">
                {s.label}
              </span>
              <div
                className="w-[42%] h-2 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden shrink-0"
                role="progressbar"
                aria-valuenow={s.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${s.label}: ${s.countLabel}`}
              >
                <div
                  className="h-full rounded-full bg-[var(--dev-accent)]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="text-[var(--dev-text-primary)] font-medium tabular-nums w-[78px] text-right text-[11.5px]">
                {s.countLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
