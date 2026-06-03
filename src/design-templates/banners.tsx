/* Banners ─────────────────────────────────────────────────────────────────
   Strip-style banners (distinct from the card-style banner in Feedback) —
   a sticky announcement bar, a pinned-message strip, and a subtle info
   banner. Full-width strips that sit above content.
   ───────────────────────────────────────────────────────────────────── */

import { Sparkles, X, Pin, ShieldCheck, ArrowRight } from "lucide-react";

// On the saturated rose bar, the focus ring is white with a rose offset.
const ON_ROSE =
  "cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600";

export function AnnouncementBar() {
  return (
    <div className="w-[600px] max-w-full flex items-center gap-3 rounded-[12px] bg-rose-600 text-white px-4 py-2.5">
      <Sparkles className="size-4 shrink-0" strokeWidth={2} />
      <p className="text-[13px] font-medium flex-1 min-w-0">New: AI hook suggestions are live for Pro members.</p>
      <button type="button" className={`inline-flex items-center gap-1 text-[12.5px] font-semibold underline underline-offset-2 shrink-0 rounded-[6px] px-0.5 ${ON_ROSE}`}>
        Try it <ArrowRight className="size-3.5" strokeWidth={2} />
      </button>
      <button type="button" aria-label="Dismiss" className={`size-6 rounded-full inline-flex items-center justify-center hover:bg-white/20 shrink-0 ${ON_ROSE}`}>
        <X className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function PinnedBanner() {
  return (
    <div className="w-[460px] max-w-full border border-amber-100 bg-amber-50/60 rounded-[12px] px-4 py-2.5">
      <div className="flex items-start gap-2">
        <Pin className="size-3.5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[12.5px] text-ink-700 leading-snug truncate">
            <span className="font-semibold text-ink-900">Jack:</span> Welcome! Read the pinned guide before posting 📌
          </div>
          <div className="text-[12.5px] text-ink-700 leading-snug truncate">
            <span className="font-semibold text-ink-900">Amelia:</span> Office hours every Friday at 3pm.
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfoBanner() {
  return (
    <div className="w-[460px] max-w-full flex items-center gap-3 rounded-[12px] bg-rose-50/60 border border-rose-100 px-4 py-3">
      <ShieldCheck className="size-4 text-rose-500 shrink-0" strokeWidth={2} />
      <p className="text-[12.5px] text-ink-700 leading-snug">
        Your data is private — only you can see your draft posts and notes.
      </p>
    </div>
  );
}
