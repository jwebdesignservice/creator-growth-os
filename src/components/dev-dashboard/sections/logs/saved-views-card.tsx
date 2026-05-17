import { ChevronRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { SavedViewRow, SavedViewTone } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const TONE_ICON: Record<SavedViewTone, string> = {
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  success: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  info:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  neutral: "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border-[var(--dev-border)]",
};

export function SavedViewsCard({ views }: { views: SavedViewRow[] }) {
  return (
    <DevSectionCard title="Saved Views / Quick Filters">
      <ul className="-mx-1 -my-1">
        {views.map((v) => {
          const Icon = v.icon;
          return (
            <li key={v.key}>
              <button
                type="button"
                className="group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[10px] hover:bg-[var(--dev-surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] transition-colors text-left"
              >
                <span
                  className={cn(
                    "size-7 rounded-[8px] inline-flex items-center justify-center border shrink-0",
                    TONE_ICON[v.tone],
                  )}
                  aria-hidden
                >
                  <Icon className="size-[15px]" strokeWidth={1.9} />
                </span>
                <span className="flex-1 min-w-0 truncate text-[13px] font-medium text-[var(--dev-text-primary)]">
                  {v.label}
                </span>
                <ChevronRight
                  className="size-3.5 text-[var(--dev-text-muted)] group-hover:text-[var(--dev-text-secondary)] transition-colors"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
