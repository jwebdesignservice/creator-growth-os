import { DevSectionCard } from "../../dev-section-card";
import { DevDonut } from "../../dev-donut";
import { PLAN_DISTRIBUTION } from "@/lib/dev-dashboard/mock-data";

export function PlanDistributionCard() {
  const { slices } = PLAN_DISTRIBUTION;
  return (
    <DevSectionCard title="Plan Distribution">
      <div className="flex items-center gap-5">
        <DevDonut
          slices={slices.map((s) => ({ value: s.value, color: s.color }))}
          size={132}
          strokeWidth={16}
        />

        <ul className="space-y-2.5 flex-1 min-w-0">
          {slices.map((s) => (
            <li key={s.key} className="flex items-start gap-2.5">
              <span
                className="mt-1.5 size-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <div className="min-w-0">
                <div className="text-[12.5px] text-[var(--dev-text-secondary)]">{s.label}</div>
                <div className="text-[12.5px] text-[var(--dev-text-primary)] tabular-nums">
                  {s.value.toLocaleString()}{" "}
                  <span className="text-[var(--dev-text-muted)]">({s.percent}%)</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DevSectionCard>
  );
}
