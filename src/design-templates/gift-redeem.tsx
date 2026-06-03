/* Gift & redeem ────────────────────────────────────────────────────────────────
   Gifting surfaces — gift a program to someone, and the redeem-a-code flow that
   unlocks access. Complements `checkout` / `pricing` with the give-and-claim
   path. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Gift, Ticket, ArrowRight, Check, AlertCircle } from "lucide-react";

/* 1 · Gift a program — recipient + message + send. */
export function GiftCard() {
  return (
    <div className="w-[360px] max-w-full rounded-[18px] border border-rose-100 bg-gradient-to-b from-rose-50/60 to-white p-5 shadow-card">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <Gift className="size-5" strokeWidth={1.9} />
        </span>
        <div>
          <h3 className="text-[14.5px] font-bold text-ink-900 leading-tight">Gift this program</h3>
          <div className="text-[12px] text-ink-500">They&apos;ll get instant access</div>
        </div>
      </div>
      <div className="space-y-2 mt-3.5">
        <input
          type="email"
          placeholder="Recipient's email"
          className="w-full h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[13px] outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
        <textarea
          rows={2}
          placeholder="Add a note (optional)"
          defaultValue="Thought you'd love this — happy launching! 🚀"
          className="w-full px-3.5 py-2.5 rounded-[12px] border border-ink-200 bg-white text-[13px] outline-none resize-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
      </div>
      <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-bold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
        Send gift · $49 <ArrowRight className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

/* 2 · Redeem a code — claim flow with a success state. */
export function RedeemCode() {
  return (
    <div className="w-[360px] max-w-full space-y-3">
      <div className="rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2.5">
          <Ticket className="size-4 text-rose-600" strokeWidth={2} />
          <h3 className="text-[14px] font-bold text-ink-900">Have a gift or promo code?</h3>
        </div>
        <div className="flex items-stretch gap-2">
          <input
            defaultValue="GIFT-9F3K"
            className="flex-1 h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white font-mono text-[13px] tracking-wider uppercase outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
          />
          <button type="button" className="inline-flex items-center justify-center h-11 px-4 rounded-[12px] bg-ink-900 text-white text-[13px] font-semibold shrink-0 transition-colors cursor-pointer hover:bg-ink-700 active:bg-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
            Redeem
          </button>
        </div>
      </div>
      {/* Success */}
      <div className="rounded-[14px] bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
        <span className="size-8 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
          <Check className="size-4" strokeWidth={2.6} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-emerald-800">Code applied!</div>
          <div className="text-[12px] text-emerald-700">“Niche Audience” is now unlocked in your library.</div>
        </div>
      </div>
    </div>
  );
}

/* 3 · Error — an invalid / expired code (the error state). */
export function RedeemError() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Ticket className="size-4 text-rose-600" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-ink-900">Have a gift or promo code?</h3>
      </div>
      <div className="flex items-stretch gap-2">
        <input
          defaultValue="EXPIRED-99"
          aria-invalid="true"
          className="flex-1 h-11 px-3.5 rounded-[12px] border border-rose-400 ring-2 ring-rose-100 bg-white font-mono text-[13px] tracking-wider uppercase outline-none"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center h-11 px-4 rounded-[12px] bg-ink-900 text-white text-[13px] font-semibold shrink-0 transition-colors cursor-pointer hover:bg-ink-700 active:bg-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
        >
          Redeem
        </button>
      </div>
      <p className="mt-2 text-[11.5px] text-rose-600 inline-flex items-center gap-1">
        <AlertCircle className="size-3.5 shrink-0" strokeWidth={2} />
        That code has expired or doesn&apos;t exist — double-check and try again.
      </p>
    </div>
  );
}
