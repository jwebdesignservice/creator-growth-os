/* Pricing ──────────────────────────────────────────────────────────────
   Plan cards with feature lists. Common patterns: side-by-side tier
   comparison, "most popular" highlight, monthly/annual toggle.
   ───────────────────────────────────────────────────────────────────── */

import { Check } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    features: ["1 connected platform", "Weekly KPIs", "Community access"],
    cta: "Current plan",
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      {PLANS.map((p) => (
        <div
          key={p.name}
          className={
            "card p-6 flex flex-col " +
            (p.highlighted ? "ring-2 ring-rose-600" : "")
          }
        >
          {p.highlighted && (
            <span className="self-start inline-flex items-center px-2 h-6 mb-3 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
              Most popular
            </span>
          )}
          <h3 className="text-h4 text-ink-900">{p.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-h1 text-ink-900 tabular-nums">{p.price}</span>
            <span className="text-[14px] text-ink-500">{p.cadence}</span>
          </div>
          <ul className="mt-5 space-y-2 flex-1">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-700">
                <Check className="size-4 text-rose-600 mt-0.5 shrink-0" strokeWidth={2.2} />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={
              "mt-6 inline-flex items-center justify-center h-10 px-4 rounded-[10px] text-[13.5px] font-medium transition-colors " +
              (p.highlighted
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                : "bg-cream-200 hover:bg-cream-300 text-ink-900")
            }
          >
            {p.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
