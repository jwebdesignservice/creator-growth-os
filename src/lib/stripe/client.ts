import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.warn("[stripe] STRIPE_SECRET_KEY missing — checkout disabled.");
}

export const stripe = new Stripe(key ?? "sk_test_missing", {
  apiVersion: "2026-04-22.dahlia",
});

export const STRIPE_PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BASIC ?? "",
  pro: process.env.STRIPE_PRICE_PRO ?? "",
} as const;

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_") &&
      STRIPE_PRICE_IDS.basic &&
      STRIPE_PRICE_IDS.pro,
  );
}
