"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Route-segment error boundary for /dev/support.

   Next.js renders this when an uncaught error escapes the server component.
   Without it, the user sees a plain "Internal Server Error" with zero
   debugging info — this surfaces the actual message + digest so operators
   can act, and offers a one-click retry.

   Also acts as a safety net: a single failing query in the page won't
   take the whole dev console down anymore.
   ───────────────────────────────────────────────────────────────────────── */

export default function DevSupportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side digest links the message to the server log line.
    console.error("[/dev/support] render error:", error);
  }, [error]);

  return (
    <div className="space-y-5">
      <div className="dev-card p-6 flex flex-col items-start gap-4">
        <span className="inline-flex items-center justify-center size-10 rounded-full bg-[var(--dev-danger-soft)] border border-[var(--dev-danger-border)]">
          <AlertOctagon className="size-5 text-[var(--dev-danger-text)]" strokeWidth={1.9} />
        </span>

        <div className="space-y-1">
          <h2 className="text-[16px] font-semibold text-[var(--dev-text-primary)]">
            Support page failed to render
          </h2>
          <p className="text-[13px] text-[var(--dev-text-secondary)] max-w-[60ch]">
            One of the data-fetching steps threw an uncaught error. The page
            has been isolated so the rest of the dev console still works.
          </p>
        </div>

        <pre className="w-full max-w-full overflow-x-auto rounded-[10px] bg-[var(--dev-sidebar-bg)] border border-[var(--dev-border)] p-3 text-[12px] font-mono text-[var(--dev-danger-text)] whitespace-pre-wrap">
          {error.message || "Unknown error"}
          {error.digest && (
            <>
              {"\n\n"}
              <span className="text-[var(--dev-text-muted)]">
                digest: {error.digest}
              </span>
            </>
          )}
        </pre>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
          >
            <RotateCcw className="size-3.5" strokeWidth={2} />
            Try again
          </button>
          <a
            href="/dev"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
          >
            Back to overview
          </a>
        </div>

        <p className="text-[11.5px] text-[var(--dev-text-muted)]">
          Most likely cause: one of the support migrations (0013, 0016, 0017,
          0018) has not been applied to the connected Supabase instance, or
          the <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> env
          var is missing. Check the server log line above for the exact query
          that failed.
        </p>
      </div>
    </div>
  );
}
