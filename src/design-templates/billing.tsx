/* Billing ───────────────────────────────────────────────────────────────
   Billing & subscription surfaces: the current-plan summary card, the
   "Unlock Pro" upgrade accent card, and a saved payment-method row. Pure
   presentational mirrors of src/app/(app)/billing/* and the Pro-upgrade
   accents used across the app.
   ───────────────────────────────────────────────────────────────────── */

import { Crown, Sparkles, CreditCard, Check, ArrowRight, Pencil } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Current plan — active subscription summary with status + manage actions.
// ─────────────────────────────────────────────────────────────────────────────

export function CurrentPlanCard() {
  return (
    <div className="card p-6 w-[440px] max-w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Crown className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-ink-900 leading-tight">Pro Plan</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10.5px] font-bold">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            </div>
            <p className="text-[12.5px] text-ink-500 mt-0.5">Renews June 24, 2026</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[24px] font-bold text-ink-900 leading-none tabular-nums">$29</div>
          <div className="text-[11.5px] text-ink-500 mt-0.5">/ month</div>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {["All programs unlocked", "Scale & Automate track", "Content review", "Priority support"].map((f) => (
          <li key={f} className="flex items-center gap-2 text-[12.5px] text-ink-700">
            <span className="size-4 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-2.5">
        <span className="inline-flex items-center h-10 px-4 rounded-[12px] bg-rose-600 text-white text-[13px] font-semibold">
          Manage subscription
        </span>
        <span className="inline-flex items-center h-10 px-4 rounded-[12px] border border-ink-200 text-ink-700 text-[13px] font-semibold">
          Change plan
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade accent — the rose "Unlock the Pro track" promotional card.
// ─────────────────────────────────────────────────────────────────────────────

export function UpgradeProCard() {
  return (
    <div className="rounded-[16px] bg-rose-50/80 border border-rose-100 p-5 flex flex-col w-[300px] max-w-full">
      <Sparkles className="size-5 text-rose-500 mb-3" strokeWidth={2} />
      <h3 className="text-h4 text-ink-900 leading-tight mb-2">Unlock the Pro track</h3>
      <p className="text-[13px] text-ink-700 leading-snug mb-4 flex-1">
        Pro unlocks <span className="font-semibold">Scale &amp; Automate</span>, the
        Monetization Path, content review and bonus modules in every program.
      </p>
      <span className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[12px] bg-rose-600 text-white text-[14px] font-medium">
        Upgrade to Pro <ArrowRight className="size-4" strokeWidth={2} />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment method — saved card row with brand, last four, expiry, edit.
// ─────────────────────────────────────────────────────────────────────────────

export function PaymentMethodRow() {
  return (
    <div className="card p-4 w-[440px] max-w-full">
      <div className="flex items-center gap-3.5">
        <span className="size-10 rounded-[10px] bg-ink-900 text-white inline-flex items-center justify-center shrink-0">
          <CreditCard className="size-[18px]" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-ink-900">Visa •••• 4242</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cream-100 text-ink-500 text-[10px] font-semibold uppercase tracking-wide">
              Default
            </span>
          </div>
          <div className="text-[12px] text-ink-500">Expires 08 / 2027</div>
        </div>
        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 text-[12.5px] font-semibold text-ink-700 shrink-0">
          <Pencil className="size-3.5" strokeWidth={2} /> Edit
        </span>
      </div>
    </div>
  );
}
