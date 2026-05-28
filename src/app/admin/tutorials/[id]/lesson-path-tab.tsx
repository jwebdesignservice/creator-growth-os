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
  Loader2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  saveLessonChapters,
  type LessonChapter,
  type ChapterType,
  type IconKey,
} from "./lesson-chapters-actions";

/* ─────────────────────────────────────────────────────────────────────────
   Lesson path editor.

   State of the world lives in `chapters`. Every mutation is local-first;
   a debounced effect ships the whole array to `saveLessonChapters`
   ~800ms after the user stops typing/dragging. The header shows live
   "Saving…/Saved/Retry" status so the admin always knows where they
   stand. New chapters get client-side ids that the server replaces
   with real UUIDs on the next reload.
   ───────────────────────────────────────────────────────────────────────── */

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

const TYPE_OPTIONS: ChapterType[] = [
  "intro", "lesson", "activity", "closing", "checkpoint",
];

/* Sample seed offered on the empty state — matches the original demo. */
const SAMPLE_CHAPTERS: LessonChapter[] = [
  { id: "c1", title: "Welcome",          type: "intro",    durationMinutes: 1, iconKey: "hand" },
  { id: "c2", title: "Core Concept",     type: "lesson",   durationMinutes: 2, iconKey: "lightbulb" },
  { id: "c3", title: "Walkthrough",      type: "lesson",   durationMinutes: 5, iconKey: "monitor" },
  { id: "c4", title: "Exercise",         type: "activity", durationMinutes: 3, iconKey: "pencil" },
  { id: "c5", title: "CTA / Next step",  type: "closing",  durationMinutes: 1, iconKey: "target" },
];

export type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

export function LessonPathTab({
  lessonId,
  initialChapters,
  lastUpdatedAt,
  onSaveStateChange,
  saveSignal,
}: {
  lessonId: string;
  initialChapters: LessonChapter[];
  lastUpdatedAt: string;
  /** Bubbles the autosave status up so the page header's Save button can
   *  reflect it (this tab autosaves; the header would otherwise sit on a
   *  permanently-disabled "Saved"). */
  onSaveStateChange?: (s: SaveState) => void;
  /** Parent increments this to request an immediate save (header "Save"
   *  click) — flushes the debounce and writes now. */
  saveSignal?: number;
}) {
  const [chapters, setChapters] = useState<LessonChapter[]>(initialChapters);
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });

  /* Autosave plumbing -------------------------------------------------- */
  // Skip the very first run so hydrating from the server doesn't trigger
  // a redundant write back. Subsequent mutations debounce by 800ms.
  const skipNextSaveRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflightTokenRef = useRef(0);

  const runSave = useCallback(
    async (snapshot: LessonChapter[]) => {
      const token = ++inflightTokenRef.current;
      setSaveState({ kind: "saving" });
      onSaveStateChange?.({ kind: "saving" });
      const res = await saveLessonChapters(lessonId, snapshot);
      // Bail if a newer save started while this one was in flight.
      if (token !== inflightTokenRef.current) return;
      const next: SaveState = res.ok
        ? { kind: "saved", at: Date.now() }
        : { kind: "error", message: res.error };
      setSaveState(next);
      onSaveStateChange?.(next);
    },
    [lessonId, onSaveStateChange],
  );

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void runSave(chapters);
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [chapters, runSave]);

  // Keep a live ref of chapters so a parent-triggered save always writes the
  // latest set without re-subscribing the signal effect on every edit.
  const chaptersRef = useRef(chapters);
  useEffect(() => {
    chaptersRef.current = chapters;
  }, [chapters]);

  // Parent (header Save button) requests an immediate save via `saveSignal`.
  // Skip the initial mount value so we don't write on first render.
  const firstSignalRef = useRef(true);
  useEffect(() => {
    if (firstSignalRef.current) {
      firstSignalRef.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    void runSave(chaptersRef.current);
  }, [saveSignal, runSave]);

  /* Derived values ----------------------------------------------------- */
  const totalMinutes = useMemo(
    () => chapters.reduce((sum, c) => sum + c.durationMinutes, 0),
    [chapters],
  );

  const lastUpdatedLabel = useMemo(() => {
    const ref =
      saveState.kind === "saved" ? new Date(saveState.at).toISOString() : lastUpdatedAt;
    try {
      return new Date(ref).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }, [lastUpdatedAt, saveState]);

  /* Mutations ---------------------------------------------------------- */
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

  const setType = useCallback((id: string, type: ChapterType) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, type, iconKey: DEFAULT_ICON_FOR_TYPE[type] } : c,
      ),
    );
  }, []);

  const setDuration = useCallback((id: string, minutes: number) => {
    const safe = Math.max(0, Math.min(999, Math.round(minutes || 0)));
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, durationMinutes: safe } : c)));
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

  const useSample = useCallback(() => {
    setChapters(SAMPLE_CHAPTERS.map((c) => ({ ...c, id: makeId() })));
  }, []);

  const retrySave = useCallback(() => {
    void runSave(chapters);
  }, [chapters, runSave]);

  /* Render ------------------------------------------------------------- */
  return (
    <>
      <section className="card p-5 sm:p-7 lg:p-8 space-y-6">
        <header className="flex items-start gap-4">
          <span className="size-12 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Route className="size-[22px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h2 className="font-display text-[24px] sm:text-[28px] text-ink-900 leading-tight mb-1">
                  Lesson path
                </h2>
                <p className="text-[13.5px] text-ink-500 leading-relaxed">
                  Organize your tutorial into a clear, logical flow. Changes save automatically.
                </p>
              </div>
              <SaveIndicator state={saveState} onRetry={retrySave} />
            </div>
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

        {chapters.length === 0 ? (
          <EmptyState onAdd={() => append("intro")} onUseSample={useSample} />
        ) : (
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
                  onSetType={(t) => setType(chapter.id, t)}
                  onSetDuration={(m) => setDuration(chapter.id, m)}
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
                    title="Insert chapter here"
                    className="absolute right-3 -bottom-2 z-10 size-7 rounded-full inline-flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-colors"
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}

        {!calloutDismissed && chapters.length > 0 && (
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

        {chapters.length > 0 && (
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
        )}
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

/* ─────────────────────────────────────────────────────────────────────── */

function SaveIndicator({
  state,
  onRetry,
}: {
  state: SaveState;
  onRetry: () => void;
}) {
  if (state.kind === "idle") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 h-7 px-2.5 rounded-full">
        <span className="size-1.5 rounded-full bg-ink-300" aria-hidden />
        All changes saved
      </span>
    );
  }
  if (state.kind === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 h-7 px-2.5 rounded-full bg-cream-100">
        <Loader2 className="size-3.5 animate-spin" strokeWidth={2} aria-hidden />
        Saving…
      </span>
    );
  }
  if (state.kind === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-success h-7 px-2.5 rounded-full bg-success/10">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
        Saved
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRetry}
      title={state.message}
      className="inline-flex items-center gap-1.5 text-[12px] text-rose-700 h-7 px-2.5 rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
    >
      <AlertCircle className="size-3.5" strokeWidth={2} aria-hidden />
      Save failed — retry
    </button>
  );
}

function EmptyState({
  onAdd,
  onUseSample,
}: {
  onAdd: () => void;
  onUseSample: () => void;
}) {
  return (
    <div className="rounded-[14px] border border-dashed border-ink-200 px-6 py-10 text-center bg-cream-50/40">
      <span className="mx-auto size-12 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-3">
        <Route className="size-[22px]" strokeWidth={1.8} />
      </span>
      <h3 className="text-[15px] font-semibold text-ink-900 mb-1">Start building your lesson path</h3>
      <p className="text-[12.5px] text-ink-500 leading-relaxed max-w-[420px] mx-auto mb-5">
        Break your tutorial into clear chapters — intros, lessons,
        activities and closings — so learners always know what&apos;s next.
      </p>
      <div className="inline-flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Add first chapter
        </button>
        <button
          type="button"
          onClick={onUseSample}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
        >
          <Sparkles className="size-4" strokeWidth={2} />
          Use sample path
        </button>
      </div>
    </div>
  );
}

function ChapterRow({
  chapter, index, total, isFirst, isLast, isEditing, isDragging,
  onStartEdit, onStopEdit, onRename, onSetType, onSetDuration,
  onDuplicate, onRemove, onMove,
  onDragStart, onDragEnter, onDragEnd,
}: {
  chapter: LessonChapter;
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  isDragging: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onRename: (t: string) => void;
  onSetType: (t: ChapterType) => void;
  onSetDuration: (m: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const Icon = ICON_BY_KEY[chapter.iconKey];
  const [menuOpen, setMenuOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    if (!menuOpen && !typeOpen && !durationOpen) return;
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (menuOpen && !menuRef.current?.contains(t)) setMenuOpen(false);
      if (typeOpen && !typeRef.current?.contains(t)) setTypeOpen(false);
      if (durationOpen && !durationRef.current?.contains(t)) setDurationOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen, typeOpen, durationOpen]);

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
        title="Drag to reorder"
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
          <div ref={typeRef} className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setTypeOpen((v) => !v); }}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 -mx-1.5 rounded-md transition-colors",
                typeOpen ? "bg-cream-100 text-ink-900" : "hover:bg-cream-100 hover:text-ink-700",
              )}
              aria-haspopup="menu"
              aria-expanded={typeOpen}
              title="Change chapter type"
            >
              <span className="size-1.5 rounded-full bg-rose-400" aria-hidden />
              {TYPE_LABEL[chapter.type]}
              <ChevronDown className="size-3 opacity-60" strokeWidth={2} aria-hidden />
            </button>
            {typeOpen && (
              <div role="menu" className="absolute left-0 top-[calc(100%+4px)] z-30 w-40 rounded-[10px] bg-white border border-ink-100 shadow-card py-1">
                {TYPE_OPTIONS.map((t) => {
                  const TIcon = ICON_BY_KEY[DEFAULT_ICON_FOR_TYPE[t]];
                  const active = t === chapter.type;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => { setTypeOpen(false); onSetType(t); }}
                      className={cn(
                        "w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] transition-colors",
                        active ? "text-rose-700 bg-rose-50/60" : "text-ink-700 hover:bg-cream-100",
                      )}
                    >
                      <TIcon className="size-3.5" strokeWidth={2} />
                      {TYPE_LABEL[t]}
                      {active && <Check className="size-3.5 ml-auto" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <span aria-hidden>·</span>
          <div ref={durationRef} className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDurationOpen((v) => !v); }}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 -mx-1.5 rounded-md tabular-nums transition-colors",
                durationOpen ? "bg-cream-100 text-ink-900" : "hover:bg-cream-100 hover:text-ink-700",
              )}
              aria-haspopup="dialog"
              aria-expanded={durationOpen}
              title="Edit estimated duration"
            >
              <Clock className="size-3" strokeWidth={2} aria-hidden />
              ~{chapter.durationMinutes} min
            </button>
            {durationOpen && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-30 w-44 rounded-[10px] bg-white border border-ink-100 shadow-card p-2.5">
                <label className="block text-[11px] font-semibold text-ink-500 mb-1">
                  Minutes
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    defaultValue={chapter.durationMinutes}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onSetDuration(Number((e.target as HTMLInputElement).value));
                        setDurationOpen(false);
                      }
                      if (e.key === "Escape") setDurationOpen(false);
                    }}
                    onBlur={(e) => {
                      onSetDuration(Number(e.target.value));
                    }}
                    className="flex-1 min-w-0 h-8 rounded-[8px] border border-ink-200 px-2 text-[13px] tabular-nums focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={() => setDurationOpen(false)}
                    className="h-8 px-2 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
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
  chapters: LessonChapter[];
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
          {chapters.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-ink-200 px-4 py-8 text-center text-[12.5px] text-ink-500">
              Add a chapter to preview the learner flow.
            </div>
          ) : (
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
          )}
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

function makeChapter(type: ChapterType): LessonChapter {
  return {
    id: makeId(),
    title: type === "checkpoint" ? "New checkpoint" : "New chapter",
    type,
    durationMinutes: type === "checkpoint" ? 0 : 2,
    iconKey: DEFAULT_ICON_FOR_TYPE[type],
  };
}
