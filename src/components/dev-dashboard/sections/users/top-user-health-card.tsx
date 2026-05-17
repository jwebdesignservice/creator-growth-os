import { DevSectionCard } from "../../dev-section-card";
import { TOP_USER_HEALTH } from "@/lib/dev-dashboard/mock-data";
import type { UserHealthTone } from "@/lib/dev-dashboard/types";

const DOT_COLOR: Record<UserHealthTone, string> = {
  success: "var(--dev-success-text)",
  warning: "var(--dev-warning-text)",
  danger:  "var(--dev-danger-text)",
};

export function TopUserHealthCard() {
  return (
    <DevSectionCard title="Top User Health">
      <ul className="space-y-2.5">
        {TOP_USER_HEALTH.map((r) => (
          <li key={r.key} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ background: DOT_COLOR[r.tone] }}
              aria-hidden
            />
            <span className="flex-1 min-w-0 truncate text-[var(--dev-text-secondary)]">
              {r.label}
            </span>
            <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">
              {r.percent}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
