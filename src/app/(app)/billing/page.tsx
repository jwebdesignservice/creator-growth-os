import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getSubscription, getInvoices } from "@/lib/billing/queries";
import { isStripeConfigured } from "@/lib/stripe/client";
import { BillingPageClient } from "./billing-panel";

export const metadata = { title: "Billing · Creator Growth OS" };

export default async function BillingPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

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
    />
  );
}
