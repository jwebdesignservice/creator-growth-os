/* Access tiers ────────────────────────────────────────────────────────────────
   Admin program-access governance — the Free / Basic / Pro tier selector
   and the enrollment-rules toggles. Distinct from the member-facing paywall;
   this is the admin side that *sets* the minimum plan needed to access a
   program, with per-tier member counts.
   ───────────────────────────────────────────────────────────────────────── */

import { Check, Lock, Users, Crown } from "lucide-react";
import { cn } from "@/lib/cn";

type Tier = { key: string; label: string; members: string; selected?: boolean; icon?: boolean };

const TIERS: Tier[] = [
  { key: "free", label: "Free", members: "1,204" },
  { key: "basic", label: "Basic", members: "382", selected: true },
  { key: "pro", label: "Pro", members: "147", icon: true },
];

/* 1 · Tier selector — the membership gate with per-tier member counts. */
export function AccessTierSelector() {
  return (
    <div className="w-[460px] max-w-full">
      <div className="text-[12px] font-medium text-ink-700 mb-2">Minimum access tier</div>
      <div className="grid grid-cols-3 gap-2.5">
        {TIERS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={t.selected || undefined}
            className={cn(
              "rounded-[12px] border p-3 text-left cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
              t.selected
                ? "border-rose-300 ring-2 ring-rose-100 bg-rose-50/50"
                : "border-ink-100 bg-white hover:bg-cream-50 active:bg-cream-100",
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-bold text-ink-900 inline-flex items-center gap-1">
                {t.icon && <Crown className="size-3.5 text-amber-500" strokeWidth={2} fill="currentColor" />}
                {t.label}
              </span>
              {t.selected && (
                <span className="size-4 rounded-full bg-rose-600 text-white inline-flex items-center justify-center">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-[11px] text-ink-400 inline-flex items-center gap-1">
              <Users className="size-3" strokeWidth={2} />
              {t.members}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] text-ink-400 inline-flex items-center gap-1.5">
        <Lock className="size-3.5 shrink-0" strokeWidth={2} />
        Members on <span className="font-semibold text-ink-500">Basic and above</span> can access this program.
      </p>
    </div>
  );
}

/* 2 · Enrollment rules — behaviour toggles for how members join. */
const RULES = [
  { label: "Auto-enroll eligible members", desc: "Add everyone on the tier automatically", on: true },
  { label: "Allow waitlist", desc: "Let lower tiers request early access", on: false },
  { label: "Notify on enrollment", desc: "Email members when they gain access", on: true },
];

export function EnrollmentRulesCard() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-[14px] font-bold text-ink-900 mb-3.5">Enrollment rules</h3>
      <ul className="divide-y divide-ink-100">
        {RULES.map((r) => (
          <li key={r.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900 leading-tight">{r.label}</div>
              <div className="text-[11.5px] text-ink-500 mt-0.5">{r.desc}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={r.on}
              aria-label={r.label}
              className={cn(
                "relative inline-flex shrink-0 h-6 w-[44px] rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-300",
                r.on ? "bg-rose-600 hover:bg-rose-700" : "bg-ink-200 hover:bg-ink-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-[3px] inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform",
                  r.on ? "translate-x-[23px]" : "translate-x-[3px]",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
