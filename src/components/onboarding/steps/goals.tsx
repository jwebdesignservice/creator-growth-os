"use client";

import { Users, Clock, ShieldCheck, Wallet } from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import type { OnboardingDraft } from "@/components/onboarding/types";

const GOALS = [
  {
    key: "improve_consistency",
    title: "Build consistency",
    desc: "Post regularly and build a steady rhythm",
    icon: Clock,
  },
  {
    key: "grow_audience",
    title: "Grow audience",
    desc: "Reach more people and gain followers",
    icon: Users,
  },
  {
    key: "build_authority",
    title: "Build authority",
    desc: "Be seen as a trusted voice in your niche",
    icon: ShieldCheck,
  },
  {
    key: "monetize",
    title: "Monetize",
    desc: "Turn your content into income",
    icon: Wallet,
  },
] as const;

type Props = {
  draft: OnboardingDraft;
  onSelect: (patch: Partial<OnboardingDraft>) => void;
};

export function GoalsStep({ draft, onSelect }: Props) {
  return (
    <div className="space-y-7">
      <header className="text-center">
        <h1 className="text-h1 text-ink-900 leading-tight mb-2">
          What&apos;s your main goal right now?
        </h1>
        <p className="text-ink-500 text-[14px]">
          Your goal shapes your plans, tasks, and tutorials.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {GOALS.map((g) => (
          <SelectionCard
            key={g.key}
            icon={<g.icon className="size-5" strokeWidth={1.8} />}
            title={g.title}
            description={g.desc}
            selected={draft.main_goal === g.key}
            onToggle={() => onSelect({ main_goal: g.key })}
          />
        ))}
      </div>
    </div>
  );
}
