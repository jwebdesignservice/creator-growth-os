"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Route,
  ListChecks,
  Clock,
  CalendarDays,
  GripVertical,
  Hand,
  Lightbulb,
  Monitor,
  Pencil,
  Target,
  Flag,
  Copy,
  MoreHorizontal,
  Plus,
  Eye,
  Check,
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Trash2,
  Square,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Chapter model + icon registry. Local-only for now — when a
   `lesson_chapters` table lands, swap the initial seed and the
   `setChapters` callsites for a server action.
   ───────────────────────────────────────────────────────────────────────── */

type ChapterType = "intro" | "lesson" | "activity" | "closing" | "checkpoint";
type IconKey = "hand" | "lightbulb" | "monitor" | "pencil" | "target" | "flag" | "square";

type Chapter = {
  id: string;
  title: string;
  type: ChapterType;
  durationMinutes: number;
  iconKey: IconKey;
};

const ICON_BY_KEY: Record<IconKey, LucideIcon> = {
  hand: Hand,
  lightbulb: Lightbulb,
  monitor: Monitor,
  pencil: Pencil,
  target: Target,
  flag: Flag,
  square: Square,
};

const TYPE_LABEL: Record<ChapterType, string> = {
  intro: "Intro",
  lesson: "Lesson",
  activity: "Activity",
  closing: "Closing",
  checkpoint: "Checkpoint",
};

const DEFAULT_ICON_FOR_TYPE: Record<ChapterType, IconKey> = {
  intro: "hand",
  lesson: "lightbulb",
  activity: "pencil",
  closing: "target",
  checkpoint: "flag",
};

/* Seed matches the reference image exactly. */
const INITIAL_CHAPTERS: Chapter[] = [
  { id: "c1", title: "Welcome",          type: "intro",    durationMinutes: 1, iconKey: "hand" },
  { id: "c2", title: "Core Concept",     type: "lesson",   durationMinutes: 2, iconKey: "lightbulb" },
  { id: "c3", title: "Walkthrough",      type: "lesson",   durationMinutes: 5, iconKey: "monitor" },
  { id: "c4", title: "Exercise",         type: "activity", durationMinutes: 3, iconKey: "pencil" },
  { id: "c5", title: "CTA / Next step",  type: "closing",  durationMinutes: 1, iconKey: "target" },
];

export function LessonPathTab({
  lastUpdatedAt,
  // Accepted for forward-compat with the server-side chapters loader
  // (lesson-chapters-actions). Not yet wired into save/load — the
  // component falls back to its INITIAL_CHAPTERS seed when nothing is
  // passed in, and when chapters ARE passed in we use them as the
  // initial state so a refresh shows what was last persisted.
  initialChapters,
}: {
  lastUpdatedAt: string;
  lessonId?: string;
  initialChapters?: Chapter[];
}) {
  const [chapters, setChapters] = useState<Chapter[]>(
    initialChapters && initialChapters.length > 0 ? initialChapters : INITIAL_CHAPTERS,
  );
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const totalMinutes = useMemo(
    () => chapters.reduce((sum, c) => sum + c.durationMinutes, 0),
    [chapters],
  );

  const lastUpdatedLabel = useMemo(() => {
    try {
      return new Date(lastUpdatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }, [lastUpdatedAt]);

  const insertAt = useCallback((index: number, type: ChapterType = "lesson") => {
    setChapters((prev) => {
      const next = prev.slice();
      next.splice(index, 0, makeChapter(type));
      return next;
    });
  }, []);

  const append = useCallback((type: ChapterType = "lesson") => {
    setChapters((prev) => [...prev, makeChapter(type)]);
  }, []);

  const duplicate = useCallback((id: string) => {
    setChapters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const next = prev.slice();
      next.splice(idx + 1, 0, {
        ...prev[idx],
        id: makeId(),
        title: prev[idx].title + " (copy)",
      });
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const move = useCallback((id: string, dir: -1 | 1) => {
    setChapters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const rename = useCallback((id: string, title: string) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const onDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const onDragEnter = useCallback((index: number) => {
    setDraggingIndex((current) => {
      if (current === null || current === index) return current;
      setChapters((prev) => {
        const next = prev.slice();
        const [moved] = next.splice(current, 1);
        next.splice(index, 0, moved);
        return next;
      });
      return index;
    });
  }, []);

  const onDragEnd = useCallback(() => setDraggingIndex(null), []);

  return (
    <>
      <section className="card p-5 sm:p-7 lg:p-8 space-y-6">
        <header className="flex items-start gap-4">
          <span className="size-12 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Route className="size-[22px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[24px] sm:text-[28px] text-ink-900 leading-tight mb-1">
              Lesson path
            </h2>
            <p className="text-[13.5px] text-ink-500 leading-relaxed">
              Organize your tutorial into a clear, logical flow. A
              well-structured path improves learner experience and completion.
            </p>
          </div>
        </header>

        <div className="rounded-[14px] bg-cream-50/80 border border-cream-200 px-2 py-4 sm:px-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-cream-200">
            <StatCell icon={ListChecks} value={String(chapters.length)} label="Chapters" />
            <StatCell icon={Route} value="Linear" label="Completion flow" />
            <StatCell icon={Clock} value={"~" + totalMinutes + " min"} label="Est. duration" />
            <StatCell icon={CalendarDays} value={lastUpdatedLabel} label="Last updated" />
          </div>
        </div>

        <ol className="space-y-2">
          {chapters.map((chapter, index) => (
            <li key={chapter.id} className="relative">
              <ChapterRow
                chapter={chapter}
                index={index}
                total={chapters.length}
                isFirst={index === 0}
                isLast={index === chapters.length - 1}
                isEditing={editingId === chapter.id}
                isDragging={draggingIndex === index}
                onStartEdit={() => setEditingId(chapter.id)}
                onStopEdit={() => setEditingId(null)}
                onRename={(t) => rename(chapter.id, t)}
                onDuplicate={() => duplicate(chapter.id)}
                onRemove={() => remove(chapter.id)}
                onMove={(dir) => move(chapter.id, dir)}
                onDragStart={() => onDragStart(index)}
                onDragEnter={() => onDragEnter(index)}
                onDragEnd={onDragEnd}
              />
              {index < chapters.length - 1 && (
                <button
                  type="button"
                  onClick={() => insertAt(index + 1)}
                  aria-label={"Insert chapter after " + chapter.title}
                  className="absolute right-3 -bottom-2 z-10 size-7 rounded-full inline-flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-colors"
                >
                  <Plus className="size-3.5" strokeWidth={2.5} />
                </button>
              )}
            </li>
          ))}
          {chapters.length === 0 && (
            <li className="rounded-[12px] border border-dashed border-ink-200 px-5 py-10 text-center text-[13px] text-ink-500">
              No chapters yet — add the first one below.
            </li>
          )}
        </ol>

        {!calloutDismissed && (
          <div className="rounded-[14px] bg-rose-50/70 border border-rose-100 px-4 py-3.5 flex items-start gap-3">
            <span className="size-9 rounded-[10px] bg-rose-100/80 text-rose-500 inline-flex items-center justify-center shrink-0">
              <Sparkles className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-ink-900">
                Great structure drives better results
              </div>
              <p className="text-[12.5px] text-ink-500 leading-snug mt-0.5">
                Tutorials with a clear path see up to 42% higher completion
                rates and get discovered more often.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCalloutDismissed(true)}
              aria-label="Dismiss tip"
              className="size-7 rounded-full inline-flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-rose-100/60 shrink-0"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => append("lesson")}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors shadow-sm"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add chapter
          </button>
          <button
            type="button"
            onClick={() => append("checkpoint")}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13.5px] font-semibold hover:bg-cream-100 transition-colors"
          >
            <Flag className="size-4" strokeWidth={2} />
            Add checkpoint
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13.5px] font-semibold hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview learner flow
          </button>
        </div>
      </section>

      {previewOpen && (
        <PreviewModal
          chapters={chapters}
          totalMinutes={totalMinutes}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

function ChapterRow({
  chapter, index, total, isFirst, isLast, isEditing, isDragging,
  onStartEdit, onStopEdit, onRename, onDuplicate, onRemove, onMove,
  onDragStart, onDragEnter, onDragEnd,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  isDragging: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onRename: (t: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const Icon = ICON_BY_KEY[chapter.iconKey];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      className={cn(
        "relative grid grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-[12px] border bg-white transition-all",
        isDragging
          ? "border-rose-300 shadow-sm opacity-80"
          : "border-ink-100 hover:border-rose-200",
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="size-6 inline-flex items-center justify-center text-ink-300 hover:text-ink-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4" strokeWidth={2} />
      </button>

      <span className="size-8 rounded-full bg-rose-500 text-white inline-flex items-center justify-center text-[12.5px] font-bold tabular-nums shrink-0">
        {index + 1}
      </span>

      <span className="size-10 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>

      <div className="min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            defaultValue={chapter.title}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v) onRename(v);
              onStopEdit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") onStopEdit();
            }}
            className="w-full text-[14px] font-bold text-ink-900 leading-tight bg-transparent border-b-2 border-rose-400 outline-none pb-0.5 mb-1"
          />
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className="block text-left text-[14px] font-bold text-ink-900 leading-tight hover:text-rose-700 transition-colors truncate w-full"
          >
            {chapter.title}
          </button>
        )}
        <div className="flex items-center gap-2 text-[11.5px] text-ink-500 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-rose-400" aria-hidden />
            {TYPE_LABEL[chapter.type]}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="size-3" strokeWidth={2} aria-hidden />
            ~{chapter.durationMinutes} min
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <RowIconButton
          icon={Pencil}
          label={isEditing ? "Save title" : "Edit title"}
          onClick={isEditing ? onStopEdit : onStartEdit}
        />
        <RowIconButton icon={Copy} label="Duplicate chapter" onClick={onDuplicate} />
        <div ref={menuRef} className="relative">
          <RowIconButton
            icon={MoreHorizontal}
            label="More actions"
            onClick={() => setMenuOpen((v) => !v)}
            active={menuOpen}
          />
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              <MenuItem icon={ChevronUp}   label="Move up"   onClick={() => { setMenuOpen(false); onMove(-1); }} disabled={isFirst} />
              <MenuItem icon={ChevronDown} label="Move down" onClick={() => { setMenuOpen(false); onMove(1);  }} disabled={isLast} />
              <MenuItem icon={Pencil}      label="Rename"    onClick={() => { setMenuOpen(false); onStartEdit(); }} />
              <MenuItem icon={Copy}        label="Duplicate" onClick={() => { setMenuOpen(false); onDuplicate(); }} />
              <div aria-hidden className="h-px my-1 bg-ink-100" />
              <MenuItem icon={Trash2}      label="Delete"    onClick={() => { setMenuOpen(false); onRemove(); }} danger disabled={total === 1} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCell({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 min-w-0">
      <span className="size-10 rounded-[10px] bg-white text-rose-600 inline-flex items-center justify-center shrink-0 border border-cream-200">
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <div className="text-[16px] font-bold text-ink-900 leading-tight tabular-nums truncate">{value}</div>
        <div className="text-[11.5px] text-ink-500 leading-tight mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function RowIconButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
      aria-label={label}
      className={cn(
        "size-8 rounded-[8px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors",
        active && "bg-cream-100 text-ink-900",
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] transition-colors",
        disabled
          ? "text-ink-300 cursor-not-allowed"
          : danger
            ? "text-rose-600 hover:bg-rose-50"
            : "text-ink-700 hover:bg-cream-100",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {label}
    </button>
  );
}

function PreviewModal({
  chapters,
  totalMinutes,
  onClose,
}: {
  chapters: Chapter[];
  totalMinutes: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Learner flow preview"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-ink-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="w-full max-w-[560px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden my-6" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-rose-600" strokeWidth={2} />
            <h2 className="text-[15px] font-bold text-ink-900">Learner flow preview</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900">
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-[13px] text-ink-500 leading-relaxed">
            This is how a learner moves through the tutorial — top to bottom.
            Estimated total: ~{totalMinutes} min.
          </p>
          <ol className="space-y-2">
            {chapters.map((c, i) => {
              const Icon = ICON_BY_KEY[c.iconKey];
              return (
                <li key={c.id} className="flex items-center gap-3 rounded-[10px] border border-ink-100 px-3.5 py-2.5">
                  <span className="size-7 rounded-full bg-rose-500 text-white inline-flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0">
                    {i + 1}
                  </span>
                  <span className="size-8 rounded-[8px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                    <Icon className="size-[15px]" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink-900 truncate">{c.title}</div>
                    <div className="text-[11.5px] text-ink-500 leading-tight">
                      {TYPE_LABEL[c.type]} · ~{c.durationMinutes} min
                    </div>
                  </div>
                  {i === chapters.length - 1 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                      <Check className="size-3.5" strokeWidth={2.5} />
                      End
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "c-" + Math.random().toString(36).slice(2, 9);
}

function makeChapter(type: ChapterType): Chapter {
  return {
    id: makeId(),
    title: type === "checkpoint" ? "New checkpoint" : "New chapter",
    type,
    durationMinutes: type === "checkpoint" ? 0 : 2,
    iconKey: DEFAULT_ICON_FOR_TYPE[type],
  };
}
