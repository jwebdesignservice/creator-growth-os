import { ArrowDown } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { ONBOARDING_FUNNEL } from "@/lib/dev-dashboard/mock-data";

export function OnboardingFunnelCard() {
  const stages = ONBOARDING_FUNNEL;
  const top = stages[0]?.count ?? 0;

  return (
    <DevSectionCard title="Onboarding Funnel">
      <ul className="space-y-1.5">
        {stages.map((stage) => {
          // Width relative to the top of the funnel — gives the visual taper.
          const pct = top > 0 ? Math.max(0.32, stage.count / top) : 1;
          const widthPercent = pct * 100;
          return (
            <li key={stage.key} className="flex items-center gap-3 text-[12.5px]">
              <div className="flex-1 flex justify-center">
                <div
                  className="relative h-9 inline-flex items-center justify-center rounded-[6px] bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] text-[var(--dev-accent-text)] text-[12.5px] font-medium"
                  style={{ width: `${widthPercent}%`, minWidth: "32%" }}
                  aria-label={`${stage.label}: ${stage.count} users${stage.dropOffPercent != null ? `, ${stage.dropOffPercent}% drop-off` : ""}`}
                >
                  {stage.label}
                </div>
              </div>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums w-12 text-right">
                {stage.count.toLocaleString()}
              </span>
              <span
                className="inline-flex items-center justify-end gap-0.5 tabular-nums w-14 text-right"
                aria-hidden={stage.dropOffPercent == null}
              >
                {stage.dropOffPercent != null ? (
                  <>
                    <ArrowDown className="size-3 text-[var(--dev-danger-text)]" strokeWidth={2.5} />
                    <span className="text-[var(--dev-danger-text)] font-medium">
                      {stage.dropOffPercent.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-[var(--dev-text-faint)]">—</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
