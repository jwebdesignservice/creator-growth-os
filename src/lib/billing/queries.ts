import { createClient } from "@/lib/supabase/server";

export type SubscriptionRow = {
  plan: "free" | "basic" | "pro";
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type InvoiceRow = {
  id: string;
  number: string | null;
  description: string | null;
  amount_paid: number;
  currency: string;
  status: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  paid_at: string | null;
  created_at: string;
};

export async function getSubscription(
  userId: string,
): Promise<SubscriptionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end",
    )
    .eq("user_id", userId)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export async function getInvoices(
  userId: string,
  limit = 10,
): Promise<InvoiceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "id, number, description, amount_paid, currency, status, hosted_invoice_url, invoice_pdf, paid_at, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as InvoiceRow[] | null) ?? [];
}
