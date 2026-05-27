"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions backing the Creator drill tab of the tutorial editor.
   - loadDrill   : read the drill row for a lesson (null if none yet)
   - saveDrill   : upsert the full drill in one shot
   - deleteDrill : remove the drill so the lesson has no required action
   ───────────────────────────────────────────────────────────────────────── */

export type SubmissionType = "text" | "url" | "file" | "video" | "checkbox";
export type Difficulty = "easy" | "medium" | "advanced";

export type DrillStep = { id: string; text: string };
export type DrillResource = {
  id:   string;
  name: string;
  ext:  "pdf" | "docx" | "xlsx" | "link";
  size: string;
  url?: string;
};

export type DrillData = {
  title:               string;
  linkedLearningPoint: string;
  objective:           string;
  instructions:        string;
  submissionType:      SubmissionType;
  difficulty:          Difficulty;
  estimatedMinutes:    number;
  rewardPoints:        number;
  required:            boolean;
  taskSteps:           DrillStep[];
  successCriteria:     string[];
  resources:           DrillResource[];
};

export type DrillRow = DrillData & { id: string; lessonId: string };

type LoadResult =
  | { ok: true;  drill: DrillRow | null }
  | { ok: false; error: string; missingTable?: boolean };

type SaveResult =
  | { ok: true;  drill: DrillRow }
  | { ok: false; error: string; missingTable?: boolean };

type SimpleResult =
  | { ok: true }
  | { ok: false; error: string };

/* ─────────────────────────────────────────────────────────────────────────
   Load
   ───────────────────────────────────────────────────────────────────────── */

export async function loadDrill(lessonId: string): Promise<LoadResult> {
  if (!lessonId) return { ok: false, error: "Missing lesson id." };
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("lesson_drills")
    .select(
      "id, lesson_id, title, linked_learning_point, objective, instructions, submission_type, difficulty, estimated_minutes, reward_points, required, task_steps, success_criteria, resources",
    )
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    // 42P01 = undefined_table — migration 0031 not applied yet.
    if (error.code === "42P01") {
      return { ok: false, error: error.message, missingTable: true };
    }
    return { ok: false, error: error.message };
  }
  if (!data) return { ok: true, drill: null };

  return { ok: true, drill: rowToDrill(data) };
}

/* ─────────────────────────────────────────────────────────────────────────
   Save (upsert)
   ───────────────────────────────────────────────────────────────────────── */

export async function saveDrill(
  lessonId: string,
  data: DrillData,
): Promise<SaveResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  if (!lessonId) return { ok: false, error: "Missing lesson id." };

  const validation = validateDrill(data);
  if (validation) return { ok: false, error: validation };

  const {
    data: { user: adminUser },
  } = await guard.supabase.auth.getUser();

  const service = createServiceClient();

  const payload = {
    lesson_id:             lessonId,
    title:                 data.title.trim(),
    linked_learning_point: data.linkedLearningPoint.trim(),
    objective:             data.objective.trim(),
    instructions:          data.instructions,
    submission_type:       data.submissionType,
    difficulty:            data.difficulty,
    estimated_minutes:     clampInt(data.estimatedMinutes, 1, 999),
    reward_points:         clampInt(data.rewardPoints, 0, 9999),
    required:              !!data.required,
    task_steps:            sanitizeSteps(data.taskSteps),
    success_criteria:      sanitizeCriteria(data.successCriteria),
    resources:             sanitizeResources(data.resources),
    created_by:            adminUser?.id ?? null,
  };

  const { data: saved, error } = await service
    .from("lesson_drills")
    .upsert(payload, { onConflict: "lesson_id" })
    .select(
      "id, lesson_id, title, linked_learning_point, objective, instructions, submission_type, difficulty, estimated_minutes, reward_points, required, task_steps, success_criteria, resources",
    )
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return { ok: false, error: error.message, missingTable: true };
    }
    return { ok: false, error: error.message };
  }
  if (!saved) {
    return { ok: false, error: "Save returned no row — check Supabase logs." };
  }

  revalidatePath(`/admin/tutorials/${lessonId}`);
  return { ok: true, drill: rowToDrill(saved) };
}

/* ─────────────────────────────────────────────────────────────────────────
   Delete — used by the kebab "Remove drill" action
   ───────────────────────────────────────────────────────────────────────── */

export async function deleteDrill(lessonId: string): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  const { error } = await service
    .from("lesson_drills")
    .delete()
    .eq("lesson_id", lessonId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/tutorials/${lessonId}`);
  return { ok: true };
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

type DbRow = Record<string, unknown>;

function rowToDrill(r: DbRow): DrillRow {
  return {
    id:                  r.id as string,
    lessonId:            r.lesson_id as string,
    title:               (r.title as string) ?? "",
    linkedLearningPoint: (r.linked_learning_point as string) ?? "",
    objective:           (r.objective as string) ?? "",
    instructions:        (r.instructions as string) ?? "",
    submissionType:      (r.submission_type as SubmissionType) ?? "text",
    difficulty:          (r.difficulty as Difficulty) ?? "easy",
    estimatedMinutes:    (r.estimated_minutes as number) ?? 15,
    rewardPoints:        (r.reward_points as number) ?? 10,
    required:            (r.required as boolean) ?? true,
    taskSteps:           sanitizeSteps(r.task_steps),
    successCriteria:     sanitizeCriteria(r.success_criteria),
    resources:           sanitizeResources(r.resources),
  };
}

function validateDrill(d: DrillData): string | null {
  if (!d.title.trim()) return "Drill title is required.";
  if (d.title.trim().length > 200) return "Drill title is too long.";
  if (d.objective.length > 500) return "Objective is too long.";
  if (d.instructions.length > 5000) return "Instructions are too long.";
  if (!["text", "url", "file", "video", "checkbox"].includes(d.submissionType)) {
    return "Invalid submission type.";
  }
  if (!["easy", "medium", "advanced"].includes(d.difficulty)) {
    return "Invalid difficulty.";
  }
  if (!Number.isFinite(d.estimatedMinutes) || d.estimatedMinutes < 0) {
    return "Estimated minutes must be a positive number.";
  }
  if (!Number.isFinite(d.rewardPoints) || d.rewardPoints < 0) {
    return "Reward points must be ≥ 0.";
  }
  if (d.taskSteps.length > 50) return "Too many task steps (max 50).";
  if (d.successCriteria.length > 20) {
    return "Too many success criteria (max 20).";
  }
  if (d.resources.length > 25) return "Too many resources (max 25).";
  return null;
}

function clampInt(n: unknown, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

function sanitizeSteps(raw: unknown): DrillStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s, i) => {
      if (!s || typeof s !== "object") return null;
      const obj = s as Record<string, unknown>;
      const text = String(obj.text ?? "").slice(0, 500);
      if (!text.trim()) return null;
      const id =
        typeof obj.id === "string" && obj.id ? obj.id : `s-${Date.now()}-${i}`;
      return { id, text };
    })
    .filter((s): s is DrillStep => s !== null)
    .slice(0, 50);
}

function sanitizeCriteria(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => String(c ?? "").slice(0, 300).trim())
    .filter((c) => c.length > 0)
    .slice(0, 20);
}

function sanitizeResources(raw: unknown): DrillResource[] {
  if (!Array.isArray(raw)) return [];
  const out: DrillResource[] = [];
  for (let i = 0; i < raw.length && out.length < 25; i++) {
    const r = raw[i];
    if (!r || typeof r !== "object") continue;
    const obj = r as Record<string, unknown>;
    const name = String(obj.name ?? "").slice(0, 200).trim();
    if (!name) continue;
    const extRaw = String(obj.ext ?? "link").toLowerCase();
    const ext: DrillResource["ext"] =
      extRaw === "pdf" || extRaw === "docx" || extRaw === "xlsx"
        ? extRaw
        : "link";
    const item: DrillResource = {
      id:   typeof obj.id === "string" && obj.id ? obj.id : `r-${Date.now()}-${i}`,
      name,
      ext,
      size: String(obj.size ?? "").slice(0, 50),
    };
    if (typeof obj.url === "string") item.url = obj.url.slice(0, 2000);
    out.push(item);
  }
  return out;
}
