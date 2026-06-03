/* Comparison ──────────────────────────────────────────────────────────────
   Plan / feature comparison — a feature matrix (plans × features) and a
   monthly/yearly billing toggle. Complements the pricing grid.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export function FeatureMatrix() {
  const plans = ["Free", "Basic", "Pro"];
  const hot = 2; // Pro is the highlighted column
  const rows: { f: string; vals: boolean[] }[] = [
    { f: "Programs", vals: [true, true, true] },
    { f: "Community access", vals: [true, true, true] },
    { f: "Performance analytics", vals: [false, true, true] },
    { f: "Brand deal tracker", vals: [false, false, true] },
    { f: "1:1 coaching", vals: [false, false, true] },
  ];
  return (
    <div className="card overflow-hidden w-[480px] max-w-full">
      <table className="w-full text-left">
        <thead className="bg-cream-100/70 border-b border-ink-100">
          <tr>
            <th scope="col" className="px-4 py-3 text-[12px] font-semibold text-ink-500">Feature</th>
            {plans.map((p, i) => (
              <th
                key={p}
                scope="col"
                className={cn("px-4 py-3 text-[12px] font-semibold text-center", i === hot ? "text-rose-700" : "text-ink-700")}
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => (
            <tr key={r.f} className="hover:bg-cream-50">
              <th scope="row" className="px-4 py-3 text-[13px] font-medium text-ink-900 text-left">{r.f}</th>
              {r.vals.map((v, i) => (
                <td key={i} className={cn("px-4 py-3 text-center", i === hot && "bg-rose-50/40")}>
                  {v ? (
                    <Check className="size-4 text-emerald-500 inline" strokeWidth={2.5} />
                  ) : (
                    <Minus className="size-4 text-ink-300 inline" strokeWidth={2} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BillingToggle() {
  const [yearly, setYearly] = useState(true);
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="inline-flex items-center p-1 rounded-[12px] bg-cream-200">
        {(["Monthly", "Yearly"] as const).map((opt) => {
          const on = (opt === "Yearly") === yearly;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={on}
              onClick={() => setYearly(opt === "Yearly")}
              className={cn(
                "h-8 px-4 rounded-[9px] text-[13px] font-medium inline-flex items-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200",
                on ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <span className="chip chip-success">Save 20% with yearly</span>
    </div>
  );
}
