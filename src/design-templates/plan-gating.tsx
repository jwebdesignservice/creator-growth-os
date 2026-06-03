/* Plan gating ──────────────────────────────────────────────────────────────
   Monetization / paywall surfaces — how the app gates features behind a plan
   tier (Free / Basic / Pro). Locked KPI tiles, a blur-paywall overlay, and the
   upgrade-prompt card. Presentational; live equivalents live across
   components/performance/kpi-tiles.tsx and the billing upsells.
   ───────────────────────────────────────────────────────────────────────── */

import { Lock, Sparkles, Crown, ArrowRight, Check } from "lucide-react";

/* 1 · A KPI tile locked behind Pro — value hidden, lock + plan pill. */
export function LockedKpiTile() {
  return (
    <div className="w-[230px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 relative overflow-hidden shadow-card">
      <div className="flex items-center justify-between mb-3">
        <span className="size-9 rounded-[10px] bg-cream-100 text-ink-400 inline-flex items-center justify-center">
          <Lock className="size-[18px]" strokeWidth={1.9} />
        </span>
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-bold uppercase tracking-wide">
          <Crown className="size-3" strokeWidth={2} fill="currentColor" />
          Pro
        </span>
      </div>
      <div className="text-[12px] text-ink-500">Revenue</div>
      <div className="mt-1 h-7 w-24 rounded-md bg-cream-200/80 blur-[2px]" aria-hidden />
      <div className="mt-2.5 text-[11.5px] text-rose-600 font-medium">
        Upgrade to unlock
      </div>
    </div>
  );
}

/* 2 · Paywall overlay — gated content blurred behind a centered upgrade card. */
export function PaywallOverlay() {
  return (
    <div className="w-[420px] max-w-full relative rounded-[16px] border border-ink-100 bg-white overflow-hidden shadow-card">
      {/* Blurred faux content */}
      <div className="p-5 blur-[3px] select-none pointer-events-none" aria-hidden>
        <div className="h-3 w-28 rounded bg-ink-200 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-[10px] bg-cream-100 border border-ink-100" />
          ))}
        </div>
        <div className="mt-4 h-24 rounded-[10px] bg-cream-100 border border-ink-100" />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
        <div className="text-center px-6">
          <span className="mx-auto size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
            <Lock className="size-6" strokeWidth={1.9} />
          </span>
          <div className="text-[15px] font-bold text-ink-900">Revenue tracking is a Pro feature</div>
          <p className="text-[12.5px] text-ink-500 mt-1 max-w-[34ch] mx-auto leading-relaxed">
            Upgrade to see weekly income and brand-deal revenue alongside your growth.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
          >
            <Sparkles className="size-4" strokeWidth={2} />
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

/* 3 · Upgrade-prompt card — the rose upsell with benefits + CTA. */
export function UpgradeCard() {
  const benefits = ["Revenue & brand-deal tracking", "Unlimited programs", "Priority coach replies"];
  return (
    <div className="w-[320px] max-w-full rounded-[16px] bg-rose-50/80 border border-rose-100 p-5 shadow-card">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
        <span className="text-[13.5px] font-bold text-ink-900">Unlock Pro</span>
      </div>
      <p className="text-[12.5px] text-ink-700 leading-snug mb-3">
        Get the full creator toolkit and grow without limits.
      </p>
      <ul className="space-y-1.5 mb-4">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-2 text-[12.5px] text-ink-700">
            <span className="size-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
      >
        Upgrade to Pro
        <ArrowRight className="size-3.5" strokeWidth={2.4} />
      </button>
    </div>
  );
}
