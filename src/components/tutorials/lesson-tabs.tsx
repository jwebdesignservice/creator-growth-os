"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  CalendarDays,
  FileText,
  FileSpreadsheet,
  Files,
  ChevronRight,
  Lightbulb,
  Pencil,
  Hand,
  Monitor,
  Target,
  Flag,
  Square,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  NotebookPen,
  Loader2,
  Check,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { cn } from "@/lib/cn";
import {
  createLessonNote,
  updateLessonNote,
  deleteLessonNote,
} from "@/app/(app)/programs/[slug]/actions";
import type { ProgramNote } from "@/lib/programs/queries";

const NOTE_MAX = 5000;

/**
 * Tabbed detail panel for the lesson player (Loom-inspired).
 *
 * Replaces the old 6-card grid below the video with a single organized
 * panel: a horizontal tab bar (underline indicator) over four sections —
 * Overview, Lesson Path, Resources, and Notes. Keeps the page calmer and
 * gives the user one clear place to look for each thing.
 */

type Chapter = {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  iconKey: string;
};

/** A real uploaded file / external link attached to this lesson. */
export type LessonResourceItem = {
  id: string;
  kind: "file" | "link";
  title: string;
  url: string;
  ext: string;
  sizeBytes: number | null;
};

type Props = {
  description: string | null;
  chapters: Chapter[];
  resources: LessonResourceItem[];
  notes: ProgramNote[];
  lessonSlug: string;
};

type TabKey = "overview" | "path" | "resources" | "notes";

const TABS: { key: TabKey; label: string; icon: LucideIcon; beta?: boolean }[] = [
  { key: "overview",  label: "Overview",     icon: BookOpen     },
  { key: "path",      label: "Lesson Path",  icon: CalendarDays, beta: true },
  { key: "resources", label: "Resources",    icon: Files        },
  { key: "notes",     label: "Notes",        icon: Pencil       },
];

const TAKEAWAYS = [
  "Why hooks are critical for reach and retention",
  "4 high-performing hook angles that work every time",
  "The hook formula and how to use it",
  "Real hook examples that drive views",
  "How to test and refine your hooks",
];

export function LessonTabs({
  description,
  chapters,
  resources,
  notes,
  lessonSlug,
}: Props) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <section className="card overflow-hidden">
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex items-center gap-1 px-2 sm:px-4 border-b border-ink-100 overflow-x-auto"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                active ? "text-rose-700" : "text-ink-500 hover:text-ink-900",
              )}
            >
              <t.icon className="size-4" strokeWidth={1.9} aria-hidden />
              {t.label}
              {t.beta && (
                <span className="ml-0.5 inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 leading-none">
                  Beta
                </span>
              )}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-rose-600"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="p-5 sm:p-6">
        {tab === "overview" && <OverviewPanel description={description} />}
        {tab === "path" && <PathPanel chapters={chapters} />}
        {tab === "resources" && <ResourcesPanel resources={resources} />}
        {tab === "notes" && (
          <NotesPanel notes={notes} lessonSlug={lessonSlug} />
        )}
      </div>
    </section>
  );
}

/* ─── Overview (lesson summary + takeaways + coach insight) ─────────────── */

function OverviewPanel({ description }: { description: string | null }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13.5px] text-ink-600 leading-relaxed mb-4 max-w-2xl">
          {description ??
            "A focused lesson packed with what actually moves the needle for creators at your stage — clear, practical, and built to apply this week."}
        </p>
        <div className="text-[13px] font-semibold text-ink-900 mb-2.5">
          Key takeaways
        </div>
        <ul className="space-y-2">
          {TAKEAWAYS.map((t) => (
            <li
              key={t}
              className="flex items-start gap-2 text-[13px] text-ink-700"
            >
              <span className="size-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="size-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[14px] bg-cream-100 border border-cream-300 p-5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-600 mb-2">
          <Lightbulb className="size-3.5" strokeWidth={2} aria-hidden />
          Key insight
        </div>
        <blockquote className="border-l-2 border-rose-300 pl-4 italic text-[14px] text-ink-700 leading-relaxed mb-4">
          &ldquo;The best hooks create curiosity, promise value, or challenge
          the viewer&apos;s current belief. Make them want to stay.&rdquo;
        </blockquote>
        <div className="flex items-center gap-2.5">
          <Avatar name="Sophie Carter" size={36} />
          <div>
            <div className="text-[12.5px] font-semibold text-ink-900 leading-tight">
              Your Coach, Sophie
            </div>
            <div className="text-[11px] text-ink-500">
              Growth &amp; Content Strategist
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Lesson path (admin-authored chapters) ────────────────────────────── */

const CHAPTER_ICONS: Record<string, LucideIcon> = {
  hand:      Hand,
  lightbulb: Lightbulb,
  monitor:   Monitor,
  pencil:    Pencil,
  target:    Target,
  flag:      Flag,
  square:    Square,
};

const CHAPTER_TYPE_LABEL: Record<string, string> = {
  intro:      "Intro",
  lesson:     "Lesson",
  activity:   "Activity",
  closing:    "Closing",
  checkpoint: "Checkpoint",
};

function PathPanel({ chapters }: { chapters: Chapter[] }) {
  if (chapters.length === 0) {
    return (
      <div className="max-w-2xl text-center py-8 px-4 rounded-[12px] bg-cream-50 border border-dashed border-ink-200">
        <CalendarDays
          className="size-6 text-ink-400 mx-auto mb-2"
          strokeWidth={1.8}
          aria-hidden
        />
        <div className="text-[13px] font-semibold text-ink-900">
          No lesson path yet
        </div>
        <p className="text-[12px] text-ink-500 mt-0.5">
          This tutorial hasn&apos;t been broken into chapters yet.
        </p>
      </div>
    );
  }

  const totalDuration = chapters.reduce(
    (sum, c) => sum + (c.durationMinutes || 0),
    0,
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="text-[14px] font-semibold text-ink-900">
          Lesson path
        </div>
        <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
          {chapters.length} chapter{chapters.length === 1 ? "" : "s"} · ~
          {totalDuration} min
        </span>
      </div>
      <ul className="space-y-1.5">
        {chapters.map((c, i) => {
          const Icon = CHAPTER_ICONS[c.iconKey] ?? Square;
          return (
            <li
              key={c.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-ink-100 bg-white"
            >
              <span className="size-6 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0">
                {i + 1}
              </span>
              <span className="size-8 rounded-[9px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Icon className="size-4" strokeWidth={1.9} aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-900 truncate">
                  {c.title}
                </div>
                <div className="text-[11px] text-ink-500">
                  {CHAPTER_TYPE_LABEL[c.type] ?? c.type}
                </div>
              </div>
              <span className="text-[11px] text-ink-500 tabular-nums shrink-0">
                ~{c.durationMinutes} min
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Resources & templates ────────────────────────────────────────────── */

const RESOURCE_EXT_META: Record<string, { label: string; icon: LucideIcon }> = {
  pdf:  { label: "PDF",         icon: FileText        },
  docx: { label: "Document",    icon: FileText        },
  xlsx: { label: "Spreadsheet", icon: FileSpreadsheet },
  png:  { label: "Image",       icon: ImageIcon       },
  jpg:  { label: "Image",       icon: ImageIcon       },
  zip:  { label: "Archive",     icon: Files           },
  link: { label: "Link",        icon: Link2           },
  file: { label: "File",        icon: FileText        },
};

function formatBytes(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${i === 0 || v >= 10 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

function ResourcesPanel({ resources }: { resources: LessonResourceItem[] }) {
  if (resources.length === 0) {
    return (
      <div className="max-w-2xl text-center py-8 px-4 rounded-[12px] bg-cream-50 border border-dashed border-ink-200">
        <Files
          className="size-6 text-ink-400 mx-auto mb-2"
          strokeWidth={1.8}
          aria-hidden
        />
        <div className="text-[13px] font-semibold text-ink-900">
          No resources yet
        </div>
        <p className="text-[12px] text-ink-500 mt-0.5">
          The current tutorial does not have any resources.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-ink-900">
          Resources &amp; templates
        </h3>
        <span className="text-[11.5px] text-ink-500 tabular-nums">
          {resources.length} {resources.length === 1 ? "item" : "items"}
        </span>
      </div>
      <ul className="space-y-1">
        {resources.map((r) => {
          const meta =
            RESOURCE_EXT_META[r.ext] ??
            RESOURCE_EXT_META[r.kind === "link" ? "link" : "file"];
          const Icon = meta.icon;
          const size = r.kind === "file" ? formatBytes(r.sizeBytes) : null;
          return (
            <li key={r.id}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-2 -mx-1 rounded-[10px] hover:bg-cream-100 transition-colors cursor-pointer text-left"
              >
                <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                  <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink-900 truncate">
                    {r.title}
                  </div>
                </div>
                <span className="text-[11.5px] text-ink-500 hidden sm:inline">
                  {meta.label}
                  {size ? ` · ${size}` : ""}
                </span>
                {r.kind === "link" ? (
                  <ExternalLink
                    className="size-3.5 text-ink-400 shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                ) : (
                  <ChevronRight
                    className="size-3.5 text-ink-400 shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Notes (write + saved list, persisted to lesson_notes) ─────────────── */

function NotesPanel({
  notes,
  lessonSlug,
}: {
  notes: ProgramNote[];
  lessonSlug: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = body.trim();
  const tooLong = body.length > NOTE_MAX;

  function save() {
    setErr(null);
    if (!trimmed) {
      setErr("Write something before saving.");
      return;
    }
    if (tooLong) {
      setErr(`Notes are limited to ${NOTE_MAX.toLocaleString()} characters.`);
      return;
    }
    startTransition(async () => {
      const res = await createLessonNote(lessonSlug, trimmed);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Composer */}
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
          }}
          rows={5}
          placeholder="Write your key takeaways, ideas, and insights from this lesson…"
          className="w-full min-h-[150px] rounded-[10px] border border-ink-200 bg-white px-3.5 py-3 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-y leading-relaxed"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-ink-400">
            Tip: press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-cream-100 border border-ink-200 text-[10.5px] font-medium text-ink-600">
              ⌘/Ctrl + Enter
            </kbd>{" "}
            to save
          </span>
          <span
            className={cn(
              "text-[11.5px] tabular-nums shrink-0",
              tooLong ? "text-rose-600 font-semibold" : "text-ink-400",
            )}
          >
            {body.length.toLocaleString()}/{NOTE_MAX.toLocaleString()}
          </span>
        </div>
        {err && (
          <div className="mt-2 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {err}
          </div>
        )}
        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={pending || !trimmed || tooLong}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <NotebookPen className="size-3.5" strokeWidth={2} />
            )}
            Save note
          </button>
        </div>
      </div>

      {/* Saved notes */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13px] font-semibold text-ink-900">Saved notes</h3>
          {notes.length > 0 && (
            <span className="inline-flex items-center h-6 px-2 rounded-full bg-cream-100 text-ink-600 text-[11px] font-semibold tabular-nums">
              {notes.length} note{notes.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {notes.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-[12px] bg-cream-50 border border-dashed border-ink-200">
            <NotebookPen
              className="size-6 text-ink-400 mx-auto mb-2"
              strokeWidth={1.8}
              aria-hidden
            />
            <div className="text-[13px] font-semibold text-ink-900">
              No notes yet
            </div>
            <p className="text-[12px] text-ink-500 mt-0.5">
              Anything you save for this lesson will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <NoteItem key={n.id} note={n} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NoteItem({ note }: { note: ProgramNote }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = draft.trim();
  const tooLong = draft.length > NOTE_MAX;

  function save() {
    setErr(null);
    if (!trimmed) {
      setErr("Note can't be empty.");
      return;
    }
    if (tooLong) {
      setErr(`Notes are limited to ${NOTE_MAX.toLocaleString()} characters.`);
      return;
    }
    startTransition(async () => {
      const res = await updateLessonNote(note.id, trimmed);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this note? This can't be undone.")) return;
    setErr(null);
    startTransition(async () => {
      const res = await deleteLessonNote(note.id);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="rounded-[12px] border border-ink-100 bg-white p-3.5">
      {editing ? (
        <div>
          <textarea
            autoFocus
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(note.body);
                setEditing(false);
              }
            }}
            className="w-full min-h-[100px] rounded-[10px] border border-ink-200 bg-white px-3 py-2.5 text-[13px] text-ink-900 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-y leading-relaxed"
          />
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-[11.5px] tabular-nums",
                tooLong ? "text-rose-600 font-semibold" : "text-ink-400",
              )}
            >
              {draft.length.toLocaleString()}/{NOTE_MAX.toLocaleString()}
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
                disabled={pending || !trimmed || tooLong}
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
          {err && <div className="mt-2 text-[12px] text-rose-700">{err}</div>}
        </div>
      ) : (
        <div className="group flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] text-ink-800 leading-relaxed whitespace-pre-wrap break-words">
              {note.body}
            </p>
            <div className="mt-1.5 text-[11.5px] text-ink-500">
              {relativeTime(note.created_at)}
              {note.updated_at !== note.created_at && " · edited"}
            </div>
            {err && <div className="mt-2 text-[12px] text-rose-700">{err}</div>}
          </div>
          <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={pending}
              aria-label="Edit note"
              className="size-8 rounded-[9px] border border-ink-200 bg-white text-ink-500 hover:text-rose-600 hover:bg-cream-100 inline-flex items-center justify-center disabled:opacity-50"
            >
              <Pencil className="size-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              aria-label="Delete note"
              className="size-8 rounded-[9px] border border-ink-200 bg-white text-ink-500 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Trash2 className="size-3.5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
