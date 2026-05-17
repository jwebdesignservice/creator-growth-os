import { DevSectionCard } from "../../dev-section-card";
import { DevDonut } from "../../dev-donut";
import { AUTH_PROVIDER_BREAKDOWN } from "@/lib/dev-dashboard/mock-data";
import type { AuthProviderBreakdown } from "@/lib/dev-dashboard/types";

export function ProviderBreakdownCard({ data }: { data?: AuthProviderBreakdown }) {
  const { slices } = data ?? AUTH_PROVIDER_BREAKDOWN;
  return (
    <DevSectionCard title="Provider Breakdown">
      <div className="flex items-center gap-5">
        <DevDonut
          slices={slices.map((s) => ({ value: s.percent, color: s.color }))}
          size={132}
          strokeWidth={16}
        />

        <ul className="space-y-2.5 flex-1 min-w-0">
          {slices.map((s) => (
            <li key={s.key} className="flex items-start gap-2.5">
              <span
                className="mt-1.5 size-2 rounded-full shrink-0"
                style={{ background: s.color }}
                aria-hidden
              />
              <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                <span className="text-[12.5px] text-[var(--dev-text-secondary)] truncate">
                  {s.label}
                </span>
                <span className="text-[12.5px] text-[var(--dev-text-primary)] font-semibold tabular-nums">
                  {s.percent}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DevSectionCard>
  );
}
