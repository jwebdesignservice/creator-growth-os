/* Ideas ────────────────────────────────────────────────────────────────────
   Content-idea capture — a quick-add card and a saved-ideas list with status.
   Creator-facing content planning.
   ───────────────────────────────────────────────────────────────────── */

import { Lightbulb, Plus } from "lucide-react";

export function IdeaCaptureCard() {
  return (
    <div className="card p-5 w-[360px] max-w-full">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="size-9 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center">
          <Lightbulb className="size-[18px]" strokeWidth={1.9} />
        </span>
        <h3 className="text-[14px] font-bold text-ink-900">Capture an idea</h3>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-10 rounded-[10px] border border-ink-100 bg-white px-3 flex items-center text-[13px] text-ink-400">
          What should I post about?
        </div>
        <span className="size-10 rounded-[10px] bg-rose-600 text-white inline-flex items-center justify-center">
          <Plus className="size-4" strokeWidth={2.2} />
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {["Morning routine", "Gear review", "Q&A"].map((t) => (
          <span key={t} className="inline-flex items-center h-7 px-2.5 rounded-full bg-cream-100 text-ink-500 text-[12px]">{t}</span>
        ))}
      </div>
    </div>
  );
}

export function IdeasList() {
  const ideas = [
    { t: "3 hooks that stop the scroll", s: "Scheduled", tone: "bg-success-bg text-success" },
    { t: "My morning routine breakdown", s: "Drafting", tone: "bg-amber-100 text-amber-700" },
    { t: "Gear I actually use", s: "Idea", tone: "bg-cream-200 text-ink-500" },
  ];
  return (
    <div className="card p-2 w-[380px] max-w-full">
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="text-h5 text-ink-900">Content ideas</h3>
        <span className="text-[12px] text-ink-500">12 saved</span>
      </div>
      <div className="divide-y divide-ink-100">
        {ideas.map((it, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
            <span className="text-[13px] text-ink-900 flex-1 truncate">{it.t}</span>
            <span className={"chip " + it.tone}>{it.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
