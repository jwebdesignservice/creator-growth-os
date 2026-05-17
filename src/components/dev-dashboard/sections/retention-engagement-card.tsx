import Link from "next/link";
import { ArrowRight, Clock, CalendarDays, CalendarRange, Repeat, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { RETENTION_STATS } from "@/lib/dev-dashboard/analytics-data";

/* Icons line up with the row order in RETENTION_STATS — keeping this map
   local so the data file stays icon-agnostic and JSON-serializable. */
const ROW_ICON: LucideIcon[] = [
  Clock,         // 1-day retention
  CalendarDays,  // 7-day retention
  CalendarRange, // 30-day retention
  Repeat,        // Avg. sessions per user
  Users,         // Returning users
];

export function RetentionEngagementCard() {
  return (
    <DevSectionCard title="Retention & Engagement">
      <ul className="space-y-3">
        {RETENTION_STATS.map((s, i) => {
          const Icon = ROW_ICON[i] ?? Clock;
          return (
            <li key={s.label} className="flex items-center gap-3 text-[12.5px]">
              <Icon
                className="size-4 text-[var(--dev-text-muted)] shrink-0"
                strokeWidth={1.8}
                aria-hidden
              />
              <span className="text-[var(--dev-text-secondary)] flex-1 min-w-0 truncate">
                {s.label}
              </span>
              <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
                {s.value}
              </span>
            </li>
          );
        })}
      </ul>

      <Link
        href="/dev/analytics"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View full retention
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
