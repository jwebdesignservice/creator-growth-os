"use client";

import { Check } from "lucide-react";
import { PlatformGlyph } from "@/components/posting/platform-glyphs";
import { cn } from "@/lib/cn";
import type {
  FocusChannel,
  OnboardingDraft,
} from "@/components/onboarding/types";

/**
 * Q3 — "What social channel(s) are in focus?" Multi-select grid of square
 * cards: full-colour brand tile centered on top, label underneath. Selecting
 * keeps the screen open (it's multi-choice); Continue advances.
 * `primary_platform` is derived: the single pick, or "multiple" for 2+.
 */
const CHANNELS: { key: FocusChannel; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "snapchat", label: "Snapchat" },
  { key: "linkedin", label: "LinkedIn" },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function PlatformStep({ draft, onChange }: Props) {
  function toggle(key: FocusChannel) {
    const current = draft.focus_channels;
    const next = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...current, key];
    onChange({
      focus_channels: next,
      primary_platform: next.length === 0 ? null : next.length === 1 ? next[0] : "multiple",
    });
  }

  return (
    <div className="space-y-7">
      <header className="text-center">
        <h1 className="text-h1 text-ink-900 leading-tight mb-2">
          What social channel(s) are in focus?
        </h1>
        <p className="text-ink-500 text-[14px]">
          Pick every channel you create for — choose as many as you like.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-[960px] mx-auto">
        {CHANNELS.map((c) => {
          const selected = draft.focus_channels.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggle(c.key)}
              aria-pressed={selected}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3.5 rounded-[16px] border-2 px-4 py-7 transition-all duration-150 cursor-pointer",
                "hover:-translate-y-px active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2",
                selected
                  ? "border-rose-500 bg-rose-50/70 shadow-[0_10px_24px_-16px_rgba(185,72,92,0.5)]"
                  : "border-ink-100 bg-white shadow-[0_1px_2px_rgba(26,24,22,0.04)] hover:border-ink-200 hover:shadow-[0_10px_24px_-16px_rgba(26,24,22,0.3)]",
              )}
            >
              {selected && (
                <span className="absolute top-2.5 right-2.5 inline-flex size-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
              <PlatformGlyph platform={c.key} className="size-12" />
              <span className="text-[14.5px] font-semibold text-ink-900 leading-none">
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
