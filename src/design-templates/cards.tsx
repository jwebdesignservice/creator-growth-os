/* Cards ────────────────────────────────────────────────────────────────
   Content cards, KPI tiles, profile cards.
   ───────────────────────────────────────────────────────────────────── */

import { Sparkles, ArrowUp, ArrowDown } from "lucide-react";

export function BasicCard() {
  return (
    <div className="card p-5 max-w-sm">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Sparkles className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h3 className="text-h5 text-ink-900 leading-tight">Basic card</h3>
          <p className="text-[13px] text-ink-500 mt-1 leading-snug">
            A surface for a short message or feature highlight.
          </p>
        </div>
      </div>
    </div>
  );
}

export function CardWithCta() {
  return (
    <div className="card p-5 max-w-sm">
      <h3 className="text-h5 text-ink-900 leading-tight mb-1">Card title</h3>
      <p className="text-[13px] text-ink-500 leading-snug mb-4">
        Two-line description for context. Then a primary action below.
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 h-9 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium transition-colors"
      >
        Learn more
      </button>
    </div>
  );
}

export function KpiTile() {
  const delta = 12; // %
  const up = delta >= 0;
  return (
    <div className="card p-5 max-w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <Sparkles className="size-[16px]" strokeWidth={1.8} />
        </span>
        <span
          className={
            "inline-flex items-center gap-0.5 text-[11.5px] font-semibold " +
            (up ? "text-emerald-700" : "text-rose-700")
          }
        >
          {up ? (
            <ArrowUp className="size-3" strokeWidth={2.5} />
          ) : (
            <ArrowDown className="size-3" strokeWidth={2.5} />
          )}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="text-[12.5px] text-ink-500">Followers</div>
      <div className="text-h2 text-ink-900 tabular-nums leading-tight">1.2K</div>
    </div>
  );
}
