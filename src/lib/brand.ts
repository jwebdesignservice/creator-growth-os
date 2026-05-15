// Brand string of record per V3 brief; visual logo is the M-crown mark from the design comps.
export const BRAND_NAME = "Creator Growth OS";
export const BRAND_TAGLINE = "How To Become A Successful Social Media Influencer";

export const PLAN_PRICES = {
  free: { amount: 0, label: "Free", currency: "NOK" },
  basic: { amount: 999, label: "Basic", currency: "NOK" },
  pro: { amount: 1499, label: "Pro", currency: "NOK" },
} as const;

export type PlanKey = keyof typeof PLAN_PRICES;

export const CATEGORIES = [
  {
    key: "starter",
    label: "Starter Creator",
    description: "0-1k followers or no consistent posting system.",
    focus: "Niche clarity, profile setup, simple posting rhythm, basic confidence.",
  },
  {
    key: "growth",
    label: "Growth Creator",
    description: "1k-10k followers or consistent posting goal.",
    focus: "Hooks, content calendar, output volume, analytics habits, content improvement.",
  },
  {
    key: "monetization",
    label: "Monetization Creator",
    description: "10k-50k followers or revenue goal.",
    focus: "Brand deals, media kit, outreach, pricing, offer clarity, trust-building.",
  },
  {
    key: "scale",
    label: "Scale Creator",
    description: "50k+ followers or advanced growth need.",
    focus: "Systems, partnerships, productization, deeper analytics and leverage.",
  },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
