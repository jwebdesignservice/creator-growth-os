import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { RETENTION_ENGAGEMENT } from "@/lib/dev-dashboard/mock-data";

export function RetentionEngagementCard() {
  return (
    <DevSectionCard
      title="Retention & Engagement"
      trailing={
        <Link
          href="/dev/analytics"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View retention report
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {RETENTION_ENGAGEMENT.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.key} className="flex items-center gap-2.5 text-[12.5px]">
              <Icon
                className="size-3.5 text-[var(--dev-text-muted)] shrink-0"
                strokeWidth={1.8}
              />
              <span className="flex-1 min-w-0 truncate text-[var(--dev-text-secondary)]">
                {r.label}
              </span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {r.value}
              </span>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
