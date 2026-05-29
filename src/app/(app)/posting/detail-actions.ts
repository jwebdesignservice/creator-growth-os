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
    .select("topic, goal, notes, status, scheduled_for, platform, content_type")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (res.error?.code === "42703") {
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
  };
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
