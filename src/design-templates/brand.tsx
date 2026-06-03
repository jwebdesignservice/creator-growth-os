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

/* ── Brand guidelines (clear space · misuse · avatar · share) ─────────── */

function BrandClearSpace() {
  return (
    <div className="inline-flex p-5 border border-dashed border-rose-300 rounded-[12px]">
      <span className="size-12 rounded-[12px] bg-rose-600 text-white inline-flex items-center justify-center">
        <Crown size={26} strokeWidth={1.6} />
      </span>
    </div>
  );
}

function MisuseMark({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-white border border-rose-300 text-rose-600 flex items-center justify-center text-[9px] font-bold">
        ✕
      </span>
    </div>
  );
}

function BrandMisuse() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <MisuseMark>
        <span className="h-12 w-[88px] rounded-[12px] bg-rose-600 text-white inline-flex items-center justify-center">
          <Crown size={26} strokeWidth={1.6} />
        </span>
      </MisuseMark>
      <MisuseMark>
        <span className="size-12 rounded-[12px] bg-emerald-500 text-white inline-flex items-center justify-center">
          <Crown size={26} strokeWidth={1.6} />
        </span>
      </MisuseMark>
      <MisuseMark>
        <span className="size-12 rounded-[12px] bg-rose-200 text-rose-300 inline-flex items-center justify-center">
          <Crown size={26} strokeWidth={1.6} />
        </span>
      </MisuseMark>
    </div>
  );
}

function BrandAvatar() {
  return (
    <div className="flex items-center gap-4">
      <span className="size-14 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shadow-sm">
        <Crown size={28} strokeWidth={1.6} />
      </span>
      <span className="size-10 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shadow-sm">
        <Crown size={20} strokeWidth={1.6} />
      </span>
      <span className="size-8 rounded-full bg-ink-900 text-rose-400 inline-flex items-center justify-center">
        <Crown size={16} strokeWidth={1.7} />
      </span>
    </div>
  );
}

function BrandShareCard() {
  return (
    <div className="w-[280px] rounded-[12px] overflow-hidden border border-ink-100 shadow-sm">
      <div className="h-28 bg-gradient-to-br from-rose-300 via-rose-200 to-cream-200 flex items-center justify-center">
        <span className="size-12 rounded-[12px] bg-rose-600 text-white inline-flex items-center justify-center shadow-sm">
          <Crown size={26} strokeWidth={1.6} />
        </span>
      </div>
      <div className="p-3 bg-white space-y-1.5">
        <div className="h-2.5 w-2/3 rounded bg-ink-300" />
        <div className="h-2 w-full rounded bg-ink-100" />
        <div className="h-2 w-1/2 rounded bg-ink-100" />
      </div>
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
      { label: "Clear space", code: "BrandClearSpace", node: <BrandClearSpace /> },
      { label: "Misuse · don'ts", code: "BrandMisuse", node: <BrandMisuse /> },
      { label: "Social avatar", code: "BrandAvatar", node: <BrandAvatar /> },
      { label: "Share card", code: "BrandShareCard", node: <BrandShareCard /> },
    ],
  },
];
