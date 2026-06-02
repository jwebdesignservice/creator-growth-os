import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getSubscription, getInvoices } from "@/lib/billing/queries";
import { isStripeConfigured } from "@/lib/stripe/client";
import { BillingPageClient } from "../../billing/billing-panel";

export const metadata = {
  title: "Payment methods · Settings · Creator Growth OS",
};

// The full billing experience now lives here, inside Settings → Payment
// methods. This renders the exact same `BillingPageClient` the standalone
// `/billing` page used (now a redirect), so plan management, checkout,
// the Stripe portal and invoices behave identically — just inside the
// settings chrome (left nav) provided by `settings/layout.tsx`.
export default async function PaymentMethodsSettingsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

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
    />
  );
}
