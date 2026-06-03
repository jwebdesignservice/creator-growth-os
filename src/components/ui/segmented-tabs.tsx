import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * SegmentedTabs — the app's global pill tab switcher.
 *
 * A cream bar with a hairline border; the active segment lifts to a white
 * pill (soft shadow + rose icon/label). One look everywhere it's used.
 *
 * Each item is either link-driven (`href`, server-navigable) or
 * button-driven (provide `onSelect` on the group). Mixing is fine.
 */
export type SegmentedTabItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  href?: string;
};

export function SegmentedTabs({
  items,
  onSelect,
  ariaLabel,
}: {
  items: SegmentedTabItem[];
  /** Provide for button-driven (client) tabs; omit for link-driven tabs. */
  onSelect?: (key: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role={onSelect ? "tablist" : undefined}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 p-1 rounded-[14px] bg-cream-100 border border-ink-100"
    >
      {items.map((it) => {
        const Icon = it.icon;
        const cls = cn(
          "inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100",
          it.active
            ? "bg-white text-rose-600 shadow-sm ring-1 ring-ink-100"
            : "text-ink-500 hover:text-ink-800",
        );
        const inner = (
          <>
            <Icon
              className={cn("size-4 shrink-0", it.active ? "text-rose-600" : "text-ink-400")}
              strokeWidth={2}
            />
            {it.label}
          </>
        );

        if (it.href) {
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={cls}
            >
              {inner}
            </Link>
          );
        }
        return (
          <button
            key={it.key}
            type="button"
            role={onSelect ? "tab" : undefined}
            aria-selected={onSelect ? it.active : undefined}
            onClick={() => onSelect?.(it.key)}
            className={cls}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
