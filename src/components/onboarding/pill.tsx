"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  icon?: React.ReactNode;
  label: string;
  selected: boolean;
  onToggle: () => void;
};

export function Pill({ icon, label, selected, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative inline-flex items-center gap-2 px-4 h-12 rounded-[12px] border-2 text-[13.5px] font-medium transition-colors",
        selected
          ? "border-rose-500 bg-rose-50/70 text-ink-900"
          : "border-ink-100 bg-white text-ink-700 hover:border-ink-200 hover:bg-cream-100/50",
      )}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0",
            selected ? "text-rose-600" : "text-ink-500",
          )}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
      {selected && (
        <span className="ml-1 inline-flex items-center justify-center size-4 rounded-full bg-rose-500 text-white">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
