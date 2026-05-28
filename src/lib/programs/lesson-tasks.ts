/* ─────────────────────────────────────────────────────────────────────────
   Shared types + normaliser for per-lesson Tasks.

   A lesson task is an action item a learner completes for the lesson —
   title + optional details + a type + a "required" flag + a time estimate.
   Authored in the admin lesson editor (section D) and rendered on the
   learner lesson page.

   Persisted in the `lessons.action_steps` jsonb column (created in migration
   0036). That column was freed when per-learning-point action steps moved
   inside `learning_points`, so we reuse it for lesson tasks — no new
   migration required. Saves degrade gracefully (see saveVideoLesson) if the
   column isn't present yet.

   React-free on purpose so the `"use server"` actions file can import the
   types + normaliser.
   ───────────────────────────────────────────────────────────────────────── */

export const LESSON_TASK_TYPES = [
  "action",
  "reflection",
  "upload",
  "quiz",
] as const;

export type LessonTaskType = (typeof LESSON_TASK_TYPES)[number];

export const DEFAULT_TASK_TYPE: LessonTaskType = "action";

export function isLessonTaskType(v: unknown): v is LessonTaskType {
  return typeof v === "string" && (LESSON_TASK_TYPES as readonly string[]).includes(v);
}

export type LessonTask = {
  id: string;
  title: string;
  description: string;
  type: LessonTaskType;
  required: boolean;
  /** Estimated minutes to complete. 0 = unset / not shown. */
  estimatedMinutes: number;
};

export const TASK_TITLE_MAX = 200;
export const TASK_DESC_MAX = 600;
export const MAX_TASKS = 30;
export const TASK_MINUTES_MAX = 600;

let _seq = 0;
function genId(): string {
  _seq += 1;
  return `lt-${Date.now().toString(36)}-${_seq}`;
}

function clampMinutes(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(TASK_MINUTES_MAX, Math.floor(n));
}

/**
 * Coerce raw jsonb (from the DB) or client state into clean LessonTask[].
 *
 * Tolerant by design:
 *  - legacy bare-string entries become titled "action" tasks;
 *  - legacy `{ title, description }` action-step shapes upgrade cleanly;
 *  - unknown type falls back to the default;
 *  - empty-title entries are dropped;
 *  - capped at MAX_TASKS.
 */
export function normalizeLessonTasks(raw: unknown): LessonTask[] {
  if (!Array.isArray(raw)) return [];
  const out: LessonTask[] = [];

  for (const item of raw) {
    if (out.length >= MAX_TASKS) break;

    if (typeof item === "string") {
      const title = item.trim().slice(0, TASK_TITLE_MAX);
      if (!title) continue;
      out.push({
        id: genId(),
        title,
        description: "",
        type: DEFAULT_TASK_TYPE,
        required: false,
        estimatedMinutes: 0,
      });
      continue;
    }

    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? "").trim().slice(0, TASK_TITLE_MAX);
    if (!title) continue;

    out.push({
      id: typeof o.id === "string" && o.id ? o.id : genId(),
      title,
      description: String(o.description ?? "").slice(0, TASK_DESC_MAX),
      type: isLessonTaskType(o.type) ? o.type : DEFAULT_TASK_TYPE,
      required: Boolean(o.required),
      estimatedMinutes: clampMinutes(o.estimatedMinutes),
    });
  }

  return out;
}
