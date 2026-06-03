/* Earnings ─────────────────────────────────────────────────────────────────
   Creator income surfaces — an earnings overview (income by source) and a
   payout schedule. Distinct from the monetization revenue stat / deal card.
   ───────────────────────────────────────────────────────────────────── */

import { ArrowUpRight, Banknote } from "lucide-react";

export function EarningsOverview() {
  const sources = [
    { label: "Sponsorships", amt: "$2,400", pct: 56, tone: "bg-rose-500" },
    { label: "Affiliate", amt: "$980", pct: 23, tone: "bg-violet-500" },
    { label: "Products", amt: "$620", pct: 14, tone: "bg-amber-500" },
    { label: "Tips", amt: "$300", pct: 7, tone: "bg-emerald-500" },
  ];
  return (
    <div className="card p-5 w-[400px] max-w-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-h5 text-ink-900">Earnings · May</h3>
        <span className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-emerald-700">
          <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
          +18%
        </span>
      </div>
      <div className="text-[28px] font-bold text-ink-900 tabular-nums leading-none mb-3">$4,300</div>
      <div className="flex h-2.5 rounded-full overflow-hidden mb-4">
        {sources.map((s) => (
          <div key={s.label} className={s.tone} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 text-[13px]">
            <span className={"size-2.5 rounded-full " + s.tone} />
            <span className="text-ink-700 flex-1">{s.label}</span>
            <span className="text-ink-900 font-semibold tabular-nums">{s.amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PayoutSchedule() {
  const rows = [
    { date: "Apr 30", amt: "$3,640", status: "Paid" },
    { date: "Mar 31", amt: "$2,910", status: "Paid" },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
        <span className="size-11 rounded-[12px] bg-emerald-100 text-emerald-600 inline-flex items-center justify-center">
          <Banknote className="size-5" strokeWidth={1.9} />
        </span>
        <div className="flex-1">
          <div className="text-[12px] text-ink-500">Next payout</div>
          <div className="text-[18px] font-bold text-ink-900 tabular-nums">$4,300</div>
        </div>
        <span className="text-[12px] text-ink-500">May 31</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-[12.5px]">
            <span className="text-ink-500">{r.date}</span>
            <span className="text-ink-900 font-medium tabular-nums">{r.amt}</span>
            <span className="chip chip-success">{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
