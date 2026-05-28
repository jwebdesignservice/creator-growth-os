"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  GraduationCap,
  Sparkles,
  Info,
  BookOpen,
  Settings,
  Upload,
  Video,
  ListChecks,
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
  Trash2,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Star,
  Save,
  Loader2,
  AlertCircle,
  Database,
  X,
  Check,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  saveDrill,
  deleteDrill,
  type DrillData,
  type DrillRow,
  type SubmissionType,
  type Difficulty,
} from "./drill-actions";

/* ─────────────────────────────────────────────────────────────────────────
   Creator drill tab — fully backend-connected.

   - Server hands down `initialDrill` (or null on first load).
   - All edits are local + dirty-tracked; "Save drill" upserts via the
     `saveDrill` server action.
   - Cmd/Ctrl-S triggers Save.
   - Unsaved-changes guard fires on tab/page leave.
   - If the migration is still pending the tab surfaces a one-banner
     "Apply migration" prompt instead of a half-functional form.
   ───────────────────────────────────────────────────────────────────────── */

const SUBMISSION_OPTIONS: {
  value: SubmissionType;
  label: string;
  help: string;
  icon: LucideIcon;
}[] = [
  { value: "text",     label: "Text response", help: "Free-form text — hooks, scripts, reflections.",      icon: FileText },
  { value: "url",      label: "URL link",      help: "A link to their work (Notion, Drive, social post).", icon: Link2 },
  { value: "file",     label: "File upload",   help: "PDF, DOCX, image, or video they create.",            icon: Upload },
  { value: "video",    label: "Video upload",  help: "A direct video upload they record.",                 icon: Video },
  { value: "checkbox", label: "Confirmation",  help: "Just confirms they completed the task.",             icon: ListChecks },
];

/* Sensible defaults for a brand-new drill — admins can edit anything. */
const DEFAULT_DRILL: DrillData = {
  title:               "",
  linkedLearningPoint: "",
  objective:           "",
  instructions:        "",
  submissionType:      "text",
  difficulty:          "easy",
  estimatedMinutes:    15,
  rewardPoints:        10,
  required:            true,
  taskSteps:           [],
  successCriteria:     [],
  resources:           [],
};

/* Field limits — kept in lock-step with server validation. */
const TITLE_MAX = 200;
const OBJECTIVE_MAX = 500;
const INSTRUCTIONS_MAX = 5000;

/* ─────────────────────────────────────────────────────────────────────────
   Public types
   ───────────────────────────────────────────────────────────────────────── */

export type DrillTabProps = {
  lessonId:      string;
  lessonTitle:   string;
  slug:          string;
  initialDrill:  DrillRow | null;
  tableMissing:  boolean;
  videoSlot?:    ReactNode;
};

/* ──────────────────────────────────────────────────────────────────────── */

export function CreatorDrillTab({
  lessonId,
  lessonTitle,
  slug,
  initialDrill,
  tableMissing,
}: DrillTabProps) {
  function openLearnerPreview() {
    if (typeof window !== "undefined") {
      window.open(`/tutorials/${slug}`, "_blank", "noopener,noreferrer");
    }
  }
  /* Seed form state from server data. */
  const seed = initialDrill ?? {
    ...DEFAULT_DRILL,
    title: lessonTitle ? `Apply: ${lessonTitle}` : "",
    linkedLearningPoint: lessonTitle,
  };

  const [drill, setDrill] = useState<DrillData>(seed);
  /* Last-saved snapshot for dirty-tracking. JSON.stringify is plenty
     fast for a form this size and lets us avoid plumbing change tracking
     through every setter. */
  const [savedSnapshot, setSavedSnapshot] = useState<string>(
    JSON.stringify(seed),
  );
  const isDirty = useMemo(
    () => JSON.stringify(drill) !== savedSnapshot,
    [drill, savedSnapshot],
  );

  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "saved"; at: Date }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  /* ── Convenience setters — typed updaters keyed by field name. */
  function set<K extends keyof DrillData>(key: K, value: DrillData[K]) {
    setDrill((prev) => ({ ...prev, [key]: value }));
  }

  /* ── Save flow ───────────────────────────────────────────────────────── */
  const onSave = useCallback(() => {
    if (tableMissing) return;
    if (pending) return;
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res = await saveDrill(lessonId, drill);
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error });
        return;
      }
      // Round-trip the server's sanitized values back into state.
      const next: DrillData = {
        title:               res.drill.title,
        linkedLearningPoint: res.drill.linkedLearningPoint,
        objective:           res.drill.objective,
        instructions:        res.drill.instructions,
        submissionType:      res.drill.submissionType,
        difficulty:          res.drill.difficulty,
        estimatedMinutes:    res.drill.estimatedMinutes,
        rewardPoints:        res.drill.rewardPoints,
        required:            res.drill.required,
        taskSteps:           res.drill.taskSteps,
        successCriteria:     res.drill.successCriteria,
        resources:           res.drill.resources,
      };
      setDrill(next);
      setSavedSnapshot(JSON.stringify(next));
      setStatus({ kind: "saved", at: new Date() });
    });
  }, [tableMissing, pending, lessonId, drill]);

  /* ── Cmd/Ctrl-S keyboard shortcut. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSave]);

  /* ── Unsaved-changes guard. */
  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  /* ── Auto-clear "saved" toast after 4s. */
  useEffect(() => {
    if (status.kind !== "saved") return;
    const t = window.setTimeout(() => setStatus({ kind: "idle" }), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  /* ── Delete (kebab) ──────────────────────────────────────────────────── */
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!kebabOpen) return;
    function onClick(e: MouseEvent) {
      if (!kebabRef.current?.contains(e.target as Node)) setKebabOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [kebabOpen]);

  function onConfirmDelete() {
    setKebabOpen(false);
    startTransition(async () => {
      const res = await deleteDrill(lessonId);
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error });
        return;
      }
      setDrill(DEFAULT_DRILL);
      setSavedSnapshot(JSON.stringify(DEFAULT_DRILL));
      setStatus({ kind: "saved", at: new Date() });
      setConfirmDelete(false);
    });
  }

  /* ── AI assist — template-based suggestion generator. */
  function onAiAssist() {
    const titleSlug = (lessonTitle || "this lesson").trim();
    const next: DrillData = {
      ...drill,
      title: drill.title || `Apply: ${titleSlug}`,
      linkedLearningPoint:
        drill.linkedLearningPoint || titleSlug,
      objective:
        drill.objective ||
        `Learners will put the core idea from "${titleSlug}" into practice and produce one concrete artifact they can share or iterate on.`,
      instructions:
        drill.instructions ||
        `Follow the steps below to apply what you just learned.\n\n1. Re-watch the lesson and note the single biggest takeaway.\n2. Translate that takeaway into your own context (your niche, your audience).\n3. Produce one tangible output — a script, post, page, plan, or asset.\n4. Compare against the success criteria and refine before submitting.`,
    };
    setDrill(next);
  }

  /* ── Rich-text helpers (lightweight markdown-style) ──────────────────── */
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  function wrapSelection(prefix: string, suffix: string = prefix, placeholder = "") {
    const el = instructionsRef.current;
    if (!el) return;
    const start = el.selectionStart ?? drill.instructions.length;
    const end = el.selectionEnd ?? drill.instructions.length;
    const selected = drill.instructions.slice(start, end) || placeholder;
    const next =
      drill.instructions.slice(0, start) +
      prefix +
      selected +
      suffix +
      drill.instructions.slice(end);
    set("instructions", next);
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(pos, pos);
    });
  }
  function prefixLine(prefix: string) {
    const el = instructionsRef.current;
    if (!el) return;
    const start = el.selectionStart ?? drill.instructions.length;
    const lineStart =
      drill.instructions.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    set(
      "instructions",
      drill.instructions.slice(0, lineStart) +
        prefix +
        drill.instructions.slice(lineStart),
    );
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length;
      el.setSelectionRange(pos, pos);
    });
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  if (tableMissing) {
    return <MigrationPendingBanner />;
  }

  return (
    <>
      {/* Floating save toast (top-right of the viewport) */}
      <SaveToast
        status={status}
        onDismiss={() => setStatus({ kind: "idle" })}
      />

      <div className="space-y-5">
          {/* 1. Hero / intro card */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="size-11 rounded-[12px] bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0 ring-1 ring-rose-100">
                <GraduationCap className="size-5" strokeWidth={1.9} />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] font-bold text-ink-900 leading-tight">
                  Creator drill
                </h2>
                <p className="mt-1 text-[13px] text-ink-500 leading-relaxed max-w-2xl">
                  Define the hands-on action step learners must complete after
                  this lesson. A great drill reinforces learning and helps
                  learners apply what they&apos;ve just learned.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onAiAssist}
                  title="Pre-fill objective, instructions, steps, and criteria from the lesson context."
                  className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-gradient-to-br from-rose-50 to-rose-50/40 border border-rose-200 text-rose-700 text-[12.5px] font-semibold hover:from-rose-100 hover:to-rose-50 transition-colors"
                >
                  <Sparkles className="size-3.5" strokeWidth={2} fill="currentColor" />
                  AI assist
                </button>

                <div ref={kebabRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setKebabOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={kebabOpen}
                    aria-label="More drill actions"
                    className="size-10 rounded-[10px] inline-flex items-center justify-center border border-ink-200 bg-white text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                  >
                    <MoreHorizontal className="size-4" strokeWidth={2} />
                  </button>
                  {kebabOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+6px)] z-30 w-52 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setKebabOpen(false);
                          setConfirmDelete(true);
                        }}
                        disabled={!initialDrill}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                        Remove drill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Core information */}
          <section className="card p-5 sm:p-6">
            <SectionHeader
              icon={Info}
              title="Core information"
              action={
                isDirty ? (
                  <DirtyChip dirty={isDirty} hasRow={!!initialDrill} />
                ) : null
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Field
                label="Drill title"
                required
                help="A short, action-led name learners will see."
              >
                <CountedInput
                  value={drill.title}
                  onChange={(v) => set("title", v)}
                  placeholder="Give the drill a clear, action-led title"
                  max={TITLE_MAX}
                />
              </Field>

              <Field
                label="Linked learning point"
                required
                help="Which idea from the lesson does this drill reinforce?"
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none"
                  >
                    <BookOpen className="size-3.5" strokeWidth={2} />
                  </span>
                  <input
                    type="text"
                    value={drill.linkedLearningPoint}
                    onChange={(e) =>
                      set("linkedLearningPoint", e.target.value.slice(0, 200))
                    }
                    placeholder="e.g. Create hook-driven content that stops the scroll"
                    className="w-full h-11 pl-9 pr-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-5">
              <Field
                label="Drill objective"
                required
                help="One sentence — the outcome learners walk away with."
              >
                <CountedInput
                  value={drill.objective}
                  onChange={(v) => set("objective", v)}
                  placeholder="What outcome should learners walk away with?"
                  max={OBJECTIVE_MAX}
                />
              </Field>
            </div>
          </section>

          {/* 3. Instructions */}
          <section className="card p-5 sm:p-6">
            <SectionHeader icon={BookOpen} title="Instructions" />
            <Field
              label="Detailed instructions"
              required
              help="Markdown is supported (**bold**, *italic*, lists, [links](url))."
            >
              <RichTextEditor
                value={drill.instructions}
                onChange={(v) => set("instructions", v)}
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
          </section>

          {/* 4. Completion settings */}
          <section className="card p-5 sm:p-6">
            <SectionHeader icon={Settings} title="Completion settings" />
            <div className="space-y-5">
              <Field
                label="Submission type"
                required
                help="How learners will submit their response."
              >
                <SubmissionTilePicker
                  value={drill.submissionType}
                  onChange={(v) => set("submissionType", v)}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field
                  label="Difficulty"
                  required
                  help="How challenging is this drill for learners?"
                >
                  <DifficultyPicker
                    value={drill.difficulty}
                    onChange={(v) => set("difficulty", v)}
                  />
                </Field>

                <Field label="Estimated time" help="How long should this take?">
                  <SuffixedNumberInput
                    value={drill.estimatedMinutes}
                    onChange={(v) => set("estimatedMinutes", v)}
                    suffix="min"
                    min={1}
                    max={999}
                  />
                </Field>

                <Field
                  label="Reward / points"
                  help="Incentive for completing this drill."
                >
                  <SuffixedNumberInput
                    value={drill.rewardPoints}
                    onChange={(v) => set("rewardPoints", v)}
                    suffix="pts"
                    leadingIcon={<Star className="size-3.5 text-amber-500" strokeWidth={2} fill="currentColor" />}
                    showPlus
                    min={0}
                    max={9999}
                  />
                </Field>
              </div>

              <RequiredToggle
                value={drill.required}
                onChange={(v) => set("required", v)}
              />
            </div>
          </section>

        {/* Footer action bar — Save / Preview live here now that the
            right rail (video + drill readiness + tips) has been removed.
            Cmd/Ctrl-S still saves while editing. */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={openLearnerPreview}
            className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={pending || (!isDirty && !!initialDrill)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[12px] text-[13px] font-semibold transition-colors shadow-sm",
              isDirty || !initialDrill
                ? "bg-rose-600 hover:bg-rose-700 text-white disabled:bg-rose-300"
                : "bg-success-bg text-success border border-success/20 cursor-default",
            )}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : isDirty || !initialDrill ? (
              <Save className="size-4" strokeWidth={2} />
            ) : (
              <Check className="size-4" strokeWidth={2.5} />
            )}
            {pending
              ? "Saving…"
              : isDirty
                ? initialDrill
                  ? "Save changes"
                  : "Save drill"
                : initialDrill
                  ? "All saved"
                  : "Save drill"}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          title={drill.title || "this drill"}
          pending={pending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={onConfirmDelete}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right-rail cards
   ───────────────────────────────────────────────────────────────────────── */

export type DrillReadiness = {
  percent: number;
  checks: { key: string; label: string; done: boolean }[];
};

export function deriveDrillReadiness(args: {
  drillTitle: string;
  objective: string;
  steps: number;
  submissionTypeChosen: boolean;
  resources: number;
  saved: boolean;
}): DrillReadiness {
  const checks = [
    { key: "title",       label: "Drill title added",         done: args.drillTitle.trim().length > 0 },
    { key: "objective",   label: "Objective complete",        done: args.objective.trim().length > 12 },
    { key: "steps",       label: "Steps added",               done: args.steps >= 1 },
    { key: "submission",  label: "Submission type selected",  done: args.submissionTypeChosen },
    { key: "resources",   label: "Resources attached",        done: args.resources > 0 },
    { key: "ready",       label: "Saved & ready",             done: args.saved },
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, percent: Math.round((done / checks.length) * 100) };
}

export function DrillReadinessCard({
  readiness,
  onSave,
  onPreview,
  saving,
  isDirty,
  hasInitialDrill,
}: {
  readiness: DrillReadiness;
  onSave: () => void;
  onPreview: () => void;
  saving: boolean;
  isDirty: boolean;
  hasInitialDrill: boolean;
}) {
  const saveLabel = saving
    ? "Saving…"
    : isDirty
      ? hasInitialDrill
        ? "Save changes"
        : "Save drill"
      : hasInitialDrill
        ? "All saved"
        : "Save drill";

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
          onClick={onPreview}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <Eye className="size-3.5" strokeWidth={2} />
          Preview
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || (!isDirty && hasInitialDrill)}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-[10px] text-[12.5px] font-semibold transition-colors",
            isDirty || !hasInitialDrill
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:bg-rose-300"
              : "bg-success-bg text-success border border-success/20 cursor-default",
          )}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : isDirty || !hasInitialDrill ? (
            <Save className="size-3.5" strokeWidth={2} />
          ) : (
            <Check className="size-3.5" strokeWidth={2.5} />
          )}
          {saveLabel}
        </button>
      </div>
    </section>
  );
}

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
          className="transition-[stroke-dasharray] duration-500 ease-out"
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
          <span aria-hidden className="text-rose-400 mt-[2px]">•</span>
          Keep each step short, specific, and verb-led.
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden className="text-rose-400 mt-[2px]">•</span>
          Spell out success criteria so learners know when they&apos;re done.
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden className="text-rose-400 mt-[2px]">•</span>
          Attach an example or template whenever possible.
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden className="text-rose-400 mt-[2px]">•</span>
          Use <kbd className="px-1 py-0.5 rounded bg-cream-100 border border-ink-200 text-[10.5px] font-mono">⌘S</kbd> to save while you edit.
        </li>
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Small composables
   ───────────────────────────────────────────────────────────────────────── */

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-semibold text-ink-900">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {children}
      {help && (
        <p className="text-[11px] text-ink-500 leading-snug">{help}</p>
      )}
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

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-8 rounded-full bg-rose-50 text-rose-600 inline-flex items-center justify-center ring-1 ring-rose-100 shrink-0">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h3 className="text-[15px] font-bold text-ink-900 truncate">{title}</h3>
      </div>
      {action ?? null}
    </header>
  );
}

function SubmissionTilePicker({
  value,
  onChange,
}: {
  value: SubmissionType;
  onChange: (v: SubmissionType) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {SUBMISSION_OPTIONS.map((o) => {
        const active = value === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            title={o.help}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 h-[96px] px-2.5 rounded-[12px] border text-center transition-colors",
              active
                ? "border-rose-300 bg-rose-50/70 shadow-[inset_0_0_0_1px_var(--rose-200,#fecdd3)]"
                : "border-ink-200 bg-white hover:border-rose-200 hover:bg-rose-50/30",
            )}
          >
            {active && (
              <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-rose-500 text-white inline-flex items-center justify-center shadow-sm">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
            <span
              className={cn(
                "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
                active ? "bg-rose-100 text-rose-600" : "bg-cream-100 text-ink-500",
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <span
              className={cn(
                "text-[12px] font-semibold leading-tight",
                active ? "text-rose-700" : "text-ink-700",
              )}
            >
              {o.label}
            </span>
          </button>
        );
      })}
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
                ? "bg-rose-100 text-rose-700 shadow-[inset_0_0_0_1px_var(--rose-200,#fecdd3)]"
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
    <div
      className={cn(
        "flex items-start gap-3 rounded-[10px] p-3 transition-colors",
        value ? "bg-rose-50/60 border border-rose-100" : "bg-white border border-ink-100",
      )}
    >
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
    <div className="rounded-[10px] border border-ink-200 bg-white overflow-hidden focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-colors">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60 flex-wrap">
        <ToolBtn icon={Bold}          label="Bold"          onClick={onBold} />
        <ToolBtn icon={Italic}        label="Italic"        onClick={onItalic} />
        <ToolBtn icon={Underline}     label="Underline"     onClick={onUnderline} />
        <ToolBtn icon={Strikethrough} label="Strikethrough" onClick={onStrike} />
        <Divider />
        <ToolBtn icon={List}        label="Bulleted list" onClick={onBullet} />
        <ToolBtn icon={ListOrdered} label="Numbered list" onClick={onOrdered} />
        <Divider />
        <ToolBtn icon={Link2} label="Insert link" onClick={onLink} />
        <ToolBtn icon={Code}  label="Inline code" onClick={onCode} />
        <Divider />
        <ToolBtn icon={AlignLeft}   label="Align left (visual)"   onClick={() => undefined} disabled />
        <ToolBtn icon={AlignCenter} label="Align center (visual)" onClick={() => undefined} disabled />
        <ToolBtn icon={AlignRight}  label="Align right (visual)"  onClick={() => undefined} disabled />
        <span className="ml-auto" />
        <ToolBtn icon={MoreHorizontal} label="More" onClick={() => undefined} disabled />
      </div>

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

function Divider() {
  return <span aria-hidden className="w-px h-4 bg-ink-200 mx-1" />;
}

function DirtyChip({ dirty, hasRow }: { dirty: boolean; hasRow: boolean }) {
  if (!dirty && hasRow) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
        <Check className="size-3" strokeWidth={2.5} />
        Saved
      </span>
    );
  }
  if (!dirty && !hasRow) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-400">
        Not saved yet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
      <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
      Unsaved changes
    </span>
  );
}

function SaveToast({
  status,
  onDismiss,
}: {
  status:
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "saved"; at: Date }
    | { kind: "error"; message: string };
  onDismiss: () => void;
}) {
  if (status.kind === "idle") return null;
  if (status.kind === "saving") {
    return (
      <div className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-white border border-ink-100 shadow-card text-[12.5px] text-ink-700">
        <Loader2 className="size-3.5 animate-spin text-rose-500" strokeWidth={2} />
        Saving drill…
      </div>
    );
  }
  if (status.kind === "saved") {
    return (
      <div className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-success-bg border border-success/20 text-success text-[12.5px] font-semibold shadow-card">
        <Check className="size-3.5" strokeWidth={2.5} />
        Drill saved
      </div>
    );
  }
  return (
    <div className="fixed top-6 right-6 z-50 inline-flex items-start gap-2 px-4 py-3 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px] shadow-card max-w-sm">
      <AlertCircle className="size-3.5 mt-[2px] shrink-0" strokeWidth={2} />
      <span className="flex-1 leading-snug">
        <span className="block font-semibold">Save failed</span>
        <span className="block text-rose-600/90">{status.message}</span>
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="size-5 inline-flex items-center justify-center rounded-full hover:bg-rose-100"
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
}

function ConfirmDeleteDialog({
  title,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [pending, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Remove drill"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-[2px]"
      onClick={() => !pending && onCancel()}
    >
      <div
        className="w-full max-w-[440px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="size-10 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Trash2 className="size-4" strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-ink-900">Remove drill?</h3>
              <p className="text-[12.5px] text-ink-500 mt-1 leading-snug">
                The drill <strong className="text-ink-900">&ldquo;{title}&rdquo;</strong>{" "}
                will be permanently removed from this lesson. Learners will no
                longer have an action step to complete. This can&apos;t be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold disabled:bg-rose-300"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Trash2 className="size-3.5" strokeWidth={2} />
              )}
              Remove drill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MigrationPendingBanner() {
  return (
    <div className="card p-8 text-center max-w-3xl mx-auto">
      <span className="size-12 rounded-[14px] bg-amber-100 text-amber-700 inline-flex items-center justify-center mb-3">
        <Database className="size-6" strokeWidth={1.8} />
      </span>
      <h2 className="text-[18px] font-bold text-ink-900">
        Apply migration 0031 to enable the drill editor
      </h2>
      <p className="mt-2 text-[13px] text-ink-500 max-w-xl mx-auto leading-relaxed">
        The <code className="px-1 py-0.5 rounded bg-cream-100 text-rose-700 font-mono text-[11.5px]">lesson_drills</code> table
        doesn&apos;t exist in your live Supabase project yet. Open the SQL editor and run the
        consolidated migration at{" "}
        <code className="px-1 py-0.5 rounded bg-cream-100 font-mono text-[11.5px]">supabase/APPLY_THIS_IN_SUPABASE_STUDIO.sql</code>{" "}
        — it includes 0027, 0029, 0030, and 0031 in order. Refresh this page after running and the drill editor will load.
      </p>
      <a
        href="https://supabase.com/dashboard/project/mierwogzdiplwpksaoka/sql"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold mt-4"
      >
        Open Supabase SQL editor →
      </a>
    </div>
  );
}
