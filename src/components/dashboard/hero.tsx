import Link from "next/link";
import { Play } from "lucide-react";
import { Avatar } from "@/components/app-shell/topbar";

type Props = {
  firstName: string;
  coachName?: string;
};

export function DashboardHero({ firstName, coachName = "Sophie" }: Props) {
  return (
    <section className="rounded-[var(--radius-2xl)] bg-cream-200 overflow-hidden relative">
      {/* ── Mobile/tablet coach script (top-right) ───────────────────────── */}
      <div className="pointer-events-none absolute right-5 top-5 xl:hidden font-script text-[16px] text-rose-600 leading-[1.15] rotate-[-3deg] text-right z-[1]">
        Your Coach,
        <br />
        <span className="ml-3">{coachName}</span>
        <span className="text-rose-500 ml-1">♥</span>
        <MobileDots />
      </div>

      {/* ── Mobile/tablet soft "S" circle (bottom-right) ─────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-32px] bottom-[-40px] xl:hidden w-[180px] h-[180px] rounded-full bg-rose-100/70 flex items-center justify-center"
      >
        <div className="size-[120px] rounded-full bg-rose-200/70 ring-8 ring-rose-100/60 flex items-center justify-center text-rose-700 font-semibold text-[40px]">
          {coachName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-[var(--space-grid-gap)] p-6 xl:p-[clamp(1.5rem,3vw,2.5rem)]">
        {/* Left text block */}
        <div className="max-w-xl relative z-10">
          <div className="text-rose-600 font-medium text-[13.5px] xl:text-[14px] mb-2.5 xl:mb-3 flex items-center gap-2">
            Welcome back, {firstName}! <span aria-hidden>👋</span>
          </div>
          <h1 className="font-display text-[clamp(1.75rem,7vw,2.75rem)] leading-[1.08] xl:leading-[1.1] text-ink-900 mb-3.5 xl:mb-4 max-w-[14ch] xl:max-w-none">
            Let&apos;s turn your influence
            <br className="hidden xl:block" />
            <span className="xl:hidden"> </span>
            into impact and income.
          </h1>
          <p className="text-ink-500 text-[13.5px] xl:text-[14.5px] max-w-[28ch] xl:max-w-md mb-5 xl:mb-7 leading-relaxed">
            Your daily missions are live. Execute your plan, stay consistent,
            and turn your audience into a real business.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 xl:gap-3 max-w-[17rem] sm:max-w-none relative z-10">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 xl:px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14.5px] xl:text-[15px] font-medium shadow-sm transition-colors"
            >
              <Play className="size-4" fill="currentColor" />
              Continue Your Program
            </Link>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center h-12 px-6 xl:px-7 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14.5px] xl:text-[15px] font-medium hover:bg-cream-100 transition-colors"
            >
              View My Plan
            </Link>
          </div>
        </div>

        {/* Right coach illustration (desktop xl+ only) */}
        <div className="relative hidden xl:block">
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

function MobileDots() {
  return (
    <svg
      className="absolute -bottom-6 right-0 text-rose-300"
      width="80"
      height="24"
      viewBox="0 0 80 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="6" cy="6" r="1.8" />
      <circle cx="20" cy="14" r="1.8" />
      <circle cx="36" cy="4" r="1.8" />
      <circle cx="50" cy="12" r="1.8" />
      <circle cx="64" cy="18" r="1.8" />
      <circle cx="74" cy="6" r="1.8" />
    </svg>
  );
}
