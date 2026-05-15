import Link from "next/link";
import { Play } from "lucide-react";
import { Avatar } from "@/components/app-shell/topbar";

type Props = {
  firstName: string;
  coachName?: string;
};

export function DashboardHero({ firstName, coachName = "Sophie" }: Props) {
  return (
    <section className="rounded-[24px] bg-cream-200 overflow-hidden relative">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 p-8 lg:p-10">
        {/* Left text block */}
        <div className="max-w-xl relative z-10">
          <div className="text-rose-600 font-medium text-[14px] mb-3 flex items-center gap-2">
            Welcome back, {firstName}! <span aria-hidden>👋</span>
          </div>
          <h1 className="font-display text-4xl lg:text-[44px] leading-[1.1] text-ink-900 mb-4">
            Let&apos;s turn your influence
            <br />
            into impact and income.
          </h1>
          <p className="text-ink-500 text-[14.5px] max-w-md mb-7 leading-relaxed">
            Follow your personalized plan, stay consistent, and grow your brand
            with confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-medium shadow-sm transition-colors"
            >
              <Play className="size-4" fill="currentColor" />
              Continue Learning
            </Link>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center h-12 px-7 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[15px] font-medium hover:bg-cream-100 transition-colors"
            >
              View My Plan
            </Link>
          </div>
        </div>

        {/* Right coach illustration */}
        <div className="relative hidden lg:block">
          <div className="absolute -top-2 left-0 font-script text-[22px] text-rose-600 leading-[1.1] rotate-[-3deg]">
            Your Coach,
            <br />
            <span className="ml-6">{coachName}</span>
            <span className="text-rose-500 ml-1">♥</span>
          </div>

          {/* Decorative dots */}
          <DotCluster />

          {/* Coach photo placeholder — a soft cream/rose circle with a large avatar */}
          <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-rose-100/70 flex items-end justify-center pb-2">
            <div className="size-60 rounded-full overflow-hidden ring-8 ring-rose-100/60 bg-cream-300">
              {/* Plug in coach photo once admin has uploaded one */}
              <Avatar name={coachName} size={240} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DotCluster() {
  return (
    <svg
      className="absolute top-12 right-4 text-rose-300"
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="10" cy="10" r="2.5" />
      <circle cx="30" cy="20" r="2.5" />
      <circle cx="50" cy="6" r="2.5" />
      <circle cx="70" cy="14" r="2.5" />
      <circle cx="90" cy="24" r="2.5" />
      <circle cx="110" cy="10" r="2.5" />
      <circle cx="20" cy="32" r="2.5" />
      <circle cx="60" cy="34" r="2.5" />
      <circle cx="100" cy="36" r="2.5" />
    </svg>
  );
}
