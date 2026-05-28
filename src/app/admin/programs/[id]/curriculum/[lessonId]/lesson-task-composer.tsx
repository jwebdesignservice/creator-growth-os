"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ListChecks,
  Settings2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  FileText,
  UploadCloud,
  FileUp,
  Mic,
  CircleDot,
  AlignLeft,
  Clock,
  Star,
  Trophy,
  CalendarDays,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Info,
  LayoutGrid,
  Sparkles,
  Lightbulb,
  GripVertical,
  type LucideIcon,
} from "lucide-react";
import {
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  duplicateTaskTemplate,
} from "@/lib/tasks/actions";
import { listLessonProgramTasks } from "./lesson-task-actions";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Lesson-task overview — list of compact rows that expand to a learner
   preview, with a summary bar and an inline rich editor (Add / Edit). Saves
   to the unified task system. Mirrors the "What you'll learn" collapse logic
   with a richer card design.
   ───────────────────────────────────────────────────────────────────────── */

type SubmissionType = "text" | "file" | "audio" | "multiple_choice";
type Difficulty = "easy" | "medium" | "advanced";

const SUBMISSION_TYPES: { key: SubmissionType; label: string; hint: string; icon: LucideIcon }[] = [
  { key: "text",            label: "Text response",   hint: "Learner writes a text answer", icon: FileText },
  { key: "file",            label: "File upload",     hint: "Learner uploads a file",       icon: UploadCloud },
  { key: "audio",           label: "Audio response",  hint: "Learner records audio",        icon: Mic },
  { key: "multiple_choice", label: "Multiple choice", hint: "Learner selects an option",    icon: CircleDot },
];

// Per-type icon tile + chip metadata used by the rows.
const TILE: Record<string, { icon: LucideIcon; cls: string }> = {
  text:            { icon: ClipboardList, cls: "bg-rose-50 text-rose-600" },
  file:            { icon: FileUp,        cls: "bg-emerald-50 text-emerald-600" },
  audio:           { icon: Mic,           cls: "bg-violet-50 text-violet-600" },
  multiple_choice: { icon: ListChecks,    cls: "bg-amber-50 text-amber-600" },
};
const SUB_LABEL: Record<string, string> = {
  text: "Text response", file: "File upload", audio: "Audio response", multiple_choice: "Multiple choice",
};
const SUB_CHIP_ICON: Record<string, LucideIcon> = {
  text: AlignLeft, file: FileUp, audio: Mic, multiple_choice: ListChecks,
};
const DIFF: Record<string, { label: string; dot: string }> = {
  easy:     { label: "Easy",     dot: "bg-emerald-500" },
  medium:   { label: "Medium",   dot: "bg-amber-500" },
  advanced: { label: "Advanced", dot: "bg-rose-500" },
};
const tileOf = (t: string) => TILE[t] ?? TILE.text;
const diffOf = (d: string) => DIFF[d] ?? DIFF.medium;

const TITLE_MAX = 200;
const OBJECTIVE_MAX = 500;
const INSTRUCTIONS_MAX = 5000;
const NEW = "__new__";

export type ComposerTaskRow = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  difficulty: string;
  estimatedMinutes: number;
  points: number;
  isRequired: boolean;
  dueAfterDays: number | null;
};

export type LearningPointOption = { id: string; title: string };

type FormValues = {
  title: string;
  linkedPointId: string;
  objective: string;
  instructions: string;
  submissionType: SubmissionType;
  difficulty: Difficulty;
  minutes: number;
  points: number;
  required: boolean;
  dueDate: string;
};

const EMPTY_FORM: FormValues = {
  title: "", linkedPointId: "", objective: "", instructions: "",
  submissionType: "text", difficulty: "easy", minutes: 15, points: 10,
  required: true, dueDate: "",
};

/* ─── Root ─────────────────────────────────────────────────────────────── */

export function LessonTaskComposer({
  lessonId,
  programId,
  learningPoints,
}: {
  lessonId: string;
  programId: string | null;
  learningPoints: LearningPointOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [rows, setRows] = useState<ComposerTaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null); // null | NEW | <id>
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function reload() {
    const list = await listLessonProgramTasks(lessonId);
    setRows(list);
    setLoading(false);
  }
  useEffect(() => {
    let alive = true;
    listLessonProgramTasks(lessonId).then((list) => {
      if (!alive) return;
      setRows(list);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [lessonId]);

  function flashHint(msg: string) {
    setHint(msg);
    window.setTimeout(() => setHint((h) => (h === msg ? null : h)), 3500);
  }

  async function handleCreate(v: FormValues): Promise<FormResult> {
    const res = await createTaskTemplate({
      sourceType: "program_video", sourceId: lessonId, programId: programId ?? null, lessonId,
      title: v.title.trim(), description: buildDescription(v.objective, v.instructions),
      taskType: v.submissionType, difficulty: v.difficulty, estimatedMinutes: v.minutes,
      points: v.points, isRequired: v.required, autoAssignTrigger: "on_start",
      dueAfterDays: v.dueDate ? daysFromToday(v.dueDate) : null, status: "active",
    });
    if (!res.ok) return { ok: false, error: res.error };
    await reload();
    startTransition(() => router.refresh());
    setEditingId(null);
    return { ok: true };
  }

  async function handleSave(id: string, v: FormValues): Promise<FormResult> {
    const res = await updateTaskTemplate(id, {
      title: v.title.trim(), description: buildDescription(v.objective, v.instructions),
      taskType: v.submissionType, difficulty: v.difficulty, estimatedMinutes: v.minutes,
      points: v.points, isRequired: v.required,
      dueAfterDays: v.dueDate ? daysFromToday(v.dueDate) : null,
    });
    if (!res.ok) return { ok: false, error: res.error };
    await reload();
    startTransition(() => router.refresh());
    setEditingId(null);
    return { ok: true };
  }

  async function handleDuplicate(id: string) {
    setBusyId(id);
    const res = await duplicateTaskTemplate(id);
    setBusyId(null);
    if (!res.ok) {
      flashHint(res.error);
      return;
    }
    await reload();
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Delete this task? Learners who already have it keep their copy.")) {
      return;
    }
    setBusyId(id);
    const res = await deleteTaskTemplate(id);
    setBusyId(null);
    if (!res.ok) {
      flashHint(res.error);
      return;
    }
    if (editingId === id) setEditingId(null);
    if (expandedId === id) setExpandedId(null);
    await reload();
    startTransition(() => router.refresh());
  }

  const totals = {
    count: rows.length,
    required: rows.filter((r) => r.isRequired).length,
    points: rows.reduce((s, r) => s + (r.points || 0), 0),
    minutes: rows.reduce((s, r) => s + (r.estimatedMinutes || 0), 0),
  };

  return (
    <section className="card p-5 sm:p-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-display text-[22px] text-ink-900 leading-tight">D. Tasks</h3>
          <p className="text-[12.5px] text-ink-500 mt-1 max-w-2xl leading-snug">
            Action items learners complete for this lesson. Each task includes a
            title, objective, instructions, submission type, difficulty, time,
            and points.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-semibold shrink-0 whitespace-nowrap">
          <Eye className="size-3" strokeWidth={2} />
          Lesson page
        </span>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-[12.5px] text-ink-400 py-4">
          <Loader2 className="size-4 animate-spin" strokeWidth={2} /> Loading tasks…
        </div>
      ) : (
        <>
          {rows.length > 0 && (
            <div className="rounded-[14px] border border-ink-100 bg-cream-50/50 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-ink-100 mb-4">
              <Stat icon={ClipboardList} value={`${totals.count} task${totals.count === 1 ? "" : "s"}`} label="In this lesson" />
              <Stat icon={Star} value={`${totals.required} required`} label="Must be completed" />
              <Stat icon={Trophy} value={`${totals.points} pts total`} label="Across all tasks" />
              <Stat icon={Clock} value={`~${totals.minutes} min total`} label="Estimated time" />
            </div>
          )}

          <ul className="space-y-3">
            {rows.map((row) =>
              editingId === row.id ? (
                <li key={row.id}>
                  <TaskForm
                    learningPoints={learningPoints}
                    initial={rowToForm(row)}
                    submitLabel="Save changes"
                    onCancel={() => setEditingId(null)}
                    onSubmit={(v) => handleSave(row.id, v)}
                  />
                </li>
              ) : (
                <li key={row.id}>
                  <TaskRow
                    row={row}
                    expanded={expandedId === row.id}
                    busy={busyId === row.id}
                    onToggle={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                    onEdit={() => {
                      setExpandedId(null);
                      setEditingId(row.id);
                    }}
                    onDuplicate={() => handleDuplicate(row.id)}
                    onDelete={() => handleDelete(row.id)}
                  />
                </li>
              ),
            )}
          </ul>

          {editingId === NEW && (
            <div className={rows.length > 0 ? "mt-3" : ""}>
              <TaskForm
                learningPoints={learningPoints}
                initial={EMPTY_FORM}
                submitLabel="Create task"
                onCancel={() => setEditingId(null)}
                onSubmit={handleCreate}
              />
            </div>
          )}

          {rows.length === 0 && editingId === null && (
            <p className="text-[13px] text-ink-500 mb-1">
              No tasks yet — add steps learners should complete after watching.
            </p>
          )}

          {/* Footer */}
          {editingId === null && (
            <div className="mt-4 flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setEditingId(NEW)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold shadow-sm transition-colors"
              >
                <Plus className="size-4" strokeWidth={2.4} />
                Add task
              </button>
              <button
                type="button"
                onClick={() => flashHint("Task templates library — coming soon.")}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-rose-200 text-rose-700 text-[13.5px] font-semibold hover:bg-rose-50 transition-colors"
              >
                <LayoutGrid className="size-4" strokeWidth={2} />
                Use template
              </button>
              <button
                type="button"
                onClick={() => flashHint("AI task suggestions — coming soon.")}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-rose-200 text-rose-700 text-[13.5px] font-semibold hover:bg-rose-50 transition-colors"
              >
                <Sparkles className="size-4" strokeWidth={2} />
                Generate suggestions
              </button>
              <div className="ml-auto inline-flex items-center gap-2 rounded-[12px] bg-amber-50 border border-amber-100 px-3.5 py-2 text-[12px] text-ink-700 max-w-md">
                <Lightbulb className="size-4 text-amber-500 shrink-0" strokeWidth={2} />
                {hint ? (
                  <span className="text-ink-900 font-medium">{hint}</span>
                ) : (
                  <span>
                    <span className="font-semibold text-ink-900">Tip:</span> Keep
                    tasks specific, practical, and tied to the lesson objective.
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ─── Summary stat ─────────────────────────────────────────────────────── */

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-w-0">
      <span className="size-10 rounded-full bg-rose-50 text-rose-500 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[14px] font-bold text-ink-900 leading-tight truncate">{value}</div>
        <div className="text-[11px] text-ink-500 truncate">{label}</div>
      </div>
    </div>
  );
}

/* ─── Task row (compact ↔ expanded preview) ────────────────────────────── */

function TaskRow({
  row,
  expanded,
  busy,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  row: ComposerTaskRow;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const tile = tileOf(row.taskType);
  const TileIcon = tile.icon;
  const { objective, instructions } = splitDescription(row.description);
  const summary = objective || instructions.split("\n").find((l) => l.trim()) || "";
  const ready = instructions.trim().length > 0;
  const bullets = instructionsToBullets(instructions);

  if (!expanded) {
    return (
      <div
        className="group rounded-[14px] border border-ink-100 bg-white p-3.5 flex items-center gap-3 hover:border-rose-200 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <GripVertical className="size-4 text-ink-300 shrink-0 cursor-grab" strokeWidth={2} aria-hidden />
        <span className={cn("size-11 rounded-[12px] inline-flex items-center justify-center shrink-0", tile.cls)}>
          <TileIcon className="size-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-ink-900 truncate">{row.title || "Untitled task"}</span>
            <StatusBadge ready={ready} />
          </div>
          {summary && <p className="text-[12.5px] text-ink-500 leading-snug truncate mt-0.5">{stripMarkdown(summary)}</p>}
        </div>
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <MetaChips row={row} />
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <IconBtn icon={Eye} label="Preview" onClick={onToggle} />
          <IconBtn icon={Pencil} label="Edit" onClick={onEdit} />
          <IconBtn icon={Copy} label="Duplicate" onClick={onDuplicate} disabled={busy} />
          <IconBtn icon={Trash2} label="Delete" danger onClick={onDelete} disabled={busy} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-[14px] border-2 border-rose-200 bg-white p-4 sm:p-5">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Collapse"
        className="absolute top-3 right-3 size-7 rounded-[8px] inline-flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
      >
        <ChevronUp className="size-4" strokeWidth={2.2} />
      </button>

      <div className="flex items-start gap-3">
        <GripVertical className="size-4 text-ink-300 shrink-0 mt-2 cursor-grab" strokeWidth={2} aria-hidden />
        <span className={cn("size-12 rounded-[12px] inline-flex items-center justify-center shrink-0", tile.cls)}>
          <TileIcon className="size-[22px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 pr-8">
            <span className="text-[16px] font-bold text-ink-900">{row.title || "Untitled task"}</span>
            <StatusBadge ready={ready} />
          </div>
          {summary && <p className="text-[13px] text-ink-600 leading-snug mt-1">{stripMarkdown(summary)}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <MetaChips row={row} />
          </div>
        </div>

        {/* Labeled action group */}
        <div className="hidden sm:inline-flex items-stretch rounded-[10px] border border-ink-200 divide-x divide-ink-100 overflow-hidden shrink-0 mr-9">
          <ActionCell icon={Eye} label="Preview" onClick={onToggle} />
          <ActionCell icon={Pencil} label="Edit" onClick={onEdit} />
          <ActionCell icon={Copy} label="Duplicate" onClick={onDuplicate} disabled={busy} />
          <ActionCell icon={Trash2} label="Delete" danger onClick={onDelete} disabled={busy} />
        </div>
      </div>

      {/* Instructions preview */}
      <div className="mt-4 rounded-[12px] border border-rose-200 bg-rose-50/30 p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-900">
            <Info className="size-3.5 text-rose-500" strokeWidth={2} />
            Instructions preview <span className="font-normal text-ink-400">(shown to learners)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-500 shrink-0">
            <Eye className="size-3.5" strokeWidth={2} />
            Visible on lesson page
          </span>
        </div>
        {bullets.length > 0 ? (
          <ul className="space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700 leading-snug">
                <span className="text-rose-400 mt-1.5 leading-none" aria-hidden>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-ink-400 italic">
            No instructions yet — learners will only see the objective.
          </p>
        )}
      </div>

      {/* Mobile action row (the labeled group is hidden on small screens) */}
      <div className="sm:hidden mt-3 flex items-center gap-1">
        <IconBtn icon={Eye} label="Preview" onClick={onToggle} />
        <IconBtn icon={Pencil} label="Edit" onClick={onEdit} />
        <IconBtn icon={Copy} label="Duplicate" onClick={onDuplicate} disabled={busy} />
        <IconBtn icon={Trash2} label="Delete" danger onClick={onDelete} disabled={busy} />
      </div>
    </div>
  );
}

function StatusBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success-bg text-success text-[11px] font-semibold shrink-0">
      Ready
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold shrink-0">
      Draft
    </span>
  );
}

function MetaChips({ row }: { row: ComposerTaskRow }) {
  const SubIcon = SUB_CHIP_ICON[row.taskType] ?? AlignLeft;
  const diff = diffOf(row.difficulty);
  return (
    <>
      <Pill>
        <SubIcon className="size-3 text-ink-500" strokeWidth={2} />
        {SUB_LABEL[row.taskType] ?? cap(row.taskType)}
      </Pill>
      <Pill>
        <span className={cn("size-2 rounded-full", diff.dot)} aria-hidden />
        {diff.label}
      </Pill>
      <Pill>
        <Clock className="size-3 text-ink-500" strokeWidth={2} />~{row.estimatedMinutes} min
      </Pill>
      <Pill>
        <Trophy className="size-3 text-ink-500" strokeWidth={2} />+{row.points} pts
      </Pill>
      {row.isRequired ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11.5px] font-semibold text-rose-700">
          <Star className="size-3" strokeWidth={2} fill="currentColor" />
          Required
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-400">
          Optional
        </span>
      )}
    </>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 whitespace-nowrap">
      {children}
    </span>
  );
}

function IconBtn({
  icon: Icon, label, onClick, danger, disabled,
}: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "size-8 rounded-[8px] inline-flex items-center justify-center border transition-colors disabled:opacity-40",
        danger ? "border-ink-200 text-ink-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
               : "border-ink-200 text-ink-500 hover:bg-cream-100 hover:text-ink-900",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function ActionCell({
  icon: Icon, label, onClick, danger, disabled,
}: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 transition-colors disabled:opacity-40",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-500 hover:bg-cream-100 hover:text-ink-900",
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

/* ─── Expanded editor (rich form) ──────────────────────────────────────── */

type FormResult = { ok: true } | { ok: false; error: string };

function TaskForm({
  learningPoints, initial, submitLabel, onCancel, onSubmit,
}: {
  learningPoints: LearningPointOption[];
  initial: FormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (v: FormValues) => Promise<FormResult>;
}) {
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  const [v, setV] = useState<FormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) => setV((p) => ({ ...p, [k]: val }));
  const canSave = v.title.trim().length > 0 && !saving;

  function wrap(before: string, after = before) {
    const el = instructionsRef.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = v.instructions.slice(s, e) || "text";
    set("instructions", (v.instructions.slice(0, s) + before + sel + after + v.instructions.slice(e)).slice(0, INSTRUCTIONS_MAX));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = s + before.length;
      el.selectionEnd = s + before.length + sel.length;
    });
  }
  function prefixLines(prefix: string) {
    const el = instructionsRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const sel = v.instructions.slice(s, el.selectionEnd) || "item";
    const replaced = sel.split("\n").map((l) => `${prefix}${l}`).join("\n");
    set("instructions", (v.instructions.slice(0, s) + replaced + v.instructions.slice(el.selectionEnd)).slice(0, INSTRUCTIONS_MAX));
  }

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await onSubmit(v);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[14px] border border-rose-200 bg-rose-50/30 p-4 sm:p-5 space-y-6">
      <div>
        <SubHeader icon={ClipboardList} index={1} title="Core information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Task title" required help="A short, action-led name learners will see." counter={`${v.title.length} / ${TITLE_MAX}`}>
            <input type="text" autoFocus value={v.title} onChange={(e) => set("title", e.target.value.slice(0, TITLE_MAX))} placeholder="Apply: Defining Your Niche & Sweet Spot" className={inputCls} />
          </Field>
          <Field label="Linked learning point" help="Which idea from the lesson does this task reinforce?">
            <SelectShell>
              <select value={v.linkedPointId} onChange={(e) => set("linkedPointId", e.target.value)} className={selectCls}>
                <option value="">— None —</option>
                {learningPoints.map((lp) => <option key={lp.id} value={lp.id}>{lp.title}</option>)}
              </select>
            </SelectShell>
          </Field>
          <Field label="Task objective" help="One sentence — the outcome learners walk away with." counter={`${v.objective.length} / ${OBJECTIVE_MAX}`}>
            <textarea value={v.objective} onChange={(e) => set("objective", e.target.value.slice(0, OBJECTIVE_MAX))} rows={2} placeholder="What outcome should learners walk away with?" className={cn(inputCls, "h-auto py-2.5 resize-y")} />
          </Field>
          <Field label="Assign to learner" help="Per-learner assignment runs through the missions engine — coming here next.">
            <SelectShell>
              <select disabled className={cn(selectCls, "text-ink-400 cursor-not-allowed")}>
                <option>Everyone with access</option>
              </select>
            </SelectShell>
          </Field>
        </div>
      </div>

      <Divider />

      <div>
        <SubHeader icon={ListChecks} index={2} title="Instructions for the learner" />
        <div className="rounded-[12px] border border-ink-200 overflow-hidden bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-colors">
          <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60 flex-wrap">
            <ToolBtn icon={Bold} label="Bold" onClick={() => wrap("**")} />
            <ToolBtn icon={Italic} label="Italic" onClick={() => wrap("*")} />
            <ToolBtn icon={Underline} label="Underline" onClick={() => wrap("<u>", "</u>")} />
            <ToolBtn icon={Strikethrough} label="Strikethrough" onClick={() => wrap("~~")} />
            <ToolDivider />
            <ToolBtn icon={List} label="Bullet list" onClick={() => prefixLines("- ")} />
            <ToolBtn icon={ListOrdered} label="Numbered list" onClick={() => prefixLines("1. ")} />
            <ToolBtn icon={Quote} label="Quote" onClick={() => prefixLines("> ")} />
            <ToolBtn icon={Code2} label="Code" onClick={() => wrap("`")} />
          </div>
          <textarea ref={instructionsRef} value={v.instructions} onChange={(e) => set("instructions", e.target.value.slice(0, INSTRUCTIONS_MAX))} rows={5} placeholder="Write the detailed instructions learners will follow…" className="w-full px-3.5 py-3 text-[13.5px] text-ink-900 placeholder:text-ink-400 leading-relaxed resize-y focus:outline-none" />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
          <span>Markdown is supported (**bold**, *italic*, lists, [links](url)).</span>
          <span className="tabular-nums">{v.instructions.length} / {INSTRUCTIONS_MAX}</span>
        </div>
      </div>

      <Divider />

      <div>
        <SubHeader icon={Settings2} index={3} title="Completion & submission settings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          {SUBMISSION_TYPES.map((s) => {
            const active = v.submissionType === s.key;
            const Icon = s.icon;
            return (
              <button key={s.key} type="button" onClick={() => set("submissionType", s.key)} aria-pressed={active} className={cn("text-left rounded-[12px] border p-3.5 transition-colors cursor-pointer", active ? "border-rose-300 bg-rose-50/60 ring-1 ring-rose-200" : "border-ink-100 bg-white hover:bg-cream-100/60")}>
                <span className={cn("size-9 rounded-[10px] inline-flex items-center justify-center mb-2", active ? "bg-rose-100 text-rose-600" : "bg-cream-100 text-ink-500")}>
                  <Icon className="size-[18px]" strokeWidth={2} />
                </span>
                <div className="text-[13px] font-bold text-ink-900">{s.label}</div>
                <div className="text-[11.5px] text-ink-500 leading-snug">{s.hint}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Difficulty" required>
            <div className="inline-flex rounded-[10px] border border-ink-200 p-0.5 w-full bg-white">
              {(["easy", "medium", "advanced"] as const).map((d) => (
                <button key={d} type="button" onClick={() => set("difficulty", d)} className={cn("flex-1 h-9 rounded-[8px] text-[12.5px] font-semibold capitalize transition-colors", v.difficulty === d ? "bg-rose-100 text-rose-700" : "text-ink-500 hover:text-ink-800")}>{d}</button>
              ))}
            </div>
          </Field>
          <Field label="Estimated time" required>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
              <input type="number" min={0} value={v.minutes} onChange={(e) => set("minutes", Math.max(0, Number(e.target.value) || 0))} className={cn(inputCls, "pl-9 pr-12")} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-400">min</span>
            </div>
          </Field>
          <Field label="Reward / points" required>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-rose-400" strokeWidth={2} fill="currentColor" />
              <input type="number" min={0} value={v.points} onChange={(e) => set("points", Math.max(0, Number(e.target.value) || 0))} className={cn(inputCls, "pl-9 pr-12")} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-400">pts</span>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded-[12px] border border-ink-100 bg-white p-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900">Required</div>
              <div className="text-[11.5px] text-ink-500 leading-snug">Learners must complete this task to finish the lesson.</div>
            </div>
            <Toggle on={v.required} onClick={() => set("required", !v.required)} label="Required" />
          </div>
          <Field label="Due date (optional)">
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
              <input type="date" value={v.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={cn(inputCls, "pl-9")} />
            </div>
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <div className="text-[12px] min-h-[18px]">{error && <span className="text-rose-600">{error}</span>}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} disabled={saving} className="h-10 px-4 rounded-[10px] border border-ink-200 bg-white text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 transition-colors">Cancel</button>
          <button type="button" onClick={submit} disabled={!canSave} className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold shadow-sm disabled:cursor-not-allowed transition-colors">
            {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : null}
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── shared bits ──────────────────────────────────────────────────────── */

const inputCls = "w-full h-11 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors";
const selectCls = "w-full h-11 pl-3.5 pr-9 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 appearance-none focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors";

function SubHeader({ icon: Icon, index, title }: { icon: LucideIcon; index: number; title: string }) {
  return (
    <header className="flex items-center gap-2.5 mb-4">
      <span className="size-8 rounded-[9px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[16px]" strokeWidth={2} />
      </span>
      <h4 className="text-[14px] font-bold text-ink-900">{index}. {title}</h4>
    </header>
  );
}

function Field({ label, required, help, counter, children }: { label: string; required?: boolean; help?: string; counter?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-semibold text-ink-800">{label}{required && <span className="text-rose-500"> *</span>}</span>
        {counter && <span className="text-[11px] text-ink-400 tabular-nums">{counter}</span>}
      </span>
      {children}
      {help && <span className="block mt-1 text-[11px] text-ink-400 leading-snug">{help}</span>}
    </label>
  );
}

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
    </span>
  );
}

function Divider() {
  return <div aria-hidden className="h-px bg-ink-100 -mx-4 sm:-mx-5" />;
}

function ToolBtn({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="size-8 rounded-[7px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors">
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}
function ToolDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-ink-200" />;
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} role="switch" aria-checked={on} aria-label={label} className={cn("relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 cursor-pointer", on ? "bg-rose-500" : "bg-ink-200")}>
      <span aria-hidden className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/* ─── helpers ──────────────────────────────────────────────────────────── */

function buildDescription(objective: string, instructions: string): string {
  const o = objective.trim();
  const i = instructions.trim();
  if (o) return `**Objective:** ${o}${i ? `\n\n${i}` : ""}`;
  return i;
}

function splitDescription(desc: string): { objective: string; instructions: string } {
  const m = desc.match(/^\*\*Objective:\*\*\s*(.*?)(?:\n\n([\s\S]*))?$/);
  if (m) return { objective: m[1] ?? "", instructions: m[2] ?? "" };
  return { objective: "", instructions: desc };
}

function instructionsToBullets(instructions: string): string[] {
  return instructions
    .split("\n")
    .map((l) => stripMarkdown(l.replace(/^\s*(?:[-*]|\d+\.|>)\s*/, "")))
    .filter((l) => l.length > 0)
    .slice(0, 8);
}

function rowToForm(row: ComposerTaskRow): FormValues {
  const { objective, instructions } = splitDescription(row.description);
  const submissionType: SubmissionType = (["text", "file", "audio", "multiple_choice"] as const).includes(row.taskType as SubmissionType) ? (row.taskType as SubmissionType) : "text";
  const difficulty: Difficulty = (["easy", "medium", "advanced"] as const).includes(row.difficulty as Difficulty) ? (row.difficulty as Difficulty) : "medium";
  return { title: row.title, linkedPointId: "", objective, instructions, submissionType, difficulty, minutes: row.estimatedMinutes, points: row.points, required: row.isRequired, dueDate: "" };
}

function daysFromToday(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000));
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function stripMarkdown(s: string): string {
  return s.replace(/[*_`~#>]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
}
