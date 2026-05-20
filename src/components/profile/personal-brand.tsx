"use client";

import { useActionState, useState } from "react";
import { Plus, X, Save, Check } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { updateContentPillars } from "@/app/(app)/profile/actions";
import { cn } from "@/lib/cn";
import { PILLAR_LABEL } from "@/lib/profile/queries";

type Props = {
  initialPillars: string[];
  primaryPlatform: string | null;
};

const PILLAR_SUGGESTIONS = [
  "education",
  "lifestyle",
  "motivation",
  "behind_the_scenes",
  "personal_brand",
  "business_monetization",
  "inspiration",
  "promotion",
];

const PLATFORMS: { value: string; label: string; icon: React.ReactNode }[] = [
  {
    value: "instagram",
    label: "Instagram",
    icon: <InstagramIcon className="text-rose-600" size={16} />,
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: <TiktokIcon className="text-ink-900" size={16} />,
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: <YoutubeIcon className="text-rose-600" size={16} />,
  },
];

export function PersonalBrandCard({ initialPillars, primaryPlatform }: Props) {
  const initialState: { ok: true } | { ok: false; error: string } = {
    ok: false,
    error: "",
  };
  const [state, formAction, pending] = useActionState<
    { ok: true } | { ok: false; error: string },
    FormData
  >(updateContentPillars, initialState);

  const [pillars, setPillars] = useState<string[]>(initialPillars);

  function addPillar(value: string) {
    if (!value) return;
    const slug = value.toLowerCase().replace(/\s+/g, "_");
    if (pillars.includes(slug)) return;
    setPillars([...pillars, slug]);
  }
  function removePillar(slug: string) {
    setPillars(pillars.filter((p) => p !== slug));
  }

  const errMessage = state.ok ? null : state.error;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="pillars" value={pillars.join(",")} />

      <div>
        <div className="text-[12.5px] font-medium text-ink-700 mb-2">
          Content Pillars
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pillars.length === 0 && (
            <span className="text-[12px] text-ink-500">
              No pillars yet — add a few below.
            </span>
          )}
          {pillars.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 chip chip-rose"
            >
              {PILLAR_LABEL[p] ?? prettyLabel(p)}
              <button
                type="button"
                onClick={() => removePillar(p)}
                className="text-rose-700 hover:text-rose-900 cursor-pointer"
                aria-label="Remove pillar"
              >
                <X className="size-3" strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <AddPillarMenu existing={pillars} onAdd={addPillar} />
        </div>
      </div>

      <div>
        <div className="text-[12.5px] font-medium text-ink-700 mb-2">
          Preferred Platforms
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PLATFORMS.map((p) => {
            const active = primaryPlatform === p.value;
            return (
              <span
                key={p.value}
                className={cn(
                  "inline-flex items-center gap-2 h-10 px-3 rounded-[12px] border text-[13px] font-medium",
                  active
                    ? "bg-rose-50 border-rose-200 text-ink-900"
                    : "bg-white border-ink-200 text-ink-700",
                )}
              >
                {p.icon}
                {p.label}
              </span>
            );
          })}
        </div>
        <p className="text-[11px] text-ink-500 mt-2">
          Set your primary platform above. Multi-platform support comes in a
          future release.
        </p>
      </div>

      {errMessage && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {errMessage}
        </div>
      )}
      {state.ok && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success inline-flex items-center gap-1.5">
          <Check className="size-4" strokeWidth={2.5} />
          Pillars updated.
        </div>
      )}

      <div className="flex items-center justify-end pt-2 border-t border-ink-100">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium cursor-pointer transition-colors shadow-sm"
        >
          <Save className="size-4" strokeWidth={2} />
          {pending ? "Saving…" : "Save Pillars"}
        </button>
      </div>
    </form>
  );
}

function AddPillarMenu({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const remaining = PILLAR_SUGGESTIONS.filter((s) => !existing.includes(s));
  if (remaining.length === 0) return null;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-[11.5px] font-medium cursor-pointer hover:bg-rose-100"
      >
        <Plus className="size-3" strokeWidth={2.5} />
        Add Pillar
      </button>
      {open && (
        <div className="absolute z-10 top-[calc(100%+6px)] left-0 w-[200px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
          {remaining.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => {
                onAdd(slug);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 text-[13px] text-ink-700 hover:bg-cream-100 cursor-pointer"
            >
              {PILLAR_LABEL[slug] ?? prettyLabel(slug)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function prettyLabel(slug: string) {
  return slug
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
