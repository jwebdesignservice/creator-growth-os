import { DevSectionCard } from "../../dev-section-card";
import { FAILED_LOGIN_REASONS } from "@/lib/dev-dashboard/mock-data";
import type { FailedLoginReason } from "@/lib/dev-dashboard/types";

export function FailedLoginReasonsCard({ data }: { data?: FailedLoginReason[] }) {
  const reasons = data ?? FAILED_LOGIN_REASONS;
  const top = reasons[0]?.percent ?? 1;

  return (
    <DevSectionCard title="Failed Login Reasons">
      <ul className="space-y-2.5">
        {reasons.map((r) => {
          // Scale bar width relative to the largest reason so the visual rhythm
          // matches the magnitude rather than the percent of 100.
          const widthPct = (r.percent / top) * 100;
          return (
            <li key={r.key} className="flex items-center gap-3 text-[12.5px]">
              <span className="flex-1 min-w-0 truncate text-[var(--dev-text-secondary)]">
                {r.label}
              </span>
              <div
                className="w-[42%] h-2 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden shrink-0"
                role="progressbar"
                aria-valuenow={r.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${r.label}: ${r.percent}%`}
              >
                <div
                  className="h-full rounded-full bg-[var(--dev-warning)]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums w-10 text-right">
                {r.percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
