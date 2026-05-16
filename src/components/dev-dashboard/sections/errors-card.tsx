import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DevDonut } from "../dev-donut";
import { ERROR_BREAKDOWN } from "@/lib/dev-dashboard/mock-data";

export function ErrorsCard() {
  const { total, slices } = ERROR_BREAKDOWN;
  return (
    <DevSectionCard title="Errors (24h)">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 items-center">
        <DevDonut
          slices={slices.map((s) => ({ value: s.value, color: s.color }))}
          size={148}
          strokeWidth={18}
        >
          <span className="text-[22px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
            {total}
          </span>
          <span className="text-[11px] text-[var(--dev-text-muted)] mt-1">Total Errors</span>
        </DevDonut>

        <ul className="space-y-2 min-w-0">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2.5 text-[12.5px]">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-[var(--dev-text-secondary)] flex-1 min-w-0 truncate">{s.label}</span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {s.value}
              </span>
              <span className="text-[var(--dev-text-muted)] tabular-nums w-[44px] text-right">
                ({s.percent}%)
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/dev/errors"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View all errors
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
