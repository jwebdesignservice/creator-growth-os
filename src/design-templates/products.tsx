/* Products ─────────────────────────────────────────────────────────────────
   Selling surfaces — a digital-product / course card and a checkout order
   summary. Creator monetization (selling your own products).
   ───────────────────────────────────────────────────────────────────── */

import { ShoppingBag, Star } from "lucide-react";

export function ProductCard() {
  return (
    <div className="card overflow-hidden w-[280px] max-w-full">
      <div className="aspect-video bg-gradient-to-br from-rose-200 via-cream-200 to-violet-200" />
      <div className="p-4">
        <span className="chip chip-rose">Course</span>
        <h3 className="text-[14px] font-bold text-ink-900 mt-2 leading-snug">The Creator Launchpad</h3>
        <div className="flex items-center gap-1 mt-1.5 text-[11.5px] text-ink-500">
          <Star className="size-3.5 text-amber-400 fill-amber-400" strokeWidth={0} />
          4.9 · 1,204 sold
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[18px] font-bold text-ink-900">$79</span>
          <span className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold">
            <ShoppingBag className="size-3.5" strokeWidth={2} />
            Buy
          </span>
        </div>
      </div>
    </div>
  );
}

export function CheckoutSummary() {
  const rows = [
    { l: "The Creator Launchpad", v: "$79.00" },
    { l: "Hook templates pack", v: "$19.00" },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Order summary</h3>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between text-[13px]">
            <span className="text-ink-700">{r.l}</span>
            <span className="text-ink-900 tabular-nums">{r.v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-[13px] text-emerald-700">
          <span>Discount (LAUNCH20)</span>
          <span className="tabular-nums">−$19.60</span>
        </div>
      </div>
      <div className="flex items-center justify-between font-bold text-ink-900 text-[16px] pt-3 mt-3 border-t border-ink-100">
        <span>Total</span>
        <span className="tabular-nums">$78.40</span>
      </div>
      <button type="button" className="mt-4 w-full inline-flex items-center justify-center h-11 rounded-[12px] bg-rose-600 text-white text-[14px] font-semibold">
        Pay $78.40
      </button>
    </div>
  );
}
