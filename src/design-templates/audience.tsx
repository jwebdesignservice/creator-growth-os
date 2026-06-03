/* Audience ─────────────────────────────────────────────────────────────────
   Creator audience analytics — age-bracket bars (with gender split) and a
   top-fans list. Creator-facing demographics.
   ───────────────────────────────────────────────────────────────────── */

import { Heart } from "lucide-react";

export function AgeGenderBars() {
  const ages = [
    { r: "18–24", pct: 34 },
    { r: "25–34", pct: 41 },
    { r: "35–44", pct: 16 },
    { r: "45+", pct: 9 },
  ];
  return (
    <div className="card p-5 w-[360px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-1">Audience age</h3>
      <p className="text-[11.5px] text-ink-400 mb-4">58% female · 40% male · 2% other</p>
      <div className="space-y-2.5">
        {ages.map((a) => (
          <div key={a.r} className="flex items-center gap-3">
            <span className="text-[12px] text-ink-700 w-14">{a.r}</span>
            <div className="flex-1 h-2.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${a.pct}%` }} />
            </div>
            <span className="text-[12px] text-ink-500 tabular-nums w-9 text-right">{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopFans() {
  const fans = [
    { i: "AP", n: "Amelia Park", e: "142 interactions" },
    { i: "ML", n: "Marcus Lee", e: "98 interactions" },
    { i: "PS", n: "Priya Sharma", e: "76 interactions" },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-3">Top fans</h3>
      <ul className="space-y-3">
        {fans.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="relative size-9 rounded-full bg-rose-600 text-white text-[12px] font-semibold inline-flex items-center justify-center shrink-0">
              {f.i}
              {i === 0 && <span className="absolute -top-1.5 -right-1 text-[12px]">👑</span>}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900 truncate">{f.n}</div>
              <div className="text-[11.5px] text-ink-400 inline-flex items-center gap-1">
                <Heart className="size-3 text-rose-400" fill="currentColor" strokeWidth={0} />
                {f.e}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
