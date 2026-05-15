import { cn } from "@/lib/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "soft";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed shadow-sm",
  secondary:
    "bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:text-rose-300",
  ghost:
    "bg-transparent text-ink-700 hover:bg-cream-200 disabled:text-ink-300",
  outline:
    "bg-white border border-ink-200 text-ink-900 hover:bg-cream-100 disabled:text-ink-300",
  soft:
    "bg-cream-200 text-ink-900 hover:bg-cream-300 disabled:text-ink-400",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] rounded-[10px]",
  md: "h-11 px-5 text-[14px] rounded-[12px]",
  lg: "h-12 px-6 text-[15px] rounded-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
});
