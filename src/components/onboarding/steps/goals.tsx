"use client";

import {
  Users,
  Clock,
  ShieldCheck,
  Wallet,
  Leaf,
  Scale,
  Rocket,
  Zap,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { InfoBanner } from "@/components/onboarding/info-banner";
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

const PACES = [
  { key: "light",     title: "Light",     desc: "2–3 tasks/week",   icon: Leaf   },
  { key: "balanced",  title: "Balanced",  desc: "4–5 tasks/week",   icon: Scale  },
  { key: "growth",    title: "Growth",    desc: "6–8 tasks/week",   icon: Rocket },
  { key: "intensive", title: "Intensive", desc: "Daily execution",  icon: Zap    },
] as const;

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function GoalsStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1 text-ink-900 leading-tight flex items-start gap-2 mb-2">
          <span className="text-rose-500 mt-2">✦</span>
          What do you want to achieve next?
        </h1>
        <p className="text-ink-500 text-[14px]">
          Your answers will shape your personalized plans, tasks, and tutorials.
        </p>
      </header>

      <section>
        <div className="text-[13px] font-semibold text-ink-900 mb-3">
          1. Choose your primary goal
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {GOALS.map((g) => (
            <SelectionCard
              key={g.key}
              icon={<g.icon className="size-5" strokeWidth={1.8} />}
              title={g.title}
              description={g.desc}
              selected={draft.main_goal === g.key}
              onToggle={() => onChange({ main_goal: g.key })}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="text-[13px] font-semibold text-ink-900 mb-3">
          2. How much can you commit each week?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PACES.map((p) => (
            <SelectionCard
              key={p.key}
              size="compact"
              layout="horizontal"
              icon={<p.icon className="size-4" strokeWidth={1.8} />}
              title={p.title}
              description={p.desc}
              selected={draft.weekly_pace === p.key}
              onToggle={() => onChange({ weekly_pace: p.key })}
            />
          ))}
        </div>
      </section>

      <InfoBanner>
        You can refine your goals later based on your progress.
      </InfoBanner>
    </div>
  );
}
