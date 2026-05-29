"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyPostingPlanUpdated } from "@/lib/notifications/service";
import type {
  ContentStatus,
  PlatformKey,
} from "@/lib/posting/queries";

type Result = { ok: true; id?: string } | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────

export async function createPostingPlan(input: {
  title: string;
  week_start: string;
  description?: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  if (!input.week_start) return { ok: false, error: "Week start is required." };

  // Archive existing active plan for the same user (single active plan per user)
  await supabase
    .from("posting_plans")
    .update({ status: "archived" })
    .eq("user_id", user.id)
    .eq("status", "active");

  const { data, error } = await supabase
    .from("posting_plans")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      week_start: input.week_start,
      description: input.description?.trim() || null,
      status: "active",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await notifyPostingPlanUpdated(user.id);
  revalidatePath("/posting");
  return { ok: true, id: data.id };
}

export async function updatePostingPlan(
  planId: string,
  input: { title?: string; week_start?: string; description?: string },
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) return { ok: false, error: "Title is required." };
    update.title = t;
  }
  if (input.week_start !== undefined) {
    if (!input.week_start) return { ok: false, error: "Week start is required." };
    update.week_start = input.week_start;
  }
  if (input.description !== undefined) {
    update.description = input.description.trim() || null;
  }
  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await supabase
    .from("posting_plans")
    .update(update)
    .eq("id", planId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

export async function archivePostingPlan(planId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("posting_plans")
    .update({ status: "archived" })
    .eq("id", planId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Items
// ─────────────────────────────────────────────────────────────────────

export async function createPostingItem(input: {
  plan_id: string;
  scheduled_for?: string;
  platform: PlatformKey;
  content_type?: string;
  topic?: string;
  goal?: string;
  notes?: string;
  status?: ContentStatus;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const base = {
    plan_id: input.plan_id,
    user_id: user.id,
    scheduled_for: input.scheduled_for ?? null,
    platform: input.platform,
    content_type: input.content_type?.trim() || null,
    topic: input.topic?.trim() || null,
    status: input.status ?? "planned",
  };

  // goal + notes arrive with migration 0042 — if it hasn't been applied yet
  // (42703 = undefined_column), retry without them so the form still saves.
  let { error } = await supabase.from("posting_plan_items").insert({
    ...base,
    goal: input.goal?.trim() || null,
    notes: input.notes?.trim() || null,
  });
  if (error && error.code === "42703") {
    ({ error } = await supabase.from("posting_plan_items").insert(base));
  }
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

/**
 * Duplicate a planned post — clones every field into a new "(copy)" row on the
 * same plan, date and status. The user can then reschedule/edit the copy.
 * Reads + writes tolerate the pre-0042 schema (no goal/notes columns).
 */
export async function duplicatePostingItem(itemId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Read the source row. Try the modern columns (goal/notes from 0042) and
  // fall back to the legacy set when that migration isn't applied yet.
  const cols =
    "plan_id, scheduled_for, platform, content_type, topic, status, goal, notes";
  const legacyCols =
    "plan_id, scheduled_for, platform, content_type, topic, status";

  let src: Record<string, unknown> | null = null;
  const modern = await supabase
    .from("posting_plan_items")
    .select(cols)
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (modern.error && modern.error.code === "42703") {
    const legacy = await supabase
      .from("posting_plan_items")
      .select(legacyCols)
      .eq("id", itemId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (legacy.error) return { ok: false, error: legacy.error.message };
    src = legacy.data as Record<string, unknown> | null;
  } else if (modern.error) {
    return { ok: false, error: modern.error.message };
  } else {
    src = modern.data as Record<string, unknown> | null;
  }
  if (!src) return { ok: false, error: "Post not found." };

  const topic = (src.topic as string | null) ?? null;
  const base = {
    plan_id: src.plan_id as string,
    user_id: user.id,
    scheduled_for: (src.scheduled_for as string | null) ?? null,
    platform: src.platform as PlatformKey,
    content_type: (src.content_type as string | null) ?? null,
    topic: topic ? `${topic} (copy)` : null,
    // A duplicate is a fresh piece of content — start it at the beginning of the
    // pipeline ("planned", the new-post default) rather than inheriting a
    // "posted"/"filmed"/etc. status from the original, which would be illogical.
    status: "planned" as ContentStatus,
  };

  let insert = await supabase
    .from("posting_plan_items")
    .insert({
      ...base,
      goal: (src.goal as string | null) ?? null,
      notes: (src.notes as string | null) ?? null,
    })
    .select("id")
    .single();
  if (insert.error && insert.error.code === "42703") {
    insert = await supabase
      .from("posting_plan_items")
      .insert(base)
      .select("id")
      .single();
  }
  if (insert.error) return { ok: false, error: insert.error.message };

  revalidatePath("/posting");
  return { ok: true, id: insert.data?.id };
}

export async function updateItemStatus(
  itemId: string,
  status: ContentStatus,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("posting_plan_items")
    .update({ status })
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

export async function deletePostingItem(itemId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("posting_plan_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

/** Move a planned post to a new date/time (drag-and-drop in the calendar). */
export async function rescheduleItem(
  itemId: string,
  scheduledFor: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!scheduledFor) return { ok: false, error: "Missing target date." };

  const { error } = await supabase
    .from("posting_plan_items")
    .update({ scheduled_for: scheduledFor })
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}
