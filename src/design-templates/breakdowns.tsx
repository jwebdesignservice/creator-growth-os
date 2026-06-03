/* Breakdowns ───────────────────────────────────────────────────────────────
   Distribution-by-dimension lists — audience by region and traffic by
   device. Per-item bar lists (distinct from the single stacked SegmentedBar).
   Mirrors dev-dashboard regional / device breakdown cards.
   ───────────────────────────────────────────────────────────────────── */

import { Smartphone, Monitor, Tablet, type LucideIcon } from "lucide-react";

export function RegionBreakdown() {
  const regions = [
    { name: "United States", pct: 42, flag: "🇺🇸" },
    { name: "United Kingdom", pct: 18, flag: "🇬🇧" },
    { name: "Germany", pct: 12, flag: "🇩🇪" },
    { name: "Brazil", pct: 9, flag: "🇧🇷" },
    { name: "Other", pct: 19, flag: "🌍" },
  ];
  return (
    <div className="card p-5 w-[360px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Audience by region</h3>
      <div className="space-y-3">
        {regions.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="text-[16px] w-6 text-center">{r.flag}</span>
            <span className="text-[13px] text-ink-700 w-28 truncate">{r.name}</span>
            <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
            <span className="text-[12px] text-ink-500 tabular-nums w-9 text-right">{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeviceBreakdown() {
  const devices: { name: string; pct: number; Icon: LucideIcon; bar: string }[] = [
    { name: "Mobile", pct: 68, Icon: Smartphone, bar: "bg-rose-500" },
    { name: "Desktop", pct: 26, Icon: Monitor, bar: "bg-rose-300" },
    { name: "Tablet", pct: 6, Icon: Tablet, bar: "bg-cream-300" },
  ];
  return (
    <div className="card p-5 w-[320px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Traffic by device</h3>
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {devices.map((d) => (
          <div key={d.name} className={d.bar} style={{ width: `${d.pct}%` }} />
        ))}
      </div>
      <div className="space-y-2.5">
        {devices.map((d) => {
          const Icon = d.Icon;
          return (
            <div key={d.name} className="flex items-center gap-2.5 text-[13px]">
              <Icon className="size-4 text-ink-400" strokeWidth={1.9} />
              <span className="text-ink-700 flex-1">{d.name}</span>
              <span className="text-ink-900 font-semibold tabular-nums">{d.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
