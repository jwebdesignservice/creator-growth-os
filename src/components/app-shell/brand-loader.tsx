import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Premium full-screen loader used at route transitions where no app
 * shell is mounted yet (auth, onboarding, public routes, cold loads).
 *
 * Composition:
 *   1. Soft cream-to-rose radial backdrop fills the viewport.
 *   2. A rotating rose ring sits behind the static brand mark — feels
 *      like the mark is anchored while the brand "orbit" turns around it.
 *   3. Wordmark + tagline fade up underneath.
 *   4. A thin shimmer bar at the bottom signals continuous progress.
 *
 * Everything is pure CSS — no JS animation libs, no layout shift.
 */
type Props = {
  /** Override the tagline. Defaults to a friendly loading line. */
  tagline?: string;
  /** Hide the wordmark — useful when the loader briefly flashes inside
   *  a card that already shows the brand. */
  compact?: boolean;
};

export function BrandLoader({
  tagline = "Preparing your creator workspace…",
  compact = false,
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--cream-100)_0%,_var(--cream-200)_100%)]"
    >
      {/* Center stack */}
      <div className="relative flex flex-col items-center gap-6 px-6">
        {/* Mark + orbit */}
        <div className="relative size-[88px] flex items-center justify-center">
          {/* Outer orbit ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-rose-100"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 border-r-rose-400/60 brand-orbit"
          />
          {/* Static brand mark with gentle pulse */}
          <span className="brand-pulse">
            <BrandMark size={48} />
          </span>
        </div>

        {!compact && (
          <div className="text-center space-y-1.5 brand-fade-in">
            <div className="font-display text-[20px] text-ink-900 tracking-tight">
              {BRAND_NAME}
            </div>
            <div className="text-[12.5px] text-ink-500">{tagline}</div>
          </div>
        )}

        {/* Shimmer progress bar */}
        <div className="relative w-48 h-[3px] rounded-full bg-rose-100/60 overflow-hidden">
          <span aria-hidden className="absolute inset-0 brand-shimmer" />
        </div>
      </div>
    </div>
  );
}
