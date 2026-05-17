import { DevSectionCard } from "../../dev-section-card";
import { USER_STATUS_BREAKDOWN } from "@/lib/dev-dashboard/mock-data";

export function UserStatusBreakdownCard() {
  return (
    <DevSectionCard title="User Status Breakdown">
      <ul className="space-y-3">
        {USER_STATUS_BREAKDOWN.map((row) => (
          <li key={row.key} className="flex items-center gap-3 text-[12.5px]">
            <span className="text-[var(--dev-text-secondary)] w-[72px] shrink-0">
              {row.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${row.percent}%`, background: row.color }}
              />
            </div>
            <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums w-10 text-right">
              {row.percent}%
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
