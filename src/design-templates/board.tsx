/* Board ───────────────────────────────────────────────────────────────────
   Kanban / task-board surfaces — a 3-column board and a rich task card.
   The shape behind the missions board and the posting pipeline. Cards lift
   on hover; the add / card-menu affordances are real focusable buttons.
   ───────────────────────────────────────────────────────────────────── */

import { Plus, Ellipsis, SquareCheck } from "lucide-react";

const ICON_BTN =
  "inline-flex items-center justify-center rounded-[7px] text-ink-400 hover:bg-cream-200 hover:text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200";

export function KanbanBoard() {
  const cols = [
    {
      title: "Idea",
      accent: "bg-ink-300",
      cards: [
        { t: "30-day challenge series", tag: "Reel", tone: "bg-violet-100 text-violet-700" },
        { t: "Q&A with audience", tag: "Story", tone: "bg-amber-100 text-amber-700" },
      ],
    },
    {
      title: "In progress",
      accent: "bg-rose-400",
      cards: [{ t: "Hook framework carousel", tag: "Carousel", tone: "bg-sky-100 text-sky-700" }],
    },
    {
      title: "Done",
      accent: "bg-emerald-500",
      cards: [
        { t: "Intro reel", tag: "Reel", tone: "bg-violet-100 text-violet-700" },
        { t: "Weekly recap", tag: "Video", tone: "bg-rose-100 text-rose-700" },
      ],
    },
  ];
  return (
    <div className="flex gap-3 w-[640px] max-w-full">
      {cols.map((c) => (
        <div key={c.title} className="flex-1 rounded-[14px] bg-cream-100 p-2.5">
          <div className="flex items-center gap-2 px-1.5 mb-2.5">
            <span className={"size-2 rounded-full " + c.accent} />
            <span className="text-[12.5px] font-semibold text-ink-900">{c.title}</span>
            <span className="text-[11px] text-ink-400 tabular-nums">{c.cards.length}</span>
            <button type="button" aria-label={`Add to ${c.title}`} className={`size-5 ml-auto ${ICON_BTN}`}>
              <Plus className="size-3.5" strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-2">
            {c.cards.map((card, i) => (
              <div
                key={i}
                className="rounded-[10px] bg-white border border-ink-100 p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-rose-200 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={"chip " + card.tone}>{card.tag}</span>
                  <button type="button" aria-label="Card actions" className={`size-6 -mr-1 -mt-0.5 ${ICON_BTN}`}>
                    <Ellipsis className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-[12.5px] font-medium text-ink-900 leading-snug mt-1.5">{card.t}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskCard() {
  return (
    <div className="card p-4 w-[300px] max-w-full hover:border-rose-200 hover:shadow-card transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="chip bg-sky-100 text-sky-700">Carousel</span>
        <span className="chip bg-cream-100 text-ink-500">Due Fri</span>
      </div>
      <h4 className="text-[14px] font-bold text-ink-900 leading-snug">Hook framework carousel</h4>
      <p className="text-[12px] text-ink-500 leading-snug mt-1 line-clamp-2">
        Turn the 3-second hook lesson into a 6-slide carousel with examples.
      </p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
          <SquareCheck className="size-3.5 text-emerald-500" strokeWidth={2} />
          3/5
        </span>
        <span className="size-7 rounded-full bg-rose-600 text-white text-[11px] font-semibold inline-flex items-center justify-center">JW</span>
      </div>
    </div>
  );
}
