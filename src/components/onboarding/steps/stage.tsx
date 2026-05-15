"use client";

import {
  Sprout,
  TrendingUp,
  Crown,
  Wallet,
  UserSquare2,
  Crown as CrownIcon,
  CalendarDays,
  RefreshCcw,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { Pill } from "@/components/onboarding/pill";
import { InfoBanner } from "@/components/onboarding/info-banner";
import { OnboardingRail } from "@/components/onboarding/rail";
import type { OnboardingDraft } from "@/components/onboarding/types";

const STAGES = [
  {
    key: "starter",
    title: "Starter Creator",
    desc: "0–1,000 followers or no clear niche yet",
    icon: Sprout,
  },
  {
    key: "growth",
    title: "Growth Creator",
    desc: "1,000–10,000 followers and looking for more consistency",
    icon: TrendingUp,
  },
  {
    key: "authority",
    title: "Authority Creator",
    desc: "Clear niche and focused on trust, positioning, and audience depth",
    icon: Crown,
  },
  {
    key: "monetization",
    title: "Monetization Creator",
    desc: "Ready to earn through offers, brand deals, or products",
    icon: Wallet,
  },
] as const;

const FOLLOWER_BASES = [
  { value: "0-1k", label: "0–1K" },
  { value: "1k-10k", label: "1K–10K" },
  { value: "10k-50k", label: "10K–50K" },
  { value: "50k+", label: "50K+" },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function StageStep({ draft, onChange }: Props) {
  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-6 min-w-0">
        <header>
          <h1 className="font-display text-[34px] text-ink-900 leading-tight flex items-start gap-2 mb-2">
            <span className="text-rose-500 mt-2">✦</span>
            Where are you in your creator journey?
          </h1>
          <p className="text-ink-500 text-[14px]">
            This helps us personalize your experience and give you the right
            tools and guidance.
          </p>
        </header>

        <section>
          <div className="text-[13px] font-semibold text-ink-900 mb-3">
            Choose your current stage
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STAGES.map((s) => (
              <SelectionCard
                key={s.key}
                icon={<s.icon className="size-5" strokeWidth={1.8} />}
                title={s.title}
                description={s.desc}
                selected={draft.stage === s.key}
                onToggle={() => onChange({ stage: s.key })}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="text-[13px] font-semibold text-ink-900 mb-3">
            Follower Base
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FOLLOWER_BASES.map((f) => (
              <Pill
                key={f.value}
                label={f.label}
                selected={draft.follower_base === f.value}
                onToggle={() => onChange({ follower_base: f.value })}
              />
            ))}
          </div>
        </section>

        <InfoBanner>
          We&apos;ll refine your category later based on your onboarding and progress.
        </InfoBanner>
      </div>

      <OnboardingRail
        reasons={[
          { icon: UserSquare2, label: "We personalize your dashboard" },
          { icon: CrownIcon, label: "We assign the right creator category" },
          { icon: CalendarDays, label: "We tailor your plans and tutorials" },
          { icon: RefreshCcw, label: "You can refine this later" },
        ]}
        nextUp={{
          title: "Platform",
          description: "We'll help you optimize for your primary platform.",
          platforms: ["instagram", "tiktok", "youtube"],
          step: 1,
          totalSteps: 3,
        }}
      />
    </div>
  );
}
