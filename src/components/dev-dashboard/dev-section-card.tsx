import { cn } from "@/lib/cn";

type Props = {
  title?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  padded?: boolean;
};

/**
 * Standard dev-dashboard card with an optional title row and trailing
 * action slot (e.g. a count badge or a "View all" link).
 */
export function DevSectionCard({
  title,
  trailing,
  children,
  className,
  contentClassName,
  padded = true,
}: Props) {
  return (
    <section className={cn("dev-card flex flex-col", padded && "p-5", className)}>
      {(title || trailing) && (
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[var(--dev-text-primary)]">{title}</h3>
          {trailing}
        </header>
      )}
      <div className={cn("flex-1", contentClassName)}>{children}</div>
    </section>
  );
}
