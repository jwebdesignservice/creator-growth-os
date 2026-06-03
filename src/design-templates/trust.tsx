/* Trust ───────────────────────────────────────────────────────────────────────
   Reassurance surfaces — money-back guarantee seal, a secure-checkout row, and
   a social-proof trust strip. Reduce friction at checkout / on sales pages.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { ShieldCheck, Lock, RotateCcw, Star, Check } from "lucide-react";

/* 1 · Guarantee seal — money-back badge. */
export function GuaranteeBadge() {
  return (
    <div className="w-[300px] max-w-full rounded-[16px] border border-emerald-200 bg-emerald-50/60 p-5 flex items-center gap-4 shadow-card">
      <span className="size-14 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0 ring-4 ring-emerald-50">
        <RotateCcw className="size-7" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <div className="text-[15px] font-bold text-ink-900">30-day guarantee</div>
        <p className="text-[12.5px] text-ink-500 leading-snug mt-0.5">
          Not for you? Get a full refund within 30 days — no questions asked.
        </p>
      </div>
    </div>
  );
}

/* 2 · Secure-checkout row — payment reassurance. */
export function SecureCheckout() {
  return (
    <div className="w-[380px] max-w-full rounded-[12px] border border-ink-100 bg-cream-50 px-4 py-3">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-700">
        <Lock className="size-4 text-emerald-600" strokeWidth={2} />
        Secure checkout · 256-bit SSL encryption
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        {["Visa", "MC", "Amex", "PayPal"].map((b) => (
          <span key={b} className="h-6 px-2 rounded-[6px] bg-white border border-ink-100 text-[10.5px] font-bold text-ink-500 inline-flex items-center">
            {b}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-ink-400">
          <ShieldCheck className="size-3.5 text-emerald-500" strokeWidth={2} /> Powered by Stripe
        </span>
      </div>
    </div>
  );
}

/* 3 · Trust strip — social proof + rating. */
export function TrustStrip() {
  return (
    <div className="w-[420px] max-w-full rounded-[14px] bg-white border border-ink-100 px-5 py-4 flex items-center gap-5 flex-wrap shadow-card">
      <div className="flex -space-x-2">
        {["bg-rose-200", "bg-amber-200", "bg-emerald-200", "bg-indigo-200"].map((c, i) => (
          <span key={i} className={`size-8 rounded-full border-2 border-white ${c}`} />
        ))}
        <span className="size-8 rounded-full border-2 border-white bg-ink-900 text-cream-50 text-[10px] font-bold inline-flex items-center justify-center">
          12k
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 text-amber-400" fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-[12.5px] font-bold text-ink-900">4.9</span>
        </div>
        <div className="text-[12px] text-ink-500 mt-0.5">Trusted by 12,000+ creators</div>
      </div>
      <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700">
        <Check className="size-3.5" strokeWidth={2.5} /> Verified reviews
      </span>
    </div>
  );
}
