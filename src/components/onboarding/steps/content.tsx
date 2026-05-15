"use client";

import {
  BookOpen,
  Coffee,
  Heart,
  Camera,
  UserCircle2,
  DollarSign,
  Clapperboard,
  Copy,
  Plus,
  Radio,
  Lightbulb,
  MessageSquare,
  Video,
  Scissors,
  Target,
  Handshake,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { Pill } from "@/components/onboarding/pill";
import { InfoBanner } from "@/components/onboarding/info-banner";
import { OnboardingRail } from "@/components/onboarding/rail";
import type { OnboardingDraft } from "@/components/onboarding/types";

const PILLARS = [
  { value: "education", label: "Education", icon: BookOpen },
  { value: "lifestyle", label: "Lifestyle", icon: Coffee },
  { value: "motivation", label: "Motivation", icon: Heart },
  { value: "behind_the_scenes", label: "Behind the Scenes", icon: Camera },
  { value: "personal_brand", label: "Personal Brand", icon: UserCircle2 },
  { value: "business_monetization", label: "Business / Monetization", icon: DollarSign },
];

const FORMATS = [
  { value: "reels_shortform", label: "Reels / Short-form Video", icon: Clapperboard },
  { value: "carousels", label: "Carousels", icon: Copy },
  { value: "stories", label: "Stories", icon: Plus },
  { value: "youtube_shorts", label: "YouTube Shorts", icon: Clapperboard },
  { value: "live_content", label: "Live Content", icon: Radio },
];

const HELP = [
  { value: "content_ideas", label: "Content Ideas", icon: Lightbulb },
  { value: "hooks_captions", label: "Hooks & Captions", icon: MessageSquare },
  { value: "filming", label: "Filming", icon: Video },
  { value: "editing", label: "Editing", icon: Scissors },
  { value: "consistency", label: "Consistency", icon: Target },
  { value: "brand_deals", label: "Brand Deals", icon: Handshake },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function ContentStep({ draft, onChange }: Props) {
  function toggle(field: "content_pillars" | "focus_formats" | "help_needs", value: string) {
    const current = draft[field];
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    onChange({ [field]: next } as Partial<OnboardingDraft>);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-6 min-w-0">
        <header>
          <h1 className="font-display text-[34px] text-ink-900 leading-tight flex items-start gap-2 mb-2">
            <span className="text-rose-500 mt-2">✦</span>
            What kind of content do you want help creating?
          </h1>
          <p className="text-ink-500 text-[14px]">
            We&apos;ll personalize your tutorials, posting plans, and creator drills around your content style.
          </p>
        </header>

        <section>
          <div className="text-[13px] font-semibold text-ink-900 mb-3">
            1. Choose your main content pillars
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {PILLARS.map((p) => (
              <SelectionCard
                key={p.value}
                size="compact"
                icon={<p.icon className="size-4" strokeWidth={1.8} />}
                title={p.label}
                selected={draft.content_pillars.includes(p.value)}
                onToggle={() => toggle("content_pillars", p.value)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="text-[13px] font-semibold text-ink-900 mb-3">
            2. Which formats do you want to focus on?
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {FORMATS.map((f) => (
              <SelectionCard
                key={f.value}
                size="compact"
                icon={<f.icon className="size-4" strokeWidth={1.8} />}
                title={f.label}
                selected={draft.focus_formats.includes(f.value)}
                onToggle={() => toggle("focus_formats", f.value)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="text-[13px] font-semibold text-ink-900 mb-3">
            3. What do you need the most help with right now?
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {HELP.map((h) => (
              <Pill
                key={h.value}
                icon={<h.icon className="size-4" strokeWidth={1.8} />}
                label={h.label}
                selected={draft.help_needs.includes(h.value)}
                onToggle={() => toggle("help_needs", h.value)}
              />
            ))}
          </div>
        </section>

        <InfoBanner>
          You can update your preferences later in settings.
        </InfoBanner>
      </div>

      <OnboardingRail
        reasons={[
          {
            icon: GraduationCap,
            label: "Personalized tutorials built around your style",
          },
          { icon: CalendarDays, label: "Better posting plans that fit your content" },
          { icon: Target, label: "More relevant creator drills and challenges" },
        ]}
        nextUp={{
          title: "What happens next",
          description: "We personalize your dashboard, assign the right recommendations, and prepare your first weekly plan.",
          platforms: ["instagram", "tiktok", "youtube", "snapchat"],
          step: 3,
          totalSteps: 3,
        }}
      />
    </div>
  );
}

// Suppress unused (kept for readability in the icon list above)
void CheckCircle2;
