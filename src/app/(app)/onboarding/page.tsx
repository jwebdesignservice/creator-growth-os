import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

export const metadata = { title: "Welcome · Creator Growth OS" };

export default function OnboardingPage() {
  return (
    <div className="max-w-[760px] mx-auto">
      <header className="mb-6">
        <span className="chip chip-rose mb-3">Welcome 👋</span>
        <h1 className="font-display text-[44px] text-ink-900 leading-tight mb-2">
          Welcome to Creator Growth OS
        </h1>
        <p className="text-ink-500 text-[14.5px]">
          A 60-second quiz personalizes your dashboard, programs and posting plan.
        </p>
      </header>

      <div className="card p-10 text-center">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4">
          <Construction className="size-6" strokeWidth={1.8} />
        </div>
        <h2 className="font-display text-2xl text-ink-900 mb-2">
          Onboarding quiz coming next
        </h2>
        <p className="text-ink-500 text-[14px] max-w-md mx-auto mb-6">
          The 8-step quiz (platform, follower base, niche, main goal, bottleneck, time per week, content frequency, monetization status) will land in the next build phase.
          For now you&apos;ll start as a <span className="font-medium text-ink-900">Growth Creator</span> on the <span className="font-medium text-ink-900">Basic</span> preview.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors"
        >
          Continue to Dashboard <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
