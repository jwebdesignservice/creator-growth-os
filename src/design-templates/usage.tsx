/* Usage & limits ─────────────────────────────────────────────────────────────
   Quota / consumption meters — video storage (the 50 GB-per-video bucket),
   plan-limit counters (programs used), and a multi-row usage breakdown. The
   creator-platform's "how much of your allowance is left" surfaces.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { HardDrive, Film, Users, AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

function Bar({ pct, tone = "rose" }: { pct: number; tone?: "rose" | "amber" }) {
  return (
    <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
      <div
        className={cn("h-full rounded-full", tone === "amber" ? "bg-amber-500" : "bg-rose-500")}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

/* 1 · Storage meter — used vs. allowance with a progress bar. */
export function StorageMeter() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <HardDrive className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">Video storage</div>
          <div className="text-[11.5px] text-ink-500">Across all your lessons</div>
        </div>
        <div className="text-right">
          <div className="text-[14px] font-bold text-ink-900 tabular-nums leading-none">12.4 GB</div>
          <div className="text-[10.5px] text-ink-400 mt-0.5">of 50 GB</div>
        </div>
      </div>
      <Bar pct={25} />
      <div className="mt-2 text-[11.5px] text-ink-400">37.6 GB free · plenty of room</div>
    </div>
  );
}

/* 2 · Plan-limit counter — near the cap, with an upgrade nudge. */
export function PlanLimitMeter() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-[10px] bg-amber-100 text-amber-600 inline-flex items-center justify-center">
            <Film className="size-[18px]" strokeWidth={1.9} />
          </span>
          <div className="text-[13.5px] font-semibold text-ink-900">Programs</div>
        </div>
        <div className="text-[13px] font-semibold text-ink-700 tabular-nums">
          4 <span className="text-ink-400 font-normal">of 5</span>
        </div>
      </div>
      <Bar pct={80} tone="amber" />
      <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-amber-700">
        <AlertTriangle className="size-3.5 shrink-0" strokeWidth={2} />
        Almost at your limit —{" "}
        <button type="button" className="font-semibold text-rose-600 cursor-pointer rounded transition-colors hover:text-rose-700 hover:underline underline-offset-2 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">upgrade for unlimited</button>
      </div>
    </div>
  );
}

/* 3 · Usage breakdown — several metered resources at a glance. */
const ROWS: { icon: LucideIcon; label: string; used: string; pct: number; tone?: "rose" | "amber" }[] = [
  { icon: HardDrive, label: "Storage", used: "12.4 / 50 GB", pct: 25 },
  { icon: Film, label: "Programs", used: "4 / 5", pct: 80, tone: "amber" },
  { icon: Users, label: "Team seats", used: "2 / 3", pct: 66 },
];

export function UsageBreakdown() {
  return (
    <div className="w-[360px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 space-y-4 shadow-card">
      <div className="text-[13.5px] font-semibold text-ink-900">Plan usage</div>
      {ROWS.map((r) => {
        const Icon = r.icon;
        return (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-700">
                <Icon className="size-3.5 text-ink-400" strokeWidth={2} />
                {r.label}
              </span>
              <span className="text-[11.5px] text-ink-500 tabular-nums">{r.used}</span>
            </div>
            <Bar pct={r.pct} tone={r.tone} />
          </div>
        );
      })}
    </div>
  );
}
