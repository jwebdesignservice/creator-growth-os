/* Stats ─────────────────────────────────────────────────────────────────
   The KPI / metric tiles used throughout the product — dashboard,
   performance, posting, admin, and the dev dashboard all lean on these.
   Mirrors src/components/admin/stat-tile.tsx, generalised for the gallery.
   ───────────────────────────────────────────────────────────────────── */

import {
  Users,
  Eye,
  Heart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "rose" | "ink" | "success" | "gold";
const TONE: Record<Tone, { bg: string; fg: string }> = {
  rose: { bg: "bg-rose-100", fg: "text-rose-600" },
  ink: { bg: "bg-ink-100", fg: "text-ink-700" },
  success: { bg: "bg-success-bg", fg: "text-success" },
  gold: { bg: "bg-[#F6ECD3]", fg: "text-[#8A6A1F]" },
};

export function StatTile({
  label = "Followers",
  primary = "12.4K",
  sub = "+820 this week",
  icon: Icon = Users,
  tone = "rose",
}: {
  label?: string;
  primary?: string | number;
  sub?: string;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <div className="card p-5 w-[240px]">
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

export function StatRow() {
  const tiles: {
    label: string;
    primary: string;
    sub: string;
    icon: LucideIcon;
    tone: Tone;
  }[] = [
    { label: "Followers", primary: "12.4K", sub: "+820 this week", icon: Users, tone: "rose" },
    { label: "Impressions", primary: "486K", sub: "+12% vs last", icon: Eye, tone: "ink" },
    { label: "Engagement", primary: "5.7%", sub: "Above target", icon: Heart, tone: "success" },
    { label: "Revenue", primary: "$2,140", sub: "Month to date", icon: DollarSign, tone: "gold" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-[760px] max-w-full">
      {tiles.map((t) => (
        <StatTile key={t.label} {...t} />
      ))}
    </div>
  );
}

export function DeltaStats() {
  const items = [
    { label: "Posts published", value: "32", delta: 8, up: true },
    { label: "Saves", value: "1,204", delta: 14, up: true },
    { label: "Unfollows", value: "76", delta: 5, up: false },
  ];
  return (
    <div className="grid grid-cols-3 gap-4 w-[560px] max-w-full">
      {items.map((it) => (
        <div key={it.label} className="card p-5">
          <div className="text-[12px] text-ink-500">{it.label}</div>
          <div className="text-h3 text-ink-900 tabular-nums leading-tight mt-1">
            {it.value}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 mt-2 px-2 h-6 rounded-full text-[11.5px] font-semibold",
              it.up ? "bg-success-bg text-success" : "bg-rose-100 text-rose-700",
            )}
          >
            {it.up ? (
              <TrendingUp className="size-3.5" strokeWidth={2.4} />
            ) : (
              <TrendingDown className="size-3.5" strokeWidth={2.4} />
            )}
            {it.delta}%
          </span>
        </div>
      ))}
    </div>
  );
}
