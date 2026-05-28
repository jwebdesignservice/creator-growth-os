"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  SlidersHorizontal,
  Upload,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  GripVertical,
  Eye,
  ListChecks,
  X,
  Loader2,
  Lightbulb,
  ArrowUpRight,
  BookOpen,
  Droplet,
  GitBranch,
  CheckCircle2,
  CalendarDays,
  Rocket,
  Sparkles,
  Copy,
  Globe,
  LayoutTemplate,
  Clock,
  SquarePen,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  toggleLessonPublished,
  archiveLesson,
  deleteLesson,
  updateLesson,
} from "@/app/admin/lessons/actions";
import {
  addLessonToModule,
  createModule,
  deleteModule,
  renameModule,
  duplicateLesson,
  duplicateModule,
  setLessonPreview,
  createLessonTaskTemplate,
  deleteLessonTaskTemplate,
  updateLessonTaskTemplate,
} from "./actions";
import type { LessonRow, ModuleRow, TaskTemplate } from "./page";

/* ────────────────────────────────────────────────────────────────────── */
/*  Modal primitive                                                       */
/* ────────────────────────────────────────────────────────────────────── */

function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[8vh]"
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full rounded-[18px] bg-white shadow-card border border-ink-100 p-6 max-h-[85vh] overflow-y-auto",
          size === "lg" ? "max-w-2xl" : "max-w-md",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-ink-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 cursor-pointer transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-[8px] px-3 py-2 leading-snug">
      {message}
    </p>
  );
}

function FooterButtons({
  onCancel,
  onSave,
  canSave,
  pending,
  saveLabel = "Save",
  saveTone = "primary",
}: {
  onCancel: () => void;
  onSave: () => void;
  canSave: boolean;
  pending: boolean;
  saveLabel?: string;
  saveTone?: "primary" | "danger";
}) {
  return (
    <div className="flex justify-end gap-2 pt-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave || pending}
        className={cn(
          "h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-colors",
          saveTone === "danger"
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-rose-600 hover:bg-rose-700",
        )}
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        {saveLabel}
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Main editor                                                           */
/* ────────────────────────────────────────────────────────────────────── */

type StatusFilter = "all" | "published" | "draft" | "archived";

export function CurriculumEditor({
  programId,
  modules,
  lessons,
  templatesByLesson,
}: {
  programId: string;
  modules: ModuleRow[];
  lessons: LessonRow[];
  templatesByLesson: Record<string, TaskTemplate[]>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [bulkEdit, setBulkEdit] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(
    new Set(),
  );

  // Modal states
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleRow | null>(null);
  const [deletingModule, setDeletingModule] = useState<ModuleRow | null>(null);
  const [addLessonForModule, setAddLessonForModule] =
    useState<ModuleRow | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonRow | null>(null);
  const [managingTasksFor, setManagingTasksFor] = useState<LessonRow | null>(
    null,
  );

  const filteredLessons = useMemo(() => {
    let rows = lessons;
    if (statusFilter === "published") {
      rows = rows.filter((l) => l.published && !l.archived);
    } else if (statusFilter === "draft") {
      rows = rows.filter((l) => !l.published && !l.archived);
    } else if (statusFilter === "archived") {
      rows = rows.filter((l) => l.archived);
    } else {
      rows = rows.filter((l) => !l.archived);
    }
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((l) => l.title.toLowerCase().includes(q));
    return rows;
  }, [lessons, search, statusFilter]);

  const lessonsByModule = useMemo(() => {
    const map = new Map<number, LessonRow[]>();
    for (const m of modules) map.set(m.number, []);
    for (const l of filteredLessons) {
      if (l.module_number == null) continue;
      if (!map.has(l.module_number)) map.set(l.module_number, []);
      map.get(l.module_number)!.push(l);
    }
    return map;
  }, [filteredLessons, modules]);

  function toggleSelect(id: string) {
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── Deep-link handling ─────────────────────────────────────────────────
     The Setup Guide page's kebab menus link here with query strings like
     ?module=3, ?edit-lesson={slug}, ?add-lesson=3. Pick those up on mount
     and either scroll to the anchor or open the matching modal. */
  const searchParams = useSearchParams();
  const router = useRouter();
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const moduleParam = searchParams.get("module");
    const editLessonSlug = searchParams.get("edit-lesson");
    const addLessonModule = searchParams.get("add-lesson");

    if (!moduleParam && !editLessonSlug && !addLessonModule) return;

    if (editLessonSlug) {
      const lesson = lessons.find((l) => l.slug === editLessonSlug);
      if (lesson) setEditingLesson(lesson);
    }

    if (addLessonModule) {
      const n = Number(addLessonModule);
      const mod = modules.find((m) => m.number === n);
      if (mod) setAddLessonForModule(mod);
    }

    // Always try to scroll to the matching anchor for visual context.
    const anchorId = editLessonSlug
      ? `lesson-${editLessonSlug}`
      : moduleParam
        ? `module-${moduleParam}`
        : addLessonModule
          ? `module-${addLessonModule}`
          : null;
    if (anchorId) {
      // Defer until after the modal-state commit so the layout has
      // settled and the element is paint-ready.
      window.requestAnimationFrame(() => {
        document.getElementById(anchorId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    // Clear the params so refreshing doesn't re-trigger the modal.
    router.replace(`/admin/programs/${programId}/curriculum`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setBulkEdit((v) => !v);
            setSelectedLessons(new Set());
          }}
          className={cn(
            "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] border text-[13px] font-medium transition-colors cursor-pointer",
            bulkEdit
              ? "bg-rose-100 border-rose-200 text-rose-700"
              : "bg-white border-ink-200 text-ink-700 hover:bg-cream-100",
          )}
        >
          <Pencil className="size-3.5" strokeWidth={2} />
          {bulkEdit
            ? `Exit bulk edit (${selectedLessons.size})`
            : "Bulk edit"}
        </button>
        {bulkEdit && selectedLessons.size > 0 && (
          <BulkArchiveButton
            ids={Array.from(selectedLessons)}
            onDone={() => {
              setSelectedLessons(new Set());
              setBulkEdit(false);
            }}
          />
        )}
        <ImportContentButton />

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons…"
              aria-label="Search lessons"
              className="h-10 pl-9 pr-3 w-[200px] sm:w-[240px] rounded-[10px] bg-white border border-ink-100 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <FilterDropdown value={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>

      {/* Module list */}
      <div className="mt-6 space-y-3">
        {modules.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-[14px] font-semibold text-ink-900 mb-1">
              No modules yet
            </p>
            <p className="text-[13px] text-ink-500 mb-4">
              Add your first module to start structuring the curriculum.
            </p>
            <button
              type="button"
              onClick={() => setAddModuleOpen(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Add first module
            </button>
          </div>
        ) : (
          modules.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              programId={programId}
              lessons={lessonsByModule.get(m.number) ?? []}
              templatesByLesson={templatesByLesson}
              bulkEdit={bulkEdit}
              selectedLessons={selectedLessons}
              onToggleSelect={toggleSelect}
              onRenameModule={() => setEditingModule(m)}
              onDeleteModule={() => setDeletingModule(m)}
              onAddLesson={() => setAddLessonForModule(m)}
              onBulkUpload={() => setBulkEdit(true)}
              onEditLesson={(lesson) =>
                router.push(`/admin/tutorials/${lesson.id}`)
              }
              onDeleteLesson={(lesson) => setDeletingLesson(lesson)}
              onManageTasks={(lesson) => setManagingTasksFor(lesson)}
            />
          ))
        )}
      </div>

      {/* Add new module */}
      <button
        type="button"
        onClick={() => setAddModuleOpen(true)}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 py-5 rounded-[14px] border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/70 text-[14px] font-semibold text-rose-600 transition-colors cursor-pointer"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        Add new module
      </button>

      {/* Tip */}
      <div className="mt-6 rounded-[14px] bg-cream-100/60 border border-cream-300 p-4 flex items-start gap-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Lightbulb className="size-4" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-ink-700 leading-snug">
            <span className="font-semibold text-ink-900">Tip:</span> Start each
            module with a clear outcome and end with an action step.
          </p>
        </div>
        <a
          href="/support"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 shrink-0"
        >
          Learn curriculum best practices
          <ArrowUpRight className="size-3.5" strokeWidth={2} />
        </a>
      </div>

      {/* Modals */}
      <AddModuleModal
        open={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        programId={programId}
      />
      {editingModule && (
        <EditModuleModal
          module={editingModule}
          programId={programId}
          onClose={() => setEditingModule(null)}
        />
      )}
      {deletingModule && (
        <DeleteModuleModal
          module={deletingModule}
          programId={programId}
          hasLessons={
            (lessonsByModule.get(deletingModule.number)?.length ?? 0) > 0
          }
          onClose={() => setDeletingModule(null)}
        />
      )}
      {addLessonForModule && (
        <AddLessonModal
          module={addLessonForModule}
          programId={programId}
          onClose={() => setAddLessonForModule(null)}
        />
      )}
      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson}
          modules={modules}
          onClose={() => setEditingLesson(null)}
        />
      )}
      {deletingLesson && (
        <DeleteLessonModal
          lesson={deletingLesson}
          onClose={() => setDeletingLesson(null)}
        />
      )}
      {managingTasksFor && (
        <TaskTemplatesModal
          lesson={managingTasksFor}
          programId={programId}
          templates={templatesByLesson[managingTasksFor.id] ?? []}
          onClose={() => setManagingTasksFor(null)}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Module card                                                           */
/* ────────────────────────────────────────────────────────────────────── */

function ModuleCard({
  module: m,
  programId,
  lessons,
  templatesByLesson,
  bulkEdit,
  selectedLessons,
  onToggleSelect,
  onRenameModule,
  onDeleteModule,
  onAddLesson,
  onBulkUpload,
  onEditLesson,
  onDeleteLesson,
  onManageTasks,
}: {
  module: ModuleRow;
  programId: string;
  lessons: LessonRow[];
  templatesByLesson: Record<string, TaskTemplate[]>;
  bulkEdit: boolean;
  selectedLessons: Set<string>;
  onToggleSelect: (id: string) => void;
  onRenameModule: () => void;
  onDeleteModule: () => void;
  onAddLesson: () => void;
  onBulkUpload: () => void;
  onEditLesson: (lesson: LessonRow) => void;
  onDeleteLesson: (lesson: LessonRow) => void;
  onManageTasks: (lesson: LessonRow) => void;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const active = lessons.filter((l) => !l.archived);
  const totalMin = Math.round(
    active.reduce((sum, l) => sum + l.duration_seconds, 0) / 60,
  );
  const publishedCount = active.filter((l) => l.published).length;
  const readiness =
    active.length === 0 ? 0 : Math.round((publishedCount / active.length) * 100);
  const visibility = publishedCount > 0 ? "Public" : "Internal";
  const lastUpdated = lessons.reduce<string | null>((latest, l) => {
    if (!latest || l.created_at > latest) return l.created_at;
    return latest;
  }, null);

  function onDuplicateSection() {
    startTransition(async () => {
      const res = await duplicateModule(programId, m.id);
      if (res.ok) router.refresh();
      else window.alert(res.error);
    });
  }

  return (
    <div
      id={`module-${m.number}`}
      className={cn(
        // No `overflow-hidden` here — it would clip the header dropdowns
        // (Quick actions / kebab) and the per-lesson kebab menus. The
        // footer rounds its own bottom corners so the card still reads as
        // a single rounded surface.
        "card scroll-mt-6 transition-opacity",
        pending && "opacity-70",
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
        <GripVertical
          className="size-4 text-ink-300 shrink-0 cursor-grab"
          strokeWidth={2}
          aria-hidden
        />
        <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <BookOpen className="size-5" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="block text-left text-[17px] sm:text-[19px] font-bold text-ink-900 truncate hover:text-rose-700 transition-colors cursor-pointer leading-tight"
          >
            {m.title}
          </button>
          <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-500 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="size-3.5 text-ink-400" strokeWidth={2} />
              {active.length} lesson{active.length === 1 ? "" : "s"}
            </span>
            <span aria-hidden className="text-ink-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-ink-400" strokeWidth={2} />
              Estimated {totalMin} min
            </span>
            <span aria-hidden className="text-ink-300">·</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-semibold",
                readiness === 100
                  ? "bg-success-bg text-success"
                  : "bg-ink-100 text-ink-600",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  readiness === 100 ? "bg-success" : "bg-ink-400",
                )}
              />
              {readiness === 100 ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <DripButton />
        <QuickActionsDropdown
          onRename={onRenameModule}
          onDuplicate={onDuplicateSection}
          onDelete={onDeleteModule}
        />
        <ModuleUtilityKebab
          open={open}
          onToggle={() => setOpen((v) => !v)}
          onAddLesson={onAddLesson}
        />
      </div>

      {open && (
        <>
          {/* ── Meta bar ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-ink-100 divide-x divide-ink-100">
            <MetaCol
              icon={GitBranch}
              label="Completion flow"
              value="Sequential"
            />
            <MetaCol icon={Eye} label="Visibility" value={visibility} />
            <MetaCol
              icon={CheckCircle2}
              label="Publish readiness"
              value={`${readiness}%`}
              bar={readiness}
            />
            <MetaCol
              icon={CalendarDays}
              label="Last updated"
              value={lastUpdated ? formatShortDate(lastUpdated) : "—"}
            />
          </div>

          {/* ── Lessons ───────────────────────────────────────────── */}
          {active.length === 0 && lessons.length === 0 ? (
            <div className="border-t border-ink-100 px-5 py-6 text-center">
              <p className="text-[13px] text-ink-500 mb-3">
                No lessons in this section yet.
              </p>
              <button
                type="button"
                onClick={onAddLesson}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold cursor-pointer transition-colors"
              >
                <Plus className="size-3.5" strokeWidth={2.5} />
                Add first lesson
              </button>
            </div>
          ) : (
            <ul className="border-t border-ink-100 divide-y divide-ink-100">
              {lessons.map((l, i) => (
                <LessonItem
                  key={l.id}
                  lesson={l}
                  position={i + 1}
                  templateCount={(templatesByLesson[l.id] ?? []).length}
                  bulkEdit={bulkEdit}
                  selected={selectedLessons.has(l.id)}
                  onToggleSelect={() => onToggleSelect(l.id)}
                  onEdit={() => onEditLesson(l)}
                  onDelete={() => onDeleteLesson(l)}
                  onManageTasks={() => onManageTasks(l)}
                />
              ))}
            </ul>
          )}

          {/* ── Footer actions ────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap px-4 sm:px-5 py-3 border-t border-ink-100 bg-cream-50/40 rounded-b-[16px]">
            <button
              type="button"
              onClick={onAddLesson}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              New lesson
            </button>
            <FooterButton icon={Upload} label="Bulk upload" onClick={onBulkUpload} />
            <FooterButton
              icon={Sparkles}
              label="Section summary"
              onClick={() =>
                window.alert(
                  "Section summary — AI will draft a short overview of this section's lessons. Coming soon.",
                )
              }
            />
            <FooterButton
              icon={LayoutTemplate}
              label="Add from template"
              onClick={() =>
                window.alert(
                  "Add from template — pick a pre-built lesson template. Coming soon.",
                )
              }
            />
            <span className="ml-auto">
              <FooterButton
                icon={Sparkles}
                label="AI assist"
                onClick={() =>
                  window.alert(
                    "AI assist — generate lesson drafts from a prompt. Coming soon.",
                  )
                }
              />
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* Header sub-components ─────────────────────────────────────────────── */

function DripButton() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setOn((v) => !v);
        window.alert(
          "Drip scheduling lets you release this section to learners on a delay after they enrol. Full scheduling UI is coming soon.",
        );
      }}
      aria-pressed={on}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-rose-200 bg-white text-rose-700 text-[12.5px] font-semibold hover:bg-rose-50 transition-colors shrink-0"
    >
      <Droplet className="size-3.5" strokeWidth={2} fill={on ? "currentColor" : "none"} />
      Drip
    </button>
  );
}

function QuickActionsDropdown({
  onRename,
  onDuplicate,
  onDelete,
}: {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function click(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 bg-white text-ink-700 text-[12.5px] font-semibold hover:bg-cream-100 transition-colors"
      >
        Quick actions
        <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuButton
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            icon={<Pencil className="size-3.5" strokeWidth={2} />}
            label="Rename section"
          />
          <MenuButton
            onClick={() => {
              setOpen(false);
              onDuplicate();
            }}
            icon={<Copy className="size-3.5" strokeWidth={2} />}
            label="Duplicate section"
          />
          <div aria-hidden className="h-px my-1 bg-ink-100" />
          <MenuButton
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            icon={<Trash2 className="size-3.5" strokeWidth={2} />}
            label="Delete section"
            danger
          />
        </div>
      )}
    </div>
  );
}

function ModuleUtilityKebab({
  open,
  onToggle,
  onAddLesson,
}: {
  open: boolean;
  onToggle: () => void;
  onAddLesson: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    function click(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [menuOpen]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="More section actions"
        className="size-9 rounded-[10px] border border-ink-200 bg-white inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 cursor-pointer transition-colors"
      >
        <MoreVertical className="size-4" strokeWidth={2} />
      </button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 w-44 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuButton
            onClick={() => {
              setMenuOpen(false);
              onAddLesson();
            }}
            icon={<Plus className="size-3.5" strokeWidth={2} />}
            label="Add lesson"
          />
          <MenuButton
            onClick={() => {
              setMenuOpen(false);
              onToggle();
            }}
            icon={
              open ? (
                <ChevronUp className="size-3.5" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-3.5" strokeWidth={2} />
              )
            }
            label={open ? "Collapse section" : "Expand section"}
          />
        </div>
      )}
    </div>
  );
}

function MetaCol({
  icon: Icon,
  label,
  value,
  bar,
}: {
  icon: typeof GitBranch;
  label: string;
  value: string;
  bar?: number;
}) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
      <span className="size-8 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-ink-500 leading-tight">{label}</div>
        {bar !== undefined ? (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-1.5 flex-1 rounded-full bg-ink-100 overflow-hidden max-w-[90px]">
              <span
                className="block h-full rounded-full bg-rose-500 transition-[width] duration-500"
                style={{ width: `${bar}%` }}
              />
            </span>
            <span className="text-[12.5px] font-bold text-ink-900 tabular-nums">
              {value}
            </span>
          </div>
        ) : (
          <div className="text-[13px] font-semibold text-ink-900 truncate">
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

function FooterButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Upload;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 bg-white text-ink-700 text-[12.5px] font-medium hover:bg-cream-100 transition-colors cursor-pointer"
    >
      <Icon className="size-3.5 text-ink-500" strokeWidth={2} />
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Lesson row                                                            */
/* ────────────────────────────────────────────────────────────────────── */

function lessonStatus(lesson: LessonRow): {
  label: string;
  dot: string;
  cls: string;
} {
  if (lesson.archived) {
    return { label: "Archived", dot: "bg-ink-400", cls: "bg-ink-100 text-ink-500" };
  }
  if (lesson.published) {
    return { label: "Ready", dot: "bg-success", cls: "bg-success-bg text-success" };
  }
  if (lesson.video_url || (lesson.description && lesson.description.trim().length > 0)) {
    return { label: "In progress", dot: "bg-amber-500", cls: "bg-amber-50 text-amber-700" };
  }
  return { label: "Draft", dot: "bg-ink-400", cls: "bg-ink-100 text-ink-600" };
}

function LessonItem({
  lesson,
  position,
  templateCount,
  bulkEdit,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onManageTasks,
}: {
  lesson: LessonRow;
  position: number;
  templateCount: number;
  bulkEdit: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageTasks: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);

  function togglePublish() {
    startTransition(async () => {
      const res = await toggleLessonPublished(lesson.id, !lesson.published);
      if (res.ok) router.refresh();
    });
  }

  const min = Math.round(lesson.duration_seconds / 60);
  const status = lessonStatus(lesson);
  const typeLabel =
    lesson.content_type === "text"
      ? "Text"
      : lesson.content_type
        ? lesson.content_type.charAt(0).toUpperCase() + lesson.content_type.slice(1)
        : "Video";

  return (
    <li
      id={`lesson-${lesson.slug}`}
      className={cn(
        "flex items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors scroll-mt-6",
        pending ? "opacity-60" : "hover:bg-cream-50/70",
      )}
    >
      {bulkEdit ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${lesson.title}`}
          className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
        />
      ) : (
        <GripVertical
          className="size-4 text-ink-300 shrink-0 cursor-grab"
          strokeWidth={2}
          aria-hidden
        />
      )}
      <span className="size-8 rounded-[10px] bg-rose-50 text-rose-700 inline-flex items-center justify-center text-[12.5px] font-bold tabular-nums shrink-0">
        {position}
      </span>
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={onEdit}
          className="block text-left text-[14px] font-semibold text-ink-900 truncate hover:text-rose-700 transition-colors cursor-pointer"
        >
          {lesson.title}
        </button>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-500">
          <span className="truncate">1 {typeLabel} &amp; Images</span>
          <span aria-hidden className="text-ink-300">·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="size-3 text-ink-400" strokeWidth={2} />
            {min > 0 ? `${min} min` : "—"}
          </span>
          <button
            type="button"
            onClick={onManageTasks}
            title="Manage lesson tasks"
            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
          >
            <ListChecks className="size-3" strokeWidth={2} />
            {templateCount} task{templateCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>

      {/* content-type pill */}
      <span className="hidden sm:inline-flex items-center px-2.5 h-6 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold shrink-0">
        {typeLabel}
      </span>

      {/* status pill */}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-semibold shrink-0",
          status.cls,
        )}
      >
        <span aria-hidden className={cn("size-1.5 rounded-full", status.dot)} />
        {status.label}
      </span>

      {/* publish button */}
      <button
        type="button"
        onClick={togglePublish}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border text-[12.5px] font-semibold shrink-0 transition-colors disabled:opacity-50",
          lesson.published
            ? "border-ink-200 bg-white text-ink-700 hover:bg-cream-100"
            : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
        )}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <Rocket className="size-3.5" strokeWidth={2} />
        )}
        {lesson.published ? "Unpublish" : "Publish"}
      </button>

      <LessonKebab
        lesson={lesson}
        onEdit={onEdit}
        onRename={() => setRenaming(true)}
        onDelete={onDelete}
        pending={pending}
      />

      {renaming && (
        <RenameModal
          title="Rename lesson"
          label="Lesson title"
          current={lesson.title}
          onClose={() => setRenaming(false)}
          onSave={async (value) => {
            const res = await updateLesson(lesson.id, { title: value });
            return res.ok ? null : res.error;
          }}
        />
      )}
    </li>
  );
}

function LessonKebab({
  lesson,
  onEdit,
  onRename,
  onDelete,
  pending,
}: {
  lesson: LessonRow;
  onEdit: () => void;
  onRename: () => void;
  onDelete: () => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [actionPending, startAction] = useTransition();

  useEffect(() => {
    if (!open) return;
    function click(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [open]);

  const isPreview = lesson.plan_access === "free";

  function doSetPreview() {
    setOpen(false);
    startAction(async () => {
      const res = await setLessonPreview(lesson.id, !isPreview);
      if (res.ok) router.refresh();
      else window.alert(res.error);
    });
  }

  function doDuplicate() {
    setOpen(false);
    startAction(async () => {
      const res = await duplicateLesson(lesson.id);
      if (res.ok) router.refresh();
      else window.alert(res.error);
    });
  }

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Lesson actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending || actionPending}
        className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer transition-colors disabled:opacity-50"
      >
        {actionPending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <MoreVertical className="size-4" strokeWidth={2} />
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 w-56 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuButton
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            icon={<SquarePen className="size-3.5" strokeWidth={2} />}
            label="Edit lesson"
          />
          <div aria-hidden className="h-px my-1 bg-ink-100" />
          <MenuButton
            onClick={doSetPreview}
            icon={<Globe className="size-3.5" strokeWidth={2} />}
            label={isPreview ? "Remove public preview" : "Set as public preview"}
          />
          <MenuButton
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            icon={<Pencil className="size-3.5" strokeWidth={2} />}
            label="Rename lesson"
          />
          <MenuButton
            onClick={doDuplicate}
            icon={<Copy className="size-3.5" strokeWidth={2} />}
            label="Duplicate lesson"
          />
          <div aria-hidden className="h-px my-1 bg-ink-100" />
          <MenuButton
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            icon={<Trash2 className="size-3.5" strokeWidth={2} />}
            label="Delete lesson"
            danger
          />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Lightweight rename modal (shared by lessons + sections)               */
/* ────────────────────────────────────────────────────────────────────── */

function RenameModal({
  title,
  label,
  current,
  onClose,
  onSave,
}: {
  title: string;
  label: string;
  current: string;
  onClose: () => void;
  onSave: (value: string) => Promise<string | null>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const v = value.trim();
    if (!v) {
      setError("Title cannot be empty.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const err = await onSave(v);
      if (err) {
        setError(err);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal open={true} onClose={() => !pending && onClose()} title={title}>
      <div className="space-y-3">
        <label className="block text-[12.5px] font-semibold text-ink-900">
          {label}
        </label>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          className="w-full h-11 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={onClose}
          onSave={save}
          canSave={value.trim().length > 0}
          pending={pending}
          saveLabel="Save"
        />
      </div>
    </Modal>
  );
}

function MenuButton({
  onClick,
  icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer transition-colors",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-cream-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Filter dropdown                                                       */
/* ────────────────────────────────────────────────────────────────────── */

function FilterDropdown({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  return (
    <div className="relative">
      <Filter
        className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-500 pointer-events-none"
        strokeWidth={2}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as StatusFilter)}
        className="appearance-none h-10 pl-9 pr-9 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 cursor-pointer hover:bg-cream-100 focus:outline-none focus:border-rose-300"
      >
        <option value="all">All lessons</option>
        <option value="published">Published only</option>
        <option value="draft">Drafts only</option>
        <option value="archived">Archived only</option>
      </select>
      <SlidersHorizontal
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function ImportContentButton() {
  function handle() {
    alert(
      "Bulk import — paste a list of lesson titles (one per line) once we wire CSV/SCORM parsing. Coming soon.",
    );
  }
  return (
    <button
      type="button"
      onClick={handle}
      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
    >
      <Upload className="size-3.5" strokeWidth={2} />
      Import content
    </button>
  );
}

function BulkArchiveButton({
  ids,
  onDone,
}: {
  ids: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function doArchive() {
    if (!confirm(`Archive ${ids.length} lesson${ids.length === 1 ? "" : "s"}?`))
      return;
    startTransition(async () => {
      for (const id of ids) {
        await archiveLesson(id, true);
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <button
      type="button"
      onClick={doArchive}
      disabled={pending}
      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold cursor-pointer transition-colors"
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      Archive selected ({ids.length})
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Add module modal                                                      */
/* ────────────────────────────────────────────────────────────────────── */

function AddModuleModal({
  open,
  onClose,
  programId,
}: {
  open: boolean;
  onClose: () => void;
  programId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bonus, setBonus] = useState(false);
  const [proOnly, setProOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setBonus(false);
    setProOnly(false);
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createModule(programId, {
        title,
        bonus,
        pro_only: proOnly,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      reset();
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!pending) {
          reset();
          onClose();
        }
      }}
      title="Add module"
      description="Group related lessons under a named section."
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Module title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="e.g. Foundation: Know Your Brand"
            className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
          />
        </label>
        <div className="flex items-center gap-5 flex-wrap">
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={bonus}
              onChange={(e) => setBonus(e.target.checked)}
              className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
            />
            Bonus module
          </label>
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={proOnly}
              onChange={(e) => setProOnly(e.target.checked)}
              className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
            />
            Pro only
          </label>
        </div>
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={() => {
            reset();
            onClose();
          }}
          onSave={save}
          canSave={title.trim().length > 0}
          pending={pending}
          saveLabel="Add module"
        />
      </div>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Edit module modal                                                     */
/* ────────────────────────────────────────────────────────────────────── */

function EditModuleModal({
  module: m,
  programId,
  onClose,
}: {
  module: ModuleRow;
  programId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(m.title);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await renameModule(m.id, title, programId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={true}
      onClose={() => {
        if (!pending) onClose();
      }}
      title={`Rename Module ${m.number}`}
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Module title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
          />
        </label>
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={onClose}
          onSave={save}
          canSave={title.trim().length > 0 && title !== m.title}
          pending={pending}
        />
      </div>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Delete module modal                                                   */
/* ────────────────────────────────────────────────────────────────────── */

function DeleteModuleModal({
  module: m,
  programId,
  hasLessons,
  onClose,
}: {
  module: ModuleRow;
  programId: string;
  hasLessons: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [keepLessons, setKeepLessons] = useState(hasLessons);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await deleteModule(m.id, { keepLessons, programId });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={true}
      onClose={() => {
        if (!pending) onClose();
      }}
      title={`Delete Module ${m.number}: ${m.title}?`}
      description="This can't be undone."
    >
      <div className="space-y-3">
        {hasLessons && (
          <div className="rounded-[10px] bg-amber-50 border border-amber-200 px-3 py-2.5 text-[12.5px] text-ink-700">
            This module has lessons. What should happen to them?
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={keepLessons}
                  onChange={() => setKeepLessons(true)}
                  className="text-rose-600"
                />
                <span>Keep lessons (detach from module)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!keepLessons}
                  onChange={() => setKeepLessons(false)}
                  className="text-rose-600"
                />
                <span className="text-rose-700 font-medium">
                  Delete lessons too
                </span>
              </label>
            </div>
          </div>
        )}
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={onClose}
          onSave={save}
          canSave={true}
          pending={pending}
          saveLabel="Delete module"
          saveTone="danger"
        />
      </div>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Add lesson modal                                                      */
/* ────────────────────────────────────────────────────────────────────── */

function AddLessonModal({
  module: m,
  programId,
  onClose,
}: {
  module: ModuleRow;
  programId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMin, setDurationMin] = useState<string>("");
  const [planAccess, setPlanAccess] = useState<"free" | "basic" | "pro">(
    "basic",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    const seconds = durationMin === "" ? 0 : Math.max(0, Number(durationMin)) * 60;
    startTransition(async () => {
      const res = await addLessonToModule({
        programId,
        moduleId: m.id,
        title,
        description,
        videoUrl,
        durationSeconds: seconds,
        planAccess,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={true}
      onClose={() => {
        if (!pending) onClose();
      }}
      title={`Add lesson to Module ${m.number}`}
      description={m.title}
      size="lg"
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Lesson title *
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="e.g. Defining Your Niche & Sweet Spot"
            className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What the learner walks away with."
            className="w-full px-3 py-2.5 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px] leading-relaxed resize-y min-h-[88px]"
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Video URL
            </span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://…"
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Duration (minutes)
            </span>
            <input
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="0"
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Plan access
          </span>
          <select
            value={planAccess}
            onChange={(e) =>
              setPlanAccess(e.target.value as "free" | "basic" | "pro")
            }
            className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px] bg-white"
          >
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
        </label>
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={onClose}
          onSave={save}
          canSave={title.trim().length > 0}
          pending={pending}
          saveLabel="Add lesson"
        />
      </div>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Edit lesson modal                                                     */
/* ────────────────────────────────────────────────────────────────────── */

function EditLessonModal({
  lesson,
  modules,
  onClose,
}: {
  lesson: LessonRow;
  modules: ModuleRow[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson.video_url ?? "");
  const [durationMin, setDurationMin] = useState(
    Math.round(lesson.duration_seconds / 60).toString(),
  );
  const [planAccess, setPlanAccess] = useState(lesson.plan_access);
  const [moduleNumber, setModuleNumber] = useState(
    lesson.module_number?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    const seconds = durationMin === "" ? 0 : Math.max(0, Number(durationMin)) * 60;
    const targetModule = moduleNumber
      ? modules.find((m) => m.number === Number(moduleNumber))
      : undefined;

    startTransition(async () => {
      const res = await updateLesson(lesson.id, {
        title,
        description,
        video_url: videoUrl,
        duration_seconds: seconds,
        plan_access: planAccess,
        module_number: targetModule?.number ?? undefined,
        module_title: targetModule?.title ?? undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={true}
      onClose={() => {
        if (!pending) onClose();
      }}
      title="Edit lesson"
      size="lg"
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Title *
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px] leading-relaxed resize-y min-h-[88px]"
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Video URL
            </span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://…"
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Duration (minutes)
            </span>
            <input
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Plan access
            </span>
            <select
              value={planAccess}
              onChange={(e) =>
                setPlanAccess(e.target.value as "free" | "basic" | "pro")
              }
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px] bg-white"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Module
            </span>
            <select
              value={moduleNumber}
              onChange={(e) => setModuleNumber(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px] bg-white"
            >
              <option value="">— No module —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.number}>
                  Module {m.number}: {m.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={onClose}
          onSave={save}
          canSave={title.trim().length > 0}
          pending={pending}
        />
      </div>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Delete lesson modal                                                   */
/* ────────────────────────────────────────────────────────────────────── */

function DeleteLessonModal({
  lesson,
  onClose,
}: {
  lesson: LessonRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await deleteLesson(lesson.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={true}
      onClose={() => {
        if (!pending) onClose();
      }}
      title="Delete lesson?"
      description="This will permanently delete the lesson and all of its content."
    >
      <div className="space-y-3">
        <ErrorBanner message={error} />
        <FooterButtons
          onCancel={onClose}
          onSave={save}
          canSave={true}
          pending={pending}
          saveLabel="Delete"
          saveTone="danger"
        />
      </div>
    </Modal>
  );
}

/** Short date like "May 20, 2024" for the module meta bar. */
function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Task template manager modal                                           */
/* ────────────────────────────────────────────────────────────────────── */

const TASK_TYPES = [
  { value: "apply", label: "Apply" },
  { value: "strategy", label: "Strategy" },
  { value: "content", label: "Content" },
  { value: "research", label: "Research" },
  { value: "reflection", label: "Reflection" },
  { value: "posting", label: "Posting" },
  { value: "engagement", label: "Engagement" },
  { value: "performance", label: "Performance" },
  { value: "monetization", label: "Monetization" },
  { value: "confidence", label: "Confidence" },
] as const;

function TaskTemplatesModal({
  lesson,
  programId,
  templates,
  onClose,
}: {
  lesson: LessonRow;
  programId: string;
  templates: TaskTemplate[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Tasks for: ${lesson.title}`}
      description="When a learner completes this video, these tasks are generated in their Tasks tab — once, idempotently."
      size="lg"
    >
      <div className="space-y-3">
        {templates.length === 0 && !adding ? (
          <div className="rounded-[12px] border border-dashed border-ink-200 bg-cream-50/40 px-4 py-6 text-center">
            <p className="text-[13px] text-ink-500 mb-3">
              No tasks linked to this lesson yet.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold cursor-pointer transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Add first task
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {templates.map((t) =>
                editingId === t.id ? (
                  <TemplateForm
                    key={t.id}
                    initial={t}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                    mode="edit"
                    programId={programId}
                    lessonId={lesson.id}
                  />
                ) : (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    onEdit={() => setEditingId(t.id)}
                    onDeleted={() => router.refresh()}
                  />
                ),
              )}
            </ul>

            {adding ? (
              <TemplateForm
                onCancel={() => setAdding(false)}
                onSaved={() => {
                  setAdding(false);
                  router.refresh();
                }}
                mode="create"
                programId={programId}
                lessonId={lesson.id}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-[10px] border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/70 text-[13px] font-semibold text-rose-600 cursor-pointer transition-colors"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                Add task
              </button>
            )}
          </>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TemplateRow({
  template,
  onEdit,
  onDeleted,
}: {
  template: TaskTemplate;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [pending, startTransition] = useTransition();
  function remove() {
    if (
      !confirm(
        `Delete task "${template.title}"? This won't affect tasks already generated for users.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteLessonTaskTemplate(template.id);
      if (res.ok) onDeleted();
    });
  }
  return (
    <li
      className={cn(
        "rounded-[10px] border border-ink-100 bg-white px-3.5 py-3 flex items-start gap-3",
        pending && "opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold text-ink-900 leading-snug">
          {template.title}
        </div>
        {template.description && (
          <p className="text-[12px] text-ink-500 mt-0.5 leading-snug">
            {template.description}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[10.5px]">
          <span className="px-1.5 py-0.5 rounded bg-cream-100 text-ink-700 capitalize">
            {template.task_type}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cream-100 text-ink-700 capitalize">
            {template.priority}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cream-100 text-ink-700">
            +{template.points} pts
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cream-100 text-ink-700">
            ~{template.estimated_minutes}m
          </span>
          {template.is_required && (
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
              Required
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          disabled={pending}
          aria-label="Edit task template"
          title="Edit"
          className="size-8 rounded-[6px] hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <Pencil className="size-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label="Delete task template"
          title="Delete"
          className="size-8 rounded-[6px] hover:bg-rose-50 inline-flex items-center justify-center text-ink-500 hover:text-rose-600 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <Trash2 className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}

function TemplateForm({
  initial,
  onCancel,
  onSaved,
  mode,
  programId,
  lessonId,
}: {
  initial?: TaskTemplate;
  onCancel: () => void;
  onSaved: () => void;
  mode: "create" | "edit";
  programId: string;
  lessonId: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [taskType, setTaskType] = useState(initial?.task_type ?? "apply");
  const [priority, setPriority] = useState<"low" | "normal" | "high">(
    initial?.priority ?? "normal",
  );
  const [points, setPoints] = useState((initial?.points ?? 10).toString());
  const [minutes, setMinutes] = useState(
    (initial?.estimated_minutes ?? 15).toString(),
  );
  const [isRequired, setIsRequired] = useState(initial?.is_required ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const payload = {
        title,
        description,
        task_type: taskType,
        priority,
        points: Number(points) || 0,
        estimated_minutes: Number(minutes) || 0,
        is_required: isRequired,
      };
      const res =
        mode === "create"
          ? await createLessonTaskTemplate({
              programId,
              lessonId,
              ...payload,
            })
          : await updateLessonTaskTemplate(initial!.id, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="rounded-[12px] border-2 border-rose-200 bg-rose-50/40 p-4 space-y-3">
      <div className="text-[12px] font-semibold uppercase tracking-wider text-rose-700">
        {mode === "create" ? "New task" : "Edit task"}
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        autoFocus
        className="w-full h-10 px-3 rounded-[8px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[13.5px] bg-white"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Short description (optional)"
        className="w-full px-3 py-2 rounded-[8px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[13px] leading-relaxed resize-y bg-white min-h-[60px]"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          className="h-9 px-2 rounded-[8px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[12.5px] bg-white"
        >
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "normal" | "high")
          }
          className="h-9 px-2 rounded-[8px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[12.5px] bg-white"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <input
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Points"
          className="h-9 px-2 rounded-[8px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[12.5px] bg-white"
        />
        <input
          type="number"
          min={0}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes"
          className="h-9 px-2 rounded-[8px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[12.5px] bg-white"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-[12.5px] text-ink-700 cursor-pointer">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
        />
        Required task
      </label>
      <ErrorBanner message={error} />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="h-9 px-3 rounded-[8px] border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-white disabled:opacity-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!title.trim() || pending}
          className="h-9 px-4 rounded-[8px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {mode === "create" ? "Add task" : "Save"}
        </button>
      </div>
    </div>
  );
}
