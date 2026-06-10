"use client";

import { Sprout, TrendingUp, Crown, Wallet } from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
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

type Props = {
  draft: OnboardingDraft;
  onSelect: (patch: Partial<OnboardingDraft>) => void;
};

export function StageStep({ draft, onSelect }: Props) {
  return (
    <div className="space-y-7">
      <header className="text-center">
        <h1 className="text-h1 text-ink-900 leading-tight mb-2">
          Where are you in your creator journey?
        </h1>
        <p className="text-ink-500 text-[14px]">
          We&apos;ll match the tools and guidance to your stage.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAGES.map((s) => (
          <SelectionCard
            key={s.key}
            icon={<s.icon className="size-5" strokeWidth={1.8} />}
            title={s.title}
            description={s.desc}
            selected={draft.stage === s.key}
            onToggle={() => onSelect({ stage: s.key })}
          />
        ))}
      </div>
    </div>
  );
}
