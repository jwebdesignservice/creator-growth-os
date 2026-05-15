import { Flame } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  streak: number;
  weekChecks: boolean[]; // 7 entries, Mon..Sun
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function StreakCard({ streak, weekChecks }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-ink-900">Daily Streak</div>
        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[13px]">
          <Flame className="size-3.5" fill="currentColor" strokeWidth={1.6} />
          {streak}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "size-7 rounded-full inline-flex items-center justify-center text-[11px] font-semibold",
                weekChecks[i]
                  ? "bg-rose-500 text-white"
                  : "bg-cream-100 border border-ink-100 text-ink-400",
              )}
            >
              {weekChecks[i] ? "✓" : label}
            </span>
            <span className="text-[9.5px] text-ink-400 uppercase tracking-wide">
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11.5px] text-ink-500 leading-snug">
        Don&apos;t break the chain — finish today&apos;s missions to keep your
        streak alive.
      </p>
    </div>
  );
}
