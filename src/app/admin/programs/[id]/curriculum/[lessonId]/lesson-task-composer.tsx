"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
  Mic,
  CircleDot,
  Clock,
  Star,
  CalendarDays,
  Loader2,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  type LucideIcon,
} from "lucide-react";
import {
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "@/lib/tasks/actions";
import { listLessonProgramTasks } from "./lesson-task-actions";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Lesson-task composer — mirrors the "What you'll learn" pattern.

   • Saved tasks render as COMPACT rows (handle · icon · title · meta · edit ·
     delete), like the learning-point rows.
   • "Add task" opens the full rich editor (Core information · Instructions ·
     Completion & submission settings).
   • "Create task" / "Save changes" persists to the unified task system and
     COLLAPSES the editor back to a compact row.

   Persisted (task_templates): title, description (objective + instructions),
   task_type (submission type), difficulty, estimated minutes, points,
   required, due-after-days. "Linked learning point" + "Assign to learner" are
   UI-only for now (no column yet — per-learner assignment is the missions
   engine's job).
   ───────────────────────────────────────────────────────────────────────── */

type SubmissionType = "text" | "file" | "audio" | "multiple_choice";
type Difficulty = "easy" | "medium" | "advanced";

const SUBMISSION_TYPES: {
  key: SubmissionType;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { key: "text",            label: "Text response",   hint: "Learner writes a text answer", icon: FileText },
  { key: "file",            label: "File upload",     hint: "Learner uploads a file",       icon: UploadCloud },
  { key: "audio",           label: "Audio response",  hint: "Learner records audio",        icon: Mic },
  { key: "multiple_choice", label: "Multiple choice", hint: "Learner selects an option",    icon: CircleDot },
];
const SUBMISSION_LABEL: Record<string, string> = {
  text: "Text", file: "File upload", audio: "Audio", multiple_choice: "Multiple choice",
};

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
  title: "",
  linkedPointId: "",
  objective: "",
  instructions: "",
  submissionType: "text",
  difficulty: "easy",
  minutes: 15,
  points: 10,
  required: true,
  dueDate: "",
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
  // null = nothing open · NEW = adding · <id> = editing that row
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await listLessonProgramTasks(lessonId);
    setRows(list);
    setLoading(false);
  }, [lessonId]);

  // Initial load — setState runs in a microtask (.then), not synchronously
  // in the effect body, and is guarded so a fast unmount can't set state.
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

  async function handleCreate(v: FormValues): Promise<FormResult> {
    const res = await createTaskTemplate({
      sourceType: "program_video",
      sourceId: lessonId,
      programId: programId ?? null,
      lessonId,
      title: v.title.trim(),
      description: buildDescription(v.objective, v.instructions),
      taskType: v.submissionType,
      difficulty: v.difficulty,
      estimatedMinutes: v.minutes,
      points: v.points,
      isRequired: v.required,
      autoAssignTrigger: "on_start",
      dueAfterDays: v.dueDate ? daysFromToday(v.dueDate) : null,
      status: "active",
    });
    if (!res.ok) return { ok: false, error: res.error };
    await refresh();
    startTransition(() => router.refresh());
    setEditingId(null);
    return { ok: true };
  }

  async function handleSave(id: string, v: FormValues): Promise<FormResult> {
    const res = await updateTaskTemplate(id, {
      title: v.title.trim(),
      description: buildDescription(v.objective, v.instructions),
      taskType: v.submissionType,
      difficulty: v.difficulty,
      estimatedMinutes: v.minutes,
      points: v.points,
      isRequired: v.required,
      dueAfterDays: v.dueDate ? daysFromToday(v.dueDate) : null,
    });
    if (!res.ok) return { ok: false, error: res.error };
    await refresh();
    startTransition(() => router.refresh());
    setEditingId(null);
    return { ok: true };
  }

  async function handleDelete(id: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this task? Learners who already have it keep their copy.")
    ) {
      return;
    }
    const res = await deleteTaskTemplate(id);
    if (!res.ok) {
      window.alert(res.error);
      return;
    }
    if (editingId === id) setEditingId(null);
    await refresh();
    startTransition(() => router.refresh());
  }

  return (
    <section className="card p-5 sm:p-6">
      {/* Section header — mirrors "C. What you will learn" */}
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-ink-900">D. Tasks</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5 max-w-2xl leading-snug">
            Action items learners complete for this lesson. Each task has a
            title, objective, instructions, a submission type, difficulty, time
            and points. Renders on the lesson page.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-semibold shrink-0 whitespace-nowrap">
          <span className="size-1.5 rounded-full bg-rose-400" aria-hidden />
          Lesson page
        </span>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-[12.5px] text-ink-400 py-4">
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          Loading tasks…
        </div>
      ) : (
        <>
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
                  <TaskCompactRow
                    row={row}
                    onEdit={() => setEditingId(row.id)}
                    onDelete={() => handleDelete(row.id)}
                  />
                </li>
              ),
            )}
          </ul>

          {/* New-task editor */}
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

          {editingId === null && (
            <button
              type="button"
              onClick={() => setEditingId(NEW)}
              className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-50 text-rose-700 text-[13px] font-semibold hover:bg-rose-100 transition-colors"
            >
              <Plus className="size-4" strokeWidth={2.4} />
              {rows.length === 0 ? "Create task" : "Add task"}
            </button>
          )}
        </>
      )}
    </section>
  );
}

/* ─── Compact row (collapsed) ──────────────────────────────────────────── */

function TaskCompactRow({
  row,
  onEdit,
  onDelete,
}: {
  row: ComposerTaskRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { objective, instructions } = splitDescription(row.description);
  const summary = objective || instructions.split("\n").find((l) => l.trim()) || "";

  return (
    <div className="group rounded-[14px] border border-ink-100 bg-white p-3.5 flex items-start gap-3">
      <GripVertical
        className="size-4 text-ink-300 shrink-0 mt-2.5 cursor-grab"
        strokeWidth={2}
        aria-hidden
      />
      <span className="size-10 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
        <ClipboardList className="size-5" strokeWidth={1.9} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-ink-900 truncate">
          {row.title || "Untitled task"}
        </div>
        {summary && (
          <p className="text-[12.5px] text-ink-500 leading-snug line-clamp-1 mt-0.5">
            {stripMarkdown(summary)}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Chip>{SUBMISSION_LABEL[row.taskType] ?? cap(row.taskType)}</Chip>
          <Chip>{cap(row.difficulty)}</Chip>
          <Chip>~{row.estimatedMinutes} min</Chip>
          <Chip>+{row.points} pts</Chip>
          {row.isRequired && <Chip tone="rose">Required</Chip>}
          {row.dueAfterDays != null && <Chip>Due +{row.dueAfterDays}d</Chip>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <RowBtn icon={Pencil} label="Edit task" onClick={onEdit} />
        <RowBtn icon={Trash2} label="Delete task" danger onClick={onDelete} />
      </div>
    </div>
  );
}

/* ─── Expanded editor (the rich form, in one block) ────────────────────── */

type FormResult = { ok: true } | { ok: false; error: string };

function TaskForm({
  learningPoints,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
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

  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const canSave = v.title.trim().length > 0 && !saving;

  function wrap(before: string, after = before) {
    const el = instructionsRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
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
    // on success the parent collapses this editor; no need to unset saving.
  }

  return (
    <div className="rounded-[14px] border border-rose-200 bg-rose-50/30 p-4 sm:p-5 space-y-6">
      {/* 1. Core information */}
      <div>
        <SubHeader icon={ClipboardList} index={1} title="Core information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Task title" required help="A short, action-led name learners will see." counter={`${v.title.length} / ${TITLE_MAX}`}>
            <input
              type="text"
              autoFocus
              value={v.title}
              onChange={(e) => set("title", e.target.value.slice(0, TITLE_MAX))}
              placeholder="Apply: Defining Your Niche & Sweet Spot"
              className={inputCls}
            />
          </Field>
          <Field label="Linked learning point" help="Which idea from the lesson does this task reinforce?">
            <SelectShell>
              <select value={v.linkedPointId} onChange={(e) => set("linkedPointId", e.target.value)} className={selectCls}>
                <option value="">— None —</option>
                {learningPoints.map((lp) => (
                  <option key={lp.id} value={lp.id}>{lp.title}</option>
                ))}
              </select>
            </SelectShell>
          </Field>
          <Field label="Task objective" help="One sentence — the outcome learners walk away with." counter={`${v.objective.length} / ${OBJECTIVE_MAX}`}>
            <textarea
              value={v.objective}
              onChange={(e) => set("objective", e.target.value.slice(0, OBJECTIVE_MAX))}
              rows={2}
              placeholder="What outcome should learners walk away with?"
              className={cn(inputCls, "h-auto py-2.5 resize-y")}
            />
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

      {/* 2. Instructions */}
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
          <textarea
            ref={instructionsRef}
            value={v.instructions}
            onChange={(e) => set("instructions", e.target.value.slice(0, INSTRUCTIONS_MAX))}
            rows={5}
            placeholder="Write the detailed instructions learners will follow…"
            className="w-full px-3.5 py-3 text-[13.5px] text-ink-900 placeholder:text-ink-400 leading-relaxed resize-y focus:outline-none"
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
          <span>Markdown is supported (**bold**, *italic*, lists, [links](url)).</span>
          <span className="tabular-nums">{v.instructions.length} / {INSTRUCTIONS_MAX}</span>
        </div>
      </div>

      <Divider />

      {/* 3. Completion & submission settings */}
      <div>
        <SubHeader icon={Settings2} index={3} title="Completion & submission settings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          {SUBMISSION_TYPES.map((s) => {
            const active = v.submissionType === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => set("submissionType", s.key)}
                aria-pressed={active}
                className={cn(
                  "text-left rounded-[12px] border p-3.5 transition-colors cursor-pointer",
                  active ? "border-rose-300 bg-rose-50/60 ring-1 ring-rose-200" : "border-ink-100 bg-white hover:bg-cream-100/60",
                )}
              >
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
                <button key={d} type="button" onClick={() => set("difficulty", d)} className={cn("flex-1 h-9 rounded-[8px] text-[12.5px] font-semibold capitalize transition-colors", v.difficulty === d ? "bg-rose-100 text-rose-700" : "text-ink-500 hover:text-ink-800")}>
                  {d}
                </button>
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

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <div className="text-[12px] min-h-[18px]">
          {error && <span className="text-rose-600">{error}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} disabled={saving} className="h-10 px-4 rounded-[10px] border border-ink-200 bg-white text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 transition-colors">
            Cancel
          </button>
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

const inputCls =
  "w-full h-11 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors";
const selectCls =
  "w-full h-11 pl-3.5 pr-9 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 appearance-none focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors";

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
        <span className="text-[12px] font-semibold text-ink-800">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
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

function RowBtn({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "size-8 rounded-[8px] inline-flex items-center justify-center border transition-colors",
        danger
          ? "border-ink-200 text-ink-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          : "border-ink-200 text-ink-500 hover:bg-cream-100 hover:text-ink-900",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "rose" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", tone === "rose" ? "bg-rose-100 text-rose-700" : "bg-cream-100 text-ink-600 border border-ink-100")}>
      {children}
    </span>
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

function rowToForm(row: ComposerTaskRow): FormValues {
  const { objective, instructions } = splitDescription(row.description);
  const submissionType: SubmissionType = (["text", "file", "audio", "multiple_choice"] as const).includes(
    row.taskType as SubmissionType,
  )
    ? (row.taskType as SubmissionType)
    : "text";
  const difficulty: Difficulty = (["easy", "medium", "advanced"] as const).includes(
    row.difficulty as Difficulty,
  )
    ? (row.difficulty as Difficulty)
    : "medium";
  return {
    title: row.title,
    linkedPointId: "",
    objective,
    instructions,
    submissionType,
    difficulty,
    minutes: row.estimatedMinutes,
    points: row.points,
    required: row.isRequired,
    dueDate: "",
  };
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
