/* Ratings ────────────────────────────────────────────────────────────────
   Star ratings & reviews — a star scale, a review card, and an aggregate
   rating summary with a distribution. Presentational.
   ───────────────────────────────────────────────────────────────────── */

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          aria-hidden
          className={cn(i <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-ink-200 fill-ink-100")}
        />
      ))}
    </span>
  );
}

export function StarRating() {
  return (
    <div className="flex flex-col gap-3">
      {[4, 5, 3].map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <Stars value={v} size={22} />
          <span className="text-[13px] text-ink-500 tabular-nums">{v}.0</span>
        </div>
      ))}
    </div>
  );
}

export function ReviewCard() {
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <div className="flex items-center gap-3 mb-3">
        <span className="size-10 rounded-full bg-rose-600 text-white text-[13px] font-semibold inline-flex items-center justify-center shrink-0">AP</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900">Amelia Park</div>
          <div className="text-[11.5px] text-ink-400">Pro member · 2 weeks ago</div>
        </div>
        <Stars value={5} />
      </div>
      <p className="text-[13px] text-ink-700 leading-relaxed">
        The Launchpad program is worth every penny. The hook framework alone doubled my
        reach in a month — highly recommend it to any creator starting out.
      </p>
    </div>
  );
}

export function RatingSummary() {
  const dist = [
    { star: 5, pct: 72 },
    { star: 4, pct: 18 },
    { star: 3, pct: 6 },
    { star: 2, pct: 3 },
    { star: 1, pct: 1 },
  ];
  return (
    <div className="card p-5 w-[360px] max-w-full flex gap-5">
      <div className="text-center shrink-0">
        <div className="text-[40px] font-bold text-ink-900 leading-none">4.8</div>
        <div className="mt-1">
          <Stars value={5} />
        </div>
        <div className="text-[11.5px] text-ink-400 mt-1">1,204 reviews</div>
      </div>
      <div className="flex-1 space-y-1.5">
        {dist.map((d) => (
          <div key={d.star} className="flex items-center gap-2 text-[11.5px]">
            <span className="text-ink-500 w-3 tabular-nums">{d.star}</span>
            <Star size={12} strokeWidth={0} className="text-amber-400 fill-amber-400" />
            <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.pct}%` }} />
            </div>
            <span className="text-ink-400 w-8 text-right tabular-nums">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
