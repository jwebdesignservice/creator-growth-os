"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Generic collapsible row — the same header anatomy + grid-rows spring
 * animation as the program hero's "What You'll Learn" dropdown, reusable for
 * any section (icon tile · title · subtitle · optional badge · chevron).
 * Render inside a `card overflow-hidden` (stack several, divided by
 * border-t) or standalone with `card` chrome via the default variant.
 */
export function CollapsibleSection({
  icon,
  title,
  subtitle,
  badge,
  defaultOpen = false,
  flush = false,
  children,
}: {
  /** Pre-rendered icon node (icons aren't serializable server→client). */
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Optional right-aligned chip/badge, rendered before the chevron. */
  badge?: ReactNode;
  defaultOpen?: boolean;
  /** Render without card chrome — for stacking inside a shared card. */
  flush?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={flush ? "overflow-hidden" : "card overflow-hidden"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3.5 p-4 sm:px-5 text-left hover:bg-cream-50/70 transition-colors cursor-pointer"
      >
        <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[18px] text-ink-900 leading-tight">
            {title}
          </span>
          {subtitle && (
            <span className="block text-[12px] text-ink-500 mt-0.5 truncate">
              {subtitle}
            </span>
          )}
        </span>
        {badge && <span className="hidden sm:inline-flex shrink-0">{badge}</span>}
        <ChevronDown
          className={cn(
            "size-5 text-ink-400 shrink-0 transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 border-t border-ink-100 pt-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
