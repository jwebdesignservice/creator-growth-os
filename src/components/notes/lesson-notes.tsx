"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { NotesList } from "@/components/notes/notes-list";
import { CreateNoteModal } from "@/components/tutorials/action-row";
import type { ProgramNote } from "@/lib/programs/queries";

/**
 * Tutorial "My Notes" board — a 1:1 mirror of the program page's `ProgramNotes`
 * card, scoped to a single lesson/tutorial. Reuses the same `NotesList` grid
 * (same cards, pin/edit/delete, double-click reader, pagination); the only
 * difference is the "+ New note" tile opens the lesson-scoped Create-note
 * composer instead of the program one — so program and tutorial notes never
 * cross.
 */
export function LessonNotes({
  notes,
  lessonSlug,
  lessonTitle,
}: {
  notes: ProgramNote[];
  lessonSlug: string;
  lessonTitle: string;
}) {
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <section className="bg-white overflow-hidden flex flex-col min-h-[70vh] lg:-ml-6 lg:-mr-[var(--space-page-x)] lg:-mb-[var(--space-page-y)]">
      {/* Header — matches the program "My Notes" card chrome */}
      <div className="p-5 sm:p-6 flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <NotebookPen className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            My Notes
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            Everything you&apos;ve saved for this lesson
          </p>
        </div>
        {notes.length > 0 && (
          <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-cream-100 text-ink-600 text-[11.5px] font-semibold shrink-0 tabular-nums">
            {notes.length} note{notes.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="border-t border-ink-100 p-4 sm:p-5 flex-1">
        <NotesList
          notes={notes}
          showContext={false}
          onNewNote={() => setComposeOpen(true)}
        />
      </div>

      {composeOpen && (
        <CreateNoteModal
          lessonSlug={lessonSlug}
          lessonTitle={lessonTitle}
          onClose={() => setComposeOpen(false)}
        />
      )}
    </section>
  );
}
