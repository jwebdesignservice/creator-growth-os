import { DevSectionCard } from "../../dev-section-card";
import { QA_RECENT_ACTIVITY } from "@/lib/dev-dashboard/mock-data";
import type { QaActivityKind, QaActivityRow } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

/**
 * Tone applied to the avatar — derived from the activity kind so a
 * reviewer can scan the column by color (passed = green, blocker = red,
 * review = amber, run = blue).
 */
const AVATAR_TONE: Record<QaActivityKind, string> = {
  "passed":         "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  "review":         "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  "run-created":    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  "blocker-added":  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
};

export function RecentActivityCard({ data }: { data?: QaActivityRow[] }) {
  const rows = data ?? QA_RECENT_ACTIVITY;
  return (
    <DevSectionCard title="Recent Activity / Sign-offs">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-2.5">
            <div
              className={cn(
                "size-7 rounded-full inline-flex items-center justify-center border text-[10.5px] font-semibold shrink-0",
                AVATAR_TONE[row.kind],
              )}
              aria-hidden
            >
              {row.actorInitials}
            </div>
            <div className="flex-1 min-w-0 text-[12.5px] leading-snug">
              <span className="text-[var(--dev-text-primary)] font-semibold">
                {row.actorName}
              </span>{" "}
              <span className="text-[var(--dev-text-secondary)]">{row.message}</span>
            </div>
            <span className="text-[11.5px] text-[var(--dev-text-muted)] tabular-nums shrink-0 mt-0.5">
              {row.timeLabel}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
