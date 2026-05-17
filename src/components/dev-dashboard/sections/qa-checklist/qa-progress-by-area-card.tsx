import { DevSectionCard } from "../../dev-section-card";
import { QA_PROGRESS_BY_AREA } from "@/lib/dev-dashboard/mock-data";
import type { QaProgressByAreaRow } from "@/lib/dev-dashboard/types";

export function QaProgressByAreaCard({ data }: { data?: QaProgressByAreaRow[] }) {
  const rows = data ?? QA_PROGRESS_BY_AREA;
  return (
    <DevSectionCard title="QA Progress by Area">
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-3 text-[12.5px]">
            <span className="text-[var(--dev-text-secondary)] truncate">{r.label}</span>
            <div
              className="h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden"
              role="progressbar"
              aria-valuenow={r.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${r.label} progress`}
            >
              <div
                className="h-full rounded-full bg-[var(--dev-accent)]"
                style={{ width: `${r.percent}%` }}
              />
            </div>
            <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums w-10 text-right">
              {r.percent}%
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
