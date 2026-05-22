"use client";

import {
  Sprout,
  CalendarPlus,
  Flame,
} from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { SelectionCard } from "@/components/onboarding/selection-card";
import { InfoBanner } from "@/components/onboarding/info-banner";
import type { OnboardingDraft } from "@/components/onboarding/types";

const PLATFORMS = [
  {
    key: "instagram",
    title: "Instagram",
    desc: "Reels, carousels, stories",
    icon: (
      <span className="text-rose-600">
        <InstagramIcon size={26} />
      </span>
    ),
  },
  {
    key: "tiktok",
    title: "TikTok",
    desc: "Short-form trend-led growth",
    icon: (
      <span className="text-ink-900">
        <TiktokIcon size={26} />
      </span>
    ),
  },
  {
    key: "youtube",
    title: "YouTube",
    desc: "Shorts and channel growth",
    icon: (
      <span className="text-rose-600">
        <YoutubeIcon size={26} />
      </span>
    ),
  },
  {
    key: "snapchat",
    title: "Snapchat",
    desc: "Story-first creator reach",
    icon: <SnapchatGlyph />,
  },
];

const RHYTHMS = [
  { value: "just_starting", label: "Not posting yet", icon: Sprout },
  { value: "1-2/week", label: "1–2 times/week", icon: CalendarPlus },
  { value: "3-5/week", label: "3–5 times/week", icon: CalendarPlus },
  { value: "daily", label: "Daily", icon: Flame },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function PlatformStep({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[34px] text-ink-900 leading-tight flex items-start gap-2 mb-2">
          <span className="text-rose-500 mt-2">✦</span>
          Which platform do you want to grow on first?
        </h1>
        <p className="text-ink-500 text-[14px]">
          We&apos;ll tailor your growth path, posting plans, and tutorials to the
          platform that matters most to you.
        </p>
      </header>

      <section>
        <div className="text-[13px] font-semibold text-ink-900 mb-3">
          1. Choose your primary platform
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {PLATFORMS.map((p) => (
            <SelectionCard
              key={p.key}
              icon={p.icon}
              title={p.title}
              description={p.desc}
              selected={draft.primary_platform === p.key}
              onToggle={() =>
                onChange({
                  primary_platform:
                    p.key as OnboardingDraft["primary_platform"],
                })
              }
            />
          ))}
        </div>
      </section>

      <section>
        <div className="text-[13px] font-semibold text-ink-900 mb-3">
          2. What&apos;s your current posting rhythm?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RHYTHMS.map((r) => (
            <SelectionCard
              key={r.value}
              size="compact"
              layout="horizontal"
              icon={<r.icon className="size-4" strokeWidth={1.8} />}
              title={r.label}
              selected={draft.content_frequency === r.value}
              onToggle={() => onChange({ content_frequency: r.value })}
            />
          ))}
        </div>
      </section>

      <InfoBanner>
        We&apos;ll build your weekly posting plan around your platform and rhythm.
      </InfoBanner>
    </div>
  );
}

function SnapchatGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={26}
      height={26}
      fill="#F5C400"
      aria-hidden
      style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.05))" }}
    >
      <path d="M12 2c3.4 0 5.6 2.4 5.6 5.5 0 1 .1 2 .3 2.6.6 0 1.4-.1 2 .3.6.4.4 1-.1 1.4-.7.5-2.1.6-2.4 1.1-.3.6.6 1.9 1.5 2.7.8.7 1.7 1 2.1 1.2.3.2.4.4.3.6-.4.7-2.1.9-2.6 1.1-.1.4-.3 1.1-.6 1.3-.3.2-.9 0-1.5-.1-.7-.1-1.5-.2-2.2.1-.6.3-1.2.9-1.7 1.3-.6.4-1.4.9-2.7.9s-2.1-.5-2.7-.9c-.5-.4-1.1-1-1.7-1.3-.7-.3-1.5-.2-2.2-.1-.6.1-1.2.3-1.5.1-.3-.2-.5-.9-.6-1.3-.5-.2-2.2-.4-2.6-1.1-.1-.2 0-.4.3-.6.4-.2 1.3-.5 2.1-1.2.9-.8 1.8-2.1 1.5-2.7-.3-.5-1.7-.6-2.4-1.1-.5-.4-.7-1-.1-1.4.6-.4 1.4-.3 2-.3.2-.6.3-1.6.3-2.6C6.4 4.4 8.6 2 12 2Z" />
    </svg>
  );
}
