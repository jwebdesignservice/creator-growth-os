"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus, PlatformKey } from "@/lib/posting/queries";

type Result = { ok: true; id?: string } | { ok: false; error: string };

export type PostingItemDetail = {
  topic: string | null;
  goal: string | null;
  notes: string | null;
  status: ContentStatus;
  scheduled_for: string | null;
  platform: string | null;
  content_type: string | null;
  /** Spread across pipeline phases (true) vs a single day (false). */
  is_phased: boolean;
};

/** One scheduled production phase of a post (a pipeline stage on a given day). */
export type PostingItemPhase = {
  stage: ContentStatus;
  scheduled_for: string | null;
};

/**
 * Read one post's editable detail, including the `goal` (objective) and
 * `notes` (caption direction) added in migration 0042. If that migration
 * hasn't been applied yet the columns are missing (Postgres 42703); we retry
 * without them so the popup still opens — goal/notes just come back null.
 */
export async function getPostingItemDetail(
  itemId: string,
): Promise<PostingItemDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let res = await supabase
    .from("posting_plan_items")
    .select(
      "topic, goal, notes, status, scheduled_for, platform, content_type, is_phased",
    )
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (res.error?.code === "42703") {
    // goal/notes (0042) or is_phased (0055) columns not applied yet — retry
    // with the core columns so the popup still opens.
    res = await supabase
      .from("posting_plan_items")
      .select("topic, status, scheduled_for, platform, content_type")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .maybeSingle();
  }
  if (res.error || !res.data) return null;

  const d = res.data as Record<string, unknown>;
  return {
    topic: (d.topic as string | null) ?? null,
    goal: (d.goal as string | null) ?? null,
    notes: (d.notes as string | null) ?? null,
    status: (d.status as ContentStatus) ?? "planned",
    scheduled_for: (d.scheduled_for as string | null) ?? null,
    platform: (d.platform as string | null) ?? null,
    content_type: (d.content_type as string | null) ?? null,
    is_phased: (d.is_phased as boolean | null) ?? false,
  };
}

/** All scheduled phases for a post (empty if none / table not applied yet). */
export async function getPostingItemPhases(
  itemId: string,
): Promise<PostingItemPhase[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("posting_item_phases")
    .select("stage, scheduled_for")
    .eq("item_id", itemId)
    .eq("user_id", user.id);
  if (error || !data) return [];

  return data.map((r) => ({
    stage: (r as { stage: ContentStatus }).stage,
    scheduled_for:
      ((r as { scheduled_for: string | null }).scheduled_for) ?? null,
  }));
}

/**
 * Save a post's production schedule: the single-day vs phased flag plus, when
 * phased, the per-stage dates (only stages with a date are stored). Replaces
 * the post's phase rows wholesale. When phased, the post's primary
 * `scheduled_for` is re-anchored to its "Posted" phase (or the latest phase) so
 * it still places on the calendar. Degrades gracefully pre-migration.
 */
export async function savePostingItemPhases(
  itemId: string,
  input: {
    isPhased: boolean;
    phases: PostingItemPhase[];
  },
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Ownership check.
  const { data: item, error: itemErr } = await supabase
    .from("posting_plan_items")
    .select("id")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (itemErr || !item) {
    return { ok: false, error: itemErr?.message ?? "Post not found." };
  }

  // Flip the flag (ignore if the column isn't there yet).
  const { error: flagErr } = await supabase
    .from("posting_plan_items")
    .update({ is_phased: input.isPhased })
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (flagErr && flagErr.code !== "42703") {
    return { ok: false, error: flagErr.message };
  }

  // Replace phase rows: clear, then insert the dated ones.
  const { error: delErr } = await supabase
    .from("posting_item_phases")
    .delete()
    .eq("item_id", itemId)
    .eq("user_id", user.id);
  if (delErr && delErr.code !== "42P01") {
    return { ok: false, error: delErr.message };
  }

  if (input.isPhased) {
    const rows = input.phases
      .filter((p) => p.scheduled_for)
      .map((p) => ({
        item_id: itemId,
        user_id: user.id,
        stage: p.stage,
        scheduled_for: p.scheduled_for,
      }));

    if (rows.length > 0) {
      const { error: insErr } = await supabase
        .from("posting_item_phases")
        .insert(rows);
      if (insErr) {
        if (insErr.code === "42P01") {
          return {
            ok: false,
            error: "Phases aren't enabled yet — apply migration 0055.",
          };
        }
        return { ok: false, error: insErr.message };
      }

      // Anchor the post's primary date to the publish phase (or the latest).
      const posted = rows.find((r) => r.stage === "posted");
      const anchor =
        posted?.scheduled_for ??
        [...rows]
          .map((r) => r.scheduled_for as string)
          .sort()
          .at(-1);
      if (anchor) {
        await supabase
          .from("posting_plan_items")
          .update({ scheduled_for: anchor })
          .eq("id", itemId)
          .eq("user_id", user.id);
      }
    }
  }

  revalidatePath("/posting");
  return { ok: true };
}

/** Save edits to a post's title/goal/notes/status (from the detail popup). */
export async function updatePostingItemDetail(
  itemId: string,
  input: {
    topic?: string;
    goal?: string;
    notes?: string;
    status?: ContentStatus;
    platform?: PlatformKey;
    content_type?: string;
  },
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const full: Record<string, unknown> = {};
  if (input.topic !== undefined) full.topic = input.topic.trim() || null;
  if (input.status !== undefined) full.status = input.status;
  if (input.goal !== undefined) full.goal = input.goal.trim() || null;
  if (input.notes !== undefined) full.notes = input.notes.trim() || null;
  if (input.platform !== undefined) full.platform = input.platform;
  if (input.content_type !== undefined)
    full.content_type = input.content_type.trim() || null;
  if (Object.keys(full).length === 0) return { ok: true };

  let { error } = await supabase
    .from("posting_plan_items")
    .update(full)
    .eq("id", itemId)
    .eq("user_id", user.id);

  // goal/notes column missing (migration 0042 not applied) → save the rest.
  if (error?.code === "42703") {
    const safe: Record<string, unknown> = {};
    if ("topic" in full) safe.topic = full.topic;
    if ("status" in full) safe.status = full.status;
    if ("platform" in full) safe.platform = full.platform;
    if ("content_type" in full) safe.content_type = full.content_type;
    if (Object.keys(safe).length === 0) return { ok: true };
    ({ error } = await supabase
      .from("posting_plan_items")
      .update(safe)
      .eq("id", itemId)
      .eq("user_id", user.id));
  }
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

/** Duplicate a post within the same plan (title gets a "(copy)" suffix). */
export async function duplicatePostingItem(itemId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  let read = await supabase
    .from("posting_plan_items")
    .select(
      "plan_id, scheduled_for, platform, content_type, topic, goal, notes, status",
    )
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();
  let hasExtra = true;
  if (read.error?.code === "42703") {
    hasExtra = false;
    read = await supabase
      .from("posting_plan_items")
      .select("plan_id, scheduled_for, platform, content_type, topic, status")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .maybeSingle();
  }
  if (read.error || !read.data) {
    return { ok: false, error: read.error?.message ?? "Post not found." };
  }

  const s = read.data as Record<string, unknown>;
  const base: Record<string, unknown> = {
    plan_id: s.plan_id,
    user_id: user.id,
    scheduled_for: (s.scheduled_for as string | null) ?? null,
    platform: s.platform,
    content_type: (s.content_type as string | null) ?? null,
    topic: s.topic ? `${s.topic as string} (copy)` : "Untitled post (copy)",
    status: (s.status as ContentStatus) ?? "planned",
  };
  if (hasExtra) {
    base.goal = (s.goal as string | null) ?? null;
    base.notes = (s.notes as string | null) ?? null;
  }

  let ins = await supabase
    .from("posting_plan_items")
    .insert(base)
    .select("id")
    .single();
  if (ins.error?.code === "42703") {
    delete base.goal;
    delete base.notes;
    ins = await supabase
      .from("posting_plan_items")
      .insert(base)
      .select("id")
      .single();
  }
  if (ins.error) return { ok: false, error: ins.error.message };

  revalidatePath("/posting");
  return { ok: true, id: ins.data?.id };
}
