/* Sliders ─────────────────────────────────────────────────────────────────
   Range inputs — a single-value slider, a dual min/max range, and a
   stepped/discrete slider. Thumbs are focusable and carry slider semantics
   (role + value) so they're keyboard- and screen-reader-friendly.
   ───────────────────────────────────────────────────────────────────── */

const THUMB =
  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full bg-white border-2 border-rose-500 shadow cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50";

export function RangeSlider() {
  const pct = 64;
  return (
    <div className="w-[300px] max-w-full">
      <div className="flex items-center justify-between mb-3 text-[12.5px]">
        <span className="text-ink-700 font-medium">Budget</span>
        <span className="text-ink-900 font-semibold tabular-nums">$640</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-cream-200">
        <div className="absolute inset-y-0 left-0 rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
        <span
          role="slider"
          tabIndex={0}
          aria-label="Budget"
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={640}
          aria-valuetext="$640"
          className={THUMB}
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-ink-400 mt-2">
        <span>$0</span>
        <span>$1,000</span>
      </div>
    </div>
  );
}

export function DualRangeSlider() {
  const lo = 25;
  const hi = 70;
  return (
    <div className="w-[300px] max-w-full">
      <div className="flex items-center justify-between mb-3 text-[12.5px]">
        <span className="text-ink-700 font-medium">Followers</span>
        <span className="text-ink-900 font-semibold tabular-nums">25k – 70k</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-cream-200">
        <div className="absolute inset-y-0 rounded-full bg-rose-500" style={{ left: `${lo}%`, right: `${100 - hi}%` }} />
        <span role="slider" tabIndex={0} aria-label="Minimum followers" aria-valuemin={0} aria-valuemax={100} aria-valuenow={25} aria-valuetext="25k" className={THUMB} style={{ left: `${lo}%` }} />
        <span role="slider" tabIndex={0} aria-label="Maximum followers" aria-valuemin={0} aria-valuemax={100} aria-valuenow={70} aria-valuetext="70k" className={THUMB} style={{ left: `${hi}%` }} />
      </div>
    </div>
  );
}

export function SteppedSlider() {
  const steps = 5;
  const active = 3;
  return (
    <div className="w-[300px] max-w-full">
      <div className="flex items-center justify-between mb-3 text-[12.5px]">
        <span className="text-ink-700 font-medium">Weekly pace</span>
        <span className="text-rose-600 font-semibold">3 posts</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-cream-200 flex items-center">
        <div className="absolute inset-y-0 left-0 rounded-full bg-rose-500" style={{ width: `${((active - 1) / (steps - 1)) * 100}%` }} />
        {Array.from({ length: steps }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={"absolute -translate-x-1/2 size-2.5 rounded-full " + (i < active ? "bg-rose-500" : "bg-cream-300 border border-ink-200")}
            style={{ left: `${(i / (steps - 1)) * 100}%` }}
          />
        ))}
        <span
          role="slider"
          tabIndex={0}
          aria-label="Weekly pace"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={3}
          aria-valuetext="3 posts per week"
          className={THUMB}
          style={{ left: `${((active - 1) / (steps - 1)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-ink-400 mt-2">
        <span>1</span>
        <span>5</span>
      </div>
    </div>
  );
}
