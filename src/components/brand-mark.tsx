import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  size?: number;
};

/**
 * Crown-M brand mark from the design comps.
 * Two stylized peaks resembling an "M" with a small dot above each peak,
 * rendered in rose. Vector traced from the dashboard reference.
 */
export function BrandMark({ className, size = 36 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-rose-600", className)}
      aria-hidden
    >
      <path
        d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"
        fill="currentColor"
      />
      <circle cx="14" cy="12" r="2.2" fill="currentColor" />
      <circle cx="34" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}
