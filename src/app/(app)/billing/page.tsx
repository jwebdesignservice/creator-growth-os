import { redirect } from "next/navigation";

export const metadata = { title: "Billing | Profluencer" };

/**
 * Billing has moved into Settings → Payment methods. This route is kept as
 * a redirect so every existing link to `/billing` (top-bar, profile menu,
 * command palette, "Upgrade to Pro" CTAs, etc.) still lands on the same
 * billing experience in its new home — nothing 404s. Query params (e.g.
 * `?upgrade=pro` from upgrade CTAs, `?status=…` from Stripe returns) are
 * forwarded so the destination page can act on them.
 */
export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) for (const v of value) qs.append(key, v);
  }
  const query = qs.toString();
  redirect(`/settings/payment-methods${query ? `?${query}` : ""}`);
}
