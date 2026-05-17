import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { TOP_USER_SEGMENTS } from "@/lib/dev-dashboard/mock-data";

export function TopUserSegmentsCard() {
  return (
    <DevSectionCard
      title="Top User Segments"
      trailing={
        <Link
          href="/dev/users"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View all segments
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {TOP_USER_SEGMENTS.map((s) => (
          <li
            key={s.rank}
            className="flex items-center gap-3 text-[12.5px] py-1.5"
          >
            <span className="text-[var(--dev-text-muted)] tabular-nums w-4 shrink-0">
              {s.rank}
            </span>
            <span className="flex-1 min-w-0 truncate text-[var(--dev-text-secondary)]">
              {s.label}
            </span>
            <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
              {s.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
