"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { X, NotebookPen, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { RichNoteEditor } from "@/components/notes/rich-note";
import {
  noteIsEmpty,
  noteTextLength,
  stripUnsafeNoteHtml,
} from "@/lib/notes/sanitize";
import { createProgramNote } from "@/app/(app)/programs/[slug]/program-note-actions";

const MAX_LEN = 5000;

/**
 * Composer popup for a free-standing program note (not tied to a lesson).
 * Opened by the "+ New note" tile on the program's Notes board.
 */
export function NewNoteModal({
  programSlug,
  onClose,
}: {
  programSlug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isEmpty = noteIsEmpty(body);
  const tooLong = noteTextLength(body) > MAX_LEN;

  function save() {
    setErr(null);
    if (isEmpty) return setErr("Write something before saving.");
    if (tooLong)
      return setErr(`Notes are limited to ${MAX_LEN.toLocaleString()} characters.`);
    const html = stripUnsafeNoteHtml(body);
    startTransition(async () => {
      const res = await createProgramNote(programSlug, html);
      if (!res.ok) return setErr(res.error);
      router.refresh();
      onClose();
    });
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !pending && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="New note"
    >
      <div
        className="bg-white rounded-[18px] shadow-xl border border-ink-100 w-full max-w-[560px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 p-5 border-b border-ink-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <NotebookPen className="size-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-ink-900 leading-tight">
                New note
              </h3>
              <p className="text-[12px] text-ink-500 mt-0.5">
                A quick note for this program — not tied to a lesson.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 disabled:opacity-50 shrink-0"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        <div className="p-5">
          <RichNoteEditor
            onChange={setBody}
            onSubmit={save}
            autoFocus
            disabled={pending}
            minHeight={150}
            placeholder="Write your note…"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11.5px] text-ink-400">
              Tip: press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-cream-100 border border-ink-200 text-[10.5px] font-medium text-ink-600">
                ⌘/Ctrl + Enter
              </kbd>{" "}
              to save
            </span>
            <span
              className={cn(
                "text-[11.5px] tabular-nums",
                tooLong ? "text-rose-600 font-semibold" : "text-ink-400",
              )}
            >
              {noteTextLength(body).toLocaleString()}/{MAX_LEN.toLocaleString()}
            </span>
          </div>
          {err && (
            <div className="mt-2 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
              {err}
            </div>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-ink-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-9 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || isEmpty || tooLong}
            className="h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />}
            Save note
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
