import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, hint, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-ink-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900",
          "placeholder:text-ink-400 text-[14px]",
          "focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
          "transition-colors",
          className,
        )}
        {...rest}
      />
      {hint && <p className="text-[12px] text-ink-500">{hint}</p>}
    </div>
  );
});
