import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { REGIONAL_SIGNIN_ACTIVITY } from "@/lib/dev-dashboard/mock-data";
import type { RegionalSignInRow } from "@/lib/dev-dashboard/types";

export function RegionalSignInCard({ data }: { data?: RegionalSignInRow[] }) {
  const rows = data ?? REGIONAL_SIGNIN_ACTIVITY;
  return (
    <DevSectionCard
      title="Regional Sign-In Activity"
      trailing={
        <Link
          href="/dev/users"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View all regions
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.rank} className="flex items-center gap-3 text-[12.5px]">
            <span className="text-[var(--dev-text-muted)] tabular-nums w-4 shrink-0">
              {r.rank}
            </span>
            <span className="flex-1 min-w-0 truncate text-[var(--dev-text-secondary)]">
              {r.label}
            </span>
            <span className="text-[var(--dev-text-primary)] tabular-nums w-12 text-right">
              {r.percent}%
            </span>
            <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums w-16 text-right">
              {r.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
