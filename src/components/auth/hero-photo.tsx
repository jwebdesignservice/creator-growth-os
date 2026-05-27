import { Check } from "lucide-react";

/**
 * Right-column lifestyle column for the auth pages.
 * Until you drop a real photo into `public/auth-hero.jpg`, this renders a
 * warm cream + rose gradient with a soft floral SVG ornament — same vibe
 * as the design comps (pink flowers / coffee / marble flatlay).
 *
 * To swap in your photo: save it to `public/auth-hero.jpg`. Done.
 */
export function AuthHeroPhoto({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-full min-h-[480px] overflow-hidden bg-cream-200">
      {/* Real photo (if present) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth-hero.jpg')" }}
      />
      {/* Decorative fallback (sits behind the photo so it only shows when
          the image is missing or transparent) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-100 via-cream-200 to-cream-300" />
      <FloralOrnament />
      {/* Overlay slot (handwriting notebook / preview card) */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

function FloralOrnament() {
  return (
    <>
      <svg
        className="absolute -top-10 -right-16 w-[420px] h-[420px] text-rose-300 opacity-60 -z-0"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="100" cy="60" r="42" />
        <circle cx="68" cy="90" r="32" />
        <circle cx="130" cy="100" r="30" />
        <circle cx="98" cy="120" r="28" />
        <circle cx="100" cy="80" r="10" className="text-rose-400" fill="currentColor" />
      </svg>
      <svg
        className="absolute bottom-10 -left-20 w-[320px] h-[320px] text-rose-200 opacity-70"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="100" cy="100" r="48" />
        <circle cx="60" cy="80" r="28" />
        <circle cx="140" cy="120" r="32" />
      </svg>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-48 rounded-full bg-rose-100/50 blur-3xl" />
    </>
  );
}

export function NotebookCallout() {
  return (
    <div className="absolute top-[32%] right-[12%] rotate-[-3deg] hidden lg:block pointer-events-none">
      <div className="bg-cream-100 rounded-[14px] px-7 py-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] border border-cream-300">
        <div className="font-script text-[22px] text-ink-700 mb-2 underline decoration-rose-300/70 underline-offset-4">
          Today&apos;s Plan
        </div>
        <ul className="space-y-1.5 font-script text-[18px] text-ink-700 leading-tight">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-rose-500" strokeWidth={2.5} />
            Create content
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-rose-500" strokeWidth={2.5} />
            Engage audience
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-rose-500" strokeWidth={2.5} />
            Share value
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-rose-500" strokeWidth={2.5} />
            Grow influence
          </li>
        </ul>
        <div className="mt-1 text-right text-rose-400 text-[18px]">♥</div>
      </div>
    </div>
  );
}

type OverlayCardProps = {
  headline: string;
  blurb: string;
  bullets: string[];
};

export function FeatureOverlayCard({
  headline,
  blurb,
  bullets,
}: OverlayCardProps) {
  return (
    <div className="absolute bottom-6 right-6 left-6 lg:left-auto lg:w-[420px] bg-white rounded-[18px] shadow-[0_30px_60px_-20px_rgba(26,24,22,0.25)] border border-ink-100 p-5">
      <div className="grid grid-cols-[1fr_1.1fr] gap-4 items-center mb-4">
        {/* Mini dashboard preview */}
        <div className="rounded-[10px] bg-cream-100 border border-ink-100 p-2.5 h-[120px] overflow-hidden">
          <div className="flex gap-1.5 mb-1.5">
            <div className="w-12 h-2 rounded bg-rose-300" />
            <div className="w-6 h-2 rounded bg-cream-300" />
          </div>
          <div className="h-3 bg-cream-200 rounded mb-1 w-3/4" />
          <div className="h-3 bg-cream-200 rounded mb-2 w-1/2" />
          <div className="grid grid-cols-3 gap-1 mb-1.5">
            <div className="h-5 rounded bg-rose-100" />
            <div className="h-5 rounded bg-cream-200" />
            <div className="h-5 rounded bg-cream-200" />
          </div>
          <div className="h-2 bg-cream-200 rounded mb-1 w-full" />
          <div className="h-2 bg-cream-200 rounded w-2/3" />
        </div>
        <div>
          <h3 className="text-h4 text-ink-900 leading-tight mb-1">
            {headline}
          </h3>
          <p className="text-[11.5px] text-ink-500 leading-snug">{blurb}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2 text-[12.5px] text-ink-700">
            <span className="inline-flex items-center justify-center size-4 rounded-full bg-rose-100 text-rose-600 shrink-0">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
