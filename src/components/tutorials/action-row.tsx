"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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
  /** Next lesson's slug — drives the "Complete & continue" primary action. */
  nextSlug?: string | null;
  /** Previous lesson's slug — drives the "Go back" action. */
  prevSlug?: string | null;
  /** Next lesson's title — names the destination in the "Up next" line. */
  nextTitle?: string | null;
  /**
   * Route prefix for sibling navigation when NOT inside a program — e.g.
   * "/tutorials" for the standalone Tutorial Library. Ignored when
   * `programSlug` is set (programs always navigate within `/programs/...`).
   */
  basePath?: string | null;
  /** Hide the Add-note button — e.g. when the page has a Notes tab with its
   *  own compose action. */
  showNoteButton?: boolean;
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
  nextSlug,
  prevSlug,
  basePath,
  showNoteButton = true,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  // Resolve where a prev/next sibling lives for the current context:
  //   • Inside a program → /programs/[program]/[slug] (overview when no slug).
  //   • Standalone tutorial (basePath set, e.g. "/tutorials") → basePath/[slug]
  //     (the library root when there's no further sibling).
  //   • Neither → the Programs index as a safe fallback.
  const siblingHref = (slug?: string | null) => {
    if (programSlug)
      return slug ? `/programs/${programSlug}/${slug}` : `/programs/${programSlug}`;
    if (basePath) return slug ? `${basePath}/${slug}` : basePath;
    return "/programs";
  };

  function completeAndContinue() {
    // Mark this lesson complete (if it isn't already) and advance to the next
    // lesson. Falls back to the section root when this is the last one.
    setErr(null);
    startTransition(async () => {
      if (!completed) {
        const res = await markLessonComplete(lessonSlug, true);
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        setCompleted(true);
      }
      router.push(siblingHref(nextSlug));
    });
  }

  const ghostBtn =
    "inline-flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-[10px] border border-ink-200 bg-white text-ink-700 text-[13px] font-medium transition-all duration-150 hover:bg-cream-100 hover:border-ink-300 hover:text-ink-900 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1 cursor-pointer";

  return (
    <>
      {/* Standalone action row — compact secondary actions on the left,
          the primary anchored right (primary first on mobile). */}
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
        {showNoteButton && (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className={ghostBtn}
          >
            <NotebookPen className="size-4" strokeWidth={1.8} />
            Add note
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push(siblingHref(prevSlug))}
          className={ghostBtn}
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Previous
        </button>
        <button
          type="button"
          onClick={completeAndContinue}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[10px] bg-rose-600 text-white text-[13.5px] font-semibold shadow-[0_8px_20px_-8px_rgba(185,72,92,0.6)] transition-all duration-150 hover:bg-rose-700 hover:shadow-[0_10px_24px_-8px_rgba(185,72,92,0.7)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_-8px_rgba(185,72,92,0.6)] sm:ml-auto"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <CheckCircle2 className="size-4" strokeWidth={2} />
          )}
          {completed ? "Continue" : "Complete & continue"}
        </button>
      </div>

      {err && <div className="mt-3 text-[12px] text-rose-700">{err}</div>}

      {noteOpen && (
        <CreateNoteModal
          lessonSlug={lessonSlug}
          lessonTitle={lessonTitle}
          programSlug={programSlug}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </>
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
      className="anim-overlay-in fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !pending && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Create note"
    >
      <div
        className="anim-modal-in relative bg-white rounded-[18px] shadow-[0_32px_80px_-24px_rgba(26,24,22,0.45)] ring-1 ring-ink-900/[0.06] w-full max-w-[560px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* top edge light — seats the panel */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-ink-900/[0.08] to-transparent"
        />
        <header className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="size-10 rounded-[12px] bg-gradient-to-br from-rose-100 to-rose-200/70 text-rose-600 ring-1 ring-rose-200/60 inline-flex items-center justify-center shrink-0">
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
            className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 transition-all duration-150 hover:bg-cream-100 hover:text-ink-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:opacity-50 shrink-0"
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
                  className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 transition-all duration-150 hover:bg-cream-100 hover:border-ink-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={pending || isEmpty || tooLong}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold shadow-[0_8px_20px_-8px_rgba(185,72,92,0.6)] transition-all duration-150 hover:bg-rose-700 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:bg-rose-300 disabled:shadow-none disabled:hover:translate-y-0"
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
