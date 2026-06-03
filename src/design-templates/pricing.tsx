/* Pricing ──────────────────────────────────────────────────────────────
   Plan cards with feature lists — the platform's three real tiers
   (Free, Basic, Pro) side by side, with a "most popular" highlight, a
   per-feature check, and a distinct current-plan state.
   ───────────────────────────────────────────────────────────────────── */

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  current?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    features: ["1 connected platform", "Weekly KPIs", "Community access"],
    cta: "Current plan",
    current: true,
  },
  {
    name: "Basic",
    price: "$9",
    cadence: "/mo",
    features: ["3 connected platforms", "All core programs", "Content calendar", "Email support"],
    cta: "Choose Basic",
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/mo",
    features: ["Unlimited platforms", "Revenue tracking", "Priority support", "AI assistant"],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export function PricingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
      {PLANS.map((p) => (
        <div
          key={p.name}
          className={cn(
            "card p-6 flex flex-col",
            p.highlighted && "ring-2 ring-rose-600 shadow-card",
          )}
        >
          <div className="flex items-center justify-between gap-2 min-h-[24px] mb-3">
            <h3 className="text-h4 text-ink-900">{p.name}</h3>
            {p.highlighted && (
              <span className="inline-flex items-center px-2 h-6 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                Most popular
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-h1 text-ink-900 tabular-nums">{p.price}</span>
            <span className="text-[14px] text-ink-500">{p.cadence}</span>
          </div>
          <ul className="mt-5 space-y-2 flex-1">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-700">
                <span className="size-4 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-disabled={p.current || undefined}
            className={cn(
              "mt-6 inline-flex items-center justify-center h-10 px-4 rounded-[10px] text-[13.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
              p.current
                ? "bg-cream-100 text-ink-400 cursor-default"
                : p.highlighted
                  ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm cursor-pointer focus-visible:ring-rose-300"
                  : "bg-white border border-ink-200 text-ink-900 hover:bg-cream-100 active:bg-cream-200 cursor-pointer focus-visible:ring-rose-200",
            )}
          >
            {p.current && <Check className="size-4 mr-1.5" strokeWidth={2.5} />}
            {p.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
