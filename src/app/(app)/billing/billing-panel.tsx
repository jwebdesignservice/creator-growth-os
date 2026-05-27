"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { InvoiceRow, SubscriptionRow } from "@/lib/billing/queries";
import {
  Crown,
  Calendar,
  Check,
  Download,
  MessageCircle,
  ArrowRight,
  Mail,
  BarChart2,
  CalendarDays,
  Bell,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Static billing data (Stripe integration pending)
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_INFO = {
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
} as const;

const INCLUDED_FEATURES: { icon: React.ReactNode; label: string }[] = [
  { icon: <Mail      className="size-[1.125rem] text-rose-600" strokeWidth={1.8} />, label: "Access to all core courses and tutorials"       },
  { icon: <BarChart2 className="size-[1.125rem] text-rose-600" strokeWidth={1.8} />, label: "Advanced analytics & performance insights"       },
  { icon: <CalendarDays className="size-[1.125rem] text-rose-600" strokeWidth={1.8} />, label: "Up to 10 posting plans"                     },
  { icon: <Bell      className="size-[1.125rem] text-rose-600" strokeWidth={1.8} />, label: "Brand deal alerts and opportunities"            },
  { icon: <Mail      className="size-[1.125rem] text-rose-600" strokeWidth={1.8} />, label: "Priority email support"                        },
];

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
  plan: "free" | "basic" | "pro";
  subscription: SubscriptionRow | null;
  invoices: InvoiceRow[];
  stripeReady: boolean;
  firstName?: string;
}) {
  return (
    <PageShell>
      <div className="w-full max-w-[var(--container-dashboard)] space-y-[var(--space-section-gap)]">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div>
          {firstName && (
            <div className="text-rose-600 font-medium text-[13.5px] flex items-center gap-2 mb-2">
              Welcome back, {firstName}! <span aria-hidden>👋</span>
            </div>
          )}
          <h1 className="font-display text-page-title text-ink-900 leading-tight">
            Billing
          </h1>
          <p className="text-body-sm text-ink-500 mt-1">
            Manage your subscription, payment methods, and invoices.
          </p>
          {!stripeReady && (
            <p className="mt-3 text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2 inline-block">
              Stripe is not yet configured — checkout & invoices will activate once env vars are set.
            </p>
          )}
        </div>

        {/* ── Row 1: Current Plan + Plan Picker ───────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[20rem_1fr] xl:items-start gap-[var(--space-grid-gap)]">
          <CurrentPlanCard
            plan={plan}
            subscription={subscription}
            stripeReady={stripeReady}
          />
          <PlanPickerCard currentPlan={plan} stripeReady={stripeReady} />
        </div>

        {/* ── Row 2: 4 info cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-grid-gap)]">
          <PaymentMethodCard
            hasSubscription={Boolean(subscription?.stripe_subscription_id)}
            stripeReady={stripeReady}
          />
          <BillingSummaryCard plan={plan} subscription={subscription} />
          <WhatsIncludedCard plan={plan} />
          <NeedHelpCard />
        </div>

        {/* ── Row 3: Invoices ─────────────────────────────────────────── */}
        <RecentInvoicesCard invoices={invoices} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action hooks (checkout / portal)
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
// 1. Current Plan
// ─────────────────────────────────────────────────────────────────────────────

function CurrentPlanCard({
  plan,
  subscription,
  stripeReady,
}: {
  plan: "free" | "basic" | "pro";
  subscription: SubscriptionRow | null;
  stripeReady: boolean;
}) {
  const info  = PLAN_INFO[plan];
  const isPro = plan === "pro";
  const { start: startCheckout, pending } = useCheckout();
  const nextPaymentDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const statusLabel =
    subscription?.status === "active"
      ? "Active"
      : subscription?.status === "trialing"
        ? "Trial"
        : subscription?.status === "past_due"
          ? "Past due"
          : subscription?.status === "canceled"
            ? "Cancelled"
            : "Active";
  const statusColor =
    subscription?.status === "past_due"
      ? "bg-amber-100 text-amber-700"
      : subscription?.status === "canceled"
        ? "bg-ink-100 text-ink-600"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="card p-[var(--space-card-padding)] flex flex-col">
      <h2 className="text-[13px] font-semibold text-ink-900 mb-[var(--space-card-padding-sm)]">
        Current Plan
      </h2>

      {/* Plan icon + name */}
      <div className="flex items-center gap-[var(--space-stack-lg)] mb-[var(--space-grid-gap)]">
        <div className="size-[clamp(3.25rem,5vw,4rem)] rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <Crown
            className="size-[clamp(1.375rem,2.5vw,1.75rem)] text-rose-500"
            strokeWidth={1.5}
          />
        </div>
        <div>
          <div className="font-display text-page-title text-ink-900 leading-none">
            {info.label}
          </div>
          <div className="text-body-sm text-ink-500 mt-1">
            <span className="font-bold text-ink-900">{info.price}</span>
            <span className="ml-1">kr/month</span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-[var(--space-stack-md)] mb-[var(--space-grid-gap)]">
        <DetailRow label="Status">
          <span className={cn("inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold", statusColor)}>
            {statusLabel}
          </span>
        </DetailRow>
        <DetailRow label="Next payment">
          <span className="inline-flex items-center gap-1.5 text-small text-ink-700">
            <Calendar className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
            {nextPaymentDate}
          </span>
        </DetailRow>
        <DetailRow label="Billing cycle">
          <span className="text-small text-ink-700">Monthly</span>
        </DetailRow>
        <DetailRow label="Plan">
          <span className="text-small text-ink-700 capitalize">
            {plan}
          </span>
        </DetailRow>
      </div>

      {/* Actions — natural placement below details (card hugs content at xl+ via items-start) */}
      <div className="space-y-3">
        {!isPro && (
          <Button
            className="w-full"
            size="md"
            disabled={!stripeReady || pending}
            onClick={() => startCheckout("pro")}
          >
            {pending ? "Redirecting…" : "Upgrade to Pro"}
          </Button>
        )}
        <div className="flex items-center justify-center">
          <Link
            href="#plans"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Compare all plans <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-small text-ink-500 shrink-0">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Plan Picker
// ─────────────────────────────────────────────────────────────────────────────

function PlanPickerCard({
  currentPlan,
  stripeReady,
}: {
  currentPlan: "free" | "basic" | "pro";
  stripeReady: boolean;
}) {
  return (
    <div id="plans" className="card p-[var(--space-card-padding)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-[var(--space-card-padding-sm)]">
        <h2 className="text-[13px] font-semibold text-ink-900">Choose Your Plan</h2>
        <span className="text-[12px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full shrink-0">
          Save 16% with Pro
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-grid-gap-sm)]">
        {(["free", "basic", "pro"] as const).map((key) => (
          <PlanCard
            key={key}
            planKey={key}
            currentPlan={currentPlan}
            stripeReady={stripeReady}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  planKey,
  currentPlan,
  stripeReady,
}: {
  planKey: "free" | "basic" | "pro";
  currentPlan: "free" | "basic" | "pro";
  stripeReady: boolean;
}) {
  const info      = PLAN_INFO[planKey];
  const isCurrent = planKey === currentPlan;
  const isPro     = planKey === "pro";
  const isFree    = planKey === "free";
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
          <span className="font-display text-h4 text-ink-900">
            {info.price}
          </span>
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
            <span className="text-tiny text-ink-700 leading-snug">
              {f}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Payment Method
// ─────────────────────────────────────────────────────────────────────────────

function PaymentMethodCard({
  hasSubscription,
  stripeReady,
}: {
  hasSubscription: boolean;
  stripeReady: boolean;
}) {
  const { open, pending } = usePortal();
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Payment Method</h3>

      <div className="flex items-center gap-3 p-3.5 rounded-[12px] bg-cream-50 border border-ink-100 mb-4">
        <div className="shrink-0">
          <MastercardIcon size="lg" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 leading-snug">
            {hasSubscription
              ? "Managed in Stripe"
              : "No payment method yet"}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px] text-ink-500">
              {hasSubscription
                ? "Open the portal to update card details."
                : "Upgrade to add a payment method."}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!stripeReady || !hasSubscription || pending}
        onClick={open}
        className="w-full h-11 sm:h-9 rounded-[10px] border border-ink-200 text-[12.5px] font-semibold text-rose-600 hover:bg-cream-100 transition-colors mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Opening…" : "Update Payment Method"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Billing Summary
// ─────────────────────────────────────────────────────────────────────────────

function BillingSummaryCard({
  plan,
  subscription,
}: {
  plan: "free" | "basic" | "pro";
  subscription: SubscriptionRow | null;
}) {
  const info = PLAN_INFO[plan];
  const nextDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const cancelling = subscription?.cancel_at_period_end ?? false;

  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Billing Summary</h3>

      <div className="space-y-3 flex-1">
        <SummaryRow label="Next payment date" value={nextDate} />
        <SummaryRow label="Amount due" value={`${info.price} kr`} />
        <SummaryRow label="Billing cycle" value="Monthly" />
        <SummaryRow label="Account status">
          {cancelling ? (
            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-amber-100 text-[12px] font-semibold text-amber-700">
              Cancels at period end
            </span>
          ) : (
            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-emerald-100 text-[12px] font-semibold text-emerald-700">
              In Good Standing
            </span>
          )}
        </SummaryRow>
      </div>

      <div className="mt-4 pt-4 border-t border-ink-100">
        <Link
          href="/support"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Billing help & FAQ <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-[12.5px] text-ink-500 shrink-0">{label}</span>
      {children ?? (
        <span className="text-[12.5px] font-semibold text-ink-800 text-right truncate">
          {value}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. What's Included
// ─────────────────────────────────────────────────────────────────────────────

function WhatsIncludedCard({ plan }: { plan: "free" | "basic" | "pro" }) {
  const info = PLAN_INFO[plan];

  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">
        What&apos;s Included in {info.label}
      </h3>

      <ul className="space-y-[var(--space-stack-md)] flex-1">
        {INCLUDED_FEATURES.map(({ icon, label }) => (
          <li key={label} className="flex items-start gap-2.5">
            <div className="size-[1.75rem] rounded-[8px] bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
              {icon}
            </div>
            <span className="text-[12.5px] text-ink-700 leading-snug">{label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-ink-100">
        <Link
          href="#plans"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          View full comparison <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Need Help?
// ─────────────────────────────────────────────────────────────────────────────

function NeedHelpCard() {
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Need Help?</h3>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
        <div className="size-14 rounded-full bg-rose-50 flex items-center justify-center mb-3">
          <MessageCircle className="size-6 text-rose-400" strokeWidth={1.5} />
        </div>
        <p className="text-[12.5px] text-ink-500 leading-snug mb-4 max-w-[10rem]">
          We&apos;re here to help with any billing questions.
        </p>
        <Link
          href="/support"
          className="w-full h-11 sm:h-9 inline-flex items-center justify-center rounded-[10px] border border-rose-300 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          Contact Support
        </Link>
      </div>

      <div className="pt-4 border-t border-ink-100 flex justify-center">
        <Link
          href="/support"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          View Help Center <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Recent Invoices
// ─────────────────────────────────────────────────────────────────────────────

function RecentInvoicesCard({ invoices }: { invoices: InvoiceRow[] }) {
  if (invoices.length === 0) {
    return (
      <div className="card p-[var(--space-card-padding)] text-center">
        <h3 className="text-[13px] font-semibold text-ink-900 mb-2">
          Recent Invoices
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
        <h3 className="text-[13px] font-semibold text-ink-900">Recent Invoices</h3>
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
                  href={inv.invoice_pdf}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download invoice"
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
            {["Date", "Invoice #", "Description", "Status", "Amount", ""].map((h, i) => (
              <span key={i} className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide">
                {h}
              </span>
            ))}
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
                    href={inv.invoice_pdf}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Download invoice"
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
