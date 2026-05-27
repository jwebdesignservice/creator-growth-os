"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  LayoutGrid,
  CalendarDays,
  GraduationCap,
  Target,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  PlayCircle,
  Lock,
} from "lucide-react";
import { InfoBanner } from "@/components/onboarding/info-banner";
import { IntroVideo } from "@/components/onboarding/intro-video";
import { cn } from "@/lib/cn";

type Props = {
  /** Display name shown in the celebration string */
  firstName?: string;
  onBack: () => void;
};

export function CompleteStep({ firstName, onBack }: Props) {
  const router = useRouter();
  const [introWatched, setIntroWatched] = useState(false);

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto">
      {/* Celebration hero */}
      <section className="relative overflow-hidden rounded-[24px] bg-rose-50/60 border border-rose-100 p-8 lg:p-10">
        <ConfettiDecor />
        <div className="relative z-10 grid lg:grid-cols-[140px_1fr_140px] gap-6 items-center">
          <div className="inline-flex items-center justify-center size-32 lg:size-36 rounded-full bg-success/15 border-4 border-success/30">
            <Check className="size-16 text-success" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-h1 lg:text-[42px] text-ink-900 leading-tight mb-2">
              {firstName
                ? `You're all set, ${firstName}! 🎉`
                : "Your personalized dashboard is ready 🎉"}
            </h1>
            <p className="text-ink-700 text-[14.5px] leading-relaxed max-w-2xl">
              We&apos;ve used your answers to tailor your programs, posting plans,
              tutorials, and tasks so you can grow faster with clarity and
              confidence.
            </p>
          </div>
          <CrownDecor />
        </div>
      </section>

      {/* Platform intro — must be watched before continuing */}
      <section>
        <h2 className="text-[16px] font-semibold text-ink-900 mb-1.5 flex items-center gap-2">
          <PlayCircle className="size-[18px] text-rose-500" strokeWidth={2} />
          Watch your quick platform tour
        </h2>
        <p className="text-[13px] text-ink-500 mb-3 max-w-2xl leading-snug">
          A 2-minute walkthrough of how everything fits together. Finish it and
          your dashboard unlocks below.
        </p>
        <IntroVideo onComplete={() => setIntroWatched(true)} />
      </section>

      {/* What we personalized */}
      <section>
        <h2 className="text-[16px] font-semibold text-ink-900 mb-3">
          What we personalized for you
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <PersonalizationCard
            icon={LayoutGrid}
            title="Personalized Dashboard"
            body="Custom overview with the metrics and insights that matter most."
          />
          <PersonalizationCard
            icon={CalendarDays}
            title="Tailored Posting Plans"
            body="Weekly plans built around your goals, pace, and content pillars."
          />
          <PersonalizationCard
            icon={GraduationCap}
            title="Recommended Tutorials & Creator Drills"
            body="Step-by-step lessons and drills to build your skills and confidence."
          />
          <PersonalizationCard
            icon={Target}
            title="Category-Based Tasks & Milestones"
            body="Actionable tasks and milestones to keep you on track."
          />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <InfoBanner>
          You can update your answers anytime in Settings to refresh your
          recommendations.
        </InfoBanner>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Review My Answers
        </button>

        <div className="flex flex-col items-stretch sm:items-end gap-1.5">
          <button
            type="button"
            disabled={!introWatched}
            aria-disabled={!introWatched}
            onClick={() => router.push("/dashboard")}
            className={cn(
              "inline-flex items-center justify-center gap-2 h-12 px-8 rounded-[14px] text-[15px] font-semibold shadow-sm transition-all duration-300",
              introWatched
                ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-200 scale-[1.02]"
                : "bg-rose-300/50 text-white/80 cursor-not-allowed",
            )}
          >
            {introWatched ? (
              <>
                Go to platform
                <ArrowRight className="size-4" strokeWidth={2} />
              </>
            ) : (
              <>
                <Lock className="size-4" strokeWidth={2} />
                Finish the intro to continue
              </>
            )}
          </button>
          {!introWatched && (
            <span className="text-[11.5px] text-ink-500 text-center sm:text-right">
              The button unlocks the moment the intro finishes.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonalizationCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof LayoutGrid;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-ink-100 p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center size-10 rounded-full bg-rose-100 text-rose-600 shrink-0">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div>
          <div className="text-[13.5px] font-semibold text-ink-900 leading-tight mb-1">
            {title}
          </div>
          <p className="text-[12px] text-ink-500 leading-snug">{body}</p>
        </div>
      </div>
    </div>
  );
}

function ConfettiDecor() {
  return (
    <>
      <svg
        className="absolute -top-4 left-4 text-rose-300/70"
        width="180"
        height="120"
        viewBox="0 0 180 120"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="10" cy="20" r="3" />
        <circle cx="40" cy="50" r="2.5" className="text-success" fill="currentColor" />
        <circle cx="60" cy="14" r="3" className="text-rose-400" fill="currentColor" />
        <circle cx="90" cy="40" r="2.5" />
        <circle cx="120" cy="20" r="2.5" />
        <circle cx="150" cy="60" r="3" className="text-rose-400" fill="currentColor" />
        <circle cx="170" cy="100" r="2.5" />
        <circle cx="30" cy="90" r="2.5" className="text-success" fill="currentColor" />
        <circle cx="80" cy="100" r="3" />
        <circle cx="110" cy="80" r="2.5" />
      </svg>
      <Sparkles
        className="absolute top-8 right-32 size-4 text-rose-400"
        strokeWidth={1.8}
      />
    </>
  );
}

function CrownDecor() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        className="text-rose-200"
      >
        <path
          d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"
          fill="currentColor"
        />
        <circle cx="14" cy="12" r="2.2" fill="currentColor" />
        <circle cx="34" cy="12" r="2.2" fill="currentColor" />
      </svg>
    </div>
  );
}
