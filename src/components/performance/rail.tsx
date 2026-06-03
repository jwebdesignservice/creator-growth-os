import Link from "next/link";
import { Flame, TrendingUp, ArrowUp, ArrowDown, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Insight = {
  label: string;
  primary: string;
  delta: number;
};

type Props = {
  plan: "free" | "basic" | "pro";
  streak: { current: number; last8: boolean[] };
  snapshot: { label: string; value: string }[];
  insights: Insight[];
};

const DAY_LABELS = ["W-7", "W-6", "W-5", "W-4", "W-3", "W-2", "W-1", "Now"];

export function PerformanceRail({
  plan,
  streak,
  snapshot,
  insights,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3 items-start">
        {/* This Week's Snapshot */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              This Week&apos;s Snapshot
            </div>
            <TrendingUp className="size-3.5 text-rose-500" strokeWidth={2} />
          </div>
          <ul className="space-y-2.5">
            {snapshot.map((s) => (
              <li
                key={s.label}
                className="flex items-center justify-between text-[12.5px]"
              >
                <span className="text-ink-500">{s.label}</span>
                <span className="text-ink-900 font-semibold tabular-nums">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Logging streak */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Logging Streak
            </div>
            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[13px]">
              <Flame className="size-3.5" fill="currentColor" strokeWidth={1.6} />
              {streak.current}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1.5 mb-2">
            {streak.last8.map((logged, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "size-6 rounded-md text-[10px] font-semibold inline-flex items-center justify-center",
                    logged
                      ? "bg-rose-500 text-white"
                      : "bg-cream-100 border border-ink-100 text-ink-400",
                  )}
                >
                  {logged ? "✓" : ""}
                </span>
                <span className="text-[9px] text-ink-400">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-ink-500 leading-snug">
            Log a snapshot every Sunday to build a real growth picture.
          </p>
        </section>

        {/* Insights */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Performance Insights
            </div>
          </div>
          {insights.length === 0 ? (
            <p className="text-[12px] text-ink-500">
              Log two consecutive weeks to unlock week-over-week insights.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {insights.map((it) => {
                const up = it.delta >= 0;
                return (
                  <li key={it.label} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center size-7 rounded-full shrink-0",
                        up
                          ? "bg-success-bg text-success"
                          : "bg-rose-100 text-rose-700",
                      )}
                    >
                      {up ? (
                        <ArrowUp className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        <ArrowDown className="size-3.5" strokeWidth={2.5} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-ink-900 leading-tight">
                        <span className="font-semibold">{it.label}</span> is{" "}
                        {up ? "up" : "down"}{" "}
                        <span className="font-semibold">
                          {Math.abs(it.delta)}%
                        </span>{" "}
                        vs last week
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        Current: {it.primary}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        </div>

        {/* Pro upsell for revenue — full-width banner now that this lives in
            the main column instead of the right rail. */}
        {plan !== "pro" && (
          <section className="rounded-[16px] bg-rose-50/80 border border-rose-100 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
                <span className="text-[13px] font-semibold text-ink-900">
                  Track revenue with Pro
                </span>
              </div>
              <p className="text-[12px] text-ink-700 leading-snug">
                Add weekly income and brand-deal revenue. See revenue trends
                alongside your audience growth.
              </p>
            </div>
            <Link
              href="/billing?upgrade=pro"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium transition-colors cursor-pointer shrink-0"
            >
              <Lock className="size-3.5" strokeWidth={2} />
              Upgrade to Pro
            </Link>
          </section>
        )}
      </div>
  );
}
