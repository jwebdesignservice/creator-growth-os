import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { HeroEmailForm } from "@/components/marketing/hero-email-form";
import { HeroSpotlight } from "@/components/marketing/hero-spotlight";

/**
 * Marketing hero — a 1:1 recreation of the reference hero composition
 * (tr9.webflow.io), rebuilt on our brand system:
 *   • full 100vh dark stage (ink-900) with a soft, blurred warm-block mosaic
 *   • top nav: wordmark · links · sign in · bright "Get started" pill
 *   • oversized 2-line headline pinned to the top, brand-accent on line 2
 *   • a divider, then a 2-column footer row: "who it's for" paragraph |
 *     "start in seconds" email + an oversized underlined CTA
 * Reference greens → our rose accent; sharp corners → our rounded system.
 */

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Resources", href: "#resources" },
];

const ACCENT = "#D08171"; // rose-400 — the brand equivalent of the reference accent

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-900 text-white">
      <MosaicBg />
      <HeroSpotlight />

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex h-[68px] w-full max-w-[1600px] shrink-0 items-center justify-between px-6 lg:px-12">
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

      {/* ── Body: headline (top) + footer row (bottom) ────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-6 pb-10 pt-[7vh] lg:px-12 lg:pb-16">
        <h1
          className="max-w-[1120px] font-sans text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[1.0] tracking-[-0.03em] text-white"
          style={{
            animation: "brand-fade-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          Grow Every Channel
          <br className="hidden sm:block" />{" "}
          <span style={{ color: ACCENT }}>with One Creator OS</span>
        </h1>

        <div className="mt-12 border-t border-white/[0.14] pt-8 lg:pt-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* who it's for */}
            <div
              style={{
                animation: "brand-fade-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
                animationDelay: "0.12s",
              }}
            >
              <div className="text-[14px] font-medium text-white/45">
                Who it&apos;s for:
              </div>
              <p className="mt-7 max-w-xl text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium leading-snug text-white/95">
                Built for creators who want to grow on purpose — plan your
                content, track what&apos;s actually working, and turn every
                platform into real, lasting reach.
              </p>
            </div>

            {/* start in seconds — bottom-aligned so it sits low, level with
                the left paragraph's base */}
            <div
              className="flex flex-col lg:justify-end"
              style={{
                animation: "brand-fade-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
                animationDelay: "0.2s",
              }}
            >
              <div className="text-[14px] font-medium text-white/45">
                Start in seconds
              </div>
              <HeroEmailForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Background — soft, blurred warm-block mosaic on ink-900 ──────────── */

const TINTS = [
  "transparent",
  "transparent",
  "transparent",
  "transparent",
  "rgba(185,72,92,0.20)", // rose-600
  "transparent",
  "transparent",
  "rgba(201,161,74,0.12)", // gold
  "transparent",
  "rgba(224,168,158,0.12)", // rose-300
  "transparent",
  "transparent",
  "rgba(58,54,49,0.65)", // ink-700 block
  "transparent",
  "rgba(151,56,74,0.16)", // rose-700
  "transparent",
];

function MosaicBg() {
  const cells = Array.from({ length: 120 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Blurred block grid */}
      <div className="absolute inset-[-12%] grid grid-cols-12 gap-2 opacity-[0.75] blur-[44px]">
        {cells.map((_, i) => (
          <div
            key={i}
            className="aspect-square"
            style={{ backgroundColor: TINTS[(i * 5 + (i % 7) * 3) % TINTS.length] }}
          />
        ))}
      </div>
      {/* Focal warm glows */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 82% 8%, rgba(185,72,92,0.16), transparent 60%)," +
            "radial-gradient(45% 45% at 96% 92%, rgba(201,161,74,0.10), transparent 60%)",
        }}
      />
      {/* Left-side darken so the headline stays crisp */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(100deg, var(--ink-900) 12%, rgba(26,24,22,0.55) 42%, transparent 70%)",
        }}
      />
    </div>
  );
}
