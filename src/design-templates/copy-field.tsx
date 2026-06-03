/* Copy & share ───────────────────────────────────────────────────────────────
   Share affordances — the referral-link field and an invite/promo code with
   copy / share actions (Invites / referrals). The OTP / email-verification
   input lives in the `verification` category. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Copy, Check, Gift, Share2, Link2 } from "lucide-react";

// Shared button states so copy / share read consistently with the rest of the system.
const PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-rose-600 text-white font-semibold cursor-pointer transition-colors hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2";
const SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-white border border-ink-200 text-ink-700 font-semibold cursor-pointer transition-colors hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2";

/* 1 · Referral-link field — read-only URL + copy button. */
export function CopyLinkField() {
  return (
    <div className="w-[420px] max-w-full">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">Your referral link</label>
      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 rounded-[12px] border border-ink-200 bg-cream-50">
          <Link2 className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
          <span className="text-[13px] text-ink-700 truncate">profluencer.app/r/yourcreator</span>
        </div>
        <button type="button" className={`${PRIMARY} h-11 px-4 text-[13px] shrink-0`}>
          <Copy className="size-4" strokeWidth={2} />
          Copy
        </button>
      </div>
      <p className="mt-1.5 text-[11.5px] text-ink-400">Earn 1 month free for every creator who joins.</p>
    </div>
  );
}

/* 2 · Invite / promo code — large code with copy (shown in its "copied" state) + share. */
export function InviteCodeField() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 text-center shadow-card">
      <span className="mx-auto size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Gift className="size-5" strokeWidth={1.9} />
      </span>
      <div className="text-[12px] text-ink-500 mb-1.5">Your invite code</div>
      <div className="inline-flex items-center gap-2 px-4 h-11 rounded-[12px] bg-cream-100 border border-dashed border-ink-300">
        <span className="text-[18px] font-bold tracking-[0.15em] text-ink-900 tabular-nums">PROFLU-8K2D</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {/* Copied — the success/confirmed state of the copy action */}
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
        >
          <Check className="size-4" strokeWidth={2.4} />
          Copied
        </button>
        <button type="button" className={`${SECONDARY} flex-1 h-10 text-[13px]`}>
          <Share2 className="size-4" strokeWidth={2} />
          Share
        </button>
      </div>
    </div>
  );
}
