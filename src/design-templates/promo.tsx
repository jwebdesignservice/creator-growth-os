/* Promo ────────────────────────────────────────────────────────────────────
   Discount & promotion surfaces — a promo-code card (code + copy) and a
   discount announcement banner. Creator selling / launches.
   ───────────────────────────────────────────────────────────────────── */

import { Ticket, Copy } from "lucide-react";

export function PromoCodeCard() {
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <Ticket className="size-4" strokeWidth={1.9} />
        </span>
        <h3 className="text-[14px] font-bold text-ink-900">Launch discount</h3>
      </div>
      <div className="flex items-center gap-2 rounded-[12px] border-2 border-dashed border-rose-200 bg-rose-50/50 p-2.5 pl-4">
        <span className="flex-1 text-[16px] font-bold text-rose-700 tracking-[0.15em]">LAUNCH20</span>
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold">
          <Copy className="size-3.5" strokeWidth={2} />
          Copy
        </button>
      </div>
      <div className="flex items-center justify-between mt-3 text-[11.5px] text-ink-400">
        <span>20% off · 142 uses</span>
        <span>Ends Sun</span>
      </div>
    </div>
  );
}

export function DiscountBanner() {
  return (
    <div className="w-[520px] max-w-full flex items-center gap-3 rounded-[12px] bg-gradient-to-r from-rose-600 to-rose-500 text-white px-4 py-3">
      <span className="text-[18px]">🎉</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold">Summer sale — 20% off all courses</p>
        <p className="text-[12px] text-white/80">Use code LAUNCH20 at checkout · ends Sunday</p>
      </div>
      <span className="inline-flex items-center h-9 px-4 rounded-[10px] bg-white text-rose-700 text-[12.5px] font-bold shrink-0">Shop now</span>
    </div>
  );
}
