"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CreatorType, OnboardingDraft } from "@/components/onboarding/types";

/**
 * Q1 — "How would you describe yourself?" Big tappable emoji cards in a
 * two-column grid (Typeform-style). Selecting an answer auto-advances via
 * `onSelect`, so most users never touch the Continue button.
 */
const TYPES: { key: CreatorType; label: string; emoji: string; tile: string }[] = [
  { key: "solo_creator", label: "Solo creator", emoji: "👋", tile: "bg-violet-100" },
  { key: "small_business", label: "Small business owner", emoji: "💪", tile: "bg-orange-100" },
  { key: "company_team", label: "Part of a company marketing team", emoji: "🏡", tile: "bg-emerald-100" },
  { key: "freelancer", label: "Freelancer/consultant", emoji: "⭐", tile: "bg-pink-100" },
  { key: "agency", label: "Marketing agency", emoji: "🎯", tile: "bg-teal-100" },
  { key: "nonprofit", label: "Non-profit organization", emoji: "🏆", tile: "bg-amber-100" },
  { key: "other", label: "Other", emoji: "🦄", tile: "bg-sky-100" },
];

type Props = {
  draft: OnboardingDraft;
  onSelect: (patch: Partial<OnboardingDraft>) => void;
};

export function DescribeStep({ draft, onSelect }: Props) {
  return (
    <div className="space-y-7">
      <header className="text-center">
        <h1 className="text-h1 text-ink-900 leading-tight mb-2">
          How would you describe yourself?
        </h1>
        <p className="text-ink-500 text-[14px]">
          So we can shape the platform around how you work.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-[880px] mx-auto">
        {TYPES.map((t) => {
          const selected = draft.creator_type === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect({ creator_type: t.key })}
              aria-pressed={selected}
              className={cn(
                "relative flex w-full items-center gap-4 rounded-[16px] border-2 p-3.5 sm:p-4 text-left transition-all duration-150 cursor-pointer",
                "hover:-translate-y-px active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2",
                selected
                  ? "border-rose-500 bg-rose-50/70 shadow-[0_10px_24px_-16px_rgba(185,72,92,0.5)]"
                  : "border-ink-100 bg-white shadow-[0_1px_2px_rgba(26,24,22,0.04)] hover:border-ink-200 hover:shadow-[0_10px_24px_-16px_rgba(26,24,22,0.3)]",
              )}
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-[12px] text-[22px]",
                  t.tile,
                )}
                aria-hidden
              >
                {t.emoji}
              </span>
              <span className="flex-1 min-w-0 text-[15px] font-semibold text-ink-900 leading-snug">
                {t.label}
              </span>
              {selected && (
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
