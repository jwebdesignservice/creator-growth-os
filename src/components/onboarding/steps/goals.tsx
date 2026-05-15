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
  CalendarDays,
  Lightbulb,
  Hand,
  DollarSign,
  Pencil,
  ClipboardList,
  Target,
} from "lucide-react";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { Pill } from "@/components/onboarding/pill";
import { InfoBanner } from "@/components/onboarding/info-banner";
import { OnboardingRail } from "@/components/onboarding/rail";
import type { OnboardingDraft } from "@/components/onboarding/types";

const GOALS = [
  {
    key: "grow_audience",
    title: "Grow audience",
    desc: "Reach more people and gain followers",
    icon: Users,
  },
  {
    key: "improve_consistency",
    title: "Improve consistency",
    desc: "Post regularly and stay consistent",
    icon: Clock,
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
  {
    key: "light",
    title: "Light pace",
    desc: "Small steps, steady progress",
    icon: Leaf,
  },
  {
    key: "balanced",
    title: "Balanced pace",
    desc: "Consistent effort, real results",
    icon: Scale,
  },
  {
    key: "growth",
    title: "Growth pace",
    desc: "Push further, see faster growth",
    icon: Rocket,
  },
  {
    key: "intensive",
    title: "Intensive pace",
    desc: "Go all in, maximum results",
    icon: Zap,
  },
] as const;

const VALUES = [
  {
    value: "clear_weekly_posting_plan",
    label: "Clear weekly posting plan",
    icon: CalendarDays,
  },
  { value: "better_content_ideas", label: "Better content ideas", icon: Lightbulb },
  { value: "more_accountability", label: "More accountability", icon: Hand },
  {
    value: "better_monetization_guidance",
    label: "Better monetization guidance",
    icon: DollarSign,
  },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function GoalsStep({ draft, onChange }: Props) {
  function toggleValue(v: string) {
    const next = draft.top_value_priorities.includes(v)
      ? draft.top_value_priorities.filter((x) => x !== v)
      : [...draft.top_value_priorities, v];
    onChange({ top_value_priorities: next });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-6 min-w-0">
        <header>
          <h1 className="font-display text-[34px] text-ink-900 leading-tight flex items-start gap-2 mb-2">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            2. How ambitious do you want to be each week?
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

        <section>
          <div className="text-[13px] font-semibold text-ink-900 mb-3">
            3. What would make this platform most valuable for you right now?
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {VALUES.map((v) => (
              <Pill
                key={v.value}
                icon={<v.icon className="size-4" strokeWidth={1.8} />}
                label={v.label}
                selected={draft.top_value_priorities.includes(v.value)}
                onToggle={() => toggleValue(v.value)}
              />
            ))}
          </div>
        </section>

        <InfoBanner>
          You can refine your goals later based on your progress.
        </InfoBanner>
      </div>

      <OnboardingRail
        reasons={[
          {
            icon: Pencil,
            label: "Personalized tasks that match your goals",
          },
          { icon: ClipboardList, label: "A plan that adapts to your pace" },
          {
            icon: Target,
            label: "Clear milestones to keep you motivated",
          },
        ]}
        nextUp={{
          title: "Content",
          description: "Last step! We'll customize your content preferences and style.",
          platforms: ["instagram", "tiktok", "youtube", "snapchat"],
          step: 2,
          totalSteps: 3,
        }}
      />
    </div>
  );
}
