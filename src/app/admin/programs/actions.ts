"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string; slug: string } | { ok: false; error: string };

export async function createProgram(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const planAccess = String(formData.get("plan_access") ?? "basic").trim();
  const estimatedDays = Number(formData.get("estimated_days") ?? 30);
  const sortOrder = Number(formData.get("sort_order") ?? 100);
  const coverImage =
    String(formData.get("cover_image_url") ?? "").trim() || null;
  const publish = formData.get("publish") === "1";

  const categoryAccess = (formData.getAll("category_access") as string[]).filter(
    Boolean,
  );

  if (!slug) return { ok: false, error: "Slug is required." };
  if (!title) return { ok: false, error: "Title is required." };

  const { error } = await ctx.supabase.from("programs").insert({
    slug,
    title,
    description,
    plan_access: planAccess,
    estimated_days: estimatedDays,
    sort_order: sortOrder,
    cover_image_url: coverImage,
    published: publish,
    category_access:
      categoryAccess.length > 0
        ? categoryAccess
        : ["starter", "growth", "monetization", "scale"],
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  return { ok: true };
}

export async function toggleProgramPublished(
  programId: string,
  published: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("programs")
    .update({ published })
    .eq("id", programId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  return { ok: true };
}

export async function deleteProgram(programId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("programs")
    .delete()
    .eq("id", programId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  return { ok: true };
}

/* ───────────────────────────────────────────────────────────────────── */

export type ProgramPatch = {
  title?: string;
  description?: string | null;
  cover_image_url?: string | null;
  plan_access?: "free" | "basic" | "pro";
  sales_page_url?: string | null;
  estimated_days?: number;
  sort_order?: number;
  category_access?: string[];
};

/**
 * Partial update on a program. Only validates fields that are present in the
 * patch — undefined fields are left alone. Empty-string text fields are
 * normalized to null so the column reflects "unset" rather than ''.
 */
export async function updateProgram(
  programId: string,
  patch: ProgramPatch,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  if (!programId) return { ok: false, error: "Missing program id." };

  const update: Record<string, unknown> = {};

  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: "Title cannot be empty." };
    update.title = t;
  }
  if (patch.description !== undefined) {
    const v = (patch.description ?? "").trim();
    update.description = v.length > 0 ? v : null;
  }
  if (patch.cover_image_url !== undefined) {
    const v = (patch.cover_image_url ?? "").trim();
    // Accept public http(s) URLs as well as inline data: image URLs (the
    // thumbnail editor downscales picked files to a data URL — matching
    // the create-wizard's "data URLs stored inline for now" approach).
    if (v && !/^https?:\/\//i.test(v) && !/^data:image\//i.test(v)) {
      return { ok: false, error: "Cover image must be a valid URL or uploaded image." };
    }
    update.cover_image_url = v.length > 0 ? v : null;
  }
  if (patch.plan_access !== undefined) {
    if (!["free", "basic", "pro"].includes(patch.plan_access)) {
      return { ok: false, error: "Invalid plan access." };
    }
    update.plan_access = patch.plan_access;
  }
  if (patch.sales_page_url !== undefined) {
    const v = (patch.sales_page_url ?? "").trim();
    if (v && !/^https?:\/\//i.test(v)) {
      return { ok: false, error: "Sales page must be a valid URL." };
    }
    update.sales_page_url = v.length > 0 ? v : null;
  }
  if (patch.estimated_days !== undefined) {
    if (
      !Number.isFinite(patch.estimated_days) ||
      patch.estimated_days < 0
    ) {
      return { ok: false, error: "Estimated days must be ≥ 0." };
    }
    update.estimated_days = Math.floor(patch.estimated_days);
  }
  if (patch.sort_order !== undefined) {
    if (!Number.isFinite(patch.sort_order)) {
      return { ok: false, error: "Sort order must be a number." };
    }
    update.sort_order = Math.floor(patch.sort_order);
  }
  if (patch.category_access !== undefined) {
    const allowed = ["starter", "growth", "monetization", "scale"];
    const cats = patch.category_access.filter((c) => allowed.includes(c));
    update.category_access = cats.length > 0 ? cats : allowed;
  }

  if (Object.keys(update).length === 0) {
    return { ok: true }; // nothing to write
  }

  const { error } = await ctx.supabase
    .from("programs")
    .update(update)
    .eq("id", programId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  return { ok: true };
}

/**
 * Archive (or un-archive) a program. Non-destructive — preserves all rows
 * + relationships; the listing/grid hides archived rows by default.
 */
export async function archiveProgram(
  programId: string,
  archived: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("programs")
    .update({ archived })
    .eq("id", programId);
  if (error) {
    // 42703 = `archived` column missing → migration 0029 not applied.
    if (error.code === "42703") {
      return {
        ok: false,
        error:
          "Archiving needs database migration 0029 (admin_crud_columns) — run supabase/migrations/0029_admin_crud_columns.sql in the Supabase SQL editor to enable it.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${programId}`);
  return { ok: true };
}

/* ──────────────────────────────────────────────────────────────────────────
   Program access settings — backs /admin/programs/[id]/access.

   `allowed_plans` is the new multi-tier source of truth (free/basic/pro/
   diamond). We also keep the legacy single `plan_access` column in sync —
   set to the lowest allowed tier — so the rest of the app's access gating
   (curriculum locks, broadcast-on-publish) stays consistent without a
   wider rewrite.
   ────────────────────────────────────────────────────────────────────────── */

const ACCESS_PLAN_VALUES = ["free", "basic", "pro", "diamond"] as const;
type AccessPlan = (typeof ACCESS_PLAN_VALUES)[number];
const ACCESS_NOTE_MAX = 2000;

export type ProgramAccessPatch = {
  allowedPlans: string[];
  instant: boolean;
  whileValid: boolean;
  revokeFuture: boolean;
  adminNote: string | null;
};

/** Lowest allowed tier → legacy plan_access. Diamond-only / empty collapse
 *  onto 'pro' (the most restrictive real billing tier). */
function deriveLegacyPlanAccess(plans: string[]): "free" | "basic" | "pro" {
  if (plans.includes("free")) return "free";
  if (plans.includes("basic")) return "basic";
  return "pro"; // pro-only, diamond-only, or empty
}

export async function saveProgramAccess(
  programId: string,
  patch: ProgramAccessPatch,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };

  if (!Array.isArray(patch.allowedPlans)) {
    return { ok: false, error: "Allowed plans must be a list." };
  }
  // Clean + de-dupe, preserving the canonical tier order.
  const set = new Set(
    patch.allowedPlans.filter((p): p is AccessPlan =>
      (ACCESS_PLAN_VALUES as readonly string[]).includes(p),
    ),
  );
  const allowed = ACCESS_PLAN_VALUES.filter((p) => set.has(p));
  if (allowed.length === 0) {
    return { ok: false, error: "Select at least one membership tier." };
  }

  const note = (patch.adminNote ?? "").trim().slice(0, ACCESS_NOTE_MAX);

  const { error } = await ctx.supabase
    .from("programs")
    .update({
      allowed_plans:        allowed,
      plan_access:          deriveLegacyPlanAccess(allowed),
      access_instant:       Boolean(patch.instant),
      access_while_valid:   Boolean(patch.whileValid),
      access_revoke_future: Boolean(patch.revokeFuture),
      access_admin_note:    note.length > 0 ? note : null,
    })
    .eq("id", programId);

  if (error) {
    // 42703 = undefined column → migration 0035 (program_access) isn't applied
    // to this database yet. Rather than hard-failing with a raw DB error, save
    // the effective tier (plan_access exists in the base schema) so the access
    // level still updates, and return an actionable message naming the exact
    // migration to run for the detailed rules.
    if (error.code === "42703") {
      const { error: tierErr } = await ctx.supabase
        .from("programs")
        .update({ plan_access: deriveLegacyPlanAccess(allowed) })
        .eq("id", programId);
      if (tierErr) return { ok: false, error: tierErr.message };
      revalidatePath(`/admin/programs/${programId}/access`);
      revalidatePath(`/admin/programs/${programId}`);
      revalidatePath("/admin/programs");
      return {
        ok: false,
        error:
          "Access tier saved. The detailed access rules (allowed plans, timing, admin note) need database migration 0035 — run supabase/migrations/0035_program_access.sql in the Supabase SQL editor to persist them.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/programs/${programId}/access`);
  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/admin/programs");
  return { ok: true };
}

/* ──────────────────────────────────────────────────────────────────────────
   Wizard-driven create
   Used by /create-new/program — the 4-step "Create new" wizard sends the
   collected fields here once the admin presses Publish / Save as draft /
   Schedule. We map wizard concepts to real `programs` columns:
     • tier            → plan_access  (diamond/undecided fall back to 'pro')
     • thumbnailDataUrl → cover_image_url (data URLs stored inline for now;
       a real upload to Supabase Storage can replace this without changing
       the schema)
     • publish flag    → published
   The slug is auto-derived from the title — we re-try with a numeric
   suffix on unique-constraint collisions so admins don't have to think
   about slug uniqueness up-front.
   ────────────────────────────────────────────────────────────────────────── */

export type WizardProgramInput = {
  title:             string;
  description:       string;
  audience:          string;   // free-form, stored in description prefix for now
  level:             string;
  goal:              string;
  accessTier:        "free" | "basic" | "pro" | "diamond" | "undecided" | null;
  thumbnailDataUrl:  string | null;
  publish:           boolean;  // Publish vs Save-as-draft / Schedule
};

export async function createProgramFromWizard(
  input: WizardProgramInput,
): Promise<CreateResult> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };

  // diamond / undecided don't map to a real subscription tier — collapse
  // them onto the closest published tier so the row is always valid.
  const planAccess: "free" | "basic" | "pro" =
    input.accessTier === "free"
      ? "free"
      : input.accessTier === "pro" || input.accessTier === "diamond"
        ? "pro"
        : "basic";

  const description = input.description.trim() || null;
  const cover = input.thumbnailDataUrl?.trim() || null;
  const baseSlug = slugify(title);

  // Try `baseSlug`, then `baseSlug-2`, `baseSlug-3` … on collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await ctx.supabase
      .from("programs")
      .insert({
        slug,
        title,
        description,
        plan_access: planAccess,
        cover_image_url: cover,
        published: input.publish,
        category_access: ["starter", "growth", "monetization", "scale"],
      })
      .select("id, slug")
      .maybeSingle();

    if (!error && data) {
      revalidatePath("/admin/programs");
      return { ok: true, id: data.id as string, slug: data.slug as string };
    }
    // 23505 = unique_violation (the slug is taken). Retry with a suffix.
    if (error && error.code === "23505") continue;
    if (error) return { ok: false, error: error.message };
  }

  return {
    ok: false,
    error:
      "Could not find a unique slug for that title. Try a slightly different name.",
  };
}

/** Lowercase, hyphenated, ASCII-safe slug. Falls back to "untitled-program"
 *  so the insert never trips a NOT NULL constraint on `slug`. */
function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "untitled-program";
}
