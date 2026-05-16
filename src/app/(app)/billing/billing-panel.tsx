"use client";

import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  Crown,
  CreditCard,
  Calendar,
  Check,
  Download,
  MessageCircle,
  ArrowRight,
  Mail,
  BarChart2,
  CalendarDays,
  Bell,
  Headphones,
  Sparkles,
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

const MOCK_INVOICES = [
  { date: "May 15, 2025", id: "INV-2025-0515", description: "Basic Plan – Monthly", status: "Paid", amount: 999 },
  { date: "Apr 15, 2025", id: "INV-2025-0415", description: "Basic Plan – Monthly", status: "Paid", amount: 999 },
  { date: "Mar 15, 2025", id: "INV-2025-0315", description: "Basic Plan – Monthly", status: "Paid", amount: 999 },
];

const INCLUDED_FEATURES: { icon: React.ReactNode; label: string }[] = [
  { icon: <Mail className="size-4 text-rose-600" strokeWidth={1.8} />,       label: "Access to all core courses and tutorials" },
  { icon: <BarChart2 className="size-4 text-rose-600" strokeWidth={1.8} />,  label: "Advanced analytics & performance insights" },
  { icon: <CalendarDays className="size-4 text-rose-600" strokeWidth={1.8} />, label: "Up to 10 posting plans" },
  { icon: <Bell className="size-4 text-rose-600" strokeWidth={1.8} />,       label: "Brand deal alerts and opportunities" },
  { icon: <Mail className="size-4 text-rose-600" strokeWidth={1.8} />,       label: "Priority email support" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export function BillingPageClient({ plan }: { plan: "free" | "basic" | "pro" }) {
  const currentPlan = PLAN_INFO[plan];
  const isPro = plan === "pro";

  return (
    <PageShell>
      <div className="max-w-[1100px] space-y-6">
        {/* Page header */}
        <div>
          <h1 className="font-display text-[28px] text-ink-900 leading-tight">Billing</h1>
          <p className="text-[14px] text-ink-500 mt-1">
            Manage your subscription, payment methods, and invoices.
          </p>
        </div>

        {/* ── Row 1: Current Plan + Plan Picker ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5">
          <CurrentPlanCard plan={plan} />
          <PlanPickerCard currentPlan={plan} />
        </div>

        {/* ── Row 2: 4 info cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <PaymentMethodCard />
          <BillingSummaryCard plan={plan} />
          <WhatsIncludedCard plan={plan} />
          <NeedHelpCard />
        </div>

        {/* ── Row 3: Invoices table ─────────────────────────────────────── */}
        <RecentInvoicesCard />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Current Plan
// ─────────────────────────────────────────────────────────────────────────────

function CurrentPlanCard({ plan }: { plan: "free" | "basic" | "pro" }) {
  const info = PLAN_INFO[plan];
  const isPro = plan === "pro";

  return (
    <div className="card p-6 flex flex-col">
      <h2 className="text-[13px] font-semibold text-ink-900 mb-5">Current Plan</h2>

      {/* Plan icon + name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <Crown className="size-7 text-rose-500" strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-display text-[28px] text-ink-900 leading-none">{info.label}</div>
          <div className="text-[14px] text-ink-500 mt-1">
            <span className="font-bold text-ink-900">{info.price}</span>
            {info.price > 0 && <span className="text-ink-500 ml-1">kr/month</span>}
            {info.price === 0 && <span className="text-ink-500 ml-1">kr/month</span>}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <DetailRow label="Status">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-emerald-100 text-[12px] font-semibold text-emerald-700">
            Active
          </span>
        </DetailRow>
        <DetailRow label="Next payment">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700">
            <Calendar className="size-3.5 text-ink-400" strokeWidth={2} />
            June 15, 2025
          </span>
        </DetailRow>
        <DetailRow label="Billing cycle">
          <span className="text-[13px] text-ink-700">Monthly</span>
        </DetailRow>
        <DetailRow label="Payment method">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700">
            <MastercardIcon />
            •••• 4242
          </span>
        </DetailRow>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {!isPro && (
          <Button className="w-full" size="md">
            Upgrade to Pro
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
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-ink-500">{label}</span>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Plan Picker
// ─────────────────────────────────────────────────────────────────────────────

function PlanPickerCard({ currentPlan }: { currentPlan: "free" | "basic" | "pro" }) {
  return (
    <div id="plans" className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[13px] font-semibold text-ink-900">Choose Your Plan</h2>
        <span className="text-[12px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
          Save 16% with Pro
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["free", "basic", "pro"] as const).map((key) => (
          <PlanCard key={key} planKey={key} currentPlan={currentPlan} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  planKey,
  currentPlan,
}: {
  planKey: "free" | "basic" | "pro";
  currentPlan: "free" | "basic" | "pro";
}) {
  const info     = PLAN_INFO[planKey];
  const isCurrent = planKey === currentPlan;
  const isPro     = planKey === "pro";

  return (
    <div
      className={cn(
        "rounded-[14px] p-4 flex flex-col border transition-all",
        isCurrent
          ? "border-rose-300 bg-white shadow-sm"
          : isPro
          ? "border-rose-500 bg-white shadow-md"
          : "border-ink-100 bg-white",
      )}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px] font-bold text-ink-900">{info.label}</span>
          {isPro && (
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-rose-600 text-[10px] font-bold text-white">
              Most Popular
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-[22px] text-ink-900">{info.price}</span>
          <span className="text-[12px] text-ink-500">kr/month</span>
        </div>
        <p className="text-[11.5px] text-ink-500 mt-1 leading-snug">{info.description}</p>
      </div>

      {/* CTA */}
      <div className="mb-4">
        {isCurrent ? (
          <button
            type="button"
            disabled
            className="w-full h-9 rounded-[10px] border border-rose-300 text-[12.5px] font-semibold text-rose-600 bg-white"
          >
            Current Plan
          </button>
        ) : isPro ? (
          <Button size="sm" className="w-full">
            Upgrade to Pro
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="w-full">
            Get Started
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-ink-100 mb-3" />

      {/* Features */}
      <ul className="space-y-2">
        {info.features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <Check className="size-3.5 text-rose-500 mt-0.5 shrink-0" strokeWidth={2.5} />
            <span className="text-[11.5px] text-ink-700 leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Payment Method
// ─────────────────────────────────────────────────────────────────────────────

function PaymentMethodCard() {
  return (
    <div className="card p-5 flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Payment Method</h3>

      <div className="flex items-center gap-3 p-3.5 rounded-[12px] bg-cream-50 border border-ink-100 mb-4">
        <MastercardIcon size="lg" />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink-900">Mastercard ending in 4242</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-ink-500">Expires 04/28</span>
            <span className="inline-flex items-center h-5 px-1.5 rounded-full bg-ink-100 text-[10.5px] font-semibold text-ink-600">
              Default
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full h-9 rounded-[10px] border border-ink-200 text-[12.5px] font-semibold text-rose-600 hover:bg-cream-100 transition-colors"
      >
        Update Payment Method
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Billing Summary
// ─────────────────────────────────────────────────────────────────────────────

function BillingSummaryCard({ plan }: { plan: "free" | "basic" | "pro" }) {
  const info = PLAN_INFO[plan];

  return (
    <div className="card p-5 flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Billing Summary</h3>

      <div className="space-y-3 flex-1">
        <SummaryRow label="Next payment date" value="June 15, 2025" />
        <SummaryRow label="Amount due"         value={`${info.price} kr`} />
        <SummaryRow label="Billing cycle"      value="Monthly" />
        <SummaryRow label="Account status">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-emerald-100 text-[12px] font-semibold text-emerald-700">
            In Good Standing
          </span>
        </SummaryRow>
      </div>

      <div className="mt-4 pt-4 border-t border-ink-100">
        <Link
          href="#"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          View Billing Details <ArrowRight className="size-3.5" strokeWidth={2.5} />
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
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12.5px] text-ink-500 shrink-0">{label}</span>
      {children ?? <span className="text-[12.5px] font-semibold text-ink-800 text-right">{value}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. What's Included
// ─────────────────────────────────────────────────────────────────────────────

function WhatsIncludedCard({ plan }: { plan: "free" | "basic" | "pro" }) {
  const info = PLAN_INFO[plan];

  return (
    <div className="card p-5 flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">
        What&apos;s Included in {info.label}
      </h3>

      <ul className="space-y-3 flex-1">
        {INCLUDED_FEATURES.map(({ icon, label }) => (
          <li key={label} className="flex items-start gap-2.5">
            <div className="size-7 rounded-[8px] bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
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
    <div className="card p-5 flex flex-col">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Need Help?</h3>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
        <div className="size-14 rounded-full bg-rose-50 flex items-center justify-center mb-3">
          <MessageCircle className="size-6 text-rose-400" strokeWidth={1.5} />
        </div>
        <p className="text-[12.5px] text-ink-500 leading-snug mb-4 max-w-[160px]">
          We&apos;re here to help with any billing questions.
        </p>
        <button
          type="button"
          className="w-full h-9 rounded-[10px] border border-rose-300 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          Contact Support
        </button>
      </div>

      <div className="pt-4 border-t border-ink-100 flex justify-center">
        <Link
          href="#"
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

function RecentInvoicesCard() {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
        <h3 className="text-[13px] font-semibold text-ink-900">Recent Invoices</h3>
        <Link
          href="#"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          View All Invoices <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Table head */}
      <div className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_40px] gap-4 px-6 py-3 bg-cream-50 border-b border-ink-100">
        {["Date", "Invoice #", "Description", "Status", "Amount", ""].map((h) => (
          <span key={h} className="text-[11.5px] font-semibold text-ink-500 uppercase tracking-wide">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-ink-50">
        {MOCK_INVOICES.map((inv) => (
          <div
            key={inv.id}
            className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_40px] gap-4 px-6 py-4 hover:bg-cream-50 transition-colors items-center"
          >
            <span className="text-[13px] text-ink-700">{inv.date}</span>
            <span className="text-[13px] text-ink-700 font-mono">{inv.id}</span>
            <span className="text-[13px] text-ink-700">{inv.description}</span>
            <span>
              <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-emerald-100 text-[12px] font-semibold text-emerald-700">
                {inv.status}
              </span>
            </span>
            <span className="text-[13px] font-semibold text-ink-900">{inv.amount} kr</span>
            <button
              type="button"
              aria-label="Download invoice"
              className="size-8 rounded-[8px] hover:bg-cream-200 flex items-center justify-center transition-colors"
            >
              <Download className="size-4 text-ink-500" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MastercardIcon({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = size === "lg" ? 36 : 24;
  return (
    <svg width={s} height={s * 0.625} viewBox="0 0 38 24" fill="none" aria-hidden>
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path
        d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z"
        fill="#FF5F00"
      />
    </svg>
  );
}
