"use client";

import { Sparkles, Crown, Check, Minus, Zap, Gift } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";
import type { OnboardingDraft, PlanChoice } from "../types";

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

/* Feature copy is kept in sync with the billing catalogue (billing-panel.tsx).
   Each plan lists what's included; Free additionally shows the upgrades it
   misses (muted) so the free-vs-paid difference is impossible to miss. */
const FREE_INCLUDED = [
  "All core programs & tutorials",
  "Community access",
  "Up to 3 posting plans",
  "Basic performance analytics",
];
const FREE_MISSING = [
  "AI content ideas",
  "Brand deal alerts",
  "1-on-1 coaching calls",
];
const PRO_INCLUDED = [
  "Everything in Free",
  "Unlimited posting plans",
  "Advanced analytics & insights",
  "AI content ideas",
  "Brand deal alerts",
  "Priority + 1-on-1 coaching",
];

export function PlanStep({ draft, onChange }: Props) {
  const selected = draft.selected_plan;

  return (
    <div className="space-y-6">
      <header className="ob-rise" style={delay(0)}>
        <h1 className="text-h2 sm:text-h1 text-ink-900 leading-tight flex items-start gap-2.5">
          <Sparkles
            className="size-6 sm:size-7 text-rose-500 mt-1 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
          Pick the plan that fits you
        </h1>
        <p className="text-ink-500 text-[14px] mt-2 max-w-xl">
          Start free and learn at your own pace, or unlock the full toolkit with
          Pro. You can switch anytime from billing — no pressure.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {/* ── Free ─────────────────────────────────────────────────────── */}
        <PlanCard
          plan="free"
          selected={selected === "free"}
          onSelect={() => onChange({ selected_plan: "free" })}
          riseDelay={90}
        >
          <CardHead
            icon={<Sparkles className="size-6" strokeWidth={1.9} />}
            iconWrap="bg-cream-200 text-ink-600"
            name="Free"
            tagline="Everything you need to get started"
          />
          <Price big="0 kr" small="Free forever · no card needed" />

          <ul className="mt-5 space-y-2.5">
            {FREE_INCLUDED.map((f, i) => (
              <FeatureRow key={f} label={f} index={i} riseBase={140} />
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-ink-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-400 mb-2.5">
              Upgrade to Pro for
            </p>
            <ul className="space-y-2">
              {FREE_MISSING.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-[13px] text-ink-400"
                >
                  <span className="size-5 rounded-full bg-cream-100 inline-flex items-center justify-center shrink-0">
                    <Minus className="size-3 text-ink-300" strokeWidth={2.5} />
                  </span>
                  <span className="line-through decoration-ink-200">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </PlanCard>

        {/* ── Pro ──────────────────────────────────────────────────────── */}
        <PlanCard
          plan="pro"
          selected={selected === "pro"}
          onSelect={() => onChange({ selected_plan: "pro" })}
          riseDelay={170}
        >
          {/* Premium glow + animated sheen sweep */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]"
            aria-hidden
          >
            <div className="absolute -inset-px bg-gradient-to-br from-rose-50 via-white to-rose-100/60" />
            <span className="ob-sheen absolute top-0 -left-1/3 h-full w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-12deg]" />
          </div>

          <div className="relative">
            {/* Trial ribbon */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-[0.05em] shadow-sm shadow-rose-600/20">
                <Gift className="size-3.5" strokeWidth={2.4} />
                7-day free trial
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.05em] text-rose-600">
                <Zap className="size-3.5" strokeWidth={2.4} fill="currentColor" />
                Most popular
              </span>
            </div>

            <CardHead
              icon={
                <Crown
                  className="ob-float size-6"
                  strokeWidth={1.9}
                  fill="currentColor"
                />
              }
              iconWrap="bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm shadow-rose-600/25"
              name="Pro"
              tagline="The full toolkit to grow & monetize faster"
            />
            <Price
              big="1499 kr"
              bigSuffix="/mo"
              small="Start free for 7 days · cancel anytime"
              accent
            />

            <ul className="mt-5 space-y-2.5">
              {PRO_INCLUDED.map((f, i) => (
                <FeatureRow
                  key={f}
                  label={f}
                  index={i}
                  riseBase={220}
                  accent
                  bold={i === 0}
                />
              ))}
            </ul>
          </div>
        </PlanCard>
      </section>
    </div>
  );
}

/* ── Card shell ──────────────────────────────────────────────────────────── */

function PlanCard({
  plan,
  selected,
  onSelect,
  riseDelay,
  children,
}: {
  plan: PlanChoice;
  selected: boolean;
  onSelect: () => void;
  riseDelay: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Choose the ${plan} plan`}
      style={delay(riseDelay)}
      className={cn(
        "ob-rise group relative w-full text-left rounded-[20px] border-2 p-5 sm:p-6",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100",
        selected
          ? "border-rose-500 shadow-[0_22px_48px_-24px_rgba(225,72,96,0.55)] -translate-y-0.5"
          : plan === "pro"
            ? "border-rose-200 hover:border-rose-300 shadow-[0_14px_36px_-26px_rgba(26,24,22,0.5)]"
            : "border-ink-100 bg-white hover:border-ink-200",
      )}
    >
      {/* Select indicator */}
      <span
        className={cn(
          "absolute top-4 right-4 z-10 inline-flex items-center justify-center size-6 rounded-full border-2 transition-all duration-300",
          selected
            ? "bg-rose-500 border-rose-500 scale-100"
            : "bg-white/70 border-ink-200 scale-90 group-hover:border-rose-300",
        )}
      >
        <Check
          className={cn(
            "size-3.5 text-white transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-0",
          )}
          strokeWidth={3}
        />
      </span>

      {children}
    </button>
  );
}

function CardHead({
  icon,
  iconWrap,
  name,
  tagline,
}: {
  icon: React.ReactNode;
  iconWrap: string;
  name: string;
  tagline: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <span
        className={cn(
          "size-12 rounded-[14px] inline-flex items-center justify-center shrink-0",
          iconWrap,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[20px] font-bold text-ink-900 leading-none">
          {name}
        </div>
        <div className="text-[12.5px] text-ink-500 mt-1.5 leading-snug">
          {tagline}
        </div>
      </div>
    </div>
  );
}

function Price({
  big,
  bigSuffix,
  small,
  accent,
}: {
  big: string;
  bigSuffix?: string;
  small: string;
  accent?: boolean;
}) {
  return (
    <div className="mt-5">
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-[30px] font-extrabold tracking-[-0.02em] tabular-nums leading-none",
            accent ? "text-rose-600" : "text-ink-900",
          )}
        >
          {big}
        </span>
        {bigSuffix && (
          <span className="text-[14px] font-semibold text-ink-400">
            {bigSuffix}
          </span>
        )}
      </div>
      <p className="text-[12px] text-ink-500 mt-1.5">{small}</p>
    </div>
  );
}

function FeatureRow({
  label,
  index,
  riseBase,
  accent,
  bold,
}: {
  label: string;
  index: number;
  riseBase: number;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <li
      className="ob-rise flex items-center gap-2.5"
      style={delay(riseBase + index * 55)}
    >
      <span
        className={cn(
          "size-5 rounded-full inline-flex items-center justify-center shrink-0",
          accent ? "bg-rose-100 text-rose-600" : "bg-success-bg text-success",
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      <span
        className={cn(
          "text-[13px]",
          bold ? "font-semibold text-ink-900" : "text-ink-700",
        )}
      >
        {label}
      </span>
    </li>
  );
}

/** Inline animation-delay helper for the staggered rise-in. */
function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` } as CSSProperties;
}
