"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";

type Result = { ok: true } | { ok: false; error: string };

/* ═════════════════════════════════════════════════════════════════════ */
/* Modules                                                                */
/* ═════════════════════════════════════════════════════════════════════ */

/**
 * Create a new module on a program. Auto-assigns the next sequential
 * `number` if the caller doesn't pin one. Title is required.
 */
export async function createModule(
  programId: string,
  input: { title: string; number?: number; bonus?: boolean; pro_only?: boolean },
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  if (!programId) return { ok: false, error: "Missing program id." };
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Module title is required." };

  let number = input.number;
  if (number === undefined) {
    const { data: max } = await ctx.supabase
      .from("program_modules")
      .select("number")
      .eq("program_id", programId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    number = (max?.number ?? 0) + 1;
  }

  const { error } = await ctx.supabase.from("program_modules").insert({
    program_id: programId,
    number,
    title,
    bonus: input.bonus ?? false,
    pro_only: input.pro_only ?? false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}

/**
 * Rename a module + cascade the title onto every lesson that uses this
 * module's number (lessons store module_title as a denormalized copy for
 * fast reads).
 */
export async function renameModule(
  moduleId: string,
  newTitle: string,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = newTitle.trim();
  if (!title) return { ok: false, error: "Module title cannot be empty." };

  // Need the program_id + number to cascade to lessons.
  const { data: mod, error: readErr } = await ctx.supabase
    .from("program_modules")
    .select("id, program_id, number")
    .eq("id", moduleId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!mod) return { ok: false, error: "Module not found." };

  const { error: upd1 } = await ctx.supabase
    .from("program_modules")
    .update({ title })
    .eq("id", moduleId);
  if (upd1) return { ok: false, error: upd1.message };

  // Cascade to lessons that store this module's title denormalized.
  const { error: upd2 } = await ctx.supabase
    .from("lessons")
    .update({ module_title: title })
    .eq("program_id", mod.program_id)
    .eq("module_number", mod.number);
  if (upd2) return { ok: false, error: upd2.message };

  revalidatePath(`/admin/programs/${mod.program_id}/curriculum`);
  revalidatePath(`/admin/programs/${mod.program_id}`);
  return { ok: true };
}

/**
 * Delete a module. By default, deletes the module *and all its lessons*
 * (cascade behavior). If `keepLessons=true` the lessons are detached from
 * the module (module_number set to null) so they survive as standalone.
 */
export async function deleteModule(
  moduleId: string,
  opts: { keepLessons?: boolean } = {},
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { data: mod, error: readErr } = await ctx.supabase
    .from("program_modules")
    .select("id, program_id, number")
    .eq("id", moduleId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!mod) return { ok: false, error: "Module not found." };

  if (opts.keepLessons) {
    const { error: detach } = await ctx.supabase
      .from("lessons")
      .update({ module_number: null, module_title: null })
      .eq("program_id", mod.program_id)
      .eq("module_number", mod.number);
    if (detach) return { ok: false, error: detach.message };
  } else {
    const { error: del } = await ctx.supabase
      .from("lessons")
      .delete()
      .eq("program_id", mod.program_id)
      .eq("module_number", mod.number);
    if (del) return { ok: false, error: del.message };
  }

  const { error } = await ctx.supabase
    .from("program_modules")
    .delete()
    .eq("id", moduleId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/programs/${mod.program_id}/curriculum`);
  revalidatePath(`/admin/programs/${mod.program_id}`);
  return { ok: true };
}

/**
 * Bulk-reorder modules. Numbers are re-assigned in the order the items are
 * passed (1, 2, 3 …). Lesson denormalized `module_number` fields are kept
 * in sync.
 */
export async function reorderModules(
  programId: string,
  orderedIds: string[],
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };

  // Fetch current numbers so we know what to migrate lessons from.
  const { data: existing } = await ctx.supabase
    .from("program_modules")
    .select("id, number")
    .eq("program_id", programId);
  const oldNumberById = new Map(
    (existing ?? []).map((m) => [m.id, m.number] as const),
  );

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]!;
    const newNumber = i + 1;
    const oldNumber = oldNumberById.get(id);
    if (oldNumber === newNumber) continue;

    const { error: mErr } = await ctx.supabase
      .from("program_modules")
      .update({ number: newNumber })
      .eq("id", id);
    if (mErr) return { ok: false, error: mErr.message };

    if (oldNumber !== undefined) {
      const { error: lErr } = await ctx.supabase
        .from("lessons")
        .update({ module_number: newNumber })
        .eq("program_id", programId)
        .eq("module_number", oldNumber);
      if (lErr) return { ok: false, error: lErr.message };
    }
  }

  revalidatePath(`/admin/programs/${programId}/curriculum`);
  revalidatePath(`/admin/programs/${programId}`);
  return { ok: true };
}

/* ═════════════════════════════════════════════════════════════════════ */
/* Add a lesson to a module                                               */
/* ═════════════════════════════════════════════════════════════════════ */

export type AddLessonInput = {
  programId: string;
  moduleId: string;
  title: string;
  slug?: string;
  description?: string;
  videoUrl?: string;
  durationSeconds?: number;
  planAccess?: "free" | "basic" | "pro";
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Create a lesson inside a given module. Auto-derives slug from title if
 * not provided + auto-assigns sort_order (last in the module).
 */
export async function addLessonToModule(
  input: AddLessonInput,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Lesson title is required." };

  const { data: mod, error: modErr } = await ctx.supabase
    .from("program_modules")
    .select("id, program_id, number, title")
    .eq("id", input.moduleId)
    .maybeSingle();
  if (modErr) return { ok: false, error: modErr.message };
  if (!mod) return { ok: false, error: "Module not found." };
  if (mod.program_id !== input.programId) {
    return { ok: false, error: "Module belongs to a different program." };
  }

  let slug = (input.slug ?? slugify(title)).trim().toLowerCase();
  if (!slug) slug = slugify(title) || `lesson-${Date.now()}`;

  // Compute next sort_order (last in this module + 1).
  const { data: last } = await ctx.supabase
    .from("lessons")
    .select("sort_order")
    .eq("program_id", input.programId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (last?.sort_order ?? 0) + 1;

  const { error } = await ctx.supabase.from("lessons").insert({
    program_id: input.programId,
    slug,
    title,
    description: input.description?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
    duration_seconds: input.durationSeconds ?? 0,
    plan_access: input.planAccess ?? "basic",
    module_number: mod.number,
    module_title: mod.title,
    sort_order: sortOrder,
    content_type: "video",
    published: false,
  });
  if (error) {
    // Likely a unique-slug collision — surface a helpful message.
    if (/duplicate key/i.test(error.message)) {
      return { ok: false, error: "Slug already in use. Try a different one." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/programs/${input.programId}/curriculum`);
  revalidatePath(`/admin/programs/${input.programId}`);
  revalidatePath("/admin/tutorials");
  return { ok: true };
}

/* ═════════════════════════════════════════════════════════════════════ */
/* Lesson task templates (per-video tasks)                                */
/* ═════════════════════════════════════════════════════════════════════ */

export type TemplateInput = {
  programId: string;
  lessonId: string;
  title: string;
  description?: string;
  task_type?: string;
  priority?: "low" | "normal" | "high";
  estimated_minutes?: number;
  points?: number;
  is_required?: boolean;
  sort_order?: number;
};

const TASK_TYPES = new Set([
  "apply",
  "strategy",
  "content",
  "research",
  "reflection",
  "posting",
  "engagement",
  "performance",
  "monetization",
  "confidence",
]);

export async function createLessonTaskTemplate(
  input: TemplateInput,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Task title is required." };

  const taskType =
    input.task_type && TASK_TYPES.has(input.task_type)
      ? input.task_type
      : "apply";
  const priority = input.priority ?? "normal";
  if (!["low", "normal", "high"].includes(priority)) {
    return { ok: false, error: "Invalid priority." };
  }
  const estimated_minutes =
    Number.isFinite(input.estimated_minutes) && input.estimated_minutes! >= 0
      ? Math.floor(input.estimated_minutes!)
      : 15;
  const points =
    Number.isFinite(input.points) && input.points! >= 0
      ? Math.floor(input.points!)
      : 10;

  // Default sort_order to "last for this lesson".
  let sortOrder = input.sort_order;
  if (sortOrder === undefined) {
    const { data: last } = await ctx.supabase
      .from("lesson_task_templates")
      .select("sort_order")
      .eq("lesson_id", input.lessonId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (last?.sort_order ?? 0) + 1;
  }

  const { error } = await ctx.supabase.from("lesson_task_templates").insert({
    program_id: input.programId,
    lesson_id: input.lessonId,
    title,
    description: input.description?.trim() || null,
    task_type: taskType,
    priority,
    estimated_minutes,
    points,
    sort_order: sortOrder,
    is_required: input.is_required ?? true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/programs/${input.programId}/curriculum`);
  return { ok: true };
}

export type TemplatePatch = Partial<{
  title: string;
  description: string | null;
  task_type: string;
  priority: "low" | "normal" | "high";
  estimated_minutes: number;
  points: number;
  is_required: boolean;
  sort_order: number;
}>;

export async function updateLessonTaskTemplate(
  templateId: string,
  patch: TemplatePatch,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: "Task title cannot be empty." };
    update.title = t;
  }
  if (patch.description !== undefined) {
    const v = (patch.description ?? "").trim();
    update.description = v.length > 0 ? v : null;
  }
  if (patch.task_type !== undefined) {
    if (!TASK_TYPES.has(patch.task_type)) {
      return { ok: false, error: "Invalid task type." };
    }
    update.task_type = patch.task_type;
  }
  if (patch.priority !== undefined) {
    if (!["low", "normal", "high"].includes(patch.priority)) {
      return { ok: false, error: "Invalid priority." };
    }
    update.priority = patch.priority;
  }
  if (patch.estimated_minutes !== undefined) {
    if (!Number.isFinite(patch.estimated_minutes) || patch.estimated_minutes < 0) {
      return { ok: false, error: "Estimated minutes must be ≥ 0." };
    }
    update.estimated_minutes = Math.floor(patch.estimated_minutes);
  }
  if (patch.points !== undefined) {
    if (!Number.isFinite(patch.points) || patch.points < 0) {
      return { ok: false, error: "Points must be ≥ 0." };
    }
    update.points = Math.floor(patch.points);
  }
  if (patch.is_required !== undefined) update.is_required = patch.is_required;
  if (patch.sort_order !== undefined) {
    if (!Number.isFinite(patch.sort_order)) {
      return { ok: false, error: "Sort order must be a number." };
    }
    update.sort_order = Math.floor(patch.sort_order);
  }

  if (Object.keys(update).length === 0) return { ok: true };

  const { data, error } = await ctx.supabase
    .from("lesson_task_templates")
    .update(update)
    .eq("id", templateId)
    .select("program_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  if (data?.program_id) {
    revalidatePath(`/admin/programs/${data.program_id}/curriculum`);
  }
  return { ok: true };
}

export async function deleteLessonTaskTemplate(
  templateId: string,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("lesson_task_templates")
    .delete()
    .eq("id", templateId)
    .select("program_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  if (data?.program_id) {
    revalidatePath(`/admin/programs/${data.program_id}/curriculum`);
  }
  return { ok: true };
}
