"use client";

import {
  Sprout,
  TrendingUp,
  Crown,
  Wallet,
  Lightbulb,
  CalendarX,
  Eye,
  DollarSign,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { InfoBanner } from "@/components/onboarding/info-banner";
import type { OnboardingDraft } from "@/components/onboarding/types";

const STAGES = [
  {
    key: "starter",
    title: "Just starting",
    desc: "New here or still finding your niche",
    icon: Sprout,
  },
  {
    key: "growth",
    title: "Growing but inconsistent",
    desc: "Posting, but not on a steady rhythm",
    icon: TrendingUp,
  },
  {
    key: "authority",
    title: "Consistent but stuck",
    desc: "Showing up, but growth has plateaued",
    icon: Crown,
  },
  {
    key: "monetization",
    title: "Ready to monetize",
    desc: "Audience built — time to earn from it",
    icon: Wallet,
  },
] as const;

const BOTTLENECKS = [
  { value: "no_ideas", label: "No clear ideas", icon: Lightbulb },
  { value: "inconsistent", label: "Inconsistent posting", icon: CalendarX },
  { value: "low_reach", label: "Low reach & visibility", icon: Eye },
  { value: "no_monetization", label: "Not monetizing yet", icon: DollarSign },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function StageStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1 text-ink-900 leading-tight flex items-start gap-2 mb-2">
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
          1. Choose your current stage
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          2. What&apos;s your biggest bottleneck right now?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BOTTLENECKS.map((b) => (
            <SelectionCard
              key={b.value}
              size="compact"
              layout="horizontal"
              icon={<b.icon className="size-4" strokeWidth={1.8} />}
              title={b.label}
              selected={draft.bottleneck === b.value}
              onToggle={() => onChange({ bottleneck: b.value })}
            />
          ))}
        </div>
      </section>

      <InfoBanner>
        We&apos;ll refine your category later based on your onboarding and progress.
      </InfoBanner>
    </div>
  );
}
