/* Outreach ─────────────────────────────────────────────────────────────────
   Brand-outreach surfaces — a pitch-template picker and an outreach tracker
   (sent → opened → replied). Creator monetization-facing.
   ───────────────────────────────────────────────────────────────────── */

import { Mail, ArrowRight } from "lucide-react";

export function PitchTemplateCard() {
  const templates = [
    { t: "Cold intro", d: "Short, friendly first contact" },
    { t: "Rate card follow-up", d: "Share pricing after interest" },
    { t: "Long-term partnership", d: "Pitch an ongoing deal" },
  ];
  return (
    <div className="card p-5 w-[400px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-3">Pitch templates</h3>
      <div className="space-y-2">
        {templates.map((t, i) => (
          <div key={i} className={"flex items-center gap-3 rounded-[12px] border p-3 " + (i === 0 ? "border-rose-200 bg-rose-50/50" : "border-ink-100")}>
            <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Mail className="size-4" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900">{t.t}</div>
              <div className="text-[11.5px] text-ink-400 truncate">{t.d}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-rose-600 shrink-0">
              Use
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OutreachTracker() {
  const stages = [
    { label: "Sent", n: 24, pct: 100, tone: "bg-ink-300" },
    { label: "Opened", n: 18, pct: 75, tone: "bg-rose-400" },
    { label: "Replied", n: 7, pct: 29, tone: "bg-rose-600" },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Outreach this month</h3>
      <div className="space-y-3">
        {stages.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="text-ink-700">{s.label}</span>
              <span className="font-semibold text-ink-900 tabular-nums">{s.n}</span>
            </div>
            <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
              <div className={"h-full rounded-full " + s.tone} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
