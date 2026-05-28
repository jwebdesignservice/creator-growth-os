import { cn } from "@/lib/cn";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type Props = {
  counts: number[]; // length 7 Mon..Sun
};

export function ActivityBar({ counts }: Props) {
  const max = Math.max(1, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-ink-900">
          Mission Activity
        </div>
        <span className="text-[11.5px] text-ink-500 font-medium">
          {total} this week
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-36">
        {counts.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-full rounded-md transition-all",
                c > 0 ? "bg-rose-400" : "bg-cream-200",
              )}
              style={{ height: `${(c / max) * 112 + 6}px` }}
              title={`${DAY_LABELS[i]}: ${c} missions`}
            />
            <span className="text-[10px] text-ink-500 font-medium">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
