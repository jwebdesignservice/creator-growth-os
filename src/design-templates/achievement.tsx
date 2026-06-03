/* Achievement ──────────────────────────────────────────────────────────────
   Gamification rewards — an "achievement unlocked" celebration card and a
   badge shelf (earned + locked). Creator-facing.
   ───────────────────────────────────────────────────────────────────── */

import { Award, Lock } from "lucide-react";

export function AchievementUnlocked() {
  return (
    <div className="card p-6 w-[320px] max-w-full text-center bg-gradient-to-b from-rose-50 to-white">
      <span className="size-16 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 text-white inline-flex items-center justify-center mx-auto shadow-card">
        <Award className="size-8" strokeWidth={1.8} />
      </span>
      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mt-3">Achievement unlocked</div>
      <h3 className="text-h4 text-ink-900 mt-1">Consistency King</h3>
      <p className="text-[13px] text-ink-500 mt-1">Posted every day for 30 days straight.</p>
      <span className="chip chip-rose mt-3">+250 XP</span>
    </div>
  );
}

export function BadgeShelf() {
  const badges = [
    { label: "First post", earned: true },
    { label: "7-day streak", earned: true },
    { label: "1k followers", earned: true },
    { label: "Viral hit", earned: false },
    { label: "First $", earned: false },
  ];
  return (
    <div className="card p-5 w-[380px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Badges</h3>
      <div className="grid grid-cols-5 gap-3">
        {badges.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
            <span className={"size-12 rounded-full inline-flex items-center justify-center " + (b.earned ? "bg-gradient-to-br from-amber-300 to-rose-500 text-white" : "bg-cream-200 text-ink-300")}>
              {b.earned ? <Award className="size-6" strokeWidth={1.8} /> : <Lock className="size-5" strokeWidth={2} />}
            </span>
            <span className={"text-[9.5px] leading-tight " + (b.earned ? "text-ink-700" : "text-ink-400")}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
