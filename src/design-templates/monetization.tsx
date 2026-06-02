/* Monetization ───────────────────────────────────────────────────────────
   Brand-deal & revenue surfaces — the monetization readiness score (ring +
   checklist), a deal pipeline, and a revenue stat. Mirrors
   src/components/monetization/{readiness-score,deal-tracker,revenue-tracker}.
   ───────────────────────────────────────────────────────────────────── */

import { TrendingUp, CircleCheck, Circle, Wallet, Building2, ArrowUpRight } from "lucide-react";

export function ReadinessScore() {
  const score = 62;
  const items = [
    { label: "Completed onboarding", done: true },
    { label: "Defined a niche", done: true },
    { label: "Audience over 1k followers", done: true },
    { label: "Created a media kit", done: true },
    { label: "Published media kit", done: false },
    { label: "Tracked at least one deal", done: true },
    { label: "Closed a paid deal", done: false },
    { label: "Logged revenue", done: false },
  ];
  const tone = score >= 70 ? "Brand-ready" : score >= 40 ? "Building" : "Foundation";
  return (
    <div className="card p-5 w-[520px] max-w-full">
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-rose-600 font-medium text-[12px] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <TrendingUp className="size-3.5" strokeWidth={2} />
            Monetization Readiness
          </div>
          <h2 className="text-h3 text-ink-900 leading-tight">
            {tone} — {score}/100
          </h2>
          <p className="text-[13px] text-ink-500 mt-1">
            How brand-ready you are based on profile, kit, deals and revenue.
          </p>
        </div>
        <ScoreRing score={score} />
      </header>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2.5 text-[13px] text-ink-700">
            {it.done ? (
              <CircleCheck className="size-4 text-emerald-500 shrink-0" strokeWidth={2.2} />
            ) : (
              <Circle className="size-4 text-ink-300 shrink-0" strokeWidth={2} />
            )}
            <span className={it.done ? "" : "text-ink-500"}>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88" aria-hidden className="shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" className="stroke-rose-100" strokeWidth="8" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        className="stroke-rose-500"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
      />
      <text x="44" y="50" textAnchor="middle" className="fill-ink-900" fontSize="20" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

export function DealCard() {
  const deals = [
    { brand: "Lumen Skincare", value: "$1,200", status: "Negotiating", tone: "bg-amber-100 text-amber-700" },
    { brand: "Aero Audio", value: "$2,500", status: "Closed", tone: "bg-success-bg text-success" },
    { brand: "Nomad Coffee", value: "$600", status: "Pitched", tone: "bg-rose-100 text-rose-700" },
  ];
  return (
    <div className="card p-2 w-[420px] max-w-full">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-h5 text-ink-900">Deal pipeline</h3>
        <span className="text-[12px] text-ink-500">3 active</span>
      </div>
      <div className="divide-y divide-ink-100">
        {deals.map((d) => (
          <div key={d.brand} className="flex items-center gap-3 px-3 py-3">
            <span className="size-9 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
              <Building2 className="size-4" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-ink-900 truncate">{d.brand}</div>
              <div className="text-[12px] text-ink-500 tabular-nums">{d.value}</div>
            </div>
            <span className={"chip " + d.tone}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueStat() {
  return (
    <div className="card p-5 w-[260px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="size-9 rounded-full bg-success-bg text-success inline-flex items-center justify-center">
          <Wallet className="size-4" strokeWidth={1.9} />
        </span>
        <span className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-success">
          <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
          18%
        </span>
      </div>
      <div className="text-[12.5px] text-ink-500">Revenue this month</div>
      <div className="text-h2 text-ink-900 tabular-nums leading-tight">$4,300</div>
      <div className="text-[12px] text-ink-400 mt-1">$24,180 all-time</div>
    </div>
  );
}
