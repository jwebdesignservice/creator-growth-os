// Referral program server-side service.
//
// Lifecycle:
//   1. User signs up with `?ref=CODE` → linkReferral() creates a `referrals`
//      row with status='pending'.
//   2. That user's first Stripe invoice.paid arrives → qualifyReferral()
//      flips the row to status='qualified'.
//   3. We then count the referrer's total qualified referrals and, if they
//      just crossed 3 or 9, grant a milestone reward (Stripe coupon
//      attached to their active subscription).
//
// Rewards:
//   - 3 qualified referrals → 1 month free (100% off, 1 cycle)
//   - 9 qualified referrals → 3 months free (100% off, 3 cycles)
// Each milestone is grantable exactly once per user (enforced by
// referral_rewards.unique(user_id, milestone)).

import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyBillingUpdate } from "@/lib/notifications/service";

type MilestoneTier = { threshold: 3 | 9; monthsFree: 1 | 3 };

const MILESTONES: readonly MilestoneTier[] = [
  { threshold: 3, monthsFree: 1 },
  { threshold: 9, monthsFree: 3 },
];

// ── linkReferral ──────────────────────────────────────────────────────
// Called from the signup action once the auth user exists. `code` is the
// referrer's referral_code captured from the ?ref= query param.
export async function linkReferral(
  refereeId: string,
  code: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const trimmed = code.trim().toLowerCase();
  if (!trimmed) return { ok: false, reason: "empty_code" };

  const svc = createServiceClient();
  const { data: referrer } = await svc
    .from("profiles")
    .select("id")
    .eq("referral_code", trimmed)
    .maybeSingle();

  if (!referrer) return { ok: false, reason: "code_not_found" };
  if (referrer.id === refereeId) return { ok: false, reason: "self_referral" };

  const { error } = await svc.from("referrals").insert({
    referrer_id: referrer.id,
    referee_id: refereeId,
    status: "pending",
  });

  if (error) {
    // unique_violation = this referee was already linked to someone (or themselves).
    // Don't surface as a hard error — first referrer wins, signup proceeds.
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false, reason: "already_linked" };
    }
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

// ── qualifyReferral ───────────────────────────────────────────────────
// Called from the Stripe invoice.paid webhook for the referee. Idempotent:
// if already qualified, no-op. Returns whether a milestone was newly hit.
export async function qualifyReferral(refereeId: string): Promise<void> {
  const svc = createServiceClient();

  const { data: row } = await svc
    .from("referrals")
    .select("id, referrer_id, status")
    .eq("referee_id", refereeId)
    .maybeSingle();

  if (!row) return; // not a referred user
  if (row.status === "qualified") return; // already counted
  if (row.status === "reverted") return; // chargeback / fraud — don't re-qualify

  // Flip to qualified.
  const { error: flipErr } = await svc
    .from("referrals")
    .update({
      status: "qualified",
      qualified_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("status", "pending"); // guard against races

  if (flipErr) {
    console.error("[referrals] qualify update failed:", flipErr);
    return;
  }

  // Re-count qualified referrals for the referrer and grant any newly
  // crossed milestones.
  await checkAndGrantMilestones(row.referrer_id);
}

// ── checkAndGrantMilestones ───────────────────────────────────────────
// Counts the referrer's qualified referrals and grants any milestone
// rewards that haven't been granted yet. Safe to call multiple times —
// the UNIQUE(user_id, milestone) constraint on referral_rewards prevents
// duplicate grants.
async function checkAndGrantMilestones(referrerId: string): Promise<void> {
  const svc = createServiceClient();

  const { count } = await svc
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", referrerId)
    .eq("status", "qualified");

  const qualified = count ?? 0;

  for (const tier of MILESTONES) {
    if (qualified < tier.threshold) continue;

    // Already granted? Skip.
    const { data: existing } = await svc
      .from("referral_rewards")
      .select("id")
      .eq("user_id", referrerId)
      .eq("milestone", tier.threshold)
      .maybeSingle();
    if (existing) continue;

    await grantMilestoneReward(referrerId, tier);
  }
}

// ── grantMilestoneReward ──────────────────────────────────────────────
// Creates a single-customer 100%-off Stripe coupon for `monthsFree`
// billing cycles, appends it to the referrer's active subscription's
// existing discounts (so we never overwrite a prior reward or promo
// code), and records the audit row.
//
// Concurrency: we INSERT the audit row FIRST. If a parallel webhook
// already inserted it (unique violation on user_id+milestone), we bail
// out before doing any Stripe work — no duplicate coupons, no duplicate
// notifications. The Stripe call + the audit row update happen only on
// the winning path.
async function grantMilestoneReward(
  referrerId: string,
  tier: MilestoneTier,
): Promise<void> {
  const svc = createServiceClient();

  // ── 1. Reserve the milestone by inserting the audit row first.
  // .select() forces the response to include the inserted row, letting
  // us distinguish "won the race" from "lost the race" by inspecting
  // the error code (23505 = unique_violation in Postgres).
  const { data: reserved, error: reserveErr } = await svc
    .from("referral_rewards")
    .insert({
      user_id: referrerId,
      milestone: tier.threshold,
      months_free: tier.monthsFree,
      stripe_coupon_id: null,
      applied_to_subscription: false,
    })
    .select("id")
    .single();

  if (reserveErr) {
    // Lost the race (or other DB error). Either way: don't proceed with
    // Stripe calls or notifications — the winning invocation will handle
    // those, or has already.
    if (!/duplicate|unique|23505/i.test(reserveErr.message)) {
      console.error("[referrals] reward insert failed:", reserveErr);
    }
    return;
  }

  // ── 2. Look up the referrer's Stripe customer + active subscription.
  const { data: sub } = await svc
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id, status")
    .eq("user_id", referrerId)
    .maybeSingle();

  let stripeCouponId: string | null = null;
  let applied = false;

  if (sub?.stripe_customer_id) {
    try {
      // duration='repeating' + duration_in_months=N + percent_off=100
      // waives the next N invoices once attached to the subscription.
      const coupon = await stripe.coupons.create({
        name: `Referral reward: ${tier.monthsFree} month${tier.monthsFree > 1 ? "s" : ""} free (${tier.threshold} referrals)`,
        percent_off: 100,
        duration: "repeating",
        duration_in_months: tier.monthsFree,
        metadata: {
          kind: "referral_milestone",
          referrer_id: referrerId,
          milestone: String(tier.threshold),
        },
      });
      stripeCouponId = coupon.id;

      if (sub.stripe_subscription_id && sub.status !== "canceled") {
        // CRITICAL: stripe.subscriptions.update with `discounts` REPLACES
        // the array. We must fetch current discounts and append, otherwise
        // we'd wipe out any prior reward or checkout promo code.
        //
        // Subscription.discounts is `Array<string | Discount>` — by default
        // string IDs; passing `expand: ['discounts']` returns full objects
        // so we can read the coupon out of each one's `source`.
        const current = await stripe.subscriptions.retrieve(
          sub.stripe_subscription_id,
          { expand: ["discounts"] },
        );
        const existing: { coupon: string }[] = (current.discounts ?? [])
          .map((d): { coupon: string } | null => {
            if (typeof d === "string") return null; // shouldn't happen with expand
            const c = d.source?.coupon;
            if (!c) return null;
            return { coupon: typeof c === "string" ? c : c.id };
          })
          .filter((x): x is { coupon: string } => x !== null);

        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          discounts: [...existing, { coupon: coupon.id }],
        });
        applied = true;
      }
    } catch (err) {
      console.error("[referrals] Stripe coupon create/attach failed:", err);
      // Don't roll back the audit row — support can attach the coupon manually.
      // We still own the row, so retries from Stripe won't double-grant.
    }
  }

  // ── 3. Update the audit row with the actual Stripe details.
  await svc
    .from("referral_rewards")
    .update({
      stripe_coupon_id: stripeCouponId,
      applied_to_subscription: applied,
    })
    .eq("id", reserved.id);

  // ── 4. Notify (only the winning invocation reaches here).
  const label =
    tier.monthsFree === 1 ? "1 month free" : `${tier.monthsFree} months free`;
  await notifyBillingUpdate(
    referrerId,
    `You hit ${tier.threshold} qualified referrals — ${label} has been added to your subscription.`,
  );
}
