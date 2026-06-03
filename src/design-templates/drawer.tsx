/* Drawer ──────────────────────────────────────────────────────────────────
   Side panels — a right-side detail drawer (header / body / footer actions)
   and a filter drawer. Mirrors posting/post-detail-modal & posting-plan-
   drawer. Distinct from modals (centered) and the mobile nav drawer.
   ───────────────────────────────────────────────────────────────────── */

import { X, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function DetailDrawer() {
  const rows = [
    { k: "Status", v: "Scheduled" },
    { k: "Platform", v: "Instagram" },
    { k: "Type", v: "Reel" },
    { k: "Date", v: "May 18, 9:00 AM" },
  ];
  return (
    <div className="w-[340px] h-[460px] rounded-[16px] border border-ink-100 bg-white shadow-card overflow-hidden flex flex-col">
      <header className="flex items-center justify-between px-5 h-14 border-b border-ink-100 shrink-0">
        <h3 className="text-[15px] font-bold text-ink-900">Post details</h3>
        <span className="size-8 rounded-[10px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100">
          <X className="size-4" strokeWidth={2} />
        </span>
      </header>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-[12px] bg-gradient-to-br from-rose-100 to-cream-200 h-28 mb-4" />
        <h4 className="text-[14px] font-bold text-ink-900 mb-3">3 hooks that stop the scroll</h4>
        <dl className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center justify-between text-[13px]">
              <dt className="text-ink-500">{r.k}</dt>
              <dd className="font-medium text-ink-900">{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <footer className="flex items-center gap-2 px-5 h-16 border-t border-ink-100 shrink-0">
        <span className="flex-1 inline-flex items-center justify-center h-10 rounded-[10px] bg-cream-200 text-ink-900 text-[13px] font-medium">Edit</span>
        <span className="flex-1 inline-flex items-center justify-center h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold">Publish</span>
      </footer>
    </div>
  );
}

export function FilterDrawer() {
  const groups = [
    { title: "Status", opts: [{ l: "Active", on: true }, { l: "At risk", on: false }, { l: "Completed", on: true }] },
    { title: "Plan", opts: [{ l: "Free", on: false }, { l: "Pro", on: true }] },
  ];
  return (
    <div className="w-[300px] rounded-[16px] border border-ink-100 bg-white shadow-card overflow-hidden">
      <header className="flex items-center justify-between px-5 h-14 border-b border-ink-100">
        <h3 className="text-[15px] font-bold text-ink-900">Filters</h3>
        <span className="text-[12px] text-rose-600 font-medium">Reset</span>
      </header>
      <div className="p-5 space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-2">{g.title}</p>
            <div className="space-y-2">
              {g.opts.map((o) => (
                <label key={o.l} className="flex items-center gap-2.5 text-[13px] text-ink-700">
                  <span className={cn("size-[18px] rounded-[5px] inline-flex items-center justify-center shrink-0", o.on ? "bg-rose-600 text-white" : "border-2 border-ink-200")}>
                    {o.on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {o.l}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <footer className="px-5 h-16 border-t border-ink-100 flex items-center">
        <span className="w-full inline-flex items-center justify-center h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold">Apply filters</span>
      </footer>
    </div>
  );
}
