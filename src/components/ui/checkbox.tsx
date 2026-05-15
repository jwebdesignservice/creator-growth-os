"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  children?: ReactNode;
  required?: boolean;
};

export function Checkbox({
  name,
  defaultChecked,
  checked,
  onCheckedChange,
  children,
  required,
}: Props) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isControlled = typeof checked === "boolean";
  const value = isControlled ? checked! : internal;

  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none group">
      <input
        type="checkbox"
        name={name}
        required={required}
        checked={value}
        onChange={(e) => {
          if (!isControlled) setInternal(e.target.checked);
          onCheckedChange?.(e.target.checked);
        }}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 size-[18px] rounded-[6px] border-2 inline-flex items-center justify-center shrink-0 transition-colors",
          value
            ? "bg-rose-600 border-rose-600"
            : "bg-white border-ink-300 group-hover:border-rose-400",
        )}
      >
        {value && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
      {children && (
        <span className="text-[13px] text-ink-700 leading-snug">{children}</span>
      )}
    </label>
  );
}
