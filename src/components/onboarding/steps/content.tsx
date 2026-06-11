"use client";

import {
  BookOpen,
  Coffee,
  Heart,
  Camera,
  UserCircle2,
  DollarSign,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import type { OnboardingDraft } from "@/components/onboarding/types";

const PILLARS = [
  { value: "education", label: "Education", icon: BookOpen },
  { value: "lifestyle", label: "Lifestyle", icon: Coffee },
  { value: "motivation", label: "Motivation", icon: Heart },
  { value: "behind_the_scenes", label: "Behind the Scenes", icon: Camera },
  { value: "personal_brand", label: "Personal Brand", icon: UserCircle2 },
  { value: "business_monetization", label: "Business / Monetization", icon: DollarSign },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function ContentStep({ draft, onChange }: Props) {
  function togglePillar(value: string) {
    const current = draft.content_pillars;
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    onChange({ content_pillars: next });
  }

  return (
    <div className="space-y-7">
      <header className="text-center">
        <h1 className="text-h1 text-ink-900 leading-tight mb-2">
          What do you want to create content about?
        </h1>
        <p className="text-ink-500 text-[14px]">
          Pick one or more — you can change these anytime in settings.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PILLARS.map((p) => (
          <SelectionCard
            key={p.value}
            size="compact"
            icon={<p.icon className="size-4" strokeWidth={1.8} />}
            title={p.label}
            selected={draft.content_pillars.includes(p.value)}
            onToggle={() => togglePillar(p.value)}
          />
        ))}
      </div>
    </div>
  );
}
