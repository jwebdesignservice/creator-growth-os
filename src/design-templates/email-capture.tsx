/* Email capture ───────────────────────────────────────────────────────────────
   Audience-building surfaces — inline newsletter signup, a lead-magnet card,
   and a waitlist form with social proof. How creators grow their email list.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Mail, Download, Sparkles, ArrowRight, Check, CheckCircle2 } from "lucide-react";

/* 1 · Inline newsletter signup. */
export function NewsletterSignup() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="size-4 text-rose-600" strokeWidth={2} />
        <h3 className="text-[14.5px] font-bold text-ink-900">Weekly creator tips</h3>
      </div>
      <p className="text-[12.5px] text-ink-500 mb-3.5">One actionable growth idea every Sunday. No spam.</p>
      <div className="flex items-stretch gap-2">
        <input
          type="email"
          placeholder="you@email.com"
          className="flex-1 h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[13px] text-ink-900 placeholder:text-ink-400 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
        <button type="button" className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] bg-rose-600 text-white text-[13px] font-semibold shrink-0 transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          Subscribe
        </button>
      </div>
    </div>
  );
}

/* 2 · Lead-magnet card — free download in exchange for an email. */
export function LeadMagnet() {
  return (
    <div className="w-[340px] max-w-full rounded-[18px] border border-rose-100 bg-rose-50/50 p-5 text-center shadow-card">
      <span className="mx-auto size-14 rounded-[16px] bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Download className="size-7" strokeWidth={1.8} />
      </span>
      <h3 className="text-[15px] font-bold text-ink-900">The Hook Vault (free)</h3>
      <p className="text-[12.5px] text-ink-500 mt-1 leading-relaxed">
        50 proven hook templates you can swipe for your next 10 videos.
      </p>
      <div className="mt-4 space-y-2">
        <input
          type="email"
          placeholder="Where should we send it?"
          className="w-full h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[13px] text-center outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
        <button type="button" className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-bold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          <Sparkles className="size-4" strokeWidth={2} /> Send me the vault
        </button>
      </div>
    </div>
  );
}

/* 3 · Waitlist — join + social proof + success row. */
export function WaitlistForm() {
  return (
    <div className="w-[400px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-[15px] font-bold text-ink-900">Join the waitlist</h3>
      <p className="text-[12.5px] text-ink-500 mt-0.5 mb-3.5">Be first in when the next cohort opens.</p>
      <div className="flex items-stretch gap-2 mb-3">
        <input
          type="email"
          defaultValue="creator@studio.com"
          className="flex-1 h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[13px] outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
        <button type="button" className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] bg-ink-900 text-white text-[13px] font-semibold shrink-0 transition-colors cursor-pointer hover:bg-ink-700 active:bg-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          Join <ArrowRight className="size-3.5" strokeWidth={2.4} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
          <Check className="size-3.5" strokeWidth={2.5} /> 1,240 creators
        </span>
        already on the list
      </div>
    </div>
  );
}

/* 4 · Subscribed — the success state after signing up. */
export function NewsletterSubscribed() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-emerald-200 bg-emerald-50/50 p-5 flex items-center gap-3.5 shadow-card">
      <span className="size-11 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
        <CheckCircle2 className="size-6" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <h3 className="text-[14.5px] font-bold text-ink-900">You&apos;re subscribed! 🎉</h3>
        <p className="text-[12.5px] text-ink-500 mt-0.5 leading-relaxed">
          Check your inbox to confirm — your first growth tip lands this Sunday.
        </p>
      </div>
    </div>
  );
}
