type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function DevPageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--dev-text-primary)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[13.5px] text-[var(--dev-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
