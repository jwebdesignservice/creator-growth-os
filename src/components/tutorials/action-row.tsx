"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Check,
  NotebookPen,
  MoreHorizontal,
  X,
  Loader2,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";
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
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
      <button
        type="button"
        onClick={() => {
          if (!completed) toggle();
        }}
        className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors cursor-pointer disabled:bg-rose-300"
        disabled={pending}
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
      <button
        type="button"
        className="size-11 rounded-[12px] border border-ink-200 bg-white text-ink-700 hover:bg-cream-100 inline-flex items-center justify-center cursor-pointer"
        aria-label="More actions"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>

      {err && (
        <div className="sm:col-span-4 text-[12px] text-rose-700">{err}</div>
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

function CreateNoteModal({
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
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const trimmed = body.trim();
  const tooLong = body.length > MAX_LEN;

  function save() {
    setErr(null);
    if (!trimmed) {
      setErr("Write something before saving.");
      return;
    }
    if (tooLong) {
      setErr(`Notes are limited to ${MAX_LEN.toLocaleString()} characters.`);
      return;
    }
    startTransition(async () => {
      const res = await createLessonNote(lessonSlug, trimmed);
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
        className="bg-white rounded-[18px] shadow-xl border border-ink-100 w-full max-w-[520px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <NotebookPen className="size-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h3 className="text-h4 text-ink-900 leading-tight">Create note</h3>
              <p className="text-[12.5px] text-ink-500 truncate">
                For{" "}
                <span className="font-semibold text-ink-700">{lessonTitle}</span>
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
            <textarea
              autoFocus
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                // Cmd/Ctrl + Enter to save quickly.
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
              }}
              placeholder="Jot down a key takeaway, an idea to apply, or a question to revisit…"
              className="input min-h-[140px] resize-y leading-relaxed"
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
                {body.length.toLocaleString()}/{MAX_LEN.toLocaleString()}
              </span>
            </div>

            {err && (
              <div className="mt-2 text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
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
                  disabled={pending || !trimmed || tooLong}
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
