import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  icon?: ReactNode;
};

/**
 * Like Input but with a leading icon slot. Used on the auth forms where
 * every field has an icon per the design comps.
 */
export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
  { className, label, hint, icon, id, ...rest },
  ref,
) {
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
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 rounded-[12px] bg-white border border-ink-200 text-ink-900",
            "placeholder:text-ink-400 text-[14px]",
            "focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
            "transition-colors",
            icon ? "pl-10 pr-4" : "px-4",
            className,
          )}
          {...rest}
        />
      </div>
      {hint && <p className="text-[12px] text-ink-500">{hint}</p>}
    </div>
  );
});
