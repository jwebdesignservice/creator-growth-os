"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";

/* ─────────────────────────────────────────────────────────────────────────
   Module-level admin actions for /admin/programs/[id].

   Modules on this page are NOT their own table — they're a grouping of
   `lessons` rows that share a `module_number`. So every action here fans
   out across all lessons in (program_id, module_number).

   Legacy note: the curriculum reader (lib/programs/queries.ts) buckets
   lessons whose `module_number` IS NULL under Module 1. We mirror that
   here so module-1 operations also touch those rows.
   ───────────────────────────────────────────────────────────────────────── */

type Result = { ok: true } | { ok: false; error: string };

/** PostgREST `.or()` fragment matching a module, treating NULL as Module 1. */
function moduleOrFragment(moduleNumber: number): string {
  return moduleNumber === 1
    ? "module_number.eq.1,module_number.is.null"
    : `module_number.eq.${moduleNumber}`;
}

/**
 * Publish or unpublish every lesson in a module at once. Used by the
 * "Publish module" / "Unpublish module" item in the outline kebab.
 */
export async function setModulePublished(
  programId: string,
  moduleNumber: number,
  publish: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };
  if (!Number.isFinite(moduleNumber)) {
    return { ok: false, error: "Invalid module." };
  }

  const { error } = await ctx.supabase
    .from("lessons")
    .update({ published: publish })
    .eq("program_id", programId)
    .or(moduleOrFragment(moduleNumber));

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}

/**
 * Duplicate a whole module: copy every lesson into a brand-new module
 * (next available `module_number`), as unpublished drafts with fresh
 * slugs and a "(Copy)" module title. The originals are untouched.
 */
export async function duplicateModule(
  programId: string,
  moduleNumber: number,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };
  if (!Number.isFinite(moduleNumber)) {
    return { ok: false, error: "Invalid module." };
  }

  // 1) Read the source module's lessons.
  const { data: lessons, error: readErr } = await ctx.supabase
    .from("lessons")
    .select(
      "slug, title, description, video_url, cover_image_url, duration_seconds, plan_access, module_title, sort_order, content_type",
    )
    .eq("program_id", programId)
    .or(moduleOrFragment(moduleNumber))
    .order("sort_order", { ascending: true });

  if (readErr) return { ok: false, error: readErr.message };
  if (!lessons || lessons.length === 0) {
    return { ok: false, error: "This module has no lessons to duplicate." };
  }

  // 2) Find the next free module number + sort_order for this program so
  //    the copy lands at the end of the curriculum.
  const { data: meta, error: metaErr } = await ctx.supabase
    .from("lessons")
    .select("module_number, sort_order")
    .eq("program_id", programId);
  if (metaErr) return { ok: false, error: metaErr.message };

  const newModule =
    Math.max(1, ...(meta ?? []).map((r) => (r.module_number as number | null) ?? 1)) + 1;
  const maxSort = Math.max(
    0,
    ...(meta ?? []).map((r) => (r.sort_order as number | null) ?? 0),
  );

  const sourceTitle =
    (lessons[0].module_title as string | null) ?? `Module ${moduleNumber}`;
  const copyTitle = `${sourceTitle} (Copy)`;
  const stamp = Date.now().toString(36);

  // 3) Build the insert rows — fresh unique slugs, unpublished.
  const rows = lessons.map((l, i) => ({
    slug: `${l.slug}-copy-${stamp}-${i + 1}`.slice(0, 120),
    title: l.title,
    description: l.description,
    video_url: l.video_url,
    cover_image_url: l.cover_image_url,
    duration_seconds: l.duration_seconds,
    plan_access: l.plan_access,
    program_id: programId,
    module_number: newModule,
    module_title: copyTitle,
    sort_order: maxSort + 1 + i,
    published: false,
    content_type: (l.content_type as string | null) ?? "video",
  }));

  const { error: insErr } = await ctx.supabase.from("lessons").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}

/**
 * Permanently delete every lesson in a module. Destructive and
 * irreversible — the caller (outline kebab) gates this behind a confirm
 * dialog that shows the lesson count.
 */
export async function deleteModule(
  programId: string,
  moduleNumber: number,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };
  if (!Number.isFinite(moduleNumber)) {
    return { ok: false, error: "Invalid module." };
  }

  const { error } = await ctx.supabase
    .from("lessons")
    .delete()
    .eq("program_id", programId)
    .or(moduleOrFragment(moduleNumber));

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}
