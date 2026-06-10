import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Marketing pricing — mirrors the real in-app plan catalogue
 * (billing-panel.tsx): Free / Basic / Pro, prices in kr/month, with Basic
 * highlighted as the popular pick. Every CTA leads to sign-up.
 */

type Plan = {
  label: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  features: string[];
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    label: "Free",
    price: "0",
    cadence: "Free forever",
    description: "Perfect for getting started with the basics.",
    cta: "Start free",
    features: [
      "Core learning content",
      "Community access",
      "3 posting plans",
      "Basic analytics",
    ],
  },
  {
    label: "Basic",
    price: "999",
    cadence: "kr / month",
    description: "Everything you need to grow your brand and audience.",
    cta: "Choose Basic",
    featured: true,
    features: [
      "Everything in Free",
      "Advanced analytics",
      "10 posting plans",
      "Brand deal alerts",
      "Email support",
    ],
  },
  {
    label: "Pro",
    price: "1499",
    cadence: "kr / month",
    description: "Advanced tools and resources to scale faster.",
    cta: "Choose Pro",
    features: [
      "Everything in Basic",
      "AI content ideas",
      "Unlimited posting plans",
      "Priority support",
      "1-on-1 coaching calls",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-[1120px] px-6 py-20 lg:py-28">
        {/* Header */}
        <div className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-rose-600">
            Pricing
          </span>
          <h2 className="mt-5 font-sans text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[2.75rem]">
            Simple pricing that grows with you
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-[15.5px] leading-relaxed text-ink-500">
            Start free, upgrade when you&apos;re ready. No card to begin, cancel
            anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-12 grid items-start gap-6 lg:mt-16 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.label}
              className={cn(
                "relative flex flex-col rounded-[20px] bg-white p-7 shadow-[0_1px_3px_rgba(26,24,22,0.04),0_14px_36px_rgba(26,24,22,0.06)]",
                p.featured ? "ring-2 ring-rose-500" : "ring-1 ring-ink-100",
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-[11.5px] font-semibold text-white shadow-sm">
                  Most popular
                </span>
              )}
              <div className="text-[15px] font-semibold text-ink-900">{p.label}</div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-[40px] font-bold leading-none tracking-tight text-ink-900 tabular-nums">
                  {p.price}
                </span>
                <span className="text-[14px] font-medium text-ink-400">{p.cadence}</span>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500">
                {p.description}
              </p>
              <Link
                href="/sign-up"
                className={cn(
                  "mt-6 inline-flex h-11 items-center justify-center rounded-[12px] px-5 text-[14px] font-semibold transition-colors",
                  p.featured
                    ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                    : "border border-ink-200 bg-white text-ink-900 hover:bg-cream-100",
                )}
              >
                {p.cta}
              </Link>
              <ul className="mt-7 space-y-3 border-t border-ink-100 pt-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink-700">
                    <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
