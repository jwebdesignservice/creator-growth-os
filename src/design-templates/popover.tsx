/* Popover ─────────────────────────────────────────────────────────────────────
   Anchored floating panels — a rich popover (title + body + actions) and an
   action-menu popover. Distinct from `tooltips` (hover labels) and `menus`
   (nav/profile menus): this is the general pinned-panel primitive.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Info, Pencil, Copy, Trash2, Share2 } from "lucide-react";

/* 1 · Rich popover — informational panel with actions and a pointer. */
export function RichPopover() {
  return (
    <div className="w-[280px] max-w-full relative pt-2">
      <div className="absolute top-0.5 left-8 size-3 rotate-45 bg-white border-l border-t border-ink-100" aria-hidden />
      <div className="rounded-[14px] bg-white border border-ink-100 shadow-card p-4">
        <div className="flex items-start gap-2.5">
          <span className="size-8 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Info className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-ink-900">Readiness score</div>
            <p className="text-[12.5px] text-ink-500 leading-relaxed mt-0.5">
              How brand-ready your profile is — media kit, rates, and recent results all count toward it.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3.5">
          <button type="button" className="h-8 px-3 rounded-[9px] text-[12.5px] font-semibold text-ink-500 transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">Dismiss</button>
          <button type="button" className="h-8 px-3 rounded-[9px] text-[12.5px] font-semibold text-white bg-rose-600 transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">Improve it</button>
        </div>
      </div>
    </div>
  );
}

/* 2 · Action-menu popover — a compact list of row actions. */
export function MenuPopover() {
  const items = [
    { icon: Pencil, label: "Edit" },
    { icon: Copy, label: "Duplicate" },
    { icon: Share2, label: "Share" },
  ];
  return (
    <div className="w-[200px] max-w-full rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5">
      {items.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-ink-700 transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200"
        >
          <Icon className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
          {label}
        </button>
      ))}
      <div className="my-1 h-px bg-ink-100" />
      <button type="button" className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-rose-600 transition-colors cursor-pointer hover:bg-rose-50 active:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-300">
        <Trash2 className="size-3.5 shrink-0" strokeWidth={2} />
        Delete
      </button>
    </div>
  );
}
