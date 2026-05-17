import { DevSectionCard } from "../dev-section-card";
import { FEATURE_USAGE } from "@/lib/dev-dashboard/analytics-data";

export function FeatureUsageCard() {
  return (
    <DevSectionCard title="Feature Usage">
      <ul className="space-y-3">
        {FEATURE_USAGE.map((f) => (
          <li key={f.label}>
            <div className="flex items-center justify-between text-[12.5px] mb-1.5">
              <span className="text-[var(--dev-text-secondary)]">{f.label}</span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {f.percent}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--dev-accent)]"
                style={{ width: `${f.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
