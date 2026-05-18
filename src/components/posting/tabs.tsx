import { cn } from "@/lib/cn";

const TABS = [
  { key: "my_plans", label: "My Plans", ready: true },
  { key: "calendar", label: "Content Calendar", ready: false },
  { key: "templates", label: "Templates", ready: false },
  { key: "best_times", label: "Best Times", ready: false },
  { key: "analytics", label: "Analytics", ready: false },
] as const;

/**
 * Posting page sub-tabs.
 *
 * Right now only "My Plans" is functional. The remaining tabs are
 * reserved for future surfaces (calendar grid, plan templates, optimal
 * post times, plan-level analytics). Until those views exist we keep
 * the row visible (signals the roadmap) but render the unbuilt entries
 * as disabled "Soon" chips so users can't click into a dead view.
 */
export function PostingTabs() {
  return (
    <div className="border-b border-ink-100">
      <ul className="flex items-center gap-1 flex-wrap">
        {TABS.map((t) => {
          if (t.ready) {
            return (
              <li key={t.key}>
                <span
                  className={cn(
                    "h-11 px-4 inline-flex items-center text-[13.5px] font-medium border-b-2 -mb-px",
                    "text-rose-700 border-rose-500",
                  )}
                >
                  {t.label}
                </span>
              </li>
            );
          }
          return (
            <li key={t.key}>
              <span
                aria-disabled
                title="Coming soon"
                className="h-11 px-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-400 border-b-2 -mb-px border-transparent cursor-not-allowed"
              >
                {t.label}
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-cream-200 text-ink-500">
                  Soon
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
