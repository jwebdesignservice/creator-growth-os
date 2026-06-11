import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getSubscription, getInvoices } from "@/lib/billing/queries";
import { isStripeConfigured } from "@/lib/stripe/client";
import { BillingPageClient } from "../../billing/billing-panel";

export const metadata = {
  title: "Payment methods · Settings",
};

// The full billing experience now lives here, inside Settings → Payment
// methods. This renders the exact same `BillingPageClient` the standalone
// `/billing` page used (now a redirect), so plan management, checkout,
// the Stripe portal and invoices behave identically — just inside the
// settings chrome (left nav) provided by `settings/layout.tsx`.
//
// Consumed query params: `?status=success|cancelled` (Stripe Checkout return
// URLs) drives the post-checkout banner; `?upgrade=pro|basic` (forwarded from
// the many "Upgrade to Pro" CTAs via /billing) opens and scrolls to the
// matching plan in the Compare plans section.
export default async function PaymentMethodsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
    upgrade?: string | string[];
  }>;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;
  const statusRaw = Array.isArray(params.status) ? params.status[0] : params.status;
  const checkoutStatus =
    statusRaw === "success" || statusRaw === "cancelled" ? statusRaw : null;
  const upgradeRaw = Array.isArray(params.upgrade) ? params.upgrade[0] : params.upgrade;
  const highlightPlan =
    upgradeRaw === "pro" || upgradeRaw === "basic" ? upgradeRaw : null;

  const firstName =
    (ctx.profile?.display_name ?? ctx.profile?.full_name ?? ctx.user.email?.split("@")[0] ?? "Creator")
      .split(" ")[0];

  const [subscription, invoices] = await Promise.all([
    getSubscription(ctx.user.id),
    getInvoices(ctx.user.id),
  ]);

  return (
    <BillingPageClient
      plan={ctx.plan}
      subscription={subscription}
      invoices={invoices}
      stripeReady={isStripeConfigured()}
      firstName={firstName}
      checkoutStatus={checkoutStatus}
      highlightPlan={highlightPlan}
    />
  );
}
