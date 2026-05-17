import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { NEEDS_ATTENTION } from "@/lib/dev-dashboard/mock-data";

export function NeedsAttentionCard() {
  return (
    <DevSectionCard
      title="Needs Attention"
      trailing={
        <Link
          href="/dev/database"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View integrity issues
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {NEEDS_ATTENTION.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2.5 text-[12.5px] text-[var(--dev-text-secondary)]"
          >
            <TriangleAlert
              className="size-4 text-[var(--dev-warning-text)] shrink-0 mt-0.5"
              strokeWidth={1.9}
            />
            <span className="leading-snug">{item.message}</span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
