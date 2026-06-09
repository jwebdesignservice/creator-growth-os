"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

/**
 * Marketing footer — the page's closing statement. A rose/ink recreation of the
 * tr9.webflow.io footer (the same reference the closing <Cta/> is built from):
 *
 *   • a short brand statement (upper-left) + grouped nav columns + top-right
 *     utility links (Login / Book a Demo)
 *   • a contact block with an oversized email link and a "Stay Updated"
 *     newsletter (white field + underlined Subscribe), reusing the CTA's
 *     field + feature-link styling so the seam with section 5 is seamless
 *   • a hairline divider, then an oversized "Profluencer" wordmark that fits
 *     the content width (its accent is the rose brand mark), and a legal row
 *
 * Reference mechanics (tr9 via DevTools): 36px side gutters (= px-9), muted
 * labels at 0.5 white, 14px links, 230px top padding, 30px contact/Subscribe.
 * Reference blue accent → our rose-400.
 */

const PRODUCT = [
  { label: "Programs", href: "/sign-up" },
  { label: "Tutorials", href: "/sign-up" },
  { label: "Posting Plans", href: "/sign-up" },
  { label: "Performance", href: "/sign-up" },
];
const COMPANY = [
  { label: "About", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
];
const FOLLOW = [
  { label: "Instagram", href: "#" },
  { label: "X", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
];

export function Footer() {
  const wordRef = useRef<HTMLSpanElement>(null);
  const wordWrapRef = useRef<HTMLDivElement>(null);

  // Fit the oversized wordmark to the content width (responsive + crisp).
  // Mutates font-size directly — no state, so it never re-renders.
  useEffect(() => {
    const word = wordRef.current;
    const wrap = wordWrapRef.current;
    if (!word || !wrap) return;
    const fit = () => {
      const avail = wrap.clientWidth;
      if (avail <= 0) return;
      const base = 140;
      word.style.fontSize = `${base}px`;
      const w = word.scrollWidth;
      if (w > 0) word.style.fontSize = `${base * (avail / w)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener("resize", fit);
    if (document.fonts?.ready) void document.fonts.ready.then(fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <footer className="relative isolate overflow-hidden bg-ink-900 text-white">
      {/* depth — rose glow + faint grid, echoing the closing CTA */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(70% 55% at 50% 0%, rgba(208,129,113,0.12), transparent 62%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "clamp(58px, 5.4vw, 92px) clamp(58px, 5.4vw, 92px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 sm:px-9">
        {/* ── TOP: statement · nav columns · utility ───────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 pt-[clamp(4.5rem,9vw,7.5rem)] sm:grid-cols-3 lg:grid-cols-[minmax(220px,1.7fr)_repeat(3,minmax(110px,1fr))_auto] lg:gap-x-[clamp(28px,3vw,56px)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandMark size={24} className="text-white" />
              <span className="text-[19px] font-bold tracking-tight text-white">
                Profluencer
              </span>
            </Link>
            <p className="mt-5 max-w-[300px] text-[14px] leading-relaxed text-white/50">
              The creator growth platform — plan, post and track every platform
              from one workspace.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Follow" links={FOLLOW} />
        </div>

        {/* ── MID: contact · newsletter ────────────────────────────── */}
        <div className="mt-[clamp(2.75rem,5vw,4rem)] flex flex-col gap-[clamp(2.25rem,4vw,3.25rem)] lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-[clamp(0.875rem,1.6vw,1.5rem)]">
            <span className="text-[14px] text-white/50">Contact Us</span>
            <a
              href="mailto:hello@profluencer.com"
              className="self-start text-[clamp(1.55rem,2.5vw,1.95rem)] font-semibold leading-[1.1] text-white underline decoration-[1.5px] underline-offset-[8px] transition-colors hover:text-rose-200 hover:decoration-rose-300"
            >
              hello@profluencer.com
            </a>
          </div>
        </div>

        {/* ── divider ──────────────────────────────────────────────── */}
        <div className="mt-[clamp(3rem,5vw,4.5rem)] h-px bg-white/15" />

        {/* ── oversized brand wordmark ─────────────────────────────── */}
        <div className="py-[clamp(1.6rem,3vw,2.6rem)]">
          <div ref={wordWrapRef} className="w-full">
            <span
              ref={wordRef}
              aria-label="Profluencer"
              className="inline-flex items-start whitespace-nowrap font-sans font-semibold leading-[0.9] tracking-[-0.03em] text-white"
              style={{ fontSize: "140px" }}
            >
              Profluencer
              <BrandMark className="ml-[0.05em] mt-[0.03em] size-[0.4em] shrink-0 text-rose-400" />
            </span>
          </div>
        </div>

        {/* ── legal ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-white/50">
            © 2026 <span className="text-white/75">Profluencer</span>. All rights
            reserved.
          </p>
          <nav className="flex gap-[clamp(20px,2.4vw,36px)]" aria-label="Legal">
            <Link
              href="/privacy"
              className="text-[13px] text-white/50 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[13px] text-white/50 transition-colors hover:text-white"
            >
              Terms of Use
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-[14px] text-white/50">{title}</p>
      <ul className="mt-[22px] space-y-3.5">
        {links.map((l) => (
          <li key={l.label}>
            <FooterLink href={l.href}>{l.label}</FooterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[14px] text-white transition-colors hover:text-white/55"
    >
      {children}
    </Link>
  );
}
