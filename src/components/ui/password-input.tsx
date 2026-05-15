"use client";

import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  withIcon?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ className, label, hint, id, withIcon = true, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? rest.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-semibold text-ink-900"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {withIcon && (
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400"
              strokeWidth={2}
            />
          )}
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(
              "w-full h-11 rounded-[12px] bg-white border border-ink-200 text-ink-900",
              "placeholder:text-ink-400 text-[14px]",
              "focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
              "transition-colors",
              withIcon ? "pl-10 pr-11" : "px-4 pr-11",
              className,
            )}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 rounded-md inline-flex items-center justify-center text-ink-500 hover:text-ink-700 hover:bg-cream-100"
          >
            {visible ? (
              <EyeOff className="size-4" strokeWidth={2} />
            ) : (
              <Eye className="size-4" strokeWidth={2} />
            )}
          </button>
        </div>
        {hint && <p className="text-[12px] text-ink-500">{hint}</p>}
      </div>
    );
  },
);
