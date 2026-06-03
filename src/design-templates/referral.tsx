/* Referral ────────────────────────────────────────────────────────────────
   Invite & earn surfaces — a referral card (code + copy + earned) and a
   reward-tier progress track. Grounded in the referrals feature
   (src/lib/referrals, settings/referrals).
   ───────────────────────────────────────────────────────────────────── */

import { Gift, Copy, Check, Users } from "lucide-react";
import { cn } from "@/lib/cn";

export function ReferralCard() {
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Gift className="size-5" strokeWidth={1.9} />
        </span>
        <div>
          <h3 className="text-h5 text-ink-900 leading-tight">Invite &amp; earn</h3>
          <p className="text-[12.5px] text-ink-500">Give a free month, get a free month.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-[12px] border border-dashed border-ink-200 bg-cream-50 p-2 pl-3.5">
        <span className="flex-1 text-[14px] font-semibold text-ink-900 tracking-wide truncate">profluencer.app/r/JACK24</span>
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold shrink-0">
          <Copy className="size-3.5" strokeWidth={2} />
          Copy
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-4 text-[12.5px] text-ink-500">
        <Users className="size-4 text-ink-400" strokeWidth={2} />
        8 friends invited ·<span className="text-emerald-700 font-semibold">2 months earned</span>
      </div>
    </div>
  );
}

export function ReferralTiers() {
  const tiers = [
    { n: 1, label: "1 month free", done: true },
    { n: 3, label: "Pro upgrade", done: true },
    { n: 5, label: "$50 payout", done: false },
    { n: 10, label: "Lifetime Pro", done: false },
  ];
  const current = 3;
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-bold text-ink-900">Referral rewards</h3>
        <span className="text-[12px] text-ink-500 tabular-nums">{current}/10 invited</span>
      </div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-cream-200" />
        <div className="absolute left-0 top-3 h-0.5 bg-rose-500" style={{ width: `${(current / 10) * 100}%` }} />
        <div className="relative flex justify-between">
          {tiers.map((t) => (
            <div key={t.n} className="flex flex-col items-center gap-1.5 w-16">
              <span className={cn("size-6 rounded-full inline-flex items-center justify-center text-[11px] font-bold", t.done ? "bg-rose-500 text-white" : "bg-white border-2 border-ink-200 text-ink-400")}>
                {t.done ? <Check className="size-3.5" strokeWidth={3} /> : t.n}
              </span>
              <span className={cn("text-[10.5px] text-center leading-tight", t.done ? "text-ink-900 font-medium" : "text-ink-400")}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
