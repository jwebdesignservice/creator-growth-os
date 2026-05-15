import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  primary: string | number;
  sub?: string;
  icon?: LucideIcon;
  tone?: "rose" | "ink" | "success" | "gold";
};

const TONE: Record<NonNullable<Props["tone"]>, { bg: string; fg: string }> = {
  rose: { bg: "bg-rose-100", fg: "text-rose-600" },
  ink: { bg: "bg-ink-100", fg: "text-ink-700" },
  success: { bg: "bg-success-bg", fg: "text-success" },
  gold: { bg: "bg-[#F6ECD3]", fg: "text-[#8A6A1F]" },
};

export function StatTile({
  label,
  primary,
  sub,
  icon: Icon,
  tone = "rose",
}: Props) {
  const t = TONE[tone];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11.5px] text-ink-500 font-medium uppercase tracking-wider">
          {label}
        </div>
        {Icon && (
          <span
            className={cn(
              "size-9 rounded-full inline-flex items-center justify-center",
              t.bg,
              t.fg,
            )}
          >
            <Icon className="size-4" strokeWidth={1.8} />
          </span>
        )}
      </div>
      <div className="text-[28px] font-semibold text-ink-900 leading-none tabular-nums mb-1">
        {primary}
      </div>
      {sub && <div className="text-[12px] text-ink-500">{sub}</div>}
    </div>
  );
}
