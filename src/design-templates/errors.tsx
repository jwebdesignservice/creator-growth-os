/* Errors ─────────────────────────────────────────────────────────────────
   Error & off-happy-path states — a 404 page, an inline error with retry,
   and a maintenance screen. The app-wide error language (rose/cream).
   ───────────────────────────────────────────────────────────────────── */

import { House, RefreshCw, Wrench, TriangleAlert } from "lucide-react";

export function NotFoundState() {
  return (
    <div className="w-[460px] max-w-full card p-10 flex flex-col items-center text-center">
      <div className="text-[64px] font-bold text-rose-600 leading-none">404</div>
      <h3 className="text-h4 text-ink-900 mt-3">Page not found</h3>
      <p className="text-[13px] text-ink-500 mt-1 leading-snug max-w-[40ch]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex items-center gap-2 mt-5">
        <button
          type="button"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
        >
          <House className="size-4" strokeWidth={2} />
          Back home
        </button>
        <button
          type="button"
          className="inline-flex items-center h-10 px-4 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13px] font-medium transition-colors"
        >
          Contact support
        </button>
      </div>
    </div>
  );
}

export function InlineError() {
  return (
    <div className="w-[460px] max-w-full rounded-[14px] border border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
      <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <TriangleAlert className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-bold text-ink-900">Couldn&apos;t load your analytics</h3>
        <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
          Something went wrong fetching your data. Check your connection and try again.
        </p>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
        >
          <RefreshCw className="size-3.5" strokeWidth={2} />
          Retry
        </button>
      </div>
    </div>
  );
}

export function MaintenanceState() {
  return (
    <div className="w-[460px] max-w-full card p-10 flex flex-col items-center text-center">
      <span className="size-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
        <Wrench className="size-7" strokeWidth={1.8} />
      </span>
      <h3 className="text-h4 text-ink-900">Down for maintenance</h3>
      <p className="text-[13px] text-ink-500 mt-1 leading-snug max-w-[42ch]">
        We&apos;re shipping an upgrade and will be back shortly. Thanks for your patience!
      </p>
      <span className="chip bg-amber-100 text-amber-700 mt-4">Est. 15 minutes</span>
    </div>
  );
}
