import Link from "next/link";
import { Play, ArrowRight, UserRound, Star } from "lucide-react";
import { Avatar } from "@/components/app-shell/topbar";

type Props = {
  firstName: string;
  plan: "free" | "basic" | "pro";
  profileCompletion: number;
  avatarUrl?: string | null;
};

const PLAN_LABEL: Record<Props["plan"], string> = {
  free: "Free Plan",
  basic: "Basic Plan",
  pro: "Pro Plan",
};

const PLAN_BLURB: Record<Props["plan"], string> = {
  free: "Upgrade anytime to unlock everything.",
  basic: "You're set. Let's build your brand.",
  pro: "You're all set! Let's build your brand.",
};

/**
 * Dashboard top row: welcome hero (left) + "Your Snapshot" card (right).
 */
export function DashboardHero({
  firstName,
  plan,
  profileCompletion,
  avatarUrl,
}: Props) {
  return (
    <div className="grid lg:grid-cols-[1.7fr_1fr] gap-[var(--space-grid-gap)] items-stretch">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 sm:gap-6 items-center">
          <div className="relative z-10 min-w-0">
            <div className="text-rose-600 font-semibold text-[13.5px] mb-2.5 flex items-center gap-2">
              Welcome to Profluencer, {firstName}! <span aria-hidden>👋</span>
            </div>
            <h1 className="font-display text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.08] text-ink-900 mb-3">
              Let&apos;s launch your{" "}
              <span className="text-rose-600">influence</span> journey
            </h1>
            <div className="text-[14.5px] font-semibold text-ink-900">
              Step 1: Start your first program.
            </div>
            <p className="text-ink-500 text-[13.5px] mb-5">
              We&apos;ll guide you step-by-step.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/programs"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14.5px] font-semibold shadow-sm transition-colors"
              >
                <Play className="size-4" fill="currentColor" />
                Start Your First Program
              </Link>
              <Link
                href="/missions"
                className="inline-flex items-center justify-center h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14.5px] font-medium hover:bg-cream-100 transition-colors"
              >
                View Today&apos;s Plan
              </Link>
            </div>
          </div>

          {/* Avatar + star */}
          <div className="relative hidden sm:block shrink-0">
            <div className="size-36 lg:size-40 rounded-full bg-rose-100 ring-[6px] ring-rose-50 overflow-hidden">
              <Avatar name={firstName} src={avatarUrl ?? undefined} size={160} />
            </div>
            <span
              aria-hidden
              className="absolute top-1 right-1 size-7 rounded-full bg-gold-500 text-white inline-flex items-center justify-center ring-4 ring-rose-50"
            >
              <Star className="size-3.5" fill="currentColor" strokeWidth={0} />
            </span>
          </div>
        </div>
      </section>

      {/* ── Your Snapshot ─────────────────────────────────────────────── */}
      <section className="card p-6 flex flex-col">
        <h2 className="text-[15px] font-semibold text-ink-900 mb-4">
          Your Snapshot
        </h2>

        <div className="flex items-start gap-3 mb-5">
          <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <UserRound className="size-[20px]" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-ink-900">
              {PLAN_LABEL[plan]}
            </div>
            <p className="text-[12.5px] text-ink-500 leading-snug">
              {PLAN_BLURB[plan]}
            </p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-ink-900">
              Profile Completion
            </span>
            <span className="text-[13px] font-semibold text-rose-600 tabular-nums">
              {profileCompletion}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-cream-200 overflow-hidden mb-3">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, profileCompletion))}%` }}
            />
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Complete your profile <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}
