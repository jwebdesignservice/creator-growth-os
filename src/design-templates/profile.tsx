/* Profile ───────────────────────────────────────────────────────────────
   Profile / settings rail surfaces: the profile-completion ring with a
   checklist, and the Social & Audience snapshot card. Pure presentational
   mirrors of src/app/(app)/settings/settings-panel.tsx + profile rails.
   ───────────────────────────────────────────────────────────────────── */

import { Check, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformGlyph } from "@/components/posting/platform-glyphs";
import type { PlatformKey } from "@/lib/posting/queries";

// ─────────────────────────────────────────────────────────────────────────────
// Profile completion — radial ring + checklist of steps.
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileCompletionCard() {
  const percent = 75;
  const steps = [
    { label: "Profile information", done: true },
    { label: "Bio & content pillars", done: true },
    { label: "Preferred platforms", done: true },
    { label: "Connect more social accounts", done: false },
  ];

  const r = 34;
  const c = 2 * Math.PI * r;
  const filled = (percent / 100) * c;

  return (
    <div className="card p-5 w-[300px] max-w-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative shrink-0">
          <svg viewBox="0 0 80 80" className="size-20 -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r={r} fill="none" stroke="var(--cream-200)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="var(--rose-500)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${c - filled}`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-ink-900 tabular-nums">
            {percent}%
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-ink-900 leading-tight">Profile Completion</h3>
          <p className="text-[12px] text-ink-500 mt-0.5">Complete your profile to get better results.</p>
        </div>
      </div>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            {s.done ? (
              <span className="size-5 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : (
              <Circle className="size-5 text-ink-300 shrink-0" strokeWidth={2} />
            )}
            <span className={cn("text-[13px]", s.done ? "text-ink-700" : "text-ink-500")}>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Social & Audience snapshot — per-platform follower rows + analytics link.
// ─────────────────────────────────────────────────────────────────────────────

export function AudienceSnapshotCard() {
  const rows: { platform: PlatformKey; label: string; metric: string; sub: string }[] = [
    { platform: "instagram", label: "Instagram", metric: "24.5K", sub: "Followers" },
    { platform: "tiktok", label: "TikTok", metric: "—", sub: "Followers" },
    { platform: "youtube", label: "YouTube", metric: "—", sub: "Subscribers" },
  ];
  return (
    <div className="card p-5 w-[300px] max-w-full">
      <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Social &amp; Audience Snapshot</h3>
      <ul className="space-y-3.5">
        {rows.map((r) => (
          <li key={r.platform} className="flex items-center gap-3">
            <PlatformGlyph platform={r.platform} className="size-8" />
            <span className="text-[13.5px] font-medium text-ink-800 flex-1 min-w-0 truncate">{r.label}</span>
            <span className="text-right shrink-0">
              <span className={cn("block text-[14px] font-bold tabular-nums leading-none", r.metric === "—" ? "text-ink-300" : "text-ink-900")}>
                {r.metric}
              </span>
              <span className="block text-[10.5px] text-ink-400 mt-0.5">{r.sub}</span>
            </span>
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600">
        View full analytics <ArrowRight className="size-3.5" strokeWidth={2} />
      </span>
    </div>
  );
}
