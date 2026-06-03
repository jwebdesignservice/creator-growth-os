/* Consent ──────────────────────────────────────────────────────────────────────
   Privacy / cookie surfaces — the bottom consent banner and a preferences panel
   with per-category toggles. Standard compliance UI for any public page.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Cookie, Check } from "lucide-react";
import { cn } from "@/lib/cn";

/* 1 · Cookie banner — accept / manage at the bottom of the page. */
export function CookieBanner() {
  return (
    <div className="w-[460px] max-w-full rounded-[16px] bg-ink-900 text-cream-50 p-5 shadow-xl flex items-start gap-3.5">
      <span className="size-10 rounded-[12px] bg-cream-50/10 text-cream-50 inline-flex items-center justify-center shrink-0">
        <Cookie className="size-5" strokeWidth={1.9} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold">We use cookies</div>
        <p className="text-[12.5px] text-cream-50/70 leading-relaxed mt-0.5">
          We use cookies to improve your experience and measure what works. You choose what to allow.
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button type="button" className="h-9 px-4 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900">
            Accept all
          </button>
          <button type="button" className="h-9 px-4 rounded-[10px] bg-cream-50/10 text-cream-50 text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-cream-50/20 active:bg-cream-50/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900">
            Reject non-essential
          </button>
          <button type="button" className="h-9 px-3 rounded-[10px] text-[12.5px] font-medium text-cream-50/70 transition-colors cursor-pointer hover:text-cream-50 active:text-cream-50/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/40">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2 · Consent preferences — per-category toggles. */
const ROWS = [
  { label: "Strictly necessary", desc: "Required for the app to work.", on: true, locked: true },
  { label: "Analytics", desc: "Helps us understand usage.", on: true, locked: false },
  { label: "Marketing", desc: "Personalised offers and ads.", on: false, locked: false },
];

export function ConsentPreferences() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-[14px] font-bold text-ink-900 mb-3.5">Cookie preferences</h3>
      <ul className="divide-y divide-ink-100">
        {ROWS.map((r) => (
          <li key={r.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900">{r.label}</div>
              <div className="text-[11.5px] text-ink-500 mt-0.5">{r.desc}</div>
            </div>
            {r.locked ? (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-cream-200 text-ink-500 text-[10.5px] font-semibold">
                <Check className="size-3" strokeWidth={3} /> Always on
              </span>
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={r.on}
                aria-label={`${r.label} cookies`}
                className={cn(
                  "relative inline-flex shrink-0 h-6 w-[44px] rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-300",
                  r.on ? "bg-rose-600 hover:bg-rose-700" : "bg-ink-200 hover:bg-ink-300",
                )}
              >
                <span className={cn("absolute top-[3px] inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform", r.on ? "translate-x-[23px]" : "translate-x-[3px]")} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
