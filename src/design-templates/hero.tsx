/* Hero ─────────────────────────────────────────────────────────────────────
   The dashboard welcome hero (gradient banner, split-colour title, CTAs,
   avatar) and its companion "snapshot" card — the warm first impression at
   the top of the learner home.
   ───────────────────────────────────────────────────────────────────── */

import { Play, ArrowRight, Star, UserRound } from "lucide-react";

const FOCUS_LIGHT =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50";

export function WelcomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-ink-100 bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 p-8 w-[640px] max-w-full">
      <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="relative z-10 min-w-0">
          <div className="text-rose-600 font-semibold text-[13.5px] mb-2.5">Welcome back, Jack! 👋</div>
          <h1 className="text-h2 text-ink-900 mb-3">
            Let&apos;s continue your <span className="text-rose-600">influence</span> journey
          </h1>
          <div className="text-[14.5px] font-semibold text-ink-900">Creator Launchpad · 68% complete</div>
          <p className="text-ink-500 text-[13.5px] mb-5">Pick up right where you left off.</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[14.5px] font-semibold shadow-sm cursor-pointer transition-colors ${FOCUS_LIGHT}`}
            >
              <Play className="size-4" fill="currentColor" />
              Continue Program
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center h-12 px-6 rounded-[14px] bg-white border border-ink-200 hover:bg-cream-100 active:bg-cream-200 text-ink-900 text-[14.5px] font-medium cursor-pointer transition-colors ${FOCUS_LIGHT}`}
            >
              View Today&apos;s Plan
            </button>
          </div>
        </div>
        <div className="relative hidden sm:block shrink-0">
          <div className="size-32 rounded-full bg-rose-200 ring-[6px] ring-rose-50 inline-flex items-center justify-center text-rose-700 text-[34px] font-bold">JW</div>
          <span aria-hidden className="absolute top-1 right-1 size-7 rounded-full bg-gold-500 text-white inline-flex items-center justify-center ring-4 ring-rose-50">
            <Star className="size-3.5" fill="currentColor" strokeWidth={0} />
          </span>
        </div>
      </div>
    </section>
  );
}

export function SnapshotCard() {
  const completion = 68;
  return (
    <section className="card p-6 w-[300px] max-w-full flex flex-col">
      <h2 className="text-[15px] font-semibold text-ink-900 mb-4">Your Snapshot</h2>
      <div className="flex items-start gap-3 mb-5">
        <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <UserRound className="size-[20px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-ink-900">Pro Plan</div>
          <p className="text-[12.5px] text-ink-500 leading-snug">You&apos;re all set! Let&apos;s build your brand.</p>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-ink-900">Profile Completion</span>
          <span className="text-[13px] font-semibold text-rose-600 tabular-nums">{completion}%</span>
        </div>
        <div role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-cream-200 overflow-hidden mb-3">
          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${completion}%` }} />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600 hover:text-rose-700 rounded-[6px] px-0.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          Complete your profile <ArrowRight className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
