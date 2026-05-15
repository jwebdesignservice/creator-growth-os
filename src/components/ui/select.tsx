import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";

type Option = { value: string; label: string };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  hint?: string;
  icon?: ReactNode;
  placeholder?: string;
  options: Option[];
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, label, hint, icon, placeholder, options, id, ...rest },
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
        <select
          ref={ref}
          id={inputId}
          defaultValue=""
          className={cn(
            "w-full h-11 rounded-[12px] bg-white border border-ink-200 text-ink-900",
            "text-[14px] appearance-none cursor-pointer",
            "focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
            "transition-colors",
            icon ? "pl-10 pr-9" : "pl-4 pr-9",
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-500 pointer-events-none"
          strokeWidth={2}
        />
      </div>
      {hint && <p className="text-[12px] text-ink-500">{hint}</p>}
    </div>
  );
});
