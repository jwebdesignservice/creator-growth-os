import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

/**
 * In-shell 404 for any path under the (app) route group. Keeps the
 * sidebar + topbar mounted so the user can navigate away without a
 * full reload.
 */
export const metadata = {
  title: "Page not found · Creator Growth OS",
};

export default function AppNotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-10 max-w-[1240px] mx-auto">
      <div className="text-rose-600 font-semibold text-[12.5px] uppercase tracking-[0.12em] mb-2">
        Error 404
      </div>
      <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-3">
        We couldn&apos;t find that page
      </h1>
      <p className="text-[14.5px] text-ink-500 leading-relaxed mb-8 max-w-[420px]">
        The link may be broken or the content may have moved. Pick a
        section to keep going.
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
          href="/help"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] border border-ink-200 bg-white hover:bg-cream-100 text-ink-900 text-[14px] font-semibold transition-colors"
        >
          <Compass className="size-4" strokeWidth={2} />
          Visit help center
        </Link>
      </div>
    </main>
  );
}
