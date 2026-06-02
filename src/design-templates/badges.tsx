/* Badges ───────────────────────────────────────────────────────────────
   Status chips, tags, count badges.
   ───────────────────────────────────────────────────────────────────── */

const COLORS = {
  rose:   "bg-rose-100 text-rose-700",
  ink:    "bg-ink-100 text-ink-700",
  emerald:"bg-emerald-100 text-emerald-700",
  amber:  "bg-amber-100 text-amber-700",
  sky:    "bg-sky-100 text-sky-700",
} as const;

export function Badge({
  color = "rose",
  children = "Badge",
}: {
  color?: keyof typeof COLORS;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11.5px] font-semibold " +
        COLORS[color]
      }
    >
      {children}
    </span>
  );
}

export function BadgeWithDot() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11.5px] font-semibold bg-emerald-100 text-emerald-700">
      <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
      Connected
    </span>
  );
}

export function CountBadge() {
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold bg-rose-600 text-white">
      12
    </span>
  );
}

export function BadgeRow() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge color="rose">Pro</Badge>
      <Badge color="ink">Draft</Badge>
      <Badge color="emerald">Live</Badge>
      <Badge color="amber">Pending</Badge>
      <Badge color="sky">Beta</Badge>
    </div>
  );
}
