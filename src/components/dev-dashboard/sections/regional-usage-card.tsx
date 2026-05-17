import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { REGIONAL_USAGE } from "@/lib/dev-dashboard/analytics-data";

export function RegionalUsageCard() {
  return (
    <DevSectionCard title="Regional Usage">
      <ul className="space-y-3">
        {REGIONAL_USAGE.map((r) => (
          <li key={r.region} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-[12.5px]">
            <span className="text-[var(--dev-text-secondary)] truncate">{r.region}</span>
            <div className="inline-flex items-center gap-2">
              <div className="hidden sm:block w-[80px] h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--dev-accent)]"
                  style={{ width: `${r.percent}%` }}
                />
              </div>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums w-[34px] text-right">
                {r.percent}%
              </span>
            </div>
            <span className="text-[var(--dev-text-muted)] tabular-nums w-[54px] text-right">
              {r.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/dev/analytics"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View all regions
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
