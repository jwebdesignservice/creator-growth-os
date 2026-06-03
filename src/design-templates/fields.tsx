/* Fields ──────────────────────────────────────────────────────────────────
   Advanced field primitives — inline-edit (idle + editing), a number
   stepper, and a tag input. Distinct from the basic select / dropzone /
   filter-chips in Forms.
   ───────────────────────────────────────────────────────────────────── */

import { Pencil, Check, X, Minus, Plus } from "lucide-react";

export function InlineEdit() {
  return (
    <div className="w-[320px] max-w-full space-y-4">
      <div>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-1">Display name</div>
        <div className="group flex items-center gap-2 h-10 px-3 rounded-[10px] hover:bg-cream-100">
          <span className="text-[13.5px] text-ink-900 flex-1">Jack Wilson</span>
          <Pencil className="size-3.5 text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-1">Username</div>
        <div className="flex items-center gap-2">
          <input readOnly defaultValue="jackwilson" className="flex-1 h-10 px-3 rounded-[10px] border border-rose-300 ring-2 ring-rose-100 bg-white text-[13.5px] text-ink-900 outline-none" />
          <span className="size-9 rounded-[10px] bg-rose-600 text-white inline-flex items-center justify-center"><Check className="size-4" strokeWidth={2.5} /></span>
          <span className="size-9 rounded-[10px] border border-ink-200 text-ink-500 inline-flex items-center justify-center"><X className="size-4" strokeWidth={2} /></span>
        </div>
      </div>
    </div>
  );
}

export function NumberStepper() {
  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex items-center rounded-[10px] border border-ink-100 overflow-hidden w-fit">
        <span className="size-10 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100"><Minus className="size-4" strokeWidth={2} /></span>
        <span className="w-12 text-center text-[14px] font-semibold text-ink-900 tabular-nums border-x border-ink-100">3</span>
        <span className="size-10 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100"><Plus className="size-4" strokeWidth={2} /></span>
      </div>
      <span className="text-[12px] text-ink-500">Posts per week</span>
    </div>
  );
}

export function TagInput() {
  const tags = ["fitness", "wellness", "mindset"];
  return (
    <div className="w-[320px] max-w-full">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-1.5">Niche tags</div>
      <div className="flex flex-wrap items-center gap-1.5 min-h-11 px-2.5 py-2 rounded-[12px] border border-ink-100 bg-white">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-rose-100 text-rose-700 text-[12.5px] font-medium">
            {t}
            <span className="size-4 rounded-full hover:bg-rose-200 inline-flex items-center justify-center"><X className="size-3" strokeWidth={2.5} /></span>
          </span>
        ))}
        <span className="text-[13px] text-ink-400 px-1">Add tag…</span>
      </div>
    </div>
  );
}
