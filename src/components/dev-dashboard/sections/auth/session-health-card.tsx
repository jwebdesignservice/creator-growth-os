import { DevSectionCard } from "../../dev-section-card";
import { SESSION_HEALTH } from "@/lib/dev-dashboard/mock-data";
import type { SessionHealthRow } from "@/lib/dev-dashboard/types";

export function SessionHealthCard({ data }: { data?: SessionHealthRow[] }) {
  const rows = data ?? SESSION_HEALTH;
  return (
    <DevSectionCard title="Session Health">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-3 text-[12.5px]">
            <span className="text-[var(--dev-text-secondary)] w-[72px] shrink-0">
              {row.label}
            </span>
            <div
              className="flex-1 h-2 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden"
              role="progressbar"
              aria-valuenow={row.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.label}: ${row.percent}%`}
            >
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
