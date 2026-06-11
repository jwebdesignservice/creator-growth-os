import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Root-level 404. Catches anything that doesn't match a route — invalid
 * URLs, deleted media kit slugs, hand-typed mistakes. Branded so users
 * see a friendly Profluencer page instead of Next.js's default
 * "404 — This page could not be found" on a white background.
 */
export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-6 py-10">
      <div className="w-full max-w-[480px] text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center mb-6"
        >
          <BrandMark size={56} />
        </Link>

        <div className="text-rose-600 font-semibold text-[12.5px] uppercase tracking-[0.12em] mb-2">
          Error 404
        </div>

        <h1 className="text-h1 text-ink-900 leading-tight mb-3">
          Page not found
        </h1>

        <p className="text-[14.5px] text-ink-500 leading-relaxed mb-8 max-w-[380px] mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold shadow-sm transition-colors"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Back to dashboard
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] border border-ink-200 bg-white hover:bg-cream-100 text-ink-900 text-[14px] font-semibold transition-colors"
          >
            <Compass className="size-4" strokeWidth={2} />
            Visit support center
          </Link>
        </div>

        <div className="mt-12 text-[12px] text-ink-500">{BRAND_NAME}</div>
      </div>
    </main>
  );
}
