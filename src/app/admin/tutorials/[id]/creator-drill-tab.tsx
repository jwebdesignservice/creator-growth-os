"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  GraduationCap,
  Sparkles,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Link2,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  MoreHorizontal,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   "Creator drill" tab of the tutorial editor.
   Every field is local state — there's no drill schema in Supabase yet,
   so the page is fully interactive but values reset on full refresh. The
   shape mirrors what an upcoming `lesson_drills` table will hold so
   wiring server-actions later is a drop-in.
   ───────────────────────────────────────────────────────────────────────── */

export type DrillTaskStep = { id: string; text: string };
export type DrillResource = {
  id: string;
  name: string;
  ext: "pdf" | "docx" | "xlsx" | "link";
  size: string;
};
export type Difficulty = "easy" | "medium" | "advanced";
export type SubmissionType =
  | "text"
  | "url"
  | "file"
  | "video"
  | "checkbox";

const SUBMISSION_OPTIONS: { value: SubmissionType; label: string }[] = [
  { value: "text",     label: "Text response" },
  { value: "url",      label: "URL submission" },
  { value: "file",     label: "File upload" },
  { value: "video",    label: "Video submission" },
  { value: "checkbox", label: "Checkbox confirmation" },
];

/* ─────────────────────────────────────────────────────────────────────────
   Defaults — match the values in the design spec so the page is alive
   on first render (admins can override anything).
   ───────────────────────────────────────────────────────────────────────── */

const DEFAULT_TITLE = "Create your first hook variations";
const DEFAULT_OBJECTIVE =
  "Learners will create multiple hook variations and adapt them for short-form platforms.";
const DEFAULT_INSTRUCTIONS = `Your hook is the make-or-break moment. In this drill, you'll ideate, refine, and adapt hooks that stop the scroll and align with your content style.

Follow the steps below to create hook variations, test which one is strongest, and rewrite it for Reels, TikTok, and YouTube Shorts.

Focus on clarity, curiosity, and value. Make it impossible to ignore.`;
const DEFAULT_STEPS: DrillTaskStep[] = [
  { id: "s1", text: "Write 5 hook variations" },
  { id: "s2", text: "Pick your strongest hook" },
  { id: "s3", text: "Rewrite it for Reels, TikTok, and Shorts" },
  { id: "s4", text: "Submit your final 3 versions" },
];
const DEFAULT_SUCCESS_CRITERIA = [
  "Hooks are attention-grabbing and relevant to the audience",
  "At least 3 platform-specific versions are included",
  "Submission is clear, original, and neatly organized",
];
const DEFAULT_RESOURCES: DrillResource[] = [
  { id: "r1", name: "Hook Library",       ext: "pdf",  size: "2.4 MB" },
  { id: "r2", name: "Example Script",     ext: "docx", size: "34 KB" },
  { id: "r3", name: "Template Worksheet", ext: "xlsx", size: "18 KB" },
];

const TITLE_MAX = 100;
const OBJECTIVE_MAX = 200;
const INSTRUCTIONS_MAX = 2000;

/* ─────────────────────────────────────────────────────────────────────────
   Public type — what the parent editor passes in so the linked-learning-
   point dropdown can show the parent tutorial, plus the video preview
   slot which lives in the parent so it can stay consistent with other
   tabs.
   ───────────────────────────────────────────────────────────────────────── */

export type DrillTabProps = {
  lessonTitle: string;
  videoSlot?: ReactNode;
};

/* ─────────────────────────────────────────────────────────────────────────
   Public type — what the parent reads off when rendering the right rail.
   The "Drill readiness" card lives in the sidebar (not inside the tab)
   so the readiness % follows the existing video / readiness layout.
   ───────────────────────────────────────────────────────────────────────── */

export type DrillReadiness = {
  percent: number;
  checks: { key: string; label: string; done: boolean }[];
};

export function CreatorDrillTab({ lessonTitle, videoSlot }: DrillTabProps) {
  /* ── Form state ──────────────────────────────────────────────────────── */
  const [drillTitle, setDrillTitle]               = useState(DEFAULT_TITLE);
  const [linkedPoint, setLinkedPoint]             = useState(
    "Create hook-driven content that stops the scroll",
  );
  const [objective, setObjective]                 = useState(DEFAULT_OBJECTIVE);
  const [instructions, setInstructions]           = useState(DEFAULT_INSTRUCTIONS);
  const [submissionType, setSubmissionType]       =
    useState<SubmissionType>("text");
  const [difficulty, setDifficulty]               = useState<Difficulty>("easy");
  const [estimatedMin, setEstimatedMin]           = useState<number>(15);
  const [rewardPoints, setRewardPoints]           = useState<number>(10);
  const [required, setRequired]                   = useState(true);
  const [taskSteps, setTaskSteps]                 = useState<DrillTaskStep[]>(DEFAULT_STEPS);
  const [successCriteria, setSuccessCriteria]     = useState<string[]>(
    DEFAULT_SUCCESS_CRITERIA,
  );
  const [resources, setResources]                 = useState<DrillResource[]>(DEFAULT_RESOURCES);

  /* ── Step CRUD ───────────────────────────────────────────────────────── */
  const [addingStep, setAddingStep]               = useState(false);
  const [stepDraft, setStepDraft]                 = useState("");
  const [editingStepId, setEditingStepId]         = useState<string | null>(null);
  const [editingStepText, setEditingStepText]     = useState("");

  function addStep() {
    const v = stepDraft.trim();
    if (!v) return;
    setTaskSteps((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, text: v },
    ]);
    setStepDraft("");
    setAddingStep(false);
  }
  function startEditStep(s: DrillTaskStep) {
    setEditingStepId(s.id);
    setEditingStepText(s.text);
  }
  function commitEditStep() {
    if (!editingStepId) return;
    const v = editingStepText.trim();
    if (!v) {
      setEditingStepId(null);
      return;
    }
    setTaskSteps((prev) =>
      prev.map((s) => (s.id === editingStepId ? { ...s, text: v } : s)),
    );
    setEditingStepId(null);
  }
  function deleteStep(id: string) {
    setTaskSteps((prev) => prev.filter((s) => s.id !== id));
  }

  /* ── Success-criteria CRUD ───────────────────────────────────────────── */
  const [criterionDraft, setCriterionDraft] = useState("");
  function addCriterion() {
    const v = criterionDraft.trim();
    if (!v) return;
    setSuccessCriteria((prev) => [...prev, v]);
    setCriterionDraft("");
  }
  function removeCriterion(idx: number) {
    setSuccessCriteria((prev) => prev.filter((_, i) => i !== idx));
  }

  /* ── Resource CRUD ───────────────────────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  function onPickResource() {
    fileInputRef.current?.click();
  }
  function onResourcePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    const safeExt: DrillResource["ext"] =
      ext === "pdf" || ext === "docx" || ext === "xlsx" ? ext : "link";
    setResources((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        ext: safeExt,
        size: formatBytes(file.size),
      },
    ]);
    e.target.value = "";
  }
  function removeResource(id: string) {
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  /* ── Rich-text helpers (lightweight markdown-style) ──────────────────── */
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  function wrapSelection(prefix: string, suffix: string = prefix, placeholder = "") {
    const el = instructionsRef.current;
    if (!el) return;
    const start = el.selectionStart ?? instructions.length;
    const end = el.selectionEnd ?? instructions.length;
    const selected = instructions.slice(start, end) || placeholder;
    const next =
      instructions.slice(0, start) + prefix + selected + suffix + instructions.slice(end);
    setInstructions(next);
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(pos, pos);
    });
  }
  function prefixLine(prefix: string) {
    const el = instructionsRef.current;
    if (!el) return;
    const start = el.selectionStart ?? instructions.length;
    const lineStart = instructions.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    setInstructions(
      instructions.slice(0, lineStart) + prefix + instructions.slice(lineStart),
    );
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length;
      el.setSelectionRange(pos, pos);
    });
  }

  /* ── AI assist (stub — flashes a toast in the host editor) ───────────── */
  function onAiAssist() {
    if (typeof window !== "undefined") {
      window.alert(
        "AI assist will draft objective + instructions + success criteria from the lesson context. Coming next.",
      );
    }
  }

  /* Live drill readiness — drives the right-rail card. */
  const readiness = useMemo(
    () =>
      deriveDrillReadiness({
        drillTitle,
        objective,
        steps: taskSteps.length,
        submissionTypeChosen: submissionType.length > 0,
        resources: resources.length,
      }),
    [drillTitle, objective, taskSteps.length, submissionType, resources.length],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-5 items-start">
      {/* ── LEFT column — all drill editing ─────────────────────────── */}
      <div className="space-y-5 min-w-0">
      {/* ── 1. Hero / intro card ──────────────────────────────────────── */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="size-11 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
            <GraduationCap className="size-5" strokeWidth={1.9} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-bold text-ink-900 leading-tight">
              Creator drill
            </h2>
            <p className="mt-1 text-[13px] text-ink-500 leading-relaxed max-w-2xl">
              Define the hands-on action step learners must complete after this
              lesson.
              <br />
              A great drill reinforces learning and helps learners apply what
              they&apos;ve just learned.
            </p>
          </div>
          <button
            type="button"
            onClick={onAiAssist}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-semibold hover:bg-cream-100 transition-colors shrink-0"
          >
            <Sparkles className="size-3.5 text-rose-500" strokeWidth={2} />
            AI assist
          </button>
        </div>
      </section>

      {/* ── 2. Drill details (2-col form) ─────────────────────────────── */}
      <section className="card p-5 sm:p-6">
        <header className="mb-4">
          <h3 className="text-[14px] font-bold text-ink-900">Drill details</h3>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
          {/* ── LEFT column ─────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">
            <Field label="Drill title" required>
              <CountedInput
                value={drillTitle}
                onChange={setDrillTitle}
                placeholder="Give the drill a clear, action-led title"
                max={TITLE_MAX}
              />
            </Field>

            <Field label="Linked learning point" required>
              <LinkedPointSelect
                value={linkedPoint}
                onChange={setLinkedPoint}
                lessonTitle={lessonTitle}
              />
            </Field>

            <Field label="Drill objective (short summary)" required>
              <CountedInput
                value={objective}
                onChange={setObjective}
                placeholder="What outcome should learners walk away with?"
                max={OBJECTIVE_MAX}
              />
            </Field>

            <Field label="Detailed drill instructions" required>
              <RichTextEditor
                value={instructions}
                onChange={setInstructions}
                inputRef={instructionsRef}
                onBold={() => wrapSelection("**", "**", "bold")}
                onItalic={() => wrapSelection("*", "*", "italic")}
                onUnderline={() => wrapSelection("__", "__", "underlined")}
                onStrike={() => wrapSelection("~~", "~~", "strike")}
                onBullet={() => prefixLine("- ")}
                onOrdered={() => prefixLine("1. ")}
                onCode={() => wrapSelection("`", "`", "code")}
                onLink={() => wrapSelection("[", "](https://)")}
                max={INSTRUCTIONS_MAX}
              />
            </Field>
          </div>

          {/* ── RIGHT column ────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">
            <Field label="Submission type" required>
              <NativeSelect
                value={submissionType}
                onChange={(v) => setSubmissionType(v as SubmissionType)}
                options={SUBMISSION_OPTIONS}
              />
            </Field>

            <Field label="Difficulty" required>
              <DifficultyPicker value={difficulty} onChange={setDifficulty} />
            </Field>

            <Field label="Estimated time" required>
              <SuffixedNumberInput
                value={estimatedMin}
                onChange={setEstimatedMin}
                suffix="min"
                min={1}
                max={999}
              />
            </Field>

            <Field label="Reward / points" required>
              <SuffixedNumberInput
                value={rewardPoints}
                onChange={setRewardPoints}
                suffix="pts"
                leadingIcon={<Star className="size-3.5 text-amber-500" strokeWidth={2} fill="currentColor" />}
                showPlus
                min={0}
                max={9999}
              />
            </Field>

            <RequiredToggle value={required} onChange={setRequired} />
          </div>
        </div>
      </section>

      {/* ── 3. Task steps + Success criteria + Resources ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT — Task steps */}
        <section className="card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold text-ink-900">Task steps</h3>
              <p className="mt-0.5 text-[12px] text-ink-500">
                Break down the drill into clear, actionable steps.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddingStep(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors shrink-0"
            >
              <Plus className="size-3.5" strokeWidth={2} />
              Add step
            </button>
          </header>

          <ul className="space-y-2">
            {taskSteps.map((s, i) => (
              <li
                key={s.id}
                className="group flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] border border-ink-100 bg-white hover:bg-cream-50/60 transition-colors"
              >
                <GripVertical
                  className="size-3.5 text-ink-300 shrink-0 cursor-grab"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="size-6 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0">
                  {i + 1}
                </span>
                {editingStepId === s.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingStepText}
                    onChange={(e) => setEditingStepText(e.target.value)}
                    onBlur={commitEditStep}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEditStep();
                      if (e.key === "Escape") setEditingStepId(null);
                    }}
                    className="flex-1 h-7 px-2 rounded-[6px] border border-rose-300 bg-white text-[13px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                ) : (
                  <span className="flex-1 text-[13px] text-ink-900 truncate">
                    {s.text}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => startEditStep(s)}
                  aria-label={`Edit step ${i + 1}`}
                  className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700"
                >
                  <Pencil className="size-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteStep(s.id)}
                  aria-label={`Delete step ${i + 1}`}
                  className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>

          {addingStep && (
            <div className="mt-2 flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={stepDraft}
                onChange={(e) => setStepDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addStep();
                  if (e.key === "Escape") {
                    setAddingStep(false);
                    setStepDraft("");
                  }
                }}
                placeholder="New step…"
                className="flex-1 h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13px] text-ink-900 focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center h-10 px-3 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingStep(false);
                  setStepDraft("");
                }}
                className="inline-flex items-center h-10 px-3 rounded-[10px] border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100"
              >
                Cancel
              </button>
            </div>
          )}

          {taskSteps.length === 0 && !addingStep && (
            <div className="text-center py-6 text-[12.5px] text-ink-500">
              No steps yet. Add the first one above.
            </div>
          )}
        </section>

        {/* RIGHT — Success criteria + Resources */}
        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <header className="mb-2">
              <h3 className="text-[14px] font-bold text-ink-900">
                Success criteria
              </h3>
              <p className="mt-0.5 text-[12px] text-ink-500">
                What a great submission looks like.
              </p>
            </header>
            <ul className="space-y-2">
              {successCriteria.map((c, i) => (
                <li
                  key={`${i}-${c}`}
                  className="group flex items-start gap-2.5 text-[12.5px] text-ink-900"
                >
                  <CheckCircle2
                    className="size-4 text-success mt-[1px] shrink-0"
                    strokeWidth={2}
                  />
                  <span className="flex-1 leading-snug">{c}</span>
                  <button
                    type="button"
                    onClick={() => removeCriterion(i)}
                    aria-label="Remove criterion"
                    className="opacity-0 group-hover:opacity-100 size-6 rounded-[6px] inline-flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="size-3" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={criterionDraft}
                onChange={(e) => setCriterionDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCriterion();
                }}
                placeholder="Add a success criterion…"
                className="flex-1 h-9 px-3 rounded-[10px] border border-ink-200 bg-white text-[12.5px] text-ink-900 focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={addCriterion}
                disabled={!criterionDraft.trim()}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-[10px] bg-rose-50 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-100 disabled:opacity-50"
              >
                <Plus className="size-3" strokeWidth={2.5} />
                Add
              </button>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <header className="mb-3">
              <h3 className="text-[14px] font-bold text-ink-900">
                Resources for this drill
              </h3>
              <p className="mt-0.5 text-[12px] text-ink-500">
                Attach templates, guides, or examples to help learners.
              </p>
            </header>

            <ul className="space-y-2">
              {resources.map((r) => (
                <ResourceRow
                  key={r.id}
                  resource={r}
                  onRemove={() => removeResource(r.id)}
                />
              ))}
            </ul>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.xlsx"
              className="hidden"
              onChange={onResourcePicked}
            />
            <button
              type="button"
              onClick={onPickResource}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 h-12 rounded-[12px] border border-dashed border-rose-200 bg-rose-50/40 text-rose-700 text-[13px] font-semibold hover:bg-rose-50 transition-colors"
            >
              <Plus className="size-4" strokeWidth={2} />
              <span className="flex flex-col items-center">
                <span>Add resource</span>
                <span className="text-[11px] font-normal text-ink-500">
                  PDF, DOCX, XLSX or link
                </span>
              </span>
            </button>
          </section>
        </div>
      </div>
      </div>

      {/* ── RIGHT rail — video + drill readiness + tips ─────────────── */}
      <aside className="space-y-4 min-w-0">
        {videoSlot}
        <DrillReadinessCard
          readiness={readiness}
          onAddResources={onPickResource}
        />
        <DrillTipsCard />
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right-rail cards — exported so the parent could embed them elsewhere,
   but the current layout renders them inside CreatorDrillTab.
   ───────────────────────────────────────────────────────────────────────── */

export function DrillReadinessCard({
  readiness,
  onAddResources,
}: {
  readiness: DrillReadiness;
  onAddResources: () => void;
}) {
  const allDone = readiness.checks.every((c) => c.done);
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900">Drill readiness</h3>
      </header>
      <div className="flex items-center gap-5">
        <div className="shrink-0">
          <ReadinessDonut percent={readiness.percent} />
        </div>
        <ul className="flex-1 min-w-0 space-y-2">
          {readiness.checks.map((c) => (
            <li key={c.key} className="flex items-center gap-2 text-[12.5px]">
              {c.done ? (
                <CheckCircle2
                  className="size-4 text-success shrink-0"
                  strokeWidth={2}
                />
              ) : (
                <span
                  aria-hidden
                  className="size-4 rounded-full border-2 border-amber-400 border-dashed shrink-0"
                />
              )}
              <span
                className={cn(
                  "truncate",
                  c.done ? "text-ink-900" : "text-ink-700",
                )}
              >
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 pt-4 border-t border-ink-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            typeof window !== "undefined" &&
            window.alert("Learner preview — coming next.")
          }
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <Sparkles className="size-3.5" strokeWidth={2} />
          Preview learner view
        </button>
        <button
          type="button"
          onClick={onAddResources}
          disabled={allDone}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold disabled:bg-rose-300 transition-colors"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          Add resources
        </button>
      </div>
    </section>
  );
}

/** Pure-SVG donut for the readiness percentage (matches the design's
 *  rose ring with white track + small "Complete" caption below). */
function ReadinessDonut({ percent }: { percent: number }) {
  const size = 112;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#fde6e6"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#e11d48"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="block text-[22px] font-bold text-ink-900 leading-none tabular-nums">
          {clamped}%
        </span>
        <span className="block text-[10.5px] text-ink-500 mt-1">Complete</span>
      </div>
    </div>
  );
}

export function DrillTipsCard() {
  return (
    <section className="card p-5">
      <header className="flex items-center gap-2 mb-3">
        <Sparkles
          className="size-4 text-amber-500"
          strokeWidth={2}
          fill="currentColor"
        />
        <h3 className="text-[14px] font-bold text-ink-900">
          Tips for a great drill
        </h3>
      </header>
      <ul className="space-y-2 text-[12.5px] text-ink-700">
        <li className="flex items-start gap-2">
          <span aria-hidden className="text-ink-400 mt-[5px]">·</span>
          Keep steps short and actionable.
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden className="text-ink-400 mt-[5px]">·</span>
          Provide clear success criteria.
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden className="text-ink-400 mt-[5px]">·</span>
          Attach examples or templates when possible.
        </li>
      </ul>
      <a
        href="#"
        className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700"
      >
        Learn best practices →
      </a>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Drill readiness — exported for the parent right rail to render.
   Derived from the drill state; for now we surface a static placeholder
   that the parent can swap when this becomes a wired form.
   ───────────────────────────────────────────────────────────────────────── */

export function deriveDrillReadiness(args: {
  drillTitle: string;
  objective: string;
  steps: number;
  submissionTypeChosen: boolean;
  resources: number;
}): DrillReadiness {
  const checks = [
    { key: "title",       label: "Drill title added",         done: args.drillTitle.trim().length > 0 },
    { key: "objective",   label: "Objective complete",        done: args.objective.trim().length > 12 },
    { key: "steps",       label: "Steps added",               done: args.steps >= 1 },
    { key: "submission",  label: "Submission type selected",  done: args.submissionTypeChosen },
    { key: "resources",   label: "Resources attached",        done: args.resources > 0 },
    { key: "ready",       label: "Ready to publish",          done: false },
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, percent: Math.round((done / checks.length) * 100) };
}

/* ─────────────────────────────────────────────────────────────────────────
   Small composables
   ───────────────────────────────────────────────────────────────────────── */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-semibold text-ink-900">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CountedInput({
  value,
  onChange,
  placeholder,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max: number;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder={placeholder}
        maxLength={max}
        className="w-full h-11 pl-3.5 pr-16 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-400 tabular-nums select-none pointer-events-none">
        {value.length} / {max}
      </span>
    </div>
  );
}

function LinkedPointSelect({
  value,
  onChange,
  lessonTitle,
}: {
  value: string;
  onChange: (v: string) => void;
  lessonTitle: string;
}) {
  // Right now the only linked learning point is the parent lesson. As the
  // backend grows, the editor will offer lesson_path checkpoints / sub-
  // sections — kept as a single select for forward compat.
  const options = useMemo(
    () => Array.from(new Set([value, lessonTitle, "Create hook-driven content that stops the scroll"])).filter(Boolean),
    [value, lessonTitle],
  );

  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-7 rounded-[8px] bg-rose-50 text-rose-600 pointer-events-none"
      >
        <GraduationCap className="size-3.5" strokeWidth={2} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-11 pl-12 pr-10 rounded-[10px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-900 cursor-pointer focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors truncate"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
      >
        <FileText className="size-3.5" strokeWidth={2} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-11 pl-10 pr-10 rounded-[10px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-900 cursor-pointer focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function DifficultyPicker({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (v: Difficulty) => void;
}) {
  const opts: { value: Difficulty; label: string }[] = [
    { value: "easy",     label: "Easy" },
    { value: "medium",   label: "Medium" },
    { value: "advanced", label: "Advanced" },
  ];
  return (
    <div className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white p-1 w-full">
      {opts.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "flex-1 h-9 px-3 rounded-[8px] text-[12.5px] font-semibold transition-colors",
              active
                ? "bg-rose-100 text-rose-700"
                : "text-ink-700 hover:bg-cream-100",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SuffixedNumberInput({
  value,
  onChange,
  suffix,
  leadingIcon,
  showPlus,
  min = 0,
  max = 999,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  leadingIcon?: ReactNode;
  showPlus?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="relative">
      {leadingIcon && (
        <span
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          {leadingIcon}
        </span>
      )}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) {
            onChange(Math.max(min, Math.min(max, Math.floor(n))));
          }
        }}
        min={min}
        max={max}
        className={cn(
          "w-full h-11 pr-14 rounded-[10px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-900 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors tabular-nums",
          leadingIcon ? "pl-9" : "pl-3.5",
        )}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] font-medium text-ink-500 pointer-events-none">
        {showPlus && value > 0 ? "+" : ""}
        {suffix}
      </span>
    </div>
  );
}

function RequiredToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-900">Required</div>
        <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
          Learners must complete this drill to finish the lesson.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex items-center h-6 w-11 rounded-full transition-colors shrink-0",
          value ? "bg-rose-500" : "bg-ink-200",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
  inputRef,
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onBullet,
  onOrdered,
  onCode,
  onLink,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrike: () => void;
  onBullet: () => void;
  onOrdered: () => void;
  onCode: () => void;
  onLink: () => void;
  max: number;
}) {
  return (
    <div className="rounded-[10px] border border-ink-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60 flex-wrap">
        <ParagraphPicker />
        <Divider />
        <ToolBtn icon={Bold}          label="Bold (**text**)"        onClick={onBold} />
        <ToolBtn icon={Italic}        label="Italic (*text*)"        onClick={onItalic} />
        <ToolBtn icon={Underline}     label="Underline (__text__)"   onClick={onUnderline} />
        <ToolBtn icon={Strikethrough} label="Strikethrough (~~~~)"   onClick={onStrike} />
        <Divider />
        <ToolBtn icon={List}          label="Bulleted list"          onClick={onBullet} />
        <ToolBtn icon={ListOrdered}   label="Numbered list"          onClick={onOrdered} />
        <Divider />
        <ToolBtn icon={Link2}         label="Insert link"            onClick={onLink} />
        <ToolBtn icon={Code}          label="Inline code (`code`)"   onClick={onCode} />
        <Divider />
        <ToolBtn icon={AlignLeft}     label="Align left (visual)"    onClick={() => undefined} disabled />
        <ToolBtn icon={AlignCenter}   label="Align center (visual)"  onClick={() => undefined} disabled />
        <ToolBtn icon={AlignRight}    label="Align right (visual)"   onClick={() => undefined} disabled />
        <span className="ml-auto" />
        <ToolBtn icon={MoreHorizontal} label="More" onClick={() => undefined} disabled />
      </div>

      {/* Body */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          rows={9}
          maxLength={max}
          placeholder="Write the detailed instructions learners will follow…"
          className="w-full px-3.5 py-3 pb-8 text-[13.5px] text-ink-900 placeholder:text-ink-400 resize-y focus:outline-none leading-relaxed bg-white"
        />
        <span className="absolute right-3 bottom-2 text-[11px] tabular-nums text-ink-400 select-none pointer-events-none">
          {value.length} / {max}
        </span>
      </div>
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "size-7 inline-flex items-center justify-center rounded-[6px] text-ink-600 hover:bg-cream-200 hover:text-ink-900 cursor-pointer",
        disabled && "opacity-40 hover:bg-transparent hover:text-ink-600 cursor-not-allowed",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function ParagraphPicker() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 h-7 px-2 rounded-[6px] text-[12px] font-medium text-ink-700 hover:bg-cream-200 cursor-default"
      title="Paragraph"
    >
      Paragraph
      <ChevronDown className="size-3" strokeWidth={2} />
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="w-px h-4 bg-ink-200 mx-1" />;
}

function ResourceRow({
  resource,
  onRemove,
}: {
  resource: DrillResource;
  onRemove: () => void;
}) {
  const palette: Record<DrillResource["ext"], { bg: string; fg: string; icon: LucideIcon }> = {
    pdf:  { bg: "bg-rose-50",    fg: "text-rose-600",    icon: FileText },
    docx: { bg: "bg-blue-50",    fg: "text-blue-600",    icon: FileText },
    xlsx: { bg: "bg-emerald-50", fg: "text-emerald-600", icon: FileSpreadsheet },
    link: { bg: "bg-cream-100",  fg: "text-ink-700",     icon: Link2 },
  };
  const p = palette[resource.ext];
  const Icon = p.icon;
  return (
    <li className="group flex items-center gap-3 px-3 py-2 rounded-[10px] border border-ink-100 bg-white">
      <span className={cn("size-9 rounded-[8px] inline-flex items-center justify-center shrink-0", p.bg, p.fg)}>
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-900 truncate">
          {resource.name}
        </div>
        <div className="text-[11px] text-ink-500 tabular-nums">
          {resource.ext.toUpperCase()} · {resource.size}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove resource"
        className="opacity-0 group-hover:opacity-100 size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-opacity"
      >
        <Trash2 className="size-3.5" strokeWidth={2} />
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Utilities
   ───────────────────────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
