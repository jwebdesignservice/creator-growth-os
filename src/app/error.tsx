"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Root error boundary — Next.js renders this when a server/client error
 * bubbles past every nested boundary. Must be a client component.
 *
 * Logs to the console so the user can paste the digest into a support
 * ticket if they hit a repeat. Hooks straight into Sentry / Vercel
 * runtime logs when those are configured.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream-100 px-6 py-10">
      <div className="w-full max-w-[480px] text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center mb-6"
        >
          <BrandMark size={56} />
        </Link>

        <div className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-[12.5px] uppercase tracking-[0.12em] mb-2">
          <AlertTriangle className="size-3.5" strokeWidth={2.5} />
          Unexpected error
        </div>

        <h1 className="text-h1 text-ink-900 leading-tight mb-3">
          Something went wrong
        </h1>

        <p className="text-[14.5px] text-ink-500 leading-relaxed mb-6 max-w-[380px] mx-auto">
          We hit a bump on our end. Try the action again — and if it keeps
          happening, our support team will sort it out fast.
        </p>

        {error.digest && (
          <div className="inline-block bg-white border border-ink-100 rounded-[10px] px-3 py-1.5 text-[11.5px] font-mono text-ink-500 mb-6">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="size-4" strokeWidth={2.5} />
            Try again
          </button>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] border border-ink-200 bg-white hover:bg-cream-100 text-ink-900 text-[14px] font-semibold transition-colors"
          >
            Contact support
          </Link>
        </div>

        <div className="mt-12 text-[12px] text-ink-500">{BRAND_NAME}</div>
      </div>
    </main>
  );
}
