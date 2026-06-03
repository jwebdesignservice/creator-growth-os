/* Inline edit ─────────────────────────────────────────────────────────────────
   Click-to-edit fields — a value row that becomes an input in place, and an
   editable page title. The app edits program titles, descriptions and field
   values inline; this is that pattern. Presentational (both states shown).
   ───────────────────────────────────────────────────────────────────────── */

import { Pencil, Check, X } from "lucide-react";

/* 1 · Inline field — display row + the editing state below it. */
export function InlineEditField() {
  return (
    <div className="w-[400px] max-w-full space-y-3">
      {/* Display state */}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400 mb-1">Display name</div>
        <div className="group flex items-center gap-2 h-11 px-3.5 rounded-[12px] border border-transparent hover:border-ink-200 hover:bg-cream-50 transition-colors">
          <span className="flex-1 text-[14px] text-ink-900">Deividas Burkauskas</span>
          <button type="button" aria-label="Edit display name" className="size-7 inline-flex items-center justify-center rounded-[8px] text-ink-400 opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-cream-200 active:bg-cream-300 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-200">
            <Pencil className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Editing state */}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400 mb-1">Niche</div>
        <div className="flex items-center gap-2">
          <input
            defaultValue="Business & monetization"
            className="flex-1 h-11 px-3.5 rounded-[12px] border border-rose-300 ring-2 ring-rose-100 bg-white text-[14px] text-ink-900 outline-none"
          />
          <button type="button" aria-label="Save" className="size-11 inline-flex items-center justify-center rounded-[12px] bg-rose-600 text-white shrink-0 transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
            <Check className="size-4" strokeWidth={2.5} />
          </button>
          <button type="button" aria-label="Cancel" className="size-11 inline-flex items-center justify-center rounded-[12px] border border-ink-200 text-ink-500 shrink-0 transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2">
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2 · Editable title — large inline-editable heading. */
export function InlineEditTitle() {
  return (
    <div className="w-[420px] max-w-full">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400 mb-1.5">Program title</div>
      <div className="group inline-flex items-center gap-2 max-w-full">
        <h2 className="text-h3 text-ink-900 border-b-2 border-dashed border-transparent group-hover:border-ink-200 transition-colors truncate">
          How to Reach Your Niche Audience
        </h2>
        <button type="button" aria-label="Rename program" className="size-8 inline-flex items-center justify-center rounded-[9px] text-ink-400 opacity-0 group-hover:opacity-100 transition shrink-0 cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-200">
          <Pencil className="size-4" strokeWidth={2} />
        </button>
      </div>
      <p className="text-[11.5px] text-ink-400 mt-1.5">Click the title to rename it.</p>
    </div>
  );
}
