import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_IDS, isStripeConfigured } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 503 },
    );
  }

  const { plan } = (await req.json().catch(() => ({}))) as {
    plan?: "basic" | "pro";
  };
  if (plan !== "basic" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = sub?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // First-time subscribers get the advertised 7-day free trial; anyone who
  // has billed before goes straight to a paying subscription. This keeps the
  // sign-up "7-day free trial" promise real while stopping people from farming
  // endless trials by cancelling and re-subscribing. Card is still collected
  // up front (Stripe Checkout default for trials) and auto-charges at day 7
  // unless they cancel — matching the "cancel anytime" copy.
  const { count: priorInvoices } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const offerTrial = (priorInvoices ?? 0) === 0;

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${appUrl}/settings/payment-methods?status=success`,
    cancel_url: `${appUrl}/settings/payment-methods?status=cancelled`,
    allow_promotion_codes: true,
    metadata: { user_id: user.id, plan },
    subscription_data: {
      metadata: { user_id: user.id, plan },
      ...(offerTrial ? { trial_period_days: 7 } : {}),
    },
  };

  const session = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
