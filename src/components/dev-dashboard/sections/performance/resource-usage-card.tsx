import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { ResourceUsageRow } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const BAR_TONE: Record<ResourceUsageRow["tone"], string> = {
  blue:  "bg-[var(--dev-accent)]",
  amber: "bg-[var(--dev-warning)]",
  red:   "bg-[var(--dev-danger)]",
};

export function ResourceUsageCard({ rows }: { rows: ResourceUsageRow[] }) {
  return (
    <DevSectionCard title="Resource Usage">
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.key}>
            <div className="flex items-center justify-between text-[12.5px] mb-1.5">
              <span className="text-[var(--dev-text-secondary)]">{r.label}</span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {r.percent}%
              </span>
            </div>
            <div
              className="h-2 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden"
              role="progressbar"
              aria-valuenow={r.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${r.label}: ${r.percent}%`}
            >
              <div
                className={cn("h-full rounded-full", BAR_TONE[r.tone])}
                style={{ width: `${r.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)]">
        <Link
          href="/dev/performance"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View infrastructure
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    </DevSectionCard>
  );
}
