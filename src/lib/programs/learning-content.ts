/* ─────────────────────────────────────────────────────────────────────────
   Shared types + normaliser for per-lesson "What you'll learn" content.

   A learning point is a structured card — icon + title + description — that
   can carry one optional action step. This is authored in the admin lesson
   editor (section C) and rendered on the learner lesson page. Stored in the
   `lessons.learning_points` jsonb column (migration 0036).

   React-free on purpose so the `"use server"` actions file can import the
   types + normaliser. The icon → component map lives where it renders (the
   editor and the public lesson page each keep a small inline map keyed by
   the keys below).
   ───────────────────────────────────────────────────────────────────────── */

export const LEARNING_ICON_KEYS = [
  "target",
  "layers",
  "anchor",
  "users",
  "trending-up",
  "lightbulb",
  "rocket",
  "book-open",
  "sparkles",
  "zap",
  "pencil",
  "video",
  "megaphone",
  "heart",
  "dollar-sign",
] as const;

export type LearningIconKey = (typeof LEARNING_ICON_KEYS)[number];

export const DEFAULT_LEARNING_ICON: LearningIconKey = "target";

export function isLearningIconKey(v: unknown): v is LearningIconKey {
  return typeof v === "string" && (LEARNING_ICON_KEYS as readonly string[]).includes(v);
}

export type LearningActionStep = {
  title: string;
  description: string;
};

export type LearningPoint = {
  id: string;
  icon: LearningIconKey;
  title: string;
  description: string;
  actionStep: LearningActionStep | null;
};

export const TITLE_MAX = 200;
export const DESC_MAX = 600;
export const MAX_POINTS = 30;

let _seq = 0;
function genId(): string {
  _seq += 1;
  return `lp-${Date.now().toString(36)}-${_seq}`;
}

/**
 * Coerce raw jsonb (from the DB) or client state into clean LearningPoint[].
 *
 * Tolerant by design:
 *  - legacy plain-string entries (`["Define your niche", …]`) become titled
 *    points with the default icon and no action step;
 *  - unknown icon keys fall back to the default;
 *  - empty-title entries are dropped;
 *  - capped at MAX_POINTS.
 *
 * Used both to hydrate the editor / public page and to sanitise on save.
 */
export function normalizeLearningPoints(raw: unknown): LearningPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: LearningPoint[] = [];

  for (const item of raw) {
    if (out.length >= MAX_POINTS) break;

    // Legacy: a bare string learning outcome.
    if (typeof item === "string") {
      const title = item.trim().slice(0, TITLE_MAX);
      if (!title) continue;
      out.push({
        id: genId(),
        icon: DEFAULT_LEARNING_ICON,
        title,
        description: "",
        actionStep: null,
      });
      continue;
    }

    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? "").trim().slice(0, TITLE_MAX);
    if (!title) continue;

    const icon = isLearningIconKey(o.icon) ? o.icon : DEFAULT_LEARNING_ICON;
    const description = String(o.description ?? "").slice(0, DESC_MAX);

    let actionStep: LearningActionStep | null = null;
    const as = o.actionStep;
    if (as && typeof as === "object") {
      const ao = as as Record<string, unknown>;
      const at = String(ao.title ?? "").trim().slice(0, TITLE_MAX);
      if (at) {
        actionStep = {
          title: at,
          description: String(ao.description ?? "").slice(0, DESC_MAX),
        };
      }
    }

    out.push({
      id: typeof o.id === "string" && o.id ? o.id : genId(),
      icon,
      title,
      description,
      actionStep,
    });
  }

  return out;
}
