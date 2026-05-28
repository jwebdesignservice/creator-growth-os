"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
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
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();

  if (!programId) return { ok: false, error: "Missing program id." };
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Module title is required." };

  // Try the first-class table first.
  let number = input.number;
  if (number === undefined) {
    const maxQuery = await db
      .from("program_modules")
      .select("number")
      .eq("program_id", programId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxQuery.error && isMissingTable(maxQuery.error)) {
      return createModuleDenormalized(db, programId, title, input.pro_only);
    }
    number = ((maxQuery.data?.number as number | null) ?? 0) + 1;
  }

  const { error } = await db.from("program_modules").insert({
    program_id: programId,
    number,
    title,
    bonus: input.bonus ?? false,
    pro_only: input.pro_only ?? false,
  });
  if (error) {
    if (isMissingTable(error)) {
      return createModuleDenormalized(db, programId, title, input.pro_only);
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
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();

  const title = newTitle.trim();
  if (!title) return { ok: false, error: "Module title cannot be empty." };

  // Denormalized synthetic id (`m3`): rename = cascade to lessons in this
  // program only (module_number is per-program, so scope by program_id).
  const synthNumber = parseSyntheticModule(moduleId);
  if (synthNumber !== null) {
    if (!programId) {
      return { ok: false, error: "Missing program id for module rename." };
    }
    const { error } = await db
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
  const { data: mod, error: readErr } = await db
    .from("program_modules")
    .select("id, program_id, number")
    .eq("id", moduleId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!mod) return { ok: false, error: "Module not found." };

  const { error: upd1 } = await db
    .from("program_modules")
    .update({ title })
    .eq("id", moduleId);
  if (upd1) return { ok: false, error: upd1.message };

  const { error: upd2 } = await db
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
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();

  // Denormalized synthetic id: operate on lessons by module_number,
  // scoped to the program (module_number is per-program).
  const synthNumber = parseSyntheticModule(moduleId);
  if (synthNumber !== null) {
    if (!opts.programId) {
      return { ok: false, error: "Missing program id for module delete." };
    }
    if (opts.keepLessons) {
      const { error } = await db
        .from("lessons")
        .update({ module_number: null, module_title: null })
        .eq("program_id", opts.programId)
        .eq("module_number", synthNumber);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await db
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

  const { data: mod, error: readErr } = await db
    .from("program_modules")
    .select("id, program_id, number")
    .eq("id", moduleId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!mod) return { ok: false, error: "Module not found." };

  if (opts.keepLessons) {
    const { error: detach } = await db
      .from("lessons")
      .update({ module_number: null, module_title: null })
      .eq("program_id", mod.program_id)
      .eq("module_number", mod.number);
    if (detach) return { ok: false, error: detach.message };
  } else {
    const { error: del } = await db
      .from("lessons")
      .delete()
      .eq("program_id", mod.program_id)
      .eq("module_number", mod.number);
    if (del) return { ok: false, error: del.message };
  }

  const { error } = await db
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
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();
  if (!programId) return { ok: false, error: "Missing program id." };

  // All-synthetic → denormalized reorder via a two-phase renumber to dodge
  // unique collisions on module_number.
  if (orderedIds.length > 0 && orderedIds.every((id) => parseSyntheticModule(id) !== null)) {
    const oldNumbers = orderedIds.map((id) => parseSyntheticModule(id)!);
    // Phase 1: park at offset numbers to avoid clashes.
    for (let i = 0; i < oldNumbers.length; i++) {
      const { error } = await db
        .from("lessons")
        .update({ module_number: 1000 + i })
        .eq("program_id", programId)
        .eq("module_number", oldNumbers[i]!);
      if (error) return { ok: false, error: error.message };
    }
    // Phase 2: land on final 1..n.
    for (let i = 0; i < oldNumbers.length; i++) {
      const { error } = await db
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
  const { data: existing } = await db
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

    const { error: mErr } = await db
      .from("program_modules")
      .update({ number: newNumber })
      .eq("id", id);
    if (mErr) return { ok: false, error: mErr.message };

    if (oldNumber !== undefined) {
      const { error: lErr } = await db
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
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Lesson title is required." };

  // Resolve module_number + module_title for the target module.
  let moduleNumber: number;
  let moduleTitle: string;

  const synthNumber = parseSyntheticModule(input.moduleId);
  if (synthNumber !== null) {
    // Denormalized: derive the title from an existing lesson in the module.
    moduleNumber = synthNumber;
    const { data: sibling } = await db
      .from("lessons")
      .select("module_title")
      .eq("program_id", input.programId)
      .eq("module_number", synthNumber)
      .limit(1)
      .maybeSingle();
    moduleTitle = (sibling?.module_title as string | null) ?? `Module ${synthNumber}`;
  } else {
    const { data: mod, error: modErr } = await db
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

  const slug = await uniqueLessonSlug(db, input.slug || title);

  // Compute next sort_order (last in the program + 1).
  const { data: last } = await db
    .from("lessons")
    .select("sort_order")
    .eq("program_id", input.programId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = ((last?.sort_order as number | null) ?? 0) + 1;

  const { error } = await db.from("lessons").insert({
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
/* Lesson + section duplication / preview                                 */
/* ═════════════════════════════════════════════════════════════════════ */

/** Duplicate a single lesson within its module. Copies every field, gives
 *  it a unique slug + "(Copy)" title, and lands it right after the
 *  original in sort order. */
export async function duplicateLesson(lessonId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();

  const { data: src, error: readErr } = await db
    .from("lessons")
    .select(
      "program_id, title, description, video_url, cover_image_url, duration_seconds, plan_access, module_number, module_title, content_type, sort_order, difficulty, category",
    )
    .eq("id", lessonId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!src) return { ok: false, error: "Lesson not found." };

  const newTitle = `${src.title} (Copy)`;
  const slug = await uniqueLessonSlug(db, newTitle);

  const { error } = await db.from("lessons").insert({
    program_id: src.program_id,
    slug,
    title: newTitle,
    description: src.description ?? null,
    video_url: src.video_url ?? null,
    cover_image_url: src.cover_image_url ?? null,
    duration_seconds: src.duration_seconds ?? 0,
    plan_access: src.plan_access ?? "basic",
    module_number: src.module_number,
    module_title: src.module_title,
    content_type: src.content_type ?? "video",
    difficulty: src.difficulty ?? "intermediate",
    category: src.category ?? null,
    sort_order: ((src.sort_order as number | null) ?? 0) + 1,
    published: false,
  });
  if (error) return { ok: false, error: error.message };

  if (src.program_id) {
    revalidatePath(`/admin/programs/${src.program_id}/curriculum`);
    revalidatePath(`/admin/programs/${src.program_id}`);
  }
  return { ok: true };
}

/** Duplicate an entire section/module: every lesson is copied into a brand
 *  new module (next number), preserving order. Title gets "(Copy)". Works
 *  in both backing stores. */
export async function duplicateModule(
  programId: string,
  moduleId: string,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();
  if (!programId) return { ok: false, error: "Missing program id." };

  // Resolve the source module number + title.
  let srcNumber: number;
  let srcTitle: string;
  const synth = parseSyntheticModule(moduleId);
  if (synth !== null) {
    srcNumber = synth;
    const { data: sibling } = await db
      .from("lessons")
      .select("module_title")
      .eq("program_id", programId)
      .eq("module_number", synth)
      .limit(1)
      .maybeSingle();
    srcTitle = (sibling?.module_title as string | null) ?? `Module ${synth}`;
  } else {
    const { data: mod, error: modErr } = await db
      .from("program_modules")
      .select("number, title")
      .eq("id", moduleId)
      .maybeSingle();
    if (modErr) return { ok: false, error: modErr.message };
    if (!mod) return { ok: false, error: "Module not found." };
    srcNumber = mod.number as number;
    srcTitle = mod.title as string;
  }

  const newNumber = await nextDenormModuleNumber(db, programId);
  const newTitle = `${srcTitle} (Copy)`;

  // If first-class table exists, mirror the module row too.
  const probe = await db
    .from("program_modules")
    .insert({ program_id: programId, number: newNumber, title: newTitle })
    .select("id")
    .maybeSingle();
  // Ignore missing-table errors — denormalized lessons carry the module.
  if (probe.error && !isMissingTable(probe.error)) {
    return { ok: false, error: probe.error.message };
  }

  // Copy lessons.
  const { data: srcLessons, error: lErr } = await db
    .from("lessons")
    .select(
      "title, description, video_url, cover_image_url, duration_seconds, plan_access, content_type, difficulty, category, sort_order",
    )
    .eq("program_id", programId)
    .eq("module_number", srcNumber)
    .order("sort_order", { ascending: true });
  if (lErr) return { ok: false, error: lErr.message };

  let order = 1;
  for (const l of srcLessons ?? []) {
    const slug = await uniqueLessonSlug(db, l.title as string);
    const { error } = await db.from("lessons").insert({
      program_id: programId,
      slug,
      title: l.title,
      description: l.description ?? null,
      video_url: l.video_url ?? null,
      cover_image_url: l.cover_image_url ?? null,
      duration_seconds: l.duration_seconds ?? 0,
      plan_access: l.plan_access ?? "basic",
      module_number: newNumber,
      module_title: newTitle,
      content_type: l.content_type ?? "video",
      difficulty: l.difficulty ?? "intermediate",
      category: l.category ?? null,
      sort_order: order++,
      published: false,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/programs/${programId}/curriculum`);
  revalidatePath(`/admin/programs/${programId}`);
  return { ok: true };
}

/** "Set as public preview" — maps to plan_access. A preview lesson is
 *  free (open) so non-members can watch it; un-setting returns it to
 *  'basic'. */
export async function setLessonPreview(
  lessonId: string,
  preview: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  // Admin verified above — perform writes with the service client so RLS
  // session quirks inside server actions can't silently block them.
  const db = createServiceClient();

  const { data, error } = await db
    .from("lessons")
    .update({ plan_access: preview ? "free" : "basic" })
    .eq("id", lessonId)
    .select("program_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  if (data?.program_id) {
    revalidatePath(`/admin/programs/${data.program_id}/curriculum`);
    revalidatePath(`/admin/programs/${data.program_id}`);
  }
  return { ok: true };
}

/* ═════════════════════════════════════════════════════════════════════ */
/* Lesson task templates (per-video tasks)                                */
/* ═════════════════════════════════════════════════════════════════════ */

// LEGACY / RETIRED — program-video task authoring moved to the unified task
// system in the Phase 3 cutover. Tasks are now created/edited via
// src/lib/tasks/actions.ts → public.task_templates (migration 0038). The old
// lesson_task_templates writers below are no longer imported or called by any
// surface; lesson_task_templates is kept read-only for legacy data.




