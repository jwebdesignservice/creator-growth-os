import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyBillingUpdate } from "@/lib/notifications/service";
import { qualifyReferral } from "@/lib/referrals/service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // no-op for unhandled types
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] handler for ${event.type} failed:`, err);
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) return;

  const userId = session.metadata?.user_id;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );
  await syncSubscriptionRow(userId, subscription);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription);
  if (!userId) return;
  await syncSubscriptionRow(userId, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription);
  if (!userId) return;
  const supabase = createServiceClient();
  await supabase
    .from("subscriptions")
    .update({
      plan: "free",
      status: "canceled",
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  await notifyBillingUpdate(
    userId,
    "Your subscription was cancelled. You're back on the Free plan.",
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const userId = await resolveUserIdFromInvoice(invoice);
  if (!userId) return;
  const supabase = createServiceClient();
  const chargeId =
    typeof (invoice as unknown as { charge?: string | null }).charge === "string"
      ? ((invoice as unknown as { charge?: string }).charge as string)
      : null;

  await supabase.from("invoices").upsert(
    {
      user_id: userId,
      stripe_invoice_id: invoice.id,
      stripe_charge_id: chargeId,
      number: invoice.number,
      description:
        invoice.lines.data[0]?.description ?? "Subscription payment",
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status ?? "paid",
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
      invoice_pdf: invoice.invoice_pdf ?? null,
      paid_at: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : new Date().toISOString(),
    },
    { onConflict: "stripe_invoice_id" },
  );
  const amount = (invoice.amount_paid / 100).toFixed(0);
  await notifyBillingUpdate(
    userId,
    `Payment received: ${amount} ${invoice.currency.toUpperCase()}.`,
  );

  // Referral qualification: a referred user's payment promotes their
  // referral from pending → qualified, and may trigger a milestone reward
  // for the referrer. qualifyReferral() is idempotent so repeated invoices
  // don't double-count.
  //
  // GATE — must be a *real* payment. A $0 invoice (a 100%-off promo code at
  // checkout, or a free-trial cycle) must NOT qualify the referral: the
  // reward is earned only when the invitee actually pays for a plan, never
  // for a free signup. If the first invoice is $0, the next non-zero invoice
  // will qualify them instead.
  if (invoice.amount_paid > 0) {
    await qualifyReferral(userId);
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const userId = await resolveUserIdFromInvoice(invoice);
  if (!userId) return;
  await notifyBillingUpdate(
    userId,
    "We couldn't process your latest payment. Please update your payment method.",
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function planFromPriceId(priceId: string | null | undefined):
  | "basic"
  | "pro"
  | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_BASIC) return "basic";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

async function syncSubscriptionRow(
  userId: string,
  subscription: Stripe.Subscription,
) {
  const supabase = createServiceClient();
  const priceId = subscription.items.data[0]?.price.id;
  const plan = planFromPriceId(priceId) ?? "basic";

  const prev = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  const periodEndSec = subscription.items.data[0]?.current_period_end;

  await supabase
    .from("subscriptions")
    .update({
      plan,
      status: subscription.status as SubscriptionStatus,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: periodEndSec
        ? new Date(periodEndSec * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (!prev.data || prev.data.plan !== plan) {
    await notifyBillingUpdate(
      userId,
      plan === "pro"
        ? "Welcome to Pro! All premium features are unlocked."
        : plan === "basic"
          ? "Welcome to Basic — advanced analytics are now active."
          : "Subscription updated.",
    );
  }
}

async function resolveUserId(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = subscription.metadata?.user_id;
  if (fromMeta) return fromMeta;

  const supabase = createServiceClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function resolveUserIdFromInvoice(
  invoice: Stripe.Invoice,
): Promise<string | null> {
  const supabase = createServiceClient();
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return null;
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";
