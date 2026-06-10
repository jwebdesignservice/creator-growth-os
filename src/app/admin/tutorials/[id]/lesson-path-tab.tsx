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
  Link2,
  Play,
  Search,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  saveLessonChapters,
  searchLinkableVideos,
  getLinkedVideoDetails,
  type LessonChapter,
  type ChapterType,
  type IconKey,
  type LinkableVideo,
} from "./lesson-chapters-actions";

/** Live info about a step's linked video: details, confirmed-deleted, or
 *  still loading (undefined). */
type LinkedVideoState = LinkableVideo | "missing" | undefined;

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
  play: Play,
};

const TYPE_LABEL: Record<ChapterType, string> = {
  intro: "Intro",
  lesson: "Lesson",
  activity: "Activity",
  closing: "Closing",
  checkpoint: "Checkpoint",
  video: "Video",
};

const DEFAULT_ICON_FOR_TYPE: Record<ChapterType, IconKey> = {
  intro: "hand",
  lesson: "lightbulb",
  activity: "pencil",
  closing: "target",
  checkpoint: "flag",
  video: "play",
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
  /** Video picker: append a new linked step, or replace the video on one row. */
  const [picker, setPicker] = useState<
    null | { mode: "append" } | { mode: "replace"; id: string }
  >(null);
  /** id → live details for every video the path links to ("missing" =
   *  confirmed deleted; absent key = still loading). */
  const [videoInfo, setVideoInfo] = useState<Record<string, LinkableVideo | "missing">>({});

  /* Linked-video resolution ---------------------------------------------- */
  // Stable key over the set of linked ids; the effect fetches only ids we
  // haven't resolved yet, so it settles after one round trip per new id.
  const linkedIdsKey = useMemo(() => {
    const ids = new Set<string>();
    for (const c of chapters) if (c.linkedLessonId) ids.add(c.linkedLessonId);
    return Array.from(ids).sort().join(",");
  }, [chapters]);

  useEffect(() => {
    const ids = linkedIdsKey ? linkedIdsKey.split(",") : [];
    const unknown = ids.filter((id) => videoInfo[id] === undefined);
    if (unknown.length === 0) return;
    let cancelled = false;
    void (async () => {
      const res = await getLinkedVideoDetails(unknown);
      if (cancelled || !res.ok) return;
      setVideoInfo((prev) => {
        const next = { ...prev };
        // Anything the lookup didn't return no longer exists.
        for (const id of unknown) if (next[id] === undefined) next[id] = "missing";
        for (const v of res.data ?? []) next[v.id] = v;
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [linkedIdsKey, videoInfo]);
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
        c.id === id
          ? {
              ...c,
              type,
              iconKey: DEFAULT_ICON_FOR_TYPE[type],
              // converting a linked-video step to a normal chapter drops the link
              linkedLessonId: type === "video" ? c.linkedLessonId : null,
            }
          : c,
      ),
    );
  }, []);

  /** Picker selection — appends a new video step, or swaps the video on an
   *  existing row (title + duration follow the newly chosen video). */
  const linkVideo = useCallback(
    (v: LinkableVideo) => {
      const mins =
        v.durationSeconds > 0
          ? Math.max(1, Math.round(v.durationSeconds / 60))
          : 1;
      setChapters((prev) => {
        if (picker && picker.mode === "replace") {
          return prev.map((c) =>
            c.id === picker.id
              ? {
                  ...c,
                  title: v.title,
                  type: "video" as const,
                  iconKey: "play" as const,
                  durationMinutes: mins,
                  linkedLessonId: v.id,
                }
              : c,
          );
        }
        return [
          ...prev,
          {
            id: makeId(),
            title: v.title,
            type: "video" as const,
            durationMinutes: mins,
            iconKey: "play" as const,
            linkedLessonId: v.id,
          },
        ];
      });
      // Seed the details cache so the row shows the chosen video instantly.
      setVideoInfo((prev) => ({ ...prev, [v.id]: v }));
      setPicker(null);
    },
    [picker],
  );

  /* Derived picker context ---------------------------------------------- */
  const replaceTarget =
    picker && picker.mode === "replace"
      ? chapters.find((c) => c.id === picker.id)
      : undefined;
  const currentLinkedId = replaceTarget?.linkedLessonId ?? null;
  // Videos already used by OTHER steps — badged "In path" in the picker so
  // accidental duplicates are visible (still allowed when intentional).
  const linkedElsewhereIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of chapters) {
      if (!c.linkedLessonId) continue;
      if (picker && picker.mode === "replace" && c.id === picker.id) continue;
      ids.add(c.linkedLessonId);
    }
    return ids;
  }, [chapters, picker]);

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
                  linkedVideo={
                    chapter.linkedLessonId
                      ? videoInfo[chapter.linkedLessonId]
                      : undefined
                  }
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
                  onChangeVideo={() =>
                    setPicker({ mode: "replace", id: chapter.id })
                  }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
              onClick={() => setPicker({ mode: "append" })}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13.5px] font-semibold hover:bg-cream-100 transition-colors"
            >
              <Link2 className="size-4" strokeWidth={2} />
              Link next video
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
          videoInfo={videoInfo}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {picker && (
        <VideoPickerModal
          lessonId={lessonId}
          mode={picker.mode}
          currentLinkedId={currentLinkedId}
          currentVideo={currentLinkedId ? videoInfo[currentLinkedId] : undefined}
          linkedElsewhereIds={linkedElsewhereIds}
          onPick={linkVideo}
          onClose={() => setPicker(null)}
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
  chapter, linkedVideo, index, total, isFirst, isLast, isEditing, isDragging,
  onStartEdit, onStopEdit, onRename, onSetType, onSetDuration,
  onDuplicate, onRemove, onMove, onChangeVideo,
  onDragStart, onDragEnter, onDragEnd,
}: {
  chapter: LessonChapter;
  linkedVideo: LinkedVideoState;
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
  onChangeVideo: () => void;
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
          {chapter.type === "video" && (
            <>
              <span aria-hidden>·</span>
              {!chapter.linkedLessonId ? (
                /* video step whose target is gone (or never set) */
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChangeVideo(); }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 -mx-1.5 rounded-md font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors"
                  title="Choose which video this step links to"
                >
                  <AlertCircle className="size-3" strokeWidth={2} aria-hidden />
                  No video attached — choose
                </button>
              ) : linkedVideo === "missing" ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChangeVideo(); }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 -mx-1.5 rounded-md font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors"
                  title="The linked video was deleted — pick a replacement"
                >
                  <AlertCircle className="size-3" strokeWidth={2} aria-hidden />
                  Video deleted — relink
                </button>
              ) : (
                <span className="inline-flex items-center gap-0.5 min-w-0">
                  {/* what this step points at, live: title + publish status */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChangeVideo(); }}
                    className="inline-flex items-center gap-1.5 px-1.5 py-0.5 -ml-1.5 rounded-md text-rose-600 font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors min-w-0"
                    title={
                      linkedVideo && !linkedVideo.published
                        ? "This video is a draft — learners won't see the link until it's published. Click to change video."
                        : "Change which video this step links to"
                    }
                  >
                    <Play className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                    <span className="truncate max-w-[200px]">
                      {linkedVideo ? linkedVideo.title : "Loading video…"}
                    </span>
                    {linkedVideo && (
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          linkedVideo.published ? "bg-success" : "bg-amber-400",
                        )}
                      />
                    )}
                    {linkedVideo && !linkedVideo.published && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-amber-600 shrink-0">
                        Draft — hidden
                      </span>
                    )}
                    <ChevronDown className="size-3 opacity-60 shrink-0" strokeWidth={2} aria-hidden />
                  </button>
                  <a
                    href={`/admin/tutorials/${chapter.linkedLessonId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="size-6 rounded-md inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 transition-colors shrink-0"
                    title="Open the linked video in the editor"
                    aria-label="Open the linked video in the editor"
                  >
                    <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
                  </a>
                </span>
              )}
            </>
          )}
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
              {chapter.type === "video" && (
                <>
                  <MenuItem icon={Link2} label="Change video…" onClick={() => { setMenuOpen(false); onChangeVideo(); }} />
                  <MenuItem icon={X}     label="Unlink video"  onClick={() => { setMenuOpen(false); onSetType("lesson"); }} />
                </>
              )}
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
  videoInfo,
  onClose,
}: {
  chapters: LessonChapter[];
  totalMinutes: number;
  videoInfo: Record<string, LinkableVideo | "missing">;
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
                      <div className="text-[11.5px] text-ink-500 leading-tight truncate">
                        {TYPE_LABEL[c.type]} · ~{c.durationMinutes} min
                        {c.type === "video" && c.linkedLessonId && (() => {
                          const info = videoInfo[c.linkedLessonId];
                          if (info === "missing") {
                            return <span className="text-amber-600"> · video deleted</span>;
                          }
                          if (!info) return <span> · …</span>;
                          return (
                            <span className={info.published ? "text-rose-600" : "text-amber-600"}>
                              {" · opens “" + info.title + "”"}
                              {info.published ? "" : " (draft — hidden)"}
                            </span>
                          );
                        })()}
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

/* ─────────────────────────────────────────────────────────────────────── */

function VideoPickerModal({
  lessonId,
  mode,
  currentLinkedId,
  currentVideo,
  linkedElsewhereIds,
  onPick,
  onClose,
}: {
  lessonId: string;
  mode: "append" | "replace";
  currentLinkedId: string | null;
  currentVideo: LinkedVideoState;
  linkedElsewhereIds: ReadonlySet<string>;
  onPick: (v: LinkableVideo) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LinkableVideo[] | null>(null);
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef(0);

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

  // Debounced search; an empty query lists the latest videos so the admin
  // can pick without typing. The token guards against out-of-order replies.
  useEffect(() => {
    const token = ++tokenRef.current;
    const t = setTimeout(
      async () => {
        setSearching(true);
        const res = await searchLinkableVideos(lessonId, query);
        if (token !== tokenRef.current) return;
        if (res.ok) {
          setResults(res.data ?? []);
          setError(null);
        } else {
          setResults([]);
          setError(res.error);
        }
        setSearching(false);
      },
      query ? 250 : 0,
    );
    return () => clearTimeout(t);
  }, [query, lessonId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "replace" ? "Change linked video" : "Link next video"}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-ink-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-rose-600" strokeWidth={2} />
            <h2 className="text-[15px] font-bold text-ink-900">
              {mode === "replace" ? "Change linked video" : "Link next video"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <p className="text-[12.5px] text-ink-500 leading-relaxed">
            {mode === "replace"
              ? "Pick the video this step should point to instead. The step's title and duration follow the new video."
              : "Add a step that points to a video you've already uploaded. Learners are sent there as the next part of this path."}
          </p>

          {mode === "replace" && currentLinkedId && (
            <div className="rounded-[12px] border border-rose-200 bg-rose-50/50 px-3.5 py-2.5 flex items-center gap-3">
              <span className="size-9 rounded-[9px] bg-white text-rose-600 ring-1 ring-rose-200 inline-flex items-center justify-center shrink-0">
                <Play className="size-4" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-rose-500 mb-0.5">
                  Currently linked
                </div>
                {currentVideo === "missing" ? (
                  <div className="text-[13px] font-semibold text-amber-700">
                    That video was deleted — pick a replacement below.
                  </div>
                ) : currentVideo ? (
                  <>
                    <div className="text-[13.5px] font-semibold text-ink-900 truncate">
                      {currentVideo.title}
                    </div>
                    <div className="text-[11.5px] text-ink-500 tabular-nums">
                      {currentVideo.durationSeconds > 0
                        ? `~${Math.max(1, Math.round(currentVideo.durationSeconds / 60))} min · `
                        : ""}
                      {currentVideo.published ? "Published" : "Draft"}
                    </div>
                  </>
                ) : (
                  <div className="text-[12.5px] text-ink-500">Loading…</div>
                )}
              </div>
              {currentVideo && currentVideo !== "missing" && (
                <a
                  href={`/admin/tutorials/${currentLinkedId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="size-8 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-white hover:text-ink-700 transition-colors shrink-0"
                  title="Open the linked video in the editor"
                  aria-label="Open the linked video in the editor"
                >
                  <ExternalLink className="size-4" strokeWidth={2} aria-hidden />
                </a>
              )}
            </div>
          )}

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Search your videos…"
              aria-label="Search your videos"
              className="w-full h-10 rounded-[10px] border border-ink-200 bg-white pl-9 pr-3 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400"
            />
          </div>

          {error ? (
            <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
              {error}
            </div>
          ) : searching && results === null ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[12.5px] text-ink-500">
              <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden />
              Loading videos…
            </div>
          ) : results && results.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-ink-200 px-4 py-8 text-center text-[12.5px] text-ink-500">
              {query
                ? "No videos match — try another search."
                : "No other videos in your library yet."}
            </div>
          ) : (
            <ul
              className={cn(
                "space-y-1.5 max-h-[46vh] overflow-y-auto pr-0.5 transition-opacity",
                searching && "opacity-60",
              )}
            >
              {(results ?? []).map((v) => {
                const mins = Math.max(1, Math.round(v.durationSeconds / 60));
                const isCurrent = v.id === currentLinkedId;
                const inPath = linkedElsewhereIds.has(v.id);
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => onPick(v)}
                      disabled={isCurrent}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                        isCurrent
                          ? "border-rose-200 bg-rose-50/60 cursor-default"
                          : "border-ink-100 bg-white hover:border-rose-300 hover:bg-rose-50/40",
                      )}
                    >
                      <span className="size-9 rounded-[9px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                        <Play className="size-4" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold text-ink-900 truncate">
                          {v.title}
                        </span>
                        <span className="block text-[11.5px] text-ink-500 mt-0.5 tabular-nums">
                          {v.durationSeconds > 0 ? `~${mins} min · ` : ""}
                          {v.published ? "Published" : "Draft"}
                        </span>
                      </span>
                      {inPath && !isCurrent && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-500 bg-cream-100 ring-1 ring-cream-200 rounded-full px-2 py-0.5 shrink-0"
                          title="Another step in this path already links to this video"
                        >
                          In path
                        </span>
                      )}
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 shrink-0">
                          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                          Current
                        </span>
                      ) : (
                        <Plus
                          className="size-4 text-ink-400 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
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
