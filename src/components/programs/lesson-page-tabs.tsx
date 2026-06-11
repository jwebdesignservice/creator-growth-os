"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type LessonTab = {
  key: string;
  label: string;
  /** Small leading icon node (rendered by the server page — icons aren't
   *  serializable across the server→client boundary). */
  icon?: ReactNode;
  content: ReactNode;
};

/**
 * Pill tab bar under the lesson player (Udemy-style). Every panel stays
 * mounted (hidden, not unmounted) so client children — task lists, forms —
 * keep their state and mount effects when the user switches tabs.
 */
export function LessonPageTabs({
  tabs,
  /** Extra classes on the tab bar — e.g. negative margins to bleed its
   *  underline full-width past the page's content padding. */
  tablistClassName,
  /** Extra classes on the component root — e.g. top padding to separate the
   *  tabs from the element above (the video). */
  rootClassName,
}: {
  tabs: LessonTab[];
  tablistClassName?: string;
  rootClassName?: string;
}) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div className={rootClassName}>
      <div
        role="tablist"
        className={cn(
          "flex items-center gap-1.5 flex-wrap border-b-2 border-ink-100 pb-3",
          tablistClassName,
        )}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium transition-colors cursor-pointer",
              active === t.key
                ? "bg-rose-100 text-rose-700"
                : "text-ink-600 hover:bg-cream-100 hover:text-ink-900",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          className={cn("pt-4", active !== t.key && "hidden")}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
