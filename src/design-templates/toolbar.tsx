/* Toolbar ─────────────────────────────────────────────────────────────────
   Action bars — a bulk-selection toolbar (dark floating pill) and a table
   toolbar (search + filters + view toggle + new). The chrome above lists.
   ───────────────────────────────────────────────────────────────────── */

import { Mail, Tag, Trash2, X, Search, ListFilter, Plus, LayoutGrid, List } from "lucide-react";

export function SelectionToolbar() {
  return (
    <div className="w-[480px] max-w-full flex items-center gap-2 rounded-[14px] bg-ink-900 text-white px-3 py-2 shadow-card">
      <span className="inline-flex items-center justify-center size-7 rounded-full bg-white/15 text-[12px] font-semibold">3</span>
      <span className="text-[13px] font-medium">selected</span>
      <div className="h-5 w-px bg-white/15 mx-1" />
      <button type="button" className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] text-[12.5px] hover:bg-white/10">
        <Mail className="size-3.5" strokeWidth={2} />
        Email
      </button>
      <button type="button" className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] text-[12.5px] hover:bg-white/10">
        <Tag className="size-3.5" strokeWidth={2} />
        Tag
      </button>
      <button type="button" className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] text-[12.5px] text-rose-300 hover:bg-white/10">
        <Trash2 className="size-3.5" strokeWidth={2} />
        Delete
      </button>
      <button type="button" aria-label="Clear selection" className="ml-auto size-7 rounded-full inline-flex items-center justify-center hover:bg-white/10">
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function TableToolbar() {
  return (
    <div className="w-[560px] max-w-full flex items-center gap-2.5">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
        <div className="h-10 rounded-[10px] border border-ink-100 bg-white pl-9 flex items-center text-[13px] text-ink-400">Search members…</div>
      </div>
      <button type="button" className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] border border-ink-100 bg-white text-ink-700 text-[13px] font-medium hover:bg-cream-100">
        <ListFilter className="size-4 text-ink-400" strokeWidth={2} />
        Filters
        <span className="ml-0.5 size-4 rounded-full bg-rose-600 text-white text-[10px] inline-flex items-center justify-center">2</span>
      </button>
      <div className="inline-flex items-center rounded-[10px] border border-ink-100 overflow-hidden">
        <span className="size-10 inline-flex items-center justify-center bg-cream-200 text-ink-900"><List className="size-4" strokeWidth={2} /></span>
        <span className="size-10 inline-flex items-center justify-center text-ink-400 border-l border-ink-100"><LayoutGrid className="size-4" strokeWidth={2} /></span>
      </div>
      <button type="button" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold">
        <Plus className="size-4" strokeWidth={2.2} />
        New
      </button>
    </div>
  );
}
