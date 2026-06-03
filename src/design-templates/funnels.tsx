/* Funnels ─────────────────────────────────────────────────────────────────
   Creator audience viz — an audience funnel (reach → customers, with
   drop-off) and an audience-retention cohort grid. New viz shapes,
   creator-facing (the kind shown on a creator's performance page).
   ───────────────────────────────────────────────────────────────────── */

import { cn } from "@/lib/cn";

export function AudienceFunnel() {
  const stages = [
    { label: "Reach", value: "120K", pct: 100 },
    { label: "Engaged", value: "24K", pct: 38 },
    { label: "Followers", value: "8.4K", pct: 18 },
    { label: "Customers", value: "640", pct: 7 },
  ];
  const drops = [0, 62, 53, 61];
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Audience funnel</h3>
      <div className="space-y-2.5">
        {stages.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="text-ink-700 font-medium">{s.label}</span>
              <span className="text-ink-500 tabular-nums">{s.value} · {s.pct}%</span>
            </div>
            <div className="h-7 rounded-[8px] bg-cream-200 overflow-hidden">
              <div className="h-full rounded-[8px] bg-gradient-to-r from-rose-500 to-rose-400 flex items-center justify-end pr-2" style={{ width: `${s.pct}%` }}>
                {i > 0 && <span className="text-[10px] font-semibold text-white/90">−{drops[i]}%</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RetentionCohort({ className }: { className?: string }) {
  const rows = [
    { label: "May 1", cells: [100, 68, 52, 44, 38] },
    { label: "May 8", cells: [100, 71, 55, 47] },
    { label: "May 15", cells: [100, 66, 50] },
    { label: "May 22", cells: [100, 72] },
    { label: "May 29", cells: [100] },
  ];
  const tone = (v: number) =>
    v >= 80 ? "bg-rose-600 text-white" : v >= 55 ? "bg-rose-400 text-white" : v >= 40 ? "bg-rose-300 text-rose-700" : "bg-rose-100 text-rose-700";
  return (
    <div className={cn("card p-5 w-[420px] max-w-full", className)}>
      <h3 className="text-h5 text-ink-900 mb-4">Audience retention</h3>
      <div className="flex gap-1 mb-1 pl-12 text-[10px] text-ink-400">
        {["W0", "W1", "W2", "W3", "W4"].map((w) => (
          <span key={w} className="flex-1 text-center">{w}</span>
        ))}
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-1">
            <span className="w-11 text-[10.5px] text-ink-500 shrink-0">{r.label}</span>
            <div className="flex gap-1 flex-1">
              {[0, 1, 2, 3, 4].map((c) => (
                <span key={c} className={cn("flex-1 h-8 rounded-[5px] inline-flex items-center justify-center text-[10.5px] font-semibold tabular-nums", r.cells[c] != null ? tone(r.cells[c]) : "bg-cream-100")}>
                  {r.cells[c] != null ? `${r.cells[c]}%` : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
