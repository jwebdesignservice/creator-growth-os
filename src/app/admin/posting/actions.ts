"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/admin/is-admin";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Admin Posting — server actions.

   Every action is gated by an admin check, then performs the write with the
   service-role client (creators' rows are RLS-protected, so admin writes to
   another user's plan/notification/mission must bypass RLS — the admin gate
   is the security boundary).

   Backed by migration 0044_posting_admin_review.sql. If that migration hasn't
   run yet, the review/note writes return a clear "not migrated" message
   instead of a raw Postgres error.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ReviewStatus = "not_reviewed" | "reviewed" | "needs_changes";
const VALID_REVIEW = new Set<ReviewStatus>([
  "not_reviewed",
  "reviewed",
  "needs_changes",
]);

type Gate = { userId: string; svc: SupabaseClient };

async function adminGate(): Promise<Gate | null> {
  const { user, isAdmin } = await getAdminContext();
  if (!user || !isAdmin) return null;
  return { userId: user.id, svc: createServiceClient() };
}

const ok = (): ActionResult => ({ ok: true });
const err = (error: string): ActionResult => ({ ok: false, error });

function humanize(raw: string): string {
  if (/column .* does not exist|schema cache|42703/i.test(raw)) {
    return "Backend not migrated yet — apply migration 0044_posting_admin_review.sql, then try again.";
  }
  return raw;
}

async function planOwner(
  svc: SupabaseClient,
  planId: string,
): Promise<{ userId: string | null; title: string } | null> {
  const { data } = await svc
    .from("posting_plans")
    .select("user_id, title")
    .eq("id", planId)
    .maybeSingle();
  if (!data) return null;
  return { userId: data.user_id ?? null, title: data.title ?? "your plan" };
}

/* ── Review state ─────────────────────────────────────────────────────── */

export async function setReviewStatus(
  planId: string,
  status: ReviewStatus,
): Promise<ActionResult> {
  const gate = await adminGate();
  if (!gate) return err("Admin only.");
  if (!VALID_REVIEW.has(status)) return err("Invalid review status.");

  const reviewing = status !== "not_reviewed";
  const { error } = await gate.svc
    .from("posting_plans")
    .update({
      review_status: status,
      reviewed_by: reviewing ? gate.userId : null,
      reviewed_at: reviewing ? new Date().toISOString() : null,
    })
    .eq("id", planId);

  if (error) return err(humanize(error.message));
  revalidatePath("/admin/posting");
  return ok();
}

/* ── Internal admin note ──────────────────────────────────────────────── */

export async function saveAdminNote(
  planId: string,
  note: string,
): Promise<ActionResult> {
  const gate = await adminGate();
  if (!gate) return err("Admin only.");
  if (note.length > 4000) return err("Note is too long (4000 character max).");

  const { error } = await gate.svc
    .from("posting_plans")
    .update({ admin_note: note.trim() || null })
    .eq("id", planId);

  if (error) return err(humanize(error.message));
  revalidatePath("/admin/posting");
  return ok();
}

/* ── Send reminder (notification) ─────────────────────────────────────── */

export async function sendReminder(planId: string): Promise<ActionResult> {
  const gate = await adminGate();
  if (!gate) return err("Admin only.");
  const owner = await planOwner(gate.svc, planId);
  if (!owner) return err("Plan not found.");
  if (!owner.userId) return err("This plan has no creator to notify.");

  const { error } = await gate.svc.from("notifications").insert({
    user_id: owner.userId,
    title: "Reminder: update your posting plan",
    body: `Your content team would love an update on “${owner.title}”. Add or refresh your scheduled posts when you get a moment.`,
    type: "post_reminder",
    category: "task",
    priority: 3,
    action_label: "Open Posting Plans",
    action_url: "/posting",
    metadata: { source: "admin_posting", plan_id: planId },
  });

  if (error) return err(humanize(error.message));
  return ok();
}

/* ── Add feedback (notification) ──────────────────────────────────────── */

export async function addFeedback(
  planId: string,
  message: string,
): Promise<ActionResult> {
  const gate = await adminGate();
  if (!gate) return err("Admin only.");
  const msg = message.trim();
  if (!msg) return err("Write a short message first.");
  if (msg.length > 1000) return err("Feedback is too long (1000 character max).");
  const owner = await planOwner(gate.svc, planId);
  if (!owner) return err("Plan not found.");
  if (!owner.userId) return err("This plan has no creator to notify.");

  const { error } = await gate.svc.from("notifications").insert({
    user_id: owner.userId,
    title: `Feedback on “${owner.title}”`,
    body: msg,
    type: "coach_message",
    category: "community",
    priority: 2,
    action_label: "Open Posting Plans",
    action_url: "/posting",
    metadata: { source: "admin_posting", plan_id: planId },
  });

  if (error) return err(humanize(error.message));
  return ok();
}

/* ── Assign follow-up task (mission + notification) ───────────────────── */

export async function assignTask(
  planId: string,
  title: string,
  dueDate?: string | null,
): Promise<ActionResult> {
  const gate = await adminGate();
  if (!gate) return err("Admin only.");
  const t = title.trim();
  if (!t) return err("Give the task a title.");
  if (t.length > 200) return err("Task title is too long (200 character max).");
  const owner = await planOwner(gate.svc, planId);
  if (!owner) return err("Plan not found.");
  if (!owner.userId) return err("This plan has no creator to assign to.");

  const { error: missionErr } = await gate.svc.from("missions").insert({
    user_id: owner.userId,
    title: t,
    description: `Follow-up from your content team on “${owner.title}”.`,
    due_date: dueDate || null,
    status: "pending",
  });
  if (missionErr) return err(humanize(missionErr.message));

  // Best-effort heads-up notification — never fail the task on this.
  await gate.svc.from("notifications").insert({
    user_id: owner.userId,
    title: "New task assigned",
    body: t,
    type: "task_assigned",
    category: "task",
    priority: 2,
    action_label: "View tasks",
    action_url: "/missions",
    metadata: { source: "admin_posting", plan_id: planId },
  });

  return ok();
}
