"use client";

import Link from "next/link";
import { NotebookPen, Play } from "lucide-react";
import { NotesList } from "@/components/notes/notes-list";
import type { ProgramNote } from "@/lib/programs/queries";

export function ProgramNotes({
  notes,
  programSlug,
  newNoteHref,
}: {
  notes: ProgramNote[];
  programSlug: string;
  /** Where the "+ New note" tile leads (the program's next lesson). */
  newNoteHref?: string;
}) {
  return (
    <section className="card overflow-hidden flex flex-col">
      {/* Header — matches Templates & Downloads chrome */}
      <div className="p-5 sm:p-6 flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <NotebookPen className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            My Notes
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            Everything you&apos;ve saved while working through this program
          </p>
        </div>
        {notes.length > 0 && (
          <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-cream-100 text-ink-600 text-[11.5px] font-semibold shrink-0 tabular-nums">
            {notes.length} note{notes.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {notes.length === 0 && !newNoteHref ? (
        <EmptyNotes programSlug={programSlug} />
      ) : (
        <div className="border-t border-ink-100 p-4 sm:p-5">
          <NotesList
            notes={notes}
            programSlug={programSlug}
            showContext
            newNoteHref={newNoteHref}
          />
        </div>
      )}
    </section>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────── */

function EmptyNotes({ programSlug }: { programSlug: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center border-t border-ink-100 px-5 sm:px-6 py-10 text-center">
      <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <NotebookPen className="size-[18px]" strokeWidth={1.9} />
      </span>
      <h4 className="text-[14px] font-semibold text-ink-900 mb-1">
        No notes yet
      </h4>
      <p className="text-[12.5px] text-ink-500 max-w-sm mx-auto leading-snug">
        Open any lesson and tap{" "}
        <span className="font-semibold text-ink-700">Create Notes</span> to save
        your takeaways. They&apos;ll all collect here.
      </p>
      <Link
        href={`/programs/${programSlug}`}
        className="inline-flex items-center gap-1.5 mt-4 h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
      >
        <Play className="size-3.5" fill="currentColor" />
        Go to lessons
      </Link>
    </div>
  );
}
