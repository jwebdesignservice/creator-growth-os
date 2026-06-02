/* Invoices ───────────────────────────────────────────────────────────────
   Billing surfaces — an invoice / receipt with line items and totals, and
   a current-plan billing row. Built in the app's rose/cream language for
   the billing & invoices screens.
   ───────────────────────────────────────────────────────────────────── */

import { Download, Receipt, CreditCard } from "lucide-react";

export function InvoiceCard() {
  const items = [
    { desc: "Pro plan — monthly", qty: 1, amount: "$29.00" },
    { desc: "Extra seats", qty: 2, amount: "$18.00" },
  ];
  return (
    <div className="card p-6 w-[440px] max-w-full">
      <header className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="size-10 rounded-[11px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
            <Receipt className="size-5" strokeWidth={1.9} />
          </span>
          <div>
            <div className="text-[14px] font-bold text-ink-900">Invoice #2026-0481</div>
            <div className="text-[12px] text-ink-500">Issued May 1, 2026</div>
          </div>
        </div>
        <span className="chip chip-success">Paid</span>
      </header>

      <div className="text-[11.5px] uppercase tracking-wider font-semibold text-ink-400 mb-2">Billed to</div>
      <div className="text-[13px] text-ink-700 mb-5">Jack Wilson · jack@profluencer.app</div>

      <table className="w-full text-left mb-4">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-wider text-ink-400 border-b border-ink-100">
            <th className="pb-2 font-semibold">Description</th>
            <th className="pb-2 font-semibold text-center">Qty</th>
            <th className="pb-2 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {items.map((it, i) => (
            <tr key={i}>
              <td className="py-2.5 text-[13px] text-ink-900">{it.desc}</td>
              <td className="py-2.5 text-[13px] text-ink-500 text-center tabular-nums">{it.qty}</td>
              <td className="py-2.5 text-[13px] text-ink-900 text-right tabular-nums">{it.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-[13px] border-t border-ink-100 pt-3">
        <div className="flex items-center justify-between text-ink-500">
          <span>Subtotal</span>
          <span className="tabular-nums text-ink-700">$47.00</span>
        </div>
        <div className="flex items-center justify-between text-ink-500">
          <span>Tax (0%)</span>
          <span className="tabular-nums text-ink-700">$0.00</span>
        </div>
        <div className="flex items-center justify-between font-bold text-ink-900 text-[15px] pt-1">
          <span>Total</span>
          <span className="tabular-nums">$47.00</span>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 w-full inline-flex items-center justify-center gap-2 h-10 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13px] font-medium transition-colors"
      >
        <Download className="size-4" strokeWidth={2} />
        Download PDF
      </button>
    </div>
  );
}

export function PlanBillingRow() {
  return (
    <div className="card p-5 w-[440px] max-w-full">
      <div className="flex items-center gap-3.5">
        <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <CreditCard className="size-5" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-ink-900">Pro plan</span>
            <span className="chip chip-rose">Current</span>
          </div>
          <div className="text-[12.5px] text-ink-500 mt-0.5">$29 / month · renews Jun 1, 2026</div>
        </div>
        <button
          type="button"
          className="h-9 px-3.5 rounded-[10px] border border-ink-100 bg-white text-ink-700 hover:bg-cream-100 text-[12.5px] font-medium transition-colors shrink-0"
        >
          Manage
        </button>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ink-100 text-[12.5px] text-ink-500">
        <span>Visa ending 6411</span>
        <span className="text-ink-300">·</span>
        <span>Expires 09/27</span>
      </div>
    </div>
  );
}
