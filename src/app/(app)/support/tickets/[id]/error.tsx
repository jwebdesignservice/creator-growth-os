"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, ArrowLeft, LifeBuoy } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Route-segment error boundary for /support/tickets/[id].

   Without this, any uncaught error during render bubbles up to the global
   app error boundary and the user sees the generic "Something went wrong"
   page with only an opaque error ID. This surfaces the actual message +
   digest so we can act on it, while keeping the surrounding shell intact.

   Pairs with /support/tickets/[id]/not-found.tsx for the empty case.
   ───────────────────────────────────────────────────────────────────────── */

export default function TicketDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side digest links the message to the server log line so
    // the operator can trace the actual stack.
    console.error("[/support/tickets/[id]] render error:", error);
  }, [error]);

  return (
    <div className="max-w-[var(--container-content)] space-y-5">
      <Link
        href="/support/tickets"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-rose-700 transition-colors"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
        All tickets
      </Link>

      <div className="card p-6 sm:p-7 flex flex-col items-start gap-4">
        <span className="inline-flex items-center justify-center size-11 rounded-full bg-rose-100 text-rose-700">
          <AlertOctagon className="size-5" strokeWidth={1.9} aria-hidden />
        </span>

        <div className="space-y-1.5">
          <h2 className="text-h4 text-ink-900">
            We couldn&rsquo;t load this ticket
          </h2>
          <p className="text-[13.5px] text-ink-500 max-w-[60ch] leading-relaxed">
            Something went wrong while rendering this page. Your ticket itself
            is safe — this is only a display issue. Try again, or head back to
            your tickets list and re-open it.
          </p>
        </div>

        <pre className="w-full max-w-full overflow-x-auto rounded-[10px] bg-cream-100 border border-ink-100 p-3 text-[12px] font-mono text-rose-700 whitespace-pre-wrap">
          {error.message || "Unknown error"}
          {error.digest && (
            <>
              {"\n\n"}
              <span className="text-ink-400">digest: {error.digest}</span>
            </>
          )}
        </pre>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
            Try again
          </button>
          <Link
            href="/support/tickets"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-white border border-ink-200 hover:bg-cream-100 text-ink-700 text-[13px] font-semibold transition-colors"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
            Back to tickets
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-[13px] font-semibold text-ink-500 hover:text-ink-900 hover:bg-cream-100 transition-colors"
          >
            <LifeBuoy className="size-3.5" strokeWidth={2} aria-hidden />
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
