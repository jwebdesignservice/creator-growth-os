"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type FilterOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

/**
 * A compact button + popover dropdown used in library toolbars (Programs,
 * Tutorials, Events). Shows the current option's icon + label with a chevron,
 * and a checked list in the popover. Closes on outside-click / Escape.
 */
export function FilterDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  width = 200,
}: {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Popover width in px. */
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];
  const CurrentIcon = current?.icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer transition-colors"
      >
        {CurrentIcon && (
          <CurrentIcon className="size-3.5 text-rose-500" strokeWidth={2} />
        )}
        {current?.label}
        <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-30 rounded-[12px] bg-white border border-ink-100 shadow-card py-1 max-h-[300px] overflow-y-auto"
          style={{ width }}
        >
          {options.map((o) => {
            const OptionIcon = o.icon;
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 text-left px-3 py-2 text-[13px] hover:bg-cream-100 cursor-pointer",
                  active ? "text-rose-700 font-semibold" : "text-ink-700",
                )}
              >
                {OptionIcon && (
                  <OptionIcon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-rose-500" : "text-ink-400",
                    )}
                    strokeWidth={2}
                  />
                )}
                <span className="flex-1 truncate">{o.label}</span>
                {active && (
                  <Check className="size-3.5 text-rose-500 shrink-0" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
