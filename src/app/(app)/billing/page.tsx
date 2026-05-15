import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Billing · Creator Growth OS" };

export default function BillingPage() {
  return (
    <PageStub
      title="Billing"
      description="Manage your plan, payments and invoices in one place."
      nextStep="Current plan card, payment method, plan comparison and upgrade flow (Free / Basic 999 NOK / Pro 1499 NOK), billing history with paid invoices, and Stripe checkout integration."
    />
  );
}
