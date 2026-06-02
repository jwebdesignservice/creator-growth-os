/* Notes ─────────────────────────────────────────────────────────────────
   Lesson / program notes — a saved rich-note card and the rich-text editor
   toolbar. Mirrors src/components/notes/rich-note.tsx (presentational; the
   live editor is a contentEditable surface).
   ───────────────────────────────────────────────────────────────────── */

import { Fragment } from "react";
import {
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Tag,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

export function NoteCard() {
  return (
    <div className="card p-5 w-[360px] max-w-full">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-h5 text-ink-900 leading-tight">Hook ideas for next week</h3>
        <span className="chip chip-rose shrink-0">Content</span>
      </div>
      <div className="text-[13px] text-ink-700 leading-relaxed space-y-1">
        <p>Three angles to test:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>“I tried X for 30 days…”</li>
          <li>Before / after transformation</li>
          <li>Myth-busting a common belief</li>
        </ul>
        <p>
          Reference:{" "}
          <a href="#" className="text-rose-600 underline underline-offset-2 font-medium">
            swipe file
          </a>
        </p>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-ink-100 text-[11.5px] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" strokeWidth={1.8} />
          Edited 2d ago
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Tag className="size-3.5" strokeWidth={1.8} />
          Ideas
        </span>
      </div>
    </div>
  );
}

export function NoteEditorToolbar() {
  const groups: LucideIcon[][] = [[Type], [Bold, Italic, Underline], [List, ListOrdered], [Link2]];
  return (
    <div className="w-[360px] max-w-full rounded-[14px] border border-ink-200 bg-white overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60">
        {groups.map((g, gi) => (
          <Fragment key={gi}>
            {gi > 0 && <span aria-hidden className="mx-1 h-5 w-px bg-ink-200" />}
            {g.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="size-8 inline-flex items-center justify-center rounded-[8px] text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors"
              >
                <Icon className="size-3.5" strokeWidth={2} />
              </button>
            ))}
          </Fragment>
        ))}
      </div>
      <div className="px-3.5 py-3 text-[14px] leading-relaxed text-ink-400 min-h-[88px]">
        Write your note…
      </div>
    </div>
  );
}
