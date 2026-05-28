import Link from "next/link";
import { Lock, ArrowRight, Sparkles } from "lucide-react";

/**
 * Full-width locked state shown when a gated user reaches a program /
 * lesson / tutorial directly (server-enforced). Soft lock: informative,
 * with a clear path back to the Start Here onboarding.
 */
export function OnboardingLockedNotice({
  percent = 0,
  programSlug = "start-here",
  kind = "content",
}: {
  percent?: number;
  programSlug?: string;
  kind?: "program" | "lesson" | "tutorial" | "content";
}) {
  const pct = Math.min(100, Math.max(0, percent));
  return (
    <section className="card p-8 sm:p-10 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4 mx-auto">
        <Lock className="size-6" strokeWidth={1.9} aria-hidden />
      </div>
      <h2 className="text-h4 sm:text-[22px] text-ink-900 mb-2">
        Complete &ldquo;Start Here&rdquo; to unlock this {kind}
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-5 leading-relaxed">
        Finish your <span className="font-semibold text-ink-700">Start Here</span>{" "}
        onboarding to unlock the full platform — every program and tutorial.
        You&apos;re {pct}% of the way there.
      </p>

      <div className="max-w-xs mx-auto mb-6">
        <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11.5px] text-ink-500 tabular-nums">
          {pct}% complete
        </div>
      </div>

      <Link
        href={`/programs/${programSlug}`}
        className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
      >
        <Sparkles className="size-4" strokeWidth={2} fill="currentColor" aria-hidden />
        Continue Start Here
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
      </Link>
    </section>
  );
}
