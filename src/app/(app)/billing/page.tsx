import { redirect } from "next/navigation";

export const metadata = { title: "Billing | Creator Growth OS" };

/**
 * Billing has moved into Settings → Payment methods. This route is kept as
 * a permanent redirect so every existing link to `/billing` (top-bar,
 * profile menu, command palette, "Upgrade to Pro" CTAs, etc.) still lands
 * on the same billing experience in its new home — nothing 404s.
 */
export default function BillingPage() {
  redirect("/settings/payment-methods");
}
