import { ArrowDown, ArrowUp, Users, Eye, TrendingUp, DollarSign, Lock } from "lucide-react";
import { Sparkline } from "@/components/dashboard/sparkline";
import { cn } from "@/lib/cn";
import type { DeltaTile } from "@/lib/performance/queries";

type Props = {
  tiles: DeltaTile[];
  plan: "free" | "basic" | "pro";
};

const ICON_MAP = [Users, Eye, TrendingUp, DollarSign] as const;

export function PerformanceKpiTiles({ tiles, plan }: Props) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((t, i) => {
        const Icon = ICON_MAP[i] ?? Users;
        const isRevenue = t.label === "Revenue";
        const proLocked = isRevenue && plan !== "pro";
        const up = t.delta >= 0;
        return (
          <div key={t.label} className="card p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "size-9 rounded-full inline-flex items-center justify-center",
                  proLocked
                    ? "bg-cream-200 text-ink-400"
                    : "bg-rose-100 text-rose-600",
                )}
              >
                {proLocked ? (
                  <Lock className="size-4" strokeWidth={2} />
                ) : (
                  <Icon className="size-4" strokeWidth={1.8} />
                )}
              </span>
              {!proLocked && t.primary !== "—" && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11.5px] font-medium",
                    up ? "text-success" : "text-rose-600",
                  )}
                >
                  {up ? (
                    <ArrowUp className="size-3" strokeWidth={2.5} />
                  ) : (
                    <ArrowDown className="size-3" strokeWidth={2.5} />
                  )}
                  {Math.abs(t.delta)}%
                </span>
              )}
            </div>
            <div className="text-[11.5px] text-ink-500 font-medium mb-1">
              {t.label}
            </div>
            <div
              className={cn(
                "text-[22px] font-semibold leading-none mb-2 tabular-nums",
                proLocked ? "text-ink-400" : "text-ink-900",
              )}
            >
              {proLocked ? "Pro" : t.primary}
            </div>
            {!proLocked && (
              <Sparkline data={t.series} width={140} height={28} />
            )}
            {proLocked && (
              <p className="text-[11px] text-ink-500 leading-snug">
                Revenue tracking is a Pro feature.
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
