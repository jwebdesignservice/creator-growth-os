import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, isStripeConfigured } from "@/lib/stripe/client";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 503 },
    );
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

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer for this user yet." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
