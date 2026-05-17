import { DevSectionCard } from "../../dev-section-card";
import { DevDonut } from "../../dev-donut";
import { SEVERITY_BREAKDOWN } from "@/lib/dev-dashboard/mock-data";
import type { SeverityBreakdown } from "@/lib/dev-dashboard/types";

export function SeverityBreakdownCard({ data }: { data?: SeverityBreakdown }) {
  const breakdown = data ?? SEVERITY_BREAKDOWN;
  const { total, slices } = breakdown;
  return (
    <DevSectionCard title="Severity Breakdown">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 items-center">
        <DevDonut
          slices={slices.map((s) => ({ value: s.value, color: s.color }))}
          size={148}
          strokeWidth={18}
        >
          <span className="text-[22px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--dev-text-muted)] mt-1">Total Errors</span>
        </DevDonut>

        <ul className="space-y-2 min-w-0">
          {slices.map((s) => (
            <li key={s.severity} className="flex items-center gap-2.5 text-[12.5px]">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-[var(--dev-text-secondary)] flex-1 min-w-0 truncate">
                {s.label}
              </span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {s.value}
              </span>
              <span className="text-[var(--dev-text-muted)] tabular-nums w-[50px] text-right">
                ({s.percent}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DevSectionCard>
  );
}
