"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { InvoiceRow, SubscriptionRow } from "@/lib/billing/queries";
import {
  Crown,
  Check,
  Download,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

type Plan = "free" | "basic" | "pro";

// ─────────────────────────────────────────────────────────────────────────────
// Static plan catalogue (prices/features). Stripe drives the live subscription.
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_INFO: Record<
  Plan,
  { label: string; price: number; description: string; features: string[] }
> = {
  free: {
    label: "Free",
    price: 0,
    description: "Perfect for getting started with the basics.",
    features: [
      "Core learning content",
      "Community access",
      "3 posting plans",
      "Basic analytics",
    ],
  },
  basic: {
    label: "Basic",
    price: 999,
    description: "Everything you need to grow your brand and audience.",
    features: [
      "Everything in Free",
      "Advanced analytics",
      "10 posting plans",
      "Brand deal alerts",
      "Email support",
    ],
  },
  pro: {
    label: "Pro",
    price: 1499,
    description: "Advanced tools and premium resources to scale faster.",
    features: [
      "Everything in Basic",
      "AI content ideas",
      "Unlimited posting plans",
      "Priority support",
      "1-on-1 coaching calls",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export function BillingPageClient({
  plan,
  subscription,
  invoices,
  stripeReady,
  firstName,
}: {
  plan: Plan;
  subscription: SubscriptionRow | null;
  invoices: InvoiceRow[];
  stripeReady: boolean;
  firstName?: string;
}) {
  const hasSubscription = Boolean(subscription?.stripe_subscription_id);

  return (
    <PageShell>
      <div className="container-content space-y-[var(--space-section-gap)]">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header>
          {firstName && (
            <div className="text-rose-600 font-medium text-[13.5px] flex items-center gap-2 mb-2">
              Welcome back, {firstName}! <span aria-hidden>👋</span>
            </div>
          )}
          <h1 className="font-display text-page-title text-ink-900 leading-tight">
            Billing
          </h1>
          <p className="text-body-sm text-ink-500 mt-1">
            Manage your subscription, payment method and invoices.
          </p>
          {!stripeReady && (
            <p className="mt-3 text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2 inline-block">
              Stripe is not yet configured — checkout & invoices will activate
              once env vars are set.
            </p>
          )}
        </header>

        {/* ── Subscription overview (plan + status + key billing facts) ── */}
        <SubscriptionHero
          plan={plan}
          subscription={subscription}
          stripeReady={stripeReady}
          hasSubscription={hasSubscription}
        />

        {/* ── Payment method ───────────────────────────────────────────── */}
        <PaymentMethodCard
          hasSubscription={hasSubscription}
          stripeReady={stripeReady}
        />

        {/* ── Billing history ──────────────────────────────────────────── */}
        <RecentInvoicesCard invoices={invoices} />

        {/* ── Compare plans (secondary, collapsible) ───────────────────── */}
        <ComparePlansSection plan={plan} stripeReady={stripeReady} />

        {/* ── Support line (replaces the standalone "Need help?" card) ──── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-2.5 gap-y-1.5 pt-1 text-body-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="size-4 text-ink-400" strokeWidth={2} />
            Questions about billing?
          </span>
          <span className="hidden sm:inline text-ink-300">·</span>
          <Link
            href="/support"
            className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Contact support
          </Link>
          <span className="text-ink-300">·</span>
          <Link
            href="/support"
            className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Billing FAQ
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action hooks (checkout / portal) — unchanged wiring to the billing API
// ─────────────────────────────────────────────────────────────────────────────

function useCheckout() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const start = (plan: "basic" | "pro") => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) {
        setError(body.error ?? "Could not start checkout.");
        return;
      }
      window.location.href = body.url;
    });
  };

  return { start, pending, error };
}

function usePortal() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) {
        setError(body.error ?? "Could not open billing portal.");
        return;
      }
      window.location.href = body.url;
    });
  };

  return { open, pending, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Subscription hero — merges the old "Current Plan" + "Billing Summary"
// ─────────────────────────────────────────────────────────────────────────────

function SubscriptionHero({
  plan,
  subscription,
  stripeReady,
  hasSubscription,
}: {
  plan: Plan;
  subscription: SubscriptionRow | null;
  stripeReady: boolean;
  hasSubscription: boolean;
}) {
  const info = PLAN_INFO[plan];
  const isPro = plan === "pro";
  const isFree = info.price === 0;
  const { start: startCheckout, pending: checkoutPending, error: checkoutError } =
    useCheckout();
  const { open: openPortal, pending: portalPending, error: portalError } =
    usePortal();

  const cancelling = subscription?.cancel_at_period_end ?? false;
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const status = deriveStatus(subscription?.status, cancelling);
  const error = checkoutError ?? portalError;

  return (
    <section className="card overflow-hidden">
      {/* Identity + primary actions */}
      <div className="p-[var(--space-card-padding)] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <span className="size-14 rounded-2xl bg-rose-100 grid place-items-center shrink-0">
            <Crown className="size-7 text-rose-600" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-h4 text-ink-900 leading-none">
                {info.label} plan
              </h2>
              <StatusBadge label={status.label} tone={status.tone} />
            </div>
            <p className="text-body-sm text-ink-500 mt-1.5">
              {isFree ? (
                "Free — no payment required"
              ) : (
                <>
                  <span className="font-bold text-ink-900 tabular-nums">
                    {info.price} kr
                  </span>{" "}
                  per month
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {!isPro && (
            <Button
              size="md"
              disabled={!stripeReady || checkoutPending}
              onClick={() => startCheckout("pro")}
            >
              {checkoutPending ? "Redirecting…" : "Upgrade to Pro"}
            </Button>
          )}
          {hasSubscription && (
            <Button
              size="md"
              variant={isPro ? "primary" : "outline"}
              disabled={!stripeReady || portalPending}
              onClick={openPortal}
            >
              {portalPending ? "Opening…" : "Manage subscription"}
              <ExternalLink className="size-4" strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="px-[var(--space-card-padding)] -mt-2 pb-2 text-[12.5px] text-rose-600">
          {error}
        </p>
      )}

      {/* Key billing facts — stacked on mobile, 3-up from sm */}
      <dl className="border-t border-ink-100 bg-cream-50/50 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink-100">
        <Fact label={cancelling ? "Plan ends" : "Next payment"} value={periodEnd} />
        <Fact label="Amount due" value={cancelling || isFree ? "—" : `${info.price} kr`} />
        <Fact label="Billing cycle" value={isFree ? "—" : "Monthly"} />
      </dl>

      {cancelling && (
        <div className="border-t border-amber-200 bg-amber-50 px-[var(--space-card-padding)] py-3 text-[12.5px] text-amber-700">
          Your plan stays active until {periodEnd}, then switches to Free.
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-[var(--space-card-padding)] py-4">
      <dt className="text-label-caps text-ink-400">{label}</dt>
      <dd className="text-body-sm font-semibold text-ink-900 mt-1 tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "amber" | "ink";
}) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    ink: "bg-ink-100 text-ink-600",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}

function deriveStatus(
  status: SubscriptionRow["status"] | undefined,
  cancelling: boolean,
): { label: string; tone: "emerald" | "amber" | "ink" } {
  if (cancelling) return { label: "Cancels soon", tone: "amber" };
  switch (status) {
    case "past_due":
      return { label: "Past due", tone: "amber" };
    case "incomplete":
      return { label: "Incomplete", tone: "amber" };
    case "canceled":
      return { label: "Cancelled", tone: "ink" };
    case "trialing":
      return { label: "Trial", tone: "emerald" };
    default:
      return { label: "Active", tone: "emerald" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Payment method
// ─────────────────────────────────────────────────────────────────────────────

function PaymentMethodCard({
  hasSubscription,
  stripeReady,
}: {
  hasSubscription: boolean;
  stripeReady: boolean;
}) {
  const { open, pending, error } = usePortal();

  return (
    <section className="card p-[var(--space-card-padding)]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <span className="size-12 rounded-xl bg-cream-100 border border-ink-100 grid place-items-center shrink-0">
            {hasSubscription ? (
              <MastercardIcon size="lg" />
            ) : (
              <CreditCard className="size-5 text-ink-400" strokeWidth={1.7} />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="text-card-title font-semibold text-ink-900">
              Payment method
            </h3>
            <p className="text-body-sm text-ink-500 mt-0.5 flex items-center gap-1.5">
              {hasSubscription ? (
                <>
                  <ShieldCheck
                    className="size-4 text-emerald-500 shrink-0"
                    strokeWidth={2}
                  />
                  Securely managed in Stripe
                </>
              ) : (
                "No payment method on file yet"
              )}
            </p>
          </div>
        </div>

        {hasSubscription ? (
          <Button
            variant="outline"
            size="md"
            className="shrink-0"
            disabled={!stripeReady || pending}
            onClick={open}
          >
            {pending ? "Opening…" : "Update card"}
          </Button>
        ) : (
          <span className="text-[12.5px] text-ink-400 shrink-0">
            Added when you upgrade
          </span>
        )}
      </div>

      {error && <p className="mt-3 text-[12.5px] text-rose-600">{error}</p>}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Compare plans — collapsible. Collapsed by default once the user is on a
// paid plan (keeps the page lean); expanded on Free so upgrades stay visible.
// ─────────────────────────────────────────────────────────────────────────────

function ComparePlansSection({
  plan,
  stripeReady,
}: {
  plan: Plan;
  stripeReady: boolean;
}) {
  const [open, setOpen] = useState(plan === "free");

  return (
    <section id="plans" className="card overflow-hidden scroll-mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="compare-plans-body"
        className="w-full flex items-center justify-between gap-3 p-[var(--space-card-padding)] text-left hover:bg-cream-50/60 transition-colors"
      >
        <div className="min-w-0">
          <h2 className="font-display text-h5 text-ink-900 leading-tight">
            Compare plans
          </h2>
          <p className="text-body-sm text-ink-500 mt-1">
            {open
              ? "Upgrade, downgrade or cancel anytime from the Stripe portal."
              : "See everything each plan includes."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center h-7 px-2.5 rounded-full bg-rose-50 text-[12px] font-semibold text-rose-700">
            Save 16% with Pro
          </span>
          <span className="size-8 rounded-full border border-ink-200 grid place-items-center text-ink-500">
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-300",
                open && "rotate-180",
              )}
              strokeWidth={2}
            />
          </span>
        </div>
      </button>

      {/* Smooth expand via grid-rows 0fr → 1fr (no animation plugin needed) */}
      <div
        id="compare-plans-body"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {/* pt-4 leaves room for the Pro card's floating "Most Popular" badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-grid-gap-sm)] px-[var(--space-card-padding)] pb-[var(--space-card-padding)] pt-4 border-t border-ink-100">
            {(["free", "basic", "pro"] as const).map((key) => (
              <PlanCard
                key={key}
                planKey={key}
                currentPlan={plan}
                stripeReady={stripeReady}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Plan card (used in the "Compare plans" grid)
// ─────────────────────────────────────────────────────────────────────────────

function PlanCard({
  planKey,
  currentPlan,
  stripeReady,
}: {
  planKey: Plan;
  currentPlan: Plan;
  stripeReady: boolean;
}) {
  const info = PLAN_INFO[planKey];
  const isCurrent = planKey === currentPlan;
  const isPro = planKey === "pro";
  const isFree = planKey === "free";
  const { start: startCheckout, pending } = useCheckout();

  return (
    <div
      className={cn(
        "relative rounded-[14px] p-[var(--space-stack-lg)] flex flex-col border transition-all",
        isCurrent
          ? "border-rose-300 bg-cream-50/60 shadow-sm"
          : isPro
            ? "border-2 border-rose-500 bg-white shadow-card ring-4 ring-rose-100"
            : "border-ink-100 bg-white",
      )}
    >
      {/* Floating "Most Popular" badge — overlaps card top edge for premium lift */}
      {isPro && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center h-6 px-3 rounded-full bg-rose-600 text-[10.5px] font-bold tracking-wide uppercase text-white shadow-sm whitespace-nowrap">
          Most Popular
        </span>
      )}

      {/* Header */}
      <div className="mb-[var(--space-stack-md)]">
        <div className="flex items-center justify-between gap-1 mb-1 flex-wrap">
          <span className="text-body-sm font-bold text-ink-900">
            {info.label}
          </span>
          {isCurrent && (
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-rose-100 text-[10px] font-bold text-rose-700 shrink-0">
              Current
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-h4 text-ink-900">{info.price}</span>
          <span className="text-[11px] text-ink-500">kr/month</span>
        </div>
        <p className="text-tiny text-ink-500 mt-1 leading-snug">
          {info.description}
        </p>
      </div>

      {/* CTA — min-h ensures comfortable touch target on mobile */}
      <div className="mb-[var(--space-grid-gap-sm)]">
        {isCurrent ? (
          <button
            type="button"
            disabled
            className="w-full min-h-[2.25rem] sm:h-9 rounded-[10px] border border-rose-300 text-[12.5px] font-semibold text-rose-600 bg-white cursor-default"
          >
            Current Plan
          </button>
        ) : isFree ? (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="w-full min-h-[2.75rem] sm:min-h-0 opacity-60 cursor-default"
          >
            Free Forever
          </Button>
        ) : (
          <Button
            size="sm"
            variant={isPro ? "primary" : "outline"}
            className="w-full min-h-[2.75rem] sm:min-h-0"
            disabled={!stripeReady || pending}
            onClick={() => startCheckout(planKey as "basic" | "pro")}
          >
            {pending ? "Redirecting…" : isPro ? "Upgrade to Pro" : "Get Basic"}
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-ink-100 mb-[var(--space-stack-md)]" />

      {/* Features */}
      <ul className="space-y-[var(--space-stack-sm)]">
        {info.features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <Check
              className="size-3.5 text-rose-500 mt-[0.15rem] shrink-0"
              strokeWidth={2.5}
            />
            <span className="text-tiny text-ink-700 leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Billing history (invoices)
// ─────────────────────────────────────────────────────────────────────────────

function RecentInvoicesCard({ invoices }: { invoices: InvoiceRow[] }) {
  if (invoices.length === 0) {
    return (
      <div className="card p-[var(--space-card-padding)] text-center">
        <h3 className="text-[13px] font-semibold text-ink-900 mb-2">
          Billing history
        </h3>
        <p className="text-[12.5px] text-ink-500">
          No invoices yet. They&apos;ll appear here after your first payment.
        </p>
      </div>
    );
  }

  const formatAmount = (a: number, c: string) =>
    `${(a / 100).toFixed(0)} ${c.toUpperCase()}`;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-[var(--space-table-cell-x)] py-4 border-b border-ink-100">
        <h3 className="text-[13px] font-semibold text-ink-900">Billing history</h3>
      </div>

      {/* Mobile (<sm): stacked invoice cards */}
      <div className="sm:hidden divide-y divide-ink-50">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-4 hover:bg-cream-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-ink-900 truncate">
                  {inv.description ?? "Subscription payment"}
                </div>
                <div className="text-[12px] text-ink-500 mt-0.5">
                  {new Date(inv.paid_at ?? inv.created_at).toLocaleDateString()} ·{" "}
                  <span className="font-mono">{inv.number ?? "—"}</span>
                </div>
              </div>
              {inv.invoice_pdf && (
                <a
                  href={`/invoices/${inv.id}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View invoice"
                  className="size-10 rounded-[10px] hover:bg-cream-200 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:outline-none shrink-0"
                >
                  <Download className="size-4 text-ink-500" strokeWidth={2} />
                </a>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 mt-3">
              <span
                className={cn(
                  "inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold capitalize",
                  inv.status === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                {inv.status}
              </span>
              <span className="text-[14px] font-semibold text-ink-900 tabular-nums">
                {formatAmount(inv.amount_paid, inv.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet+ */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[var(--table-min-width)]">
          <div className="grid grid-cols-[1fr_1.1fr_2fr_0.9fr_0.9fr_2.5rem] gap-3 px-[var(--space-table-cell-x)] py-3 bg-cream-50 border-b border-ink-100">
            {["Date", "Invoice #", "Description", "Status", "Amount", ""].map(
              (h, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide"
                >
                  {h}
                </span>
              ),
            )}
          </div>

          <div className="divide-y divide-ink-50">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[1fr_1.1fr_2fr_0.9fr_0.9fr_2.5rem] gap-3 px-[var(--space-table-cell-x)] py-[var(--space-table-cell-y)] hover:bg-cream-50 transition-colors items-center"
              >
                <span className="text-[var(--text-table)] text-ink-700 whitespace-nowrap">
                  {new Date(inv.paid_at ?? inv.created_at).toLocaleDateString()}
                </span>
                <span className="text-[var(--text-mono)] text-ink-700 font-mono whitespace-nowrap">
                  {inv.number ?? "—"}
                </span>
                <span className="text-[var(--text-table)] text-ink-700 truncate">
                  {inv.description ?? "Subscription payment"}
                </span>
                <span>
                  <span
                    className={cn(
                      "inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold capitalize",
                      inv.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {inv.status}
                  </span>
                </span>
                <span className="text-[var(--text-table)] font-semibold text-ink-900 whitespace-nowrap tabular-nums">
                  {formatAmount(inv.amount_paid, inv.currency)}
                </span>
                {inv.invoice_pdf ? (
                  <a
                    href={`/invoices/${inv.id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View invoice"
                    className="size-9 sm:size-8 rounded-[8px] hover:bg-cream-200 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:outline-none"
                  >
                    <Download className="size-4 text-ink-500" strokeWidth={2} />
                  </a>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MastercardIcon({ size = "sm" }: { size?: "sm" | "lg" }) {
  const w = size === "lg" ? 36 : 24;
  const h = size === "lg" ? 22 : 15;
  return (
    <svg width={w} height={h} viewBox="0 0 38 24" fill="none" aria-hidden>
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" />
    </svg>
  );
}
