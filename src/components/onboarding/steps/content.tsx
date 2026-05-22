"use client";

import {
  BookOpen,
  Coffee,
  Heart,
  Camera,
  UserCircle2,
  DollarSign,
  Lightbulb,
  MessageSquare,
  Video,
  Scissors,
  Target,
  Handshake,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { Pill } from "@/components/onboarding/pill";
import { InfoBanner } from "@/components/onboarding/info-banner";
import type { OnboardingDraft } from "@/components/onboarding/types";

const PILLARS = [
  { value: "education", label: "Education", icon: BookOpen },
  { value: "lifestyle", label: "Lifestyle", icon: Coffee },
  { value: "motivation", label: "Motivation", icon: Heart },
  { value: "behind_the_scenes", label: "Behind the Scenes", icon: Camera },
  { value: "personal_brand", label: "Personal Brand", icon: UserCircle2 },
  { value: "business_monetization", label: "Business / Monetization", icon: DollarSign },
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
  function toggle(field: "content_pillars" | "help_needs", value: string) {
    const current = draft[field];
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    onChange({ [field]: next } as Partial<OnboardingDraft>);
  }

  return (
    <div className="space-y-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
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
          2. What should we help you with first?
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
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
  );
}
