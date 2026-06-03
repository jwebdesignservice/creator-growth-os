/* Tag input ──────────────────────────────────────────────────────────────────
   Multi-tag entry — the add/remove chip field the app uses for content pillars
   and niche tags (Settings → Edit profile). Distinct from the read-only filter
   chips in `forms`: these are editable, with a suggestions menu. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { X, Plus, Hash, Check, AlertCircle } from "lucide-react";

/* Shared field chrome + a removable chip so every tag reads identically. */
const FIELD =
  "rounded-[12px] border bg-white p-2 flex flex-wrap items-center gap-1.5 transition";
const FIELD_REST = "border-ink-200 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100";
const FIELD_ACTIVE = "border-rose-300 ring-2 ring-rose-100";

function RemovableChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-rose-100 text-rose-700 text-[12.5px] font-medium">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="size-4 inline-flex items-center justify-center rounded-full text-rose-500 cursor-pointer transition-colors hover:bg-rose-200 active:bg-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        <X className="size-3" strokeWidth={2.4} />
      </button>
    </span>
  );
}

/* 1 · Editable tag field — chips with remove + an input row. */
export function TagInput() {
  const tags = ["business", "monetization", "short-form"];
  return (
    <div className="w-[400px] max-w-full">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">Content pillars</label>
      <div className={`${FIELD} ${FIELD_REST}`}>
        {tags.map((t) => (
          <RemovableChip key={t} label={t} />
        ))}
        <input
          type="text"
          placeholder="Add a pillar…"
          className="flex-1 min-w-[80px] h-7 px-1.5 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 outline-none"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[11.5px] text-ink-400">Press Enter to add</p>
        <span className="text-[11.5px] text-ink-400 tabular-nums">{tags.length} of 5</span>
      </div>
    </div>
  );
}

/* 2 · Tag field with an open suggestions menu (focused state). */
export function TagInputWithSuggestions() {
  const tags = ["business"];
  const suggestions = ["fitness", "tech reviews", "travel", "finance"];
  return (
    <div className="w-[400px] max-w-full">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">Niche tags</label>
      <div className={`${FIELD} ${FIELD_ACTIVE}`}>
        {tags.map((t) => (
          <RemovableChip key={t} label={t} />
        ))}
        <input
          type="text"
          defaultValue="fin"
          className="flex-1 min-w-[80px] h-7 px-1.5 bg-transparent text-[13px] text-ink-900 outline-none"
        />
      </div>
      {/* Suggestions dropdown */}
      <div className="mt-1.5 rounded-[12px] border border-ink-100 bg-white shadow-card py-1 w-full overflow-hidden">
        <div className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Suggested</div>
        {suggestions.map((s, i) => {
          const active = i === 3;
          return (
            <button
              key={s}
              type="button"
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-ink-700 cursor-pointer transition-colors hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200 ${active ? "bg-rose-50 text-rose-700 font-medium" : ""}`}
            >
              <Hash className={`size-3.5 ${active ? "text-rose-400" : "text-ink-400"}`} strokeWidth={2} />
              <span className="flex-1 text-left">{s}</span>
              {active && <Check className="size-3.5 text-rose-500" strokeWidth={2.4} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* 3 · "Add" pill button — the compact trigger to start adding tags. */
export function AddTagButton() {
  return (
    <div className="w-[400px] max-w-full flex items-center gap-1.5 flex-wrap">
      {["business", "monetization"].map((t) => (
        <span key={t} className="inline-flex items-center h-8 px-3 rounded-full bg-cream-100 border border-ink-100 text-[12.5px] font-medium text-ink-700">
          {t}
        </span>
      ))}
      <button
        type="button"
        className="inline-flex items-center gap-1 h-8 pl-2.5 pr-3 rounded-full border border-dashed border-ink-300 text-[12.5px] font-medium text-ink-500 cursor-pointer transition-colors hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
      >
        <Plus className="size-3.5" strokeWidth={2.4} />
        Add pillar
      </button>
    </div>
  );
}

/* 4 · Error / limit state — at the cap, input disabled, with a validation message. */
export function TagInputError() {
  const tags = ["business", "monetization", "short-form", "tech reviews", "fitness"];
  return (
    <div className="w-[400px] max-w-full">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">Content pillars</label>
      <div className={`${FIELD} border-rose-400 ring-2 ring-rose-100`}>
        {tags.map((t) => (
          <RemovableChip key={t} label={t} />
        ))}
        <input
          type="text"
          disabled
          placeholder="Limit reached"
          className="flex-1 min-w-[80px] h-7 px-1.5 bg-transparent text-[13px] text-ink-400 placeholder:text-ink-400 outline-none cursor-not-allowed"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[11.5px] text-rose-600 inline-flex items-center gap-1">
          <AlertCircle className="size-3.5 shrink-0" strokeWidth={2} />
          You can add up to 5 pillars
        </p>
        <span className="text-[11.5px] text-rose-600 font-semibold tabular-nums">5 of 5</span>
      </div>
    </div>
  );
}
