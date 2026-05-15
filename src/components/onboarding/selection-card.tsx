"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  selected: boolean;
  onToggle: () => void;
  layout?: "vertical" | "horizontal";
  size?: "default" | "compact";
};

/**
 * Large rounded selection card: icon, title, optional description.
 * Used for Stage / Platform / Primary Goal / Weekly Pace / Content Pillars / Formats.
 */
export function SelectionCard({
  icon,
  title,
  description,
  selected,
  onToggle,
  layout = "vertical",
  size = "default",
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative w-full text-left rounded-[16px] border-2 transition-colors group",
        size === "default" ? "p-5" : "p-3.5",
        selected
          ? "border-rose-500 bg-rose-50/70"
          : "border-ink-100 bg-white hover:border-ink-200 hover:bg-cream-100/50",
        layout === "horizontal" && "flex items-center gap-3",
      )}
    >
      {/* Check badge */}
      {selected && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center size-5 rounded-full bg-rose-500 text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}

      {/* Icon */}
      <div
        className={cn(
          layout === "vertical" && size === "default" && "mb-3",
          layout === "vertical" && size === "compact" && "mb-2",
        )}
      >
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full transition-colors",
            size === "default" ? "size-12" : "size-10",
            selected ? "bg-rose-100 text-rose-600" : "bg-cream-100 text-ink-500",
          )}
        >
          {icon}
        </div>
      </div>

      <div className={cn(layout === "horizontal" && "flex-1 min-w-0")}>
        <div
          className={cn(
            "font-semibold text-ink-900 leading-tight",
            size === "default" ? "text-[15px]" : "text-[13.5px]",
          )}
        >
          {title}
        </div>
        {description && (
          <div
            className={cn(
              "text-ink-500 leading-snug mt-1",
              size === "default" ? "text-[12.5px]" : "text-[11.5px]",
            )}
          >
            {description}
          </div>
        )}
      </div>
    </button>
  );
}
