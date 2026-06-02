/* Brand ─────────────────────────────────────────────────────────────────
   Logo-usage variations for the product's brand mark (the rose crown shown
   on the app's own pages) + wordmark "Creator Growth OS". Standard
   style-guide brand block: primary lockup, mark, monochrome, reversed,
   app icon / favicon sizes. Exported as a gallery category and re-spread
   via FOUNDATION_CATEGORIES so it leads the style guide.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { Crown, type LucideIcon } from "lucide-react";

const WORDMARK_STYLE = { fontFamily: "var(--font-heading)" } as const;

function BrandPrimary() {
  return (
    <div className="flex items-center gap-3">
      <span className="size-12 rounded-[12px] bg-rose-600 text-white inline-flex items-center justify-center shadow-sm">
        <Crown size={26} strokeWidth={1.6} />
      </span>
      <span className="text-[20px] font-semibold text-ink-900" style={WORDMARK_STYLE}>
        Creator Growth OS
      </span>
    </div>
  );
}

function BrandMarkSquare() {
  return (
    <span className="size-16 rounded-[16px] bg-rose-600 text-white inline-flex items-center justify-center shadow-sm">
      <Crown size={34} strokeWidth={1.6} />
    </span>
  );
}

function BrandMarkGlyph() {
  return <Crown size={56} strokeWidth={1.6} className="text-rose-600" />;
}

function BrandMonochrome() {
  return (
    <div className="flex items-center gap-3">
      <span className="size-12 rounded-[12px] bg-ink-900 text-white inline-flex items-center justify-center">
        <Crown size={26} strokeWidth={1.6} />
      </span>
      <span className="text-[20px] font-semibold text-ink-900" style={WORDMARK_STYLE}>
        Creator Growth OS
      </span>
    </div>
  );
}

function BrandReversed() {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-ink-900 px-5 py-4">
      <span className="size-11 rounded-[11px] bg-rose-500 text-white inline-flex items-center justify-center">
        <Crown size={24} strokeWidth={1.6} />
      </span>
      <span className="text-[19px] font-semibold text-cream-100" style={WORDMARK_STYLE}>
        Creator Growth OS
      </span>
    </div>
  );
}

function BrandIcons() {
  return (
    <div className="flex items-end gap-4">
      {[64, 40, 28, 16].map((s) => (
        <span
          key={s}
          className="rounded-[22%] bg-rose-600 text-white inline-flex items-center justify-center shrink-0 shadow-sm"
          style={{ width: s, height: s }}
        >
          <Crown size={Math.round(s * 0.55)} strokeWidth={1.7} />
        </span>
      ))}
    </div>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type BrandCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const BRAND_CATEGORIES: BrandCategory[] = [
  {
    id: "brand",
    label: "Brand",
    icon: Crown,
    blurb: "Logo lockup, mark, monochrome, reversed, app icon.",
    items: [
      { label: "Primary lockup", code: "BrandPrimary", node: <BrandPrimary /> },
      { label: "Logomark", code: "BrandMarkSquare", node: <BrandMarkSquare /> },
      { label: "Logomark · glyph", code: "BrandMarkGlyph", node: <BrandMarkGlyph /> },
      { label: "Monochrome", code: "BrandMonochrome", node: <BrandMonochrome /> },
      { label: "Reversed · on dark", code: "BrandReversed", node: <BrandReversed /> },
      { label: "App icon & favicon", code: "BrandIcons", node: <BrandIcons /> },
    ],
  },
];
