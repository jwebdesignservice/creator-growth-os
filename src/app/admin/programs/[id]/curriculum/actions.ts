"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type Result = { ok: true } | { ok: false; error: string };

/* ───────────────────────────────────────────────────────────────────────
   Dual-mode module storage
   ───────────────────────────────────────────────────────────────────────
   The curriculum supports two backing stores transparently:

   1. First-class `program_modules` table (migration 0029) — module ids are
      UUIDs. Full feature set: empty modules, bonus / pro-only flags.

   2. Denormalized fallback (no migration) — a "module" is just the set of
      lessons sharing a `module_number` on the `lessons` table, exactly how
      the public Setup Guide reads them. Synthetic ids look like `m3`. An
      empty module can't exist here, so creating one inserts a starter
      draft lesson the admin can immediately rename.

   `moduleStoreAvailable()` probes once per action; the synthetic-id helpers
   route the rest.
   ─────────────────────────────────────────────────────────────────────── */

function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  if (code === "42P01" || code === "PGRST205") return true;
  const msg = (err.message ?? "").toLowerCase();
  return msg.includes("could not find the table") ||
    (msg.includes("relation") && msg.includes("does not exist"));
}

/** Parse a synthetic denormalized module id (`m3` → 3). UUIDs return null. */
function parseSyntheticModule(moduleId: string): number | null {
  const m = /^m(\d+)$/.exec(moduleId);
  return m ? Number(m[1]) : null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/** Next free module_number for a program, derived from lessons. */
async function nextDenormModuleNumber(
  supabase: SupabaseClient,
  programId: string,
): Promise<number> {
  const { data } = await supabase
    .from("lessons")
    .select("module_number")
    .eq("program_id", programId)
    .order("module_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.module_number as number | null) ?? 0) + 1;
}

async function uniqueLessonSlug(
  supabase: SupabaseClient,
  base: string,
): Promise<string> {
  const root = slugify(base) || `lesson-${Date.now()}`;
  for (let i = 0; i < 6; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data } = await supabase
      .from("lessons")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now()}`;
}

/* ═════════════════════════════════════════════════════════════════════ */
/* Modules                                                                */
/* ═════════════════════════════════════════════════════════════════════ */

/**
 * Create a new module on a program. Uses the first-class table when
 * present; otherwise creates the module in the denormalized model by
 * seeding a starter draft lesson (a module can't exist without lessons in
 * that model).
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

  // Try the first-class table first.
  let number = input.number;
  if (number === undefined) {
    const maxQuery = await ctx.supabase
      .from("program_modules")
      .select("number")
      .eq("program_id", programId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxQuery.error && isMissingTable(maxQuery.error)) {
      return createModuleDenormalized(ctx.supabase, programId, title, input.pro_only);
    }
    number = ((maxQuery.data?.number as number | null) ?? 0) + 1;
  }

  const { error } = await ctx.supabase.from("program_modules").insert({
    program_id: programId,
    number,
    title,
    bonus: input.bonus ?? false,
    pro_only: input.pro_only ?? false,
  });
  if (error) {
    if (isMissingTable(error)) {
      return createModuleDenormalized(ctx.supabase, programId, title, input.pro_only);
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}

/** Denormalized create: seed a starter draft lesson carrying the new
 *  module_number / module_title so the module materializes. */
async function createModuleDenormalized(
  supabase: SupabaseClient,
  programId: string,
  title: string,
  proOnly?: boolean,
): Promise<Result> {
  const number = await nextDenormModuleNumber(supabase, programId);
  const slug = await uniqueLessonSlug(supabase, `${title}-lesson-1`);

  const { data: lastSort } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("program_id", programId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = ((lastSort?.sort_order as number | null) ?? 0) + 1;

  const { error } = await supabase.from("lessons").insert({
    program_id: programId,
    slug,
    title: "Untitled lesson",
    description: null,
    video_url: null,
    duration_seconds: 0,
    plan_access: proOnly ? "pro" : "basic",
    module_number: number,
    module_title: title,
    sort_order: sortOrder,
    content_type: "video",
    published: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}

/**
 * Rename a module + cascade the title onto every lesson that uses this
 * module's number (lessons store module_title as a denormalized copy for
 * fast reads). Works against either backing store.
 */
export async function renameModule(
  moduleId: string,
  newTitle: string,
  programId?: string,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = newTitle.trim();
  if (!title) return { ok: false, error: "Module title cannot be empty." };

  // Denormalized synthetic id (`m3`): rename = cascade to lessons in this
  // program only (module_number is per-program, so scope by program_id).
  const synthNumber = parseSyntheticModule(moduleId);
  if (synthNumber !== null) {
    if (!programId) {
      return { ok: false, error: "Missing program id for module rename." };
    }
    const { error } = await ctx.supabase
      .from("lessons")
      .update({ module_title: title })
      .eq("program_id", programId)
      .eq("module_number", synthNumber);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/programs/${programId}/curriculum`);
    revalidatePath(`/admin/programs/${programId}`);
    return { ok: true };
  }

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
 * Delete a module. By default deletes the module *and all its lessons*; if
 * `keepLessons=true` the lessons are detached (module_number → null).
 * Works against either backing store.
 */
export async function deleteModule(
  moduleId: string,
  opts: { keepLessons?: boolean; programId?: string } = {},
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  // Denormalized synthetic id: operate on lessons by module_number,
  // scoped to the program (module_number is per-program).
  const synthNumber = parseSyntheticModule(moduleId);
  if (synthNumber !== null) {
    if (!opts.programId) {
      return { ok: false, error: "Missing program id for module delete." };
    }
    if (opts.keepLessons) {
      const { error } = await ctx.supabase
        .from("lessons")
        .update({ module_number: null, module_title: null })
        .eq("program_id", opts.programId)
        .eq("module_number", synthNumber);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await ctx.supabase
        .from("lessons")
        .delete()
        .eq("program_id", opts.programId)
        .eq("module_number", synthNumber);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath(`/admin/programs/${opts.programId}/curriculum`);
    revalidatePath(`/admin/programs/${opts.programId}`);
    return { ok: true };
  }

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
 * Bulk-reorder modules. Numbers are re-assigned in the order passed.
 * Lesson denormalized `module_number` fields are kept in sync. Works
 * against either backing store (synthetic ids reorder lessons directly).
 */
export async function reorderModules(
  programId: string,
  orderedIds: string[],
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };

  // All-synthetic → denormalized reorder via a two-phase renumber to dodge
  // unique collisions on module_number.
  if (orderedIds.length > 0 && orderedIds.every((id) => parseSyntheticModule(id) !== null)) {
    const oldNumbers = orderedIds.map((id) => parseSyntheticModule(id)!);
    // Phase 1: park at offset numbers to avoid clashes.
    for (let i = 0; i < oldNumbers.length; i++) {
      const { error } = await ctx.supabase
        .from("lessons")
        .update({ module_number: 1000 + i })
        .eq("program_id", programId)
        .eq("module_number", oldNumbers[i]!);
      if (error) return { ok: false, error: error.message };
    }
    // Phase 2: land on final 1..n.
    for (let i = 0; i < oldNumbers.length; i++) {
      const { error } = await ctx.supabase
        .from("lessons")
        .update({ module_number: i + 1 })
        .eq("program_id", programId)
        .eq("module_number", 1000 + i);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath(`/admin/programs/${programId}/curriculum`);
    revalidatePath(`/admin/programs/${programId}`);
    return { ok: true };
  }

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

/**
 * Create a lesson inside a given module. Resolves the module's number +
 * title from either backing store, auto-derives a unique slug, and
 * auto-assigns sort_order (last in the program).
 */
export async function addLessonToModule(
  input: AddLessonInput,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Lesson title is required." };

  // Resolve module_number + module_title for the target module.
  let moduleNumber: number;
  let moduleTitle: string;

  const synthNumber = parseSyntheticModule(input.moduleId);
  if (synthNumber !== null) {
    // Denormalized: derive the title from an existing lesson in the module.
    moduleNumber = synthNumber;
    const { data: sibling } = await ctx.supabase
      .from("lessons")
      .select("module_title")
      .eq("program_id", input.programId)
      .eq("module_number", synthNumber)
      .limit(1)
      .maybeSingle();
    moduleTitle = (sibling?.module_title as string | null) ?? `Module ${synthNumber}`;
  } else {
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
    moduleNumber = mod.number as number;
    moduleTitle = mod.title as string;
  }

  const slug = await uniqueLessonSlug(ctx.supabase, input.slug || title);

  // Compute next sort_order (last in the program + 1).
  const { data: last } = await ctx.supabase
    .from("lessons")
    .select("sort_order")
    .eq("program_id", input.programId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = ((last?.sort_order as number | null) ?? 0) + 1;

  const { error } = await ctx.supabase.from("lessons").insert({
    program_id: input.programId,
    slug,
    title,
    description: input.description?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
    duration_seconds: input.durationSeconds ?? 0,
    plan_access: input.planAccess ?? "basic",
    module_number: moduleNumber,
    module_title: moduleTitle,
    sort_order: sortOrder,
    content_type: "video",
    published: false,
  });
  if (error) {
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
  if (error) {
    if (isMissingTable(error)) {
      return {
        ok: false,
        error:
          "Per-lesson tasks need migration 0027 (lesson_task_templates). Run the SQL in supabase/APPLY_THIS_IN_SUPABASE_STUDIO.sql to enable this.",
      };
    }
    return { ok: false, error: error.message };
  }

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
