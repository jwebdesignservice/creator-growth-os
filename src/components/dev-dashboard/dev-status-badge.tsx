import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type Props = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  uppercase?: boolean;
};

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  info:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  neutral: "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border border-[var(--dev-border)]",
};

export function DevStatusBadge({ tone = "neutral", children, className, uppercase = false }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap",
        uppercase && "uppercase tracking-wider",
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
