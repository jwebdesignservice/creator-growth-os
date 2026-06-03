/* Checkout ───────────────────────────────────────────────────────────────────
   Plan-upgrade / billing checkout surfaces — the order summary, a promo-code
   field (entry + applied state), and payment-method selection. These complement
   `invoices` (post-purchase) with the pre-purchase flow. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Tag, Check, CreditCard, Lock, X, Loader2 } from "lucide-react";

/* 1 · Order summary — line items, discount, total, CTA. */
export function OrderSummary() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-[14px] font-bold text-ink-900 mb-4">Order summary</h3>
      <div className="space-y-2.5 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-ink-700">Pro plan · annual</span>
          <span className="text-ink-900 font-medium tabular-nums">$290.00</span>
        </div>
        <div className="flex items-center justify-between text-emerald-700">
          <span className="inline-flex items-center gap-1.5">
            <Tag className="size-3.5" strokeWidth={2} /> CREATOR20
          </span>
          <span className="font-medium tabular-nums">−$58.00</span>
        </div>
        <div className="flex items-center justify-between text-ink-500">
          <span>Tax</span>
          <span className="tabular-nums">$0.00</span>
        </div>
      </div>
      <div className="my-3.5 h-px bg-ink-100" />
      <div className="flex items-end justify-between mb-4">
        <span className="text-[13px] font-semibold text-ink-900">Total due today</span>
        <span className="text-[20px] font-bold text-ink-900 tabular-nums leading-none">$232.00</span>
      </div>
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
      >
        <Lock className="size-3.5" strokeWidth={2} />
        Confirm & pay
      </button>
      <p className="mt-2.5 text-[11px] text-ink-400 text-center">Cancel anytime · billed yearly</p>
    </div>
  );
}

/* 2 · Promo code — entry field + the applied/redeemed state. */
export function PromoCodeField() {
  return (
    <div className="w-[360px] max-w-full space-y-3">
      {/* Entry */}
      <div>
        <label className="block text-[12px] font-medium text-ink-700 mb-1.5">Promo code</label>
        <div className="flex items-stretch gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[13px] text-ink-900 placeholder:text-ink-400 outline-none uppercase tracking-wide focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center h-11 px-4 rounded-[12px] bg-ink-900 text-white text-[13px] font-semibold transition-colors shrink-0 cursor-pointer hover:bg-ink-700 active:bg-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
          >
            Apply
          </button>
        </div>
      </div>
      {/* Applied */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-[12px] bg-emerald-50 border border-emerald-200">
        <span className="size-6 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
          <Check className="size-3.5" strokeWidth={2.6} />
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-emerald-800">CREATOR20 applied</span>
          <span className="text-[12px] text-emerald-700"> · 20% off</span>
        </div>
        <button type="button" aria-label="Remove code" className="size-6 inline-flex items-center justify-center rounded-full text-emerald-600 cursor-pointer transition-colors hover:bg-emerald-100 active:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
          <X className="size-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

/* 3 · Payment method selection — saved card + add-new radio rows. */
export function PaymentMethodSelect() {
  return (
    <div className="w-[380px] max-w-full rounded-[16px] border border-ink-100 bg-white p-3 space-y-2 shadow-card">
      {/* Selected */}
      <label className="flex items-center gap-3 p-3 rounded-[12px] border border-rose-300 ring-2 ring-rose-100 bg-rose-50/40 cursor-pointer">
        <span className="size-4 rounded-full border-[5px] border-rose-600 bg-white shrink-0" />
        <span className="size-9 rounded-[8px] bg-ink-900 text-white inline-flex items-center justify-center shrink-0">
          <CreditCard className="size-4" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink-900">Visa ending 6411</div>
          <div className="text-[11.5px] text-ink-400">Expires 09/27</div>
        </div>
        <span className="text-[11px] font-semibold text-rose-600">Default</span>
      </label>
      {/* Unselected */}
      <label className="flex items-center gap-3 p-3 rounded-[12px] border border-ink-100 hover:bg-cream-50 cursor-pointer transition-colors">
        <span className="size-4 rounded-full border-2 border-ink-300 bg-white shrink-0" />
        <span className="size-9 rounded-[8px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
          <CreditCard className="size-4" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0 text-[13px] font-medium text-ink-700">Add a new card</div>
      </label>
    </div>
  );
}

/* 4 · Processing — payment in flight; the CTA is busy + disabled. */
export function OrderProcessing() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-[14px] font-bold text-ink-900 mb-4">Order summary</h3>
      <div className="space-y-2.5 text-[13px] opacity-60 select-none" aria-hidden>
        <div className="flex items-center justify-between">
          <span className="text-ink-700">Pro plan · annual</span>
          <span className="text-ink-900 font-medium tabular-nums">$290.00</span>
        </div>
        <div className="flex items-center justify-between text-emerald-700">
          <span className="inline-flex items-center gap-1.5">
            <Tag className="size-3.5" strokeWidth={2} /> CREATOR20
          </span>
          <span className="font-medium tabular-nums">−$58.00</span>
        </div>
      </div>
      <div className="my-3.5 h-px bg-ink-100" />
      <div className="flex items-end justify-between mb-4">
        <span className="text-[13px] font-semibold text-ink-900">Total due today</span>
        <span className="text-[20px] font-bold text-ink-900 tabular-nums leading-none">$232.00</span>
      </div>
      <button
        type="button"
        disabled
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-semibold opacity-90 cursor-wait"
      >
        <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
        Processing payment…
      </button>
      <p className="mt-2.5 text-[11px] text-ink-400 text-center">Please don&apos;t close this window.</p>
    </div>
  );
}
