import { notFound, redirect } from "next/navigation";
import { Crown, CreditCard, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BRAND_NAME } from "@/lib/brand";
import { InvoiceActions } from "./invoice-actions";

export const metadata = { title: `Invoice · ${BRAND_NAME}` };

/* Billing entity (issuer). These are the same business details Stripe prints
   on the hosted invoice; kept here so the in-app premium invoice matches.
   Move to env/config if the entity ever changes. */
const ISSUER = {
  brand: BRAND_NAME,
  tagline: "Create. Grow. Monetize.",
  legalName: "Borealis Webstudio",
  address: ["Stardalen 89", "6843 Skei i Jølster", "Norway"],
  phone: "+47 93 93 12 26",
  email: "hei@bwstudio.no",
};

type Params = Promise<{ id: string }>;

/**
 * /invoices/[id] — premium, print-optimized invoice rendered from our own
 * `invoices` table (Stripe-synced via webhook). Deliberately OUTSIDE the app
 * shell so "Download PDF" (browser print) produces a clean, single-sheet PDF.
 * RLS scopes the row to its owner (or an admin); we also gate on auth here.
 */
export default async function InvoicePage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: inv } = await supabase
    .from("invoices")
    .select(
      "id, number, description, amount_paid, currency, status, hosted_invoice_url, paid_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!inv) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const billToName =
    (profile?.full_name as string | null)?.trim() ||
    (profile?.display_name as string | null)?.trim() ||
    user.email?.split("@")[0] ||
    "Customer";
  const billToEmail = (profile?.email as string | null) || user.email || "";

  const currency = ((inv.currency as string) || "nok").toUpperCase();
  const amount = (inv.amount_paid as number) ?? 0;
  const isPaid = inv.status === "paid";
  const lineDesc = (inv.description as string | null) || "Subscription payment";
  const issueDate = fmtDate((inv.created_at as string) ?? "");
  const paidDate = inv.paid_at ? fmtDate(inv.paid_at as string) : null;
  const money = (minor: number) => formatMoney(minor, currency);

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-8 sm:py-12 print:bg-white print:p-0">
      {/* Browsers drop background colors when printing — force exact color
          rendering so the premium design exports faithfully to PDF. */}
      <style>{`@media print{[data-invoice-sheet],[data-invoice-sheet] *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}`}</style>

      {/* Action bar — screen only */}
      <div className="max-w-[820px] mx-auto mb-5 flex items-center justify-between gap-3 print:hidden">
        <a
          href="/billing"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-50 transition-colors"
        >
          ← Back to billing
        </a>
        <InvoiceActions hostedUrl={(inv.hosted_invoice_url as string | null) ?? null} />
      </div>

      {/* Invoice sheet */}
      <article
        data-invoice-sheet
        className="max-w-[820px] mx-auto bg-white rounded-[18px] shadow-card border border-ink-100 overflow-hidden print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      >
        {/* Header band */}
        <header className="bg-ink-900 text-white px-8 sm:px-12 py-9 flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="size-11 rounded-[12px] bg-rose-500 inline-flex items-center justify-center shrink-0">
              <Crown className="size-6" strokeWidth={2} />
            </span>
            <div>
              <div className="text-[20px] font-bold leading-none">{ISSUER.brand}</div>
              <div className="text-[12px] text-white/55 mt-1.5">{ISSUER.tagline}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-[34px] leading-none tracking-tight">Invoice</div>
            <div className="text-[12.5px] text-white/65 mt-2 font-mono">
              {(inv.number as string | null) ?? "—"}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="px-8 sm:px-12 py-9 sm:py-10 space-y-9">
          {/* Parties + amount hero */}
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="space-y-6 min-w-[220px]">
              <Block label="Billed to">
                <div className="text-[14px] font-semibold text-ink-900">{billToName}</div>
                <div className="text-[13px] text-ink-500">{billToEmail}</div>
              </Block>
              <Block label="From">
                <div className="text-[14px] font-semibold text-ink-900">{ISSUER.legalName}</div>
                {ISSUER.address.map((l) => (
                  <div key={l} className="text-[13px] text-ink-500 leading-relaxed">
                    {l}
                  </div>
                ))}
                <div className="text-[13px] text-ink-500">{ISSUER.phone}</div>
                <div className="text-[13px] text-ink-500">{ISSUER.email}</div>
              </Block>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[260px] rounded-[14px] bg-cream-50 border border-cream-200 p-5">
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500 font-semibold">
                {isPaid ? "Amount paid" : "Amount due"}
              </div>
              <div className="font-display text-[32px] text-ink-900 leading-none mt-1.5 tabular-nums">
                {money(amount)}
              </div>
              <div className="mt-3">
                <StatusBadge isPaid={isPaid} label={(inv.status as string) ?? "open"} />
              </div>
              <dl className="mt-5 pt-4 border-t border-cream-200 space-y-2 text-[12.5px]">
                <MetaRow label="Invoice no." value={(inv.number as string | null) ?? "—"} mono />
                <MetaRow label="Issue date" value={issueDate} />
                {paidDate && <MetaRow label="Paid on" value={paidDate} />}
              </dl>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="grid grid-cols-[1fr_4rem_7rem_7rem] gap-3 px-4 py-2.5 rounded-[10px] bg-ink-900 text-white text-[11px] font-semibold uppercase tracking-wider">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit price</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="grid grid-cols-[1fr_4rem_7rem_7rem] gap-3 px-4 py-4 border-b border-ink-100 items-center">
              <span className="text-[13.5px] text-ink-900 font-medium">{lineDesc}</span>
              <span className="text-center text-[13px] text-ink-700 tabular-nums">1</span>
              <span className="text-right text-[13px] text-ink-700 tabular-nums">{money(amount)}</span>
              <span className="text-right text-[13px] text-ink-900 font-semibold tabular-nums">
                {money(amount)}
              </span>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-5">
              <dl className="w-full sm:w-[280px] space-y-2.5">
                <TotalRow label="Subtotal" value={money(amount)} />
                <TotalRow label="Total" value={money(amount)} />
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-ink-200">
                  <dt className="text-[14px] font-bold text-ink-900">
                    {isPaid ? "Amount paid" : "Amount due"}
                  </dt>
                  <dd className="text-[18px] font-bold text-rose-600 tabular-nums">{money(amount)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment + notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-7 border-t border-ink-100">
            <Block label="Payment method">
              <div className="flex items-center gap-2 text-[13px] text-ink-700">
                <CreditCard className="size-4 text-ink-500" strokeWidth={2} />
                Paid securely via Stripe
              </div>
            </Block>
            <Block label="Notes">
              <p className="text-[13px] text-ink-600 leading-relaxed">
                Thank you for being a {ISSUER.brand} member. Questions about this
                invoice? Email{" "}
                <span className="text-ink-900 font-medium">{ISSUER.email}</span>.
              </p>
            </Block>
          </div>
        </div>

        {/* Footer strip */}
        <footer className="px-8 sm:px-12 py-5 bg-cream-50 border-t border-ink-100 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-ink-500">
          <span>
            {ISSUER.brand} · {ISSUER.legalName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" strokeWidth={2} />
            {isPaid ? "Payment received — thank you" : "Awaiting payment"}
          </span>
        </footer>
      </article>
    </main>
  );
}

/* ── small server-rendered bits ───────────────────────────────────────── */

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-400 font-semibold mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={mono ? "text-ink-900 font-mono" : "text-ink-900"}>{value}</dd>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-900 tabular-nums">{value}</dd>
    </div>
  );
}

function StatusBadge({ isPaid, label }: { isPaid: boolean; label: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11.5px] font-semibold capitalize " +
        (isPaid
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700")
      }
    >
      <span
        className={
          "size-1.5 rounded-full " + (isPaid ? "bg-emerald-500" : "bg-amber-500")
        }
      />
      {label}
    </span>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function formatMoney(minor: number, currency: string): string {
  const value = (minor ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
