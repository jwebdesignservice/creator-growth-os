"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  FileText,
  Quote,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Pin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { NoteContent, RichNoteEditor } from "@/components/notes/rich-note";
import {
  noteIsEmpty,
  noteTextLength,
  stripUnsafeNoteHtml,
} from "@/lib/notes/sanitize";
import type { ProgramNote } from "@/lib/programs/queries";
import {
  updateLessonNote,
  deleteLessonNote,
  toggleNotePin,
} from "@/app/(app)/programs/[slug]/actions";

const MAX_LEN = 5000;

/* ── Accent palette ─────────────────────────────────────────────────────────
   Stable accent per note (hashed by id) for the top bar, icon tile, chips and
   badge. Pinned notes always read in the brand rose. */
type Accent = {
  top: string;
  tile: string;
  chip: string;
  chipText: string;
  chipIcon: string;
  badge: string;
};

const ACCENTS: Accent[] = [
  { top: "border-t-rose-400",    tile: "bg-rose-100 text-rose-600",       chip: "bg-rose-50 border-rose-100",       chipText: "text-rose-700",    chipIcon: "text-rose-400",    badge: "bg-rose-50 text-rose-600 border-rose-100" },
  { top: "border-t-emerald-400", tile: "bg-emerald-100 text-emerald-600", chip: "bg-emerald-50 border-emerald-100", chipText: "text-emerald-700", chipIcon: "text-emerald-400", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { top: "border-t-amber-400",   tile: "bg-amber-100 text-amber-600",     chip: "bg-amber-50 border-amber-100",     chipText: "text-amber-700",   chipIcon: "text-amber-400",   badge: "bg-amber-50 text-amber-600 border-amber-100" },
  { top: "border-t-indigo-400",  tile: "bg-indigo-100 text-indigo-600",   chip: "bg-indigo-50 border-indigo-100",   chipText: "text-indigo-700",  chipIcon: "text-indigo-400",  badge: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];

function pickAccent(id: string, pinned: boolean): Accent {
  if (pinned) return ACCENTS[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

function minutesSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 60_000;
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.round((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* ── Board (responsive grid of full-note cards) ─────────────────────────────── */

export function NotesList({
  notes,
  programSlug,
  showContext = false,
  pageSize = 6,
}: {
  notes: ProgramNote[];
  /** Used to build lesson links in the breadcrumb (program view). */
  programSlug?: string;
  /** Show the Module → Video breadcrumb. Off for single-lesson views. */
  showContext?: boolean;
  pageSize?: number;
  /** Accepted for API compatibility; the card no longer shows an author. */
  authorName?: string;
}) {
  const [page, setPage] = useState(1);

  if (notes.length === 0) return null;

  const total = notes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const shown = notes.slice(start, start + pageSize);
  const startNum = start + 1;
  const endNum = Math.min(start + pageSize, total);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5 items-start">
        {shown.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            programSlug={programSlug}
            showContext={showContext}
          />
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="text-[12px] text-ink-500 tabular-nums">
            Showing {startNum} to {endNum} of {total} notes
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="size-8 rounded-[8px] inline-flex items-center justify-center border border-ink-200 text-ink-600 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === safePage ? "page" : undefined}
                className={cn(
                  "min-w-8 h-8 px-2 rounded-[8px] text-[12.5px] font-medium transition-colors",
                  n === safePage
                    ? "bg-rose-600 text-white"
                    : "text-ink-600 hover:bg-cream-100",
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="size-8 rounded-[8px] inline-flex items-center justify-center border border-ink-200 text-ink-600 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── A single note card (vertical, full content) ────────────────────────────── */

function NoteCard({
  note,
  programSlug,
  showContext,
}: {
  note: ProgramNote;
  programSlug?: string;
  showContext: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const accent = pickAccent(note.id, note.pinned);
  const isQuote = /<blockquote/i.test(note.body);
  const TypeIcon = isQuote ? Quote : FileText;
  const typeLabel = isQuote ? "Quote" : "Note";
  const recent = minutesSince(note.created_at) < 60;
  const isEmpty = noteIsEmpty(draft);
  const tooLong = noteTextLength(draft) > MAX_LEN;

  const openHref = note.lesson_slug
    ? programSlug
      ? `/programs/${programSlug}/${note.lesson_slug}`
      : `/tutorials/${note.lesson_slug}`
    : null;

  function save() {
    setErr(null);
    if (isEmpty) return setErr("Note can't be empty.");
    if (tooLong)
      return setErr(`Notes are limited to ${MAX_LEN.toLocaleString()} characters.`);
    const html = stripUnsafeNoteHtml(draft);
    startTransition(async () => {
      const res = await updateLessonNote(note.id, html);
      if (!res.ok) return setErr(res.error);
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this note? This can't be undone.")) return;
    setErr(null);
    setMenuOpen(false);
    startTransition(async () => {
      const res = await deleteLessonNote(note.id);
      if (!res.ok) return setErr(res.error);
      router.refresh();
    });
  }

  function togglePin() {
    startTransition(async () => {
      const res = await toggleNotePin(note.id, !note.pinned);
      if (!res.ok) return setErr(res.error);
      router.refresh();
    });
  }

  return (
    <li className="break-inside-avoid">
      <div
        className={cn(
          "group h-full rounded-[16px] border border-ink-100 border-t-[3px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:shadow-soft hover:border-ink-200 motion-reduce:transition-none",
          accent.top,
        )}
      >
        <div className="p-4 sm:p-5">
          {/* Header — type tile + action rail */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span
              className={cn(
                "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
                accent.tile,
              )}
              aria-hidden
            >
              <TypeIcon className="size-4" strokeWidth={2} />
            </span>

            {!editing && (
              <div className="flex items-center gap-0.5 -mr-1 -mt-0.5">
                <button
                  type="button"
                  onClick={togglePin}
                  disabled={pending}
                  aria-pressed={note.pinned}
                  aria-label={note.pinned ? "Unpin note" : "Pin note"}
                  title={note.pinned ? "Unpin" : "Pin to top"}
                  className={cn(
                    "size-8 rounded-full inline-flex items-center justify-center transition-colors disabled:opacity-50",
                    note.pinned
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-ink-400 hover:text-ink-700 hover:bg-cream-100",
                  )}
                >
                  <Pin
                    className="size-4"
                    strokeWidth={2}
                    fill={note.pinned ? "currentColor" : "none"}
                  />
                </button>
                {openHref && (
                  <Link
                    href={openHref}
                    aria-label="Open lesson"
                    title="Open lesson"
                    className="size-8 rounded-full inline-flex items-center justify-center text-ink-400 hover:text-rose-600 hover:bg-cream-100 transition-colors"
                  >
                    <ExternalLink className="size-4" strokeWidth={2} />
                  </Link>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="More actions"
                    aria-expanded={menuOpen}
                    className="size-8 rounded-full inline-flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-cream-100 transition-colors"
                  >
                    <MoreHorizontal className="size-4" strokeWidth={2} />
                  </button>
                  {menuOpen && (
                    <>
                      <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-[150px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(true);
                            setMenuOpen(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-ink-700 hover:bg-cream-100 transition-colors"
                        >
                          <Pencil className="size-3.5 text-ink-400" strokeWidth={2} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={remove}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="size-3.5" strokeWidth={2} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {editing ? (
            <div>
              <RichNoteEditor
                initialHtml={note.body}
                onChange={setDraft}
                onSubmit={save}
                autoFocus
                disabled={pending}
                minHeight={120}
                placeholder="Edit your note…"
              />
              <div className="mt-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[11.5px] tabular-nums",
                    tooLong ? "text-rose-600 font-semibold" : "text-ink-400",
                  )}
                >
                  {noteTextLength(draft).toLocaleString()}/
                  {MAX_LEN.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(note.body);
                      setEditing(false);
                      setErr(null);
                    }}
                    disabled={pending}
                    className="inline-flex items-center gap-1 h-8 px-3 rounded-[8px] border border-ink-200 text-[12px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
                  >
                    <X className="size-3.5" strokeWidth={2} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={pending || isEmpty || tooLong}
                    className="inline-flex items-center gap-1 h-8 px-3.5 rounded-[8px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[12px] font-semibold"
                  >
                    {pending ? (
                      <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                    ) : (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Full note — first block reads as a title, rest as body. */}
              <NoteContent
                html={note.body}
                className={cn(
                  "text-[13px] text-ink-700 leading-relaxed",
                  "[&>*:first-child]:text-[14.5px] [&>*:first-child]:font-bold [&>*:first-child]:text-ink-900 [&>*:first-child]:leading-snug [&>*:first-child]:mb-1.5",
                  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5 [&_p]:mb-2 [&_strong]:font-semibold [&_a]:text-rose-600",
                )}
              />

              {/* Breadcrumb — Module › Video */}
              {showContext && (note.module_title || note.lesson_title) && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {note.module_title && (
                    <Chip
                      accent={accent}
                      icon={LayoutGrid}
                      label={`Module: ${note.module_title}`}
                    />
                  )}
                  {note.module_title && note.lesson_title && (
                    <ChevronRight
                      className="size-3 text-ink-300 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  )}
                  {note.lesson_title &&
                    (openHref ? (
                      <Link
                        href={openHref}
                        className={cn(
                          "inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] border text-[11.5px] font-medium max-w-full transition-colors hover:brightness-95",
                          accent.chip,
                          accent.chipText,
                        )}
                      >
                        <Play
                          className={cn("size-3 shrink-0", accent.chipIcon)}
                          fill="currentColor"
                        />
                        <span className="truncate">Video: {note.lesson_title}</span>
                      </Link>
                    ) : (
                      <Chip
                        accent={accent}
                        icon={Play}
                        label={`Video: ${note.lesson_title}`}
                      />
                    ))}
                </div>
              )}

              {/* Footer meta */}
              <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2 text-[11.5px] text-ink-500 flex-wrap">
                <TypeIcon
                  className="size-3.5 text-ink-400 shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="font-medium text-ink-600">{typeLabel}</span>
                <Dot />
                <span className="whitespace-nowrap">
                  Saved {relativeTime(note.created_at)}
                </span>
                {(note.pinned || recent) && (
                  <>
                    <Dot />
                    <span
                      className={cn(
                        "inline-flex items-center h-5 px-2 rounded-full border text-[10.5px] font-semibold",
                        accent.badge,
                      )}
                    >
                      {note.pinned ? "Pinned" : "Recent"}
                    </span>
                  </>
                )}
              </div>

              {err && <div className="mt-2 text-[12px] text-rose-700">{err}</div>}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────────── */

function Chip({
  accent,
  icon: Icon,
  label,
}: {
  accent: Accent;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] border text-[11.5px] font-medium max-w-full",
        accent.chip,
        accent.chipText,
      )}
    >
      <Icon className={cn("size-3 shrink-0", accent.chipIcon)} strokeWidth={2} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function Dot() {
  return (
    <span aria-hidden className="text-ink-300">
      ·
    </span>
  );
}
