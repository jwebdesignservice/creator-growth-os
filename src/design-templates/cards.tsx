/* Cards ────────────────────────────────────────────────────────────────
   Content cards, KPI tiles, profile cards. Surfaces use the `.card` token
   (rounded, hairline border, soft shadow); interactive cards add a hover
   lift, and action rows pair a primary with a quieter secondary.
   ───────────────────────────────────────────────────────────────────── */

import { Sparkles, ArrowUp, ArrowRight } from "lucide-react";

export function BasicCard() {
  return (
    <div className="card p-5 max-w-sm">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
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
    <div className="card p-5 max-w-sm hover:border-rose-200 hover:shadow-card transition-all">
      <h3 className="text-h5 text-ink-900 leading-tight mb-1">Card title</h3>
      <p className="text-[13px] text-ink-500 leading-snug mb-4">
        Two-line description for context. Then a primary action with a quieter
        secondary beside it.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[13px] font-medium cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Learn more
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          className="inline-flex items-center h-9 px-3 rounded-[10px] text-ink-600 hover:bg-cream-200 active:bg-cream-300 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function KpiTile() {
  const delta = 12; // %
  const up = delta >= 0;
  return (
    <div className="card p-5 max-w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <Sparkles className="size-[16px]" strokeWidth={1.8} />
        </span>
        <span
          className={
            "inline-flex items-center gap-0.5 text-[11.5px] font-semibold " +
            (up ? "text-emerald-700" : "text-rose-700")
          }
        >
          <ArrowUp className="size-3" strokeWidth={2.5} />
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="text-[12.5px] text-ink-500">Followers</div>
      <div className="text-h2 text-ink-900 tabular-nums leading-tight">1.2K</div>
      <div className="text-[11.5px] text-ink-400 mt-1">vs. 1,072 last week</div>
    </div>
  );
}
