/* Onboarding ─────────────────────────────────────────────────────────────
   The onboarding flow's building blocks — large selectable cards, a step
   header with progress, and a vertical progress rail. Mirrors
   src/components/onboarding/{selection-card,step-header,rail}.tsx.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { Check, Target, Users, Video } from "lucide-react";
import { cn } from "@/lib/cn";

export function SelectionCards() {
  const opts = [
    { key: "grow", icon: Target, title: "Grow my audience", desc: "Followers, reach and engagement." },
    { key: "monetize", icon: Users, title: "Monetize", desc: "Land brand deals and sponsorships." },
    { key: "content", icon: Video, title: "Post consistently", desc: "Build a repeatable content system." },
  ];
  const [sel, setSel] = useState<string[]>(["grow"]);
  const toggle = (k: string) =>
    setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <div className="grid grid-cols-3 gap-3 w-[600px] max-w-full">
      {opts.map((o) => {
        const Icon = o.icon;
        const selected = sel.includes(o.key);
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => toggle(o.key)}
            aria-pressed={selected}
            className={cn(
              "relative text-left rounded-[16px] border-2 p-5 transition-colors",
              selected
                ? "border-rose-500 bg-rose-50/70"
                : "border-ink-100 bg-white hover:border-ink-200 hover:bg-cream-100/50",
            )}
          >
            {selected && (
              <span className="absolute top-3 right-3 inline-flex items-center justify-center size-5 rounded-full bg-rose-500 text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
            <div className="mb-3">
              <span
                className={cn(
                  "inline-flex items-center justify-center size-12 rounded-full transition-colors",
                  selected ? "bg-rose-100 text-rose-600" : "bg-cream-100 text-ink-500",
                )}
              >
                <Icon className="size-6" strokeWidth={1.9} />
              </span>
            </div>
            <div className="text-[15px] font-semibold text-ink-900 leading-tight">{o.title}</div>
            <div className="text-[12.5px] text-ink-500 leading-snug mt-1">{o.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

export function StepHeader() {
  const step = 2;
  const total = 5;
  return (
    <div className="w-[460px] max-w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-rose-100 text-rose-700 text-[11.5px] font-semibold">
          Step {step} of {total}
        </span>
        <div className="flex-1 flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < step ? "bg-rose-500" : "bg-cream-200",
              )}
            />
          ))}
        </div>
      </div>
      <h2 className="text-h3 text-ink-900">What platforms do you post on?</h2>
      <p className="text-[13.5px] text-ink-500 mt-1">
        Pick all that apply — we’ll tailor your plan around them.
      </p>
    </div>
  );
}

export function ProgressRail() {
  const steps = [
    { label: "Your stage", done: true },
    { label: "Platforms", done: true },
    { label: "Goals", active: true },
    { label: "Weekly pace", done: false },
    { label: "Finish", done: false },
  ];
  return (
    <div className="w-[240px] max-w-full card p-4">
      <ol className="space-y-0.5">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "size-7 rounded-full inline-flex items-center justify-center text-[12px] font-semibold shrink-0",
                    s.done
                      ? "bg-rose-600 text-white"
                      : s.active
                        ? "bg-rose-100 text-rose-700 ring-2 ring-rose-300"
                        : "bg-cream-200 text-ink-400",
                  )}
                >
                  {s.done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                {!last && (
                  <span className={cn("w-0.5 flex-1 my-1 rounded", s.done ? "bg-rose-300" : "bg-cream-200")} />
                )}
              </div>
              <span
                className={cn(
                  "text-[13px] pt-1",
                  s.active ? "text-ink-900 font-semibold" : s.done ? "text-ink-700" : "text-ink-400",
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
