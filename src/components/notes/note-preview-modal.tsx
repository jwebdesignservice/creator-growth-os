"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Play,
  LayoutGrid,
  BookOpen,
  Pin,
  ChevronRight,
  ExternalLink,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { NoteContent } from "@/components/notes/rich-note";
import type { ProgramNote } from "@/lib/programs/queries";

/* Read-only note reader — opened by double-clicking a note card. Renders in a
   body portal so it floats above everything and never disturbs the grid. It
   only ever reads the note (no edit/pin/delete) — those stay on the card. */

function fullTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotePreviewModal({
  note,
  programSlug,
  onClose,
}: {
  note: ProgramNote;
  programSlug?: string;
  onClose: () => void;
}) {
  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openHref = note.lesson_slug
    ? programSlug
      ? `/programs/${programSlug}/${note.lesson_slug}`
      : `/tutorials/${note.lesson_slug}`
    : null;

  const edited = !!note.updated_at && note.updated_at !== note.created_at;
  const hasContext =
    !!note.program_title || !!note.module_title || !!note.lesson_title;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Note"
    >
      <div
        className="bg-white rounded-[18px] shadow-xl border border-ink-100 w-full max-w-[620px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-ink-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <NotebookPen className="size-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-ink-900 leading-tight">
                  Note
                </h3>
                {note.pinned && (
                  <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10.5px] font-semibold">
                    <Pin className="size-2.5" fill="currentColor" strokeWidth={0} />
                    Pinned
                  </span>
                )}
              </div>
              <p className="text-[12px] text-ink-500 mt-0.5">
                Saved {fullTime(note.created_at)}
                {edited ? " · edited" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 shrink-0"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        {/* Body — full note, scrolls when long */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          <NoteContent
            html={note.body}
            className={cn(
              "text-[14px] text-ink-700 leading-relaxed",
              "[&>*:first-child]:text-[18px] [&>*:first-child]:font-bold [&>*:first-child]:text-ink-900 [&>*:first-child]:leading-snug [&>*:first-child]:mb-3",
              "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_p]:mb-3 [&_strong]:font-semibold [&_a]:text-rose-600 [&_a]:underline [&_a]:break-words",
            )}
          />
        </div>

        {/* Context footer */}
        {hasContext && (
          <footer className="px-5 sm:px-6 py-4 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {note.program_title && (
                <ContextChip icon={BookOpen} label={`Program: ${note.program_title}`} />
              )}
              {note.module_title && (
                <>
                  {note.program_title && (
                    <ChevronRight className="size-3 text-ink-300 shrink-0" strokeWidth={2} aria-hidden />
                  )}
                  <ContextChip icon={LayoutGrid} label={`Module: ${note.module_title}`} />
                </>
              )}
              {note.lesson_title && (
                <>
                  {(note.program_title || note.module_title) && (
                    <ChevronRight className="size-3 text-ink-300 shrink-0" strokeWidth={2} aria-hidden />
                  )}
                  <ContextChip icon={Play} label={`Video: ${note.lesson_title}`} />
                </>
              )}
            </div>
            {openHref && (
              <Link
                href={openHref}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold shrink-0 transition-colors"
              >
                <ExternalLink className="size-3.5" strokeWidth={2} />
                Open lesson
              </Link>
            )}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

function ContextChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] bg-cream-100 border border-ink-100 text-[11.5px] font-medium text-ink-600 max-w-full">
      <Icon className="size-3 text-ink-400 shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </span>
  );
}
