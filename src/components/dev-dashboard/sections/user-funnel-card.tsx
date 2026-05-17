import { ArrowDown } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { USER_FUNNEL } from "@/lib/dev-dashboard/analytics-data";

/* Funnel renders as a stack of horizontal bars that taper from the top.
   Each bar's width is sized by the stage's share of the top-of-funnel count
   so the visual shrink mirrors the real drop-off. The right-hand drop-off
   chevron is shown between adjacent stages. */

export function UserFunnelCard() {
  const top = USER_FUNNEL[0]?.count ?? 1;

  return (
    <DevSectionCard title="User Funnel">
      <ul className="space-y-2">
        {USER_FUNNEL.map((stage, i) => {
          const widthPct = (stage.count / top) * 100;
          return (
            <li key={stage.label}>
              <div className="flex items-center gap-3">
                {/* The tapered bar — width tracks the stage's share */}
                <div
                  className="relative h-10 rounded-[8px] bg-[var(--dev-accent)] flex items-center justify-between px-3 min-w-[120px]"
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-[12.5px] font-medium text-white truncate pr-2">
                    {stage.label}
                  </span>
                  <span className="text-[12.5px] font-semibold text-white tabular-nums shrink-0">
                    {stage.count.toLocaleString()}
                  </span>
                </div>

                {/* Drop-off chevron (only between stages) */}
                {i > 0 && stage.dropOffPercent && (
                  <div className="inline-flex items-center gap-1 text-[12px] text-[var(--dev-text-secondary)] shrink-0 ml-auto">
                    <ArrowDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
                    <span className="tabular-nums">{stage.dropOffPercent}</span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
