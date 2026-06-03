"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Check,
  NotebookPen,
  X,
  Loader2,
  CheckCircle2,
  FolderOpen,
  Plus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  RichNoteEditor,
  type RichNoteEditorHandle,
} from "@/components/notes/rich-note";
import {
  noteIsEmpty,
  noteTextLength,
  stripUnsafeNoteHtml,
} from "@/lib/notes/sanitize";
import {
  markLessonComplete,
  createLessonNote,
} from "@/app/(app)/programs/[slug]/actions";

type Props = {
  lessonSlug: string;
  initialCompleted: boolean;
  /** Lesson title — shown as context inside the note popup. */
  lessonTitle: string;
  /** Program slug — used for the "view all notes" link, when in a program. */
  programSlug?: string | null;
};

const MAX_LEN = 5000;

/* Labeled snippets a creator commonly jots while reviewing a lesson —
   one click drops the scaffold so they can fill in the rest. */
const QUICK_ADDS: { label: string; snippet: string }[] = [
  { label: "CTA", snippet: "CTA: " },
  { label: "Hook", snippet: "Hook: " },
  { label: "Caption idea", snippet: "Caption idea: " },
  { label: "Revision note", snippet: "Revision note: " },
];

export function LessonActionRow({
  lessonSlug,
  initialCompleted,
  lessonTitle,
  programSlug,
}: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  function toggle() {
    setErr(null);
    const next = !completed;
    // Optimistic
    setCompleted(next);
    startTransition(async () => {
      const res = await markLessonComplete(lessonSlug, next);
      if (!res.ok) {
        setCompleted(!next);
        setErr(res.error);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => {
          // Take the learner back up to the player to keep watching — it does
          // NOT mark the lesson complete (that's the dedicated button beside
          // it). Falls back to scrolling to the top of the page if the player
          // element isn't found.
          const player = document.getElementById("lesson-video");
          if (player) {
            player.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors cursor-pointer"
      >
        <Play className="size-4" fill="currentColor" />
        Continue Watching
      </button>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-11 rounded-[12px] border text-[14px] font-medium transition-colors cursor-pointer",
          completed
            ? "bg-rose-100 border-rose-200 text-rose-700"
            : "bg-white border-ink-200 text-ink-900 hover:bg-cream-100",
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full inline-flex items-center justify-center",
            completed ? "bg-rose-500 text-white" : "border border-ink-300",
          )}
        >
          {completed && <Check className="size-3" strokeWidth={3} />}
        </span>
        {completed ? "Completed" : pending ? "Saving…" : "Mark Complete"}
      </button>
      <button
        type="button"
        onClick={() => setNoteOpen(true)}
        className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] border border-ink-200 bg-white text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors cursor-pointer"
      >
        <NotebookPen className="size-4" strokeWidth={1.8} />
        Create Notes
      </button>

      {err && (
        <div className="sm:col-span-3 text-[12px] text-rose-700">{err}</div>
      )}

      {noteOpen && (
        <CreateNoteModal
          lessonSlug={lessonSlug}
          lessonTitle={lessonTitle}
          programSlug={programSlug}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Create-note popup ───────────────────────────────────────────────── */

export function CreateNoteModal({
  lessonSlug,
  lessonTitle,
  programSlug,
  onClose,
}: {
  lessonSlug: string;
  lessonTitle: string;
  programSlug?: string | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const editorRef = useRef<RichNoteEditorHandle>(null);

  const titleText = title.trim();
  const textLen = noteTextLength(body);
  // A note is valid with just a title, just a body, or both.
  const isEmpty = !titleText && noteIsEmpty(body);
  const tooLong = textLen > MAX_LEN;

  function save() {
    setErr(null);
    if (isEmpty) {
      setErr("Write something before saving.");
      return;
    }
    if (tooLong) {
      setErr(`Notes are limited to ${MAX_LEN.toLocaleString()} characters.`);
      return;
    }
    // The title becomes the note's heading (its first block); the note cards
    // and reader already style a note's first block as the title, so this needs
    // no schema change.
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const heading = titleText ? `<p>${esc(titleText)}</p>` : "";
    const html = stripUnsafeNoteHtml(heading + body);
    startTransition(async () => {
      const res = await createLessonNote(lessonSlug, html);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSaved(true);
      // Refresh so the new note shows up immediately (tutorial Notes tab /
      // program Resources → My Notes), then close after a brief success state.
      router.refresh();
      setTimeout(onClose, 950);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !pending && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Create note"
    >
      <div
        className="bg-white rounded-[18px] shadow-xl border border-ink-100 w-full max-w-[560px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <NotebookPen className="size-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h3 className="text-h4 text-ink-900 leading-tight">Create note</h3>
              <p className="text-[12.5px] text-ink-500">
                Capture a takeaway, an idea to apply, or a question to revisit.
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

        {saved ? (
          <div className="rounded-[14px] bg-emerald-50 border border-emerald-200 px-4 py-6 text-center">
            <span className="size-11 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center mb-2.5">
              <CheckCircle2 className="size-6" strokeWidth={2} />
            </span>
            <p className="text-[14px] font-semibold text-ink-900">Note saved</p>
            <p className="text-[12.5px] text-ink-500 mt-0.5">
              {programSlug
                ? "Find it under Resources → My Notes."
                : "Find it in the Notes tab below."}
            </p>
          </div>
        ) : (
          <>
            {/* Attached-to context chip */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                Attached to
              </span>
              <span className="inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-full bg-cream-100 border border-ink-200 text-[12px] font-semibold text-ink-700 min-w-0">
                <BookOpen className="size-3.5 text-rose-500 shrink-0" strokeWidth={2} />
                <span className="truncate">{lessonTitle}</span>
              </span>
            </div>

            {/* Title — becomes the note's heading so notes are easy to scan */}
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  save();
                } else if (e.key === "Enter") {
                  // Enter in the title jumps down to the note body.
                  e.preventDefault();
                  editorRef.current?.focus();
                }
              }}
              maxLength={120}
              placeholder="Note title"
              className="w-full mb-3 h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[15px] font-semibold text-ink-900 placeholder:text-ink-400 placeholder:font-normal outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />

            {/* WYSIWYG editor — bold/italic/underline + real lists + links */}
            <RichNoteEditor
              ref={editorRef}
              onChange={setBody}
              onSubmit={save}
              disabled={pending}
              placeholder="Jot down a key takeaway, an idea to apply, or a question to revisit…"
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
                {textLen.toLocaleString()}/{MAX_LEN.toLocaleString()}
              </span>
            </div>

            {/* Quick add — one-tap labeled scaffolds inserted at the caret */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="size-3.5 text-rose-500" strokeWidth={2} />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  Quick add
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ADDS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editorRef.current?.insertSnippet(q.snippet)}
                    className="inline-flex items-center gap-1 h-8 pl-2 pr-3 rounded-full border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5 text-rose-400" strokeWidth={2.4} />
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {err && (
              <div className="mt-3 text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
                {err}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-4">
              {programSlug ? (
                <Link
                  href={`/programs/${programSlug}`}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <FolderOpen className="size-3.5" strokeWidth={2} />
                  View all notes
                </Link>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={pending || isEmpty || tooLong}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
                >
                  {pending && (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                  )}
                  Save note
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
