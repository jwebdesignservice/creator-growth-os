import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import type { ReadinessSnapshot } from "@/lib/monetization/queries";

type ChecklistItem = { label: string; done: boolean };

export function ReadinessScore({ snap }: { snap: ReadinessSnapshot }) {
  const items: ChecklistItem[] = [
    { label: "Completed onboarding", done: snap.hasCompletedOnboarding },
    { label: "Defined a niche", done: snap.hasNiche },
    { label: "Audience over 1k followers", done: snap.hasFollowers },
    { label: "Created a media kit", done: snap.hasMediaKit },
    { label: "Published media kit", done: snap.hasPublishedKit },
    { label: "Tracked at least one deal", done: snap.hasDealsTracked >= 1 },
    { label: "Closed a paid deal", done: snap.hasPaidDeals >= 1 },
    { label: "Logged revenue", done: snap.totalRevenue > 0 },
  ];
  const tone =
    snap.score >= 70
      ? "Brand-ready"
      : snap.score >= 40
        ? "Building"
        : "Foundation";

  return (
    <div className="card p-[var(--space-card-padding)]">
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-rose-600 font-medium text-[12px] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <TrendingUp className="size-3.5" strokeWidth={2} />
            Monetization Readiness
          </div>
          <h2 className="text-h2 text-ink-900 leading-tight">
            {tone} — {snap.score}/100
          </h2>
          <p className="text-[13px] text-ink-500 mt-1">
            How brand-ready you are based on profile, kit, deals and revenue.
          </p>
        </div>
        <ScoreRing score={snap.score} />
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-center gap-2.5 text-[13px] text-ink-800"
          >
            {it.done ? (
              <CheckCircle2
                className="size-4 text-emerald-500 shrink-0"
                strokeWidth={2.2}
              />
            ) : (
              <Circle
                className="size-4 text-ink-300 shrink-0"
                strokeWidth={2}
              />
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
    <svg width={88} height={88} viewBox="0 0 88 88" aria-hidden>
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="var(--rose-100, #fde2e2)"
        strokeWidth="8"
      />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="var(--rose-500, #e11d48)"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
      />
      <text
        x="44"
        y="50"
        textAnchor="middle"
        className="fill-ink-900 font-display"
        fontSize="20"
        fontWeight="600"
      >
        {score}
      </text>
    </svg>
  );
}
