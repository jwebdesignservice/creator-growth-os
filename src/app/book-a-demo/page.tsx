import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { BookADemoForm } from "@/components/marketing/book-a-demo-form";

/**
 * /book-a-demo — premium conversion / contact page.
 *
 * A 1:1 recreation of the tr9.webflow.io/book-a-demo layout, rebuilt on the
 * Profluencer rose / ink system:
 *   • full-height dark (ink-900) stage with the shared top nav
 *   • a vertical split: left editorial panel (oversized headline + a soft
 *     blurred brand-block + bottom supporting copy) | thin divider | right
 *     form panel (two-column underline fields, terms, oversized underlined CTA)
 * Reference greens → our rose accent; sharp corners → our rounded system.
 *
 * Public page (no auth gate) — prospects and signed-in users can both book.
 */

export const metadata = {
  title: "Book a Demo — Profluencer",
  description:
    "See Profluencer in action. Share a few details and we'll tailor a " +
    "personalized walkthrough to your niche, audience and growth goals.",
};

const NAV = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/#blog" },
  { label: "Resources", href: "/#resources" },
];

export default function BookADemoPage() {
  return (
    <div className="flex min-h-svh flex-col bg-ink-900 text-white">
      {/* ── Nav (shared site nav) ─────────────────────────────────────── */}
      <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={26} className="text-white" />
          <span className="text-[18px] font-bold tracking-tight text-white">
            Profluencer
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-[14.5px] text-white/65 transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link
            href="/sign-in"
            className="hidden text-[14.5px] text-white/80 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center rounded-[12px] bg-rose-400 px-5 text-[14.5px] font-semibold text-ink-900 transition-colors hover:bg-rose-300"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Split: left visual | right form ───────────────────────────── */}
      <main className="flex flex-1 flex-col lg:min-h-[calc(100svh-68px)] lg:flex-row">
        {/* Left — editorial / visual */}
        <section className="relative flex flex-col overflow-hidden px-6 py-12 sm:px-10 sm:py-14 lg:w-[51%] lg:px-12">
          <MosaicBlock />
          <h1 className="relative z-10 font-sans text-[clamp(3rem,7.6vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white">
            See It in
            <br />
            Action
          </h1>
          <p className="relative z-10 mt-12 max-w-[34ch] text-[16px] leading-relaxed text-white/55 lg:mt-auto">
            Share a few details so we can tailor your demo to your niche,
            audience and growth goals.
          </p>
        </section>

        {/* Right — form */}
        <section className="relative flex flex-col border-t border-white/12 px-6 py-12 sm:px-10 sm:py-14 lg:w-[49%] lg:border-l lg:border-t-0 lg:px-12">
          <BookADemoForm />
        </section>
      </main>
    </div>
  );
}

/* ── Left-panel visual — soft, blurred brand-block mosaic ───────────────── */

const TINTS = [
  "transparent",
  "rgba(185,72,92,0.55)", // rose-600
  "transparent",
  "rgba(201,161,74,0.34)", // gold
  "transparent",
  "transparent",
  "rgba(208,129,113,0.5)", // rose-400
  "transparent",
  "rgba(151,56,74,0.5)", // rose-700
  "transparent",
  "rgba(58,54,49,0.7)", // ink-700 block
  "rgba(217,160,147,0.3)", // warm coral
  "transparent",
  "rgba(185,72,92,0.35)",
  "transparent",
  "rgba(201,161,74,0.2)",
];

function MosaicBlock() {
  const cells = Array.from({ length: 42 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Blurred colored-block grid, drifting toward the divider */}
      <div className="absolute right-[-8%] top-[46%] h-[560px] w-[600px] -translate-y-1/2 opacity-[0.7] blur-[40px] sm:right-[2%] lg:right-[-6%]">
        <div className="grid h-full grid-cols-6 grid-rows-7 gap-2.5">
          {cells.map((_, i) => (
            <div
              key={i}
              className="rounded-[3px]"
              style={{ backgroundColor: TINTS[(i * 7 + (i % 5) * 3) % TINTS.length] }}
            />
          ))}
        </div>
      </div>
      {/* Warm focal glow + left-darken so the headline stays crisp */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(48% 50% at 68% 46%, rgba(185,72,92,0.14), transparent 62%)," +
            "linear-gradient(100deg, var(--ink-900) 18%, rgba(26,24,22,0.6) 46%, transparent 74%)",
        }}
      />
    </div>
  );
}
