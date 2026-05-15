"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Users,
  Scale,
  Heart,
  Video,
  Lightbulb,
  LayoutGrid,
  CalendarDays,
  GraduationCap,
  Target,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { InfoBanner } from "@/components/onboarding/info-banner";
import type { OnboardingDraft } from "@/components/onboarding/types";

type Props = {
  draft: OnboardingDraft;
  /** Display name shown in the celebration string */
  firstName?: string;
  onBack: () => void;
};

const STAGE_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  authority: "Authority Creator",
  monetization: "Monetization Creator",
};
const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  snapchat: "Snapchat",
  linkedin: "LinkedIn",
  multiple: "Multiple",
};
const GOAL_LABEL: Record<string, string> = {
  grow_audience: "Grow audience",
  improve_consistency: "Improve consistency",
  build_authority: "Build authority",
  monetize: "Monetize",
};
const PACE_LABEL: Record<string, string> = {
  light: "Light pace",
  balanced: "Balanced pace",
  growth: "Growth pace",
  intensive: "Intensive pace",
};
const PILLAR_LABEL: Record<string, string> = {
  education: "Education",
  lifestyle: "Lifestyle",
  motivation: "Motivation",
  behind_the_scenes: "Behind the Scenes",
  personal_brand: "Personal Brand",
  business_monetization: "Business / Monetization",
};
const FORMAT_LABEL: Record<string, string> = {
  reels_shortform: "Reels / Short-form Video",
  carousels: "Carousels",
  stories: "Stories",
  youtube_shorts: "YouTube Shorts",
  live_content: "Live Content",
};
const HELP_LABEL: Record<string, string> = {
  content_ideas: "Content Ideas",
  hooks_captions: "Hooks & Captions",
  filming: "Filming",
  editing: "Editing",
  consistency: "Consistency",
  brand_deals: "Brand Deals",
};

export function CompleteStep({ draft, onBack }: Props) {
  const summary = [
    {
      label: "Creator Category",
      value: draft.stage ? STAGE_LABEL[draft.stage] : "—",
      icon: TrendingUp,
    },
    {
      label: "Primary Platform",
      value: draft.primary_platform
        ? PLATFORM_LABEL[draft.primary_platform]
        : "—",
      icon: Smartphone,
    },
    {
      label: "Main Goal",
      value: draft.main_goal ? GOAL_LABEL[draft.main_goal] : "—",
      icon: Users,
    },
    {
      label: "Weekly Pace",
      value: draft.weekly_pace ? PACE_LABEL[draft.weekly_pace] : "—",
      icon: Scale,
    },
    {
      label: "Content Pillars",
      value: draft.content_pillars.length
        ? draft.content_pillars.map((p) => PILLAR_LABEL[p] ?? p).join(", ")
        : "—",
      icon: Heart,
    },
    {
      label: "Focus Formats",
      value: draft.focus_formats.length
        ? draft.focus_formats.map((f) => FORMAT_LABEL[f] ?? f).join(", ")
        : "—",
      icon: Video,
    },
    {
      label: "Needs Help With",
      value: draft.help_needs.length
        ? draft.help_needs.map((h) => HELP_LABEL[h] ?? h).join(", ")
        : "—",
      icon: Lightbulb,
    },
  ];

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
            <h1 className="font-display text-[36px] lg:text-[42px] text-ink-900 leading-tight mb-2">
              Your personalized dashboard is ready 🎉
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

      {/* Answers summary */}
      <section>
        <h2 className="text-[16px] font-semibold text-ink-900 mb-3">
          Your answers summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {summary.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-[16px] border border-ink-100 p-4 text-center"
            >
              <div className="mx-auto inline-flex items-center justify-center size-10 rounded-full bg-rose-100 text-rose-600 mb-2">
                <s.icon className="size-4" strokeWidth={2} />
              </div>
              <div className="text-[11.5px] text-ink-500 font-medium mb-1">
                {s.label}
              </div>
              <div className="text-[12.5px] text-ink-900 font-semibold leading-snug line-clamp-3">
                {s.value}
              </div>
            </div>
          ))}
        </div>
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

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Review My Answers
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-12 px-8 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-semibold transition-colors shadow-sm"
        >
          Go to My Dashboard
          <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
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

// Suppress unused warning (CheckCircle2 imported for type compatibility)
void CheckCircle2;
