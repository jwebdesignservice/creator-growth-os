"use server";

import { revalidatePath } from "next/cache";
import { requireDevClient } from "@/lib/dev-dashboard/require-dev";
import type { SupportTicketStatus as DbSupportTicketStatus } from "@/lib/support/types";
import {
  DEV_ESCALATION_OPTIONS,
  type DevEscalationState,
  type DevSupportActionResult,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for /dev/support/[ticketId].

   All actions are gated by requireDevClient() which validates that the
   caller is on the dev allowlist. Every mutation also appends a row to
   support_ticket_events so the audit timeline stays in sync.
   ───────────────────────────────────────────────────────────────────────── */

const VALID_DB_STATUSES: ReadonlyArray<DbSupportTicketStatus> = [
  "open",
  "waiting",
  "in_progress",
  "resolved",
  "closed",
];

/** Look up a ticket id (uuid) by its public id ("SUP-10482").
 *  Typed loosely because the project doesn't have generated Supabase types
 *  for the migration-0013 support tables yet. */
type TicketLookup = { id: string; status: DbSupportTicketStatus; subject: string };

async function getTicketIdByPublic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  publicId: string,
): Promise<TicketLookup | null> {
  const { data } = await supabase
    .from("support_tickets")
    .select("id, status, subject")
    .eq("public_id", publicId.toUpperCase())
    .maybeSingle();
  return (data as TicketLookup | null) ?? null;
}

/* ── Change Status ───────────────────────────────────────────────────────── */

export async function changeTicketStatus(
  publicId: string,
  newStatus: DbSupportTicketStatus,
): Promise<DevSupportActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  if (!VALID_DB_STATUSES.includes(newStatus)) {
    return { ok: false, error: "Invalid status." };
  }

  const ticket = await getTicketIdByPublic(ctx.supabase, publicId);
  if (!ticket) return { ok: false, error: "Ticket not found." };
  if (ticket.status === newStatus) return { ok: true };

  const updates: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (newStatus === "resolved" || newStatus === "closed") {
    updates.resolved_at = new Date().toISOString();
  }

  const { error: updErr } = await ctx.supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", ticket.id);
  if (updErr) {
    if (updErr.code === "42P01") {
      return {
        ok: false,
        error: "Support tables not found. Apply migrations 0013_support.sql and 0016_dev_support.sql first.",
      };
    }
    return { ok: false, error: updErr.message };
  }

  await ctx.supabase.from("support_ticket_events").insert({
    ticket_id: ticket.id,
    kind: "status_change",
    actor_email: ctx.user.email ?? null,
    body: `Status changed from ${prettyStatus(ticket.status)} to ${prettyStatus(newStatus)}`,
    meta: { from: ticket.status, to: newStatus },
  });

  revalidatePath(`/dev/support/${publicId.toLowerCase()}`);
  return { ok: true };
}

/* ── Assign ──────────────────────────────────────────────────────────────── */

export async function assignTicket(
  publicId: string,
  assigneeUserId: string | null,
): Promise<DevSupportActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  const ticket = await getTicketIdByPublic(ctx.supabase, publicId);
  if (!ticket) return { ok: false, error: "Ticket not found." };

  // Resolve assignee email so the legacy `assigned_to_email` stays in sync.
  let assigneeEmail: string | null = null;
  let assigneeName: string | null = null;
  if (assigneeUserId) {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("email, display_name, full_name")
      .eq("id", assigneeUserId)
      .maybeSingle();
    if (!profile) return { ok: false, error: "Assignee profile not found." };
    assigneeEmail = profile.email ?? null;
    assigneeName  = profile.display_name ?? profile.full_name ?? profile.email ?? "Unknown";
  }

  const { error: updErr } = await ctx.supabase
    .from("support_tickets")
    .update({
      assignee_user_id: assigneeUserId,
      assigned_to_email: assigneeEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket.id);
  if (updErr) {
    if (updErr.code === "42P01") {
      return { ok: false, error: "Support tables not found. Apply migrations first." };
    }
    return { ok: false, error: updErr.message };
  }

  await ctx.supabase.from("support_ticket_events").insert({
    ticket_id: ticket.id,
    kind: "assignment",
    actor_user_id: assigneeUserId,
    actor_email: ctx.user.email ?? null,
    body: assigneeName
      ? `Assigned to ${assigneeName}`
      : "Unassigned",
    meta: { assignee_user_id: assigneeUserId },
  });

  revalidatePath(`/dev/support/${publicId.toLowerCase()}`);
  return { ok: true };
}

/* ── Escalate ────────────────────────────────────────────────────────────── */

export async function escalateTicket(
  publicId: string,
  state: DevEscalationState | null,
): Promise<DevSupportActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  if (state !== null && !DEV_ESCALATION_OPTIONS.includes(state)) {
    return { ok: false, error: "Invalid escalation state." };
  }

  const ticket = await getTicketIdByPublic(ctx.supabase, publicId);
  if (!ticket) return { ok: false, error: "Ticket not found." };

  const now = new Date().toISOString();
  const { error: updErr } = await ctx.supabase
    .from("support_tickets")
    .update({
      escalation_state: state,
      escalated_at: state ? now : null,
      updated_at: now,
    })
    .eq("id", ticket.id);
  if (updErr) return { ok: false, error: updErr.message };

  await ctx.supabase.from("support_ticket_events").insert({
    ticket_id: ticket.id,
    kind: "escalation",
    actor_email: ctx.user.email ?? null,
    body: state ? `Escalated: ${state}` : "Escalation cleared",
    meta: { escalation_state: state },
  });

  revalidatePath(`/dev/support/${publicId.toLowerCase()}`);
  return { ok: true };
}

/* ── Reply to Client ─────────────────────────────────────────────────────── */

const REPLY_MIN_LEN = 1;
const REPLY_MAX_LEN = 5000;

export async function replyToTicket(
  publicId: string,
  message: string,
): Promise<DevSupportActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  const trimmed = message.trim();
  if (trimmed.length < REPLY_MIN_LEN) {
    return { ok: false, error: "Reply cannot be empty." };
  }
  if (trimmed.length > REPLY_MAX_LEN) {
    return { ok: false, error: `Reply too long (max ${REPLY_MAX_LEN} characters).` };
  }

  const ticket = await getTicketIdByPublic(ctx.supabase, publicId);
  if (!ticket) return { ok: false, error: "Ticket not found." };

  const { error: msgErr } = await ctx.supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticket.id,
      author_role: "support",
      author_email: ctx.user.email ?? null,
      body: trimmed,
    });
  if (msgErr) {
    if (msgErr.code === "42P01") {
      return { ok: false, error: "Support tables not found. Apply migrations first." };
    }
    return { ok: false, error: msgErr.message };
  }

  // Touch updated_at so the queue sort surfaces this ticket again.
  await ctx.supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticket.id);

  revalidatePath(`/dev/support/${publicId.toLowerCase()}`);
  return { ok: true };
}

/* ── Add Internal Note ───────────────────────────────────────────────────── */

const NOTE_MIN_LEN = 1;
const NOTE_MAX_LEN = 5000;

export async function addInternalNote(
  publicId: string,
  body: string,
): Promise<DevSupportActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  const trimmed = body.trim();
  if (trimmed.length < NOTE_MIN_LEN) {
    return { ok: false, error: "Note cannot be empty." };
  }
  if (trimmed.length > NOTE_MAX_LEN) {
    return { ok: false, error: `Note too long (max ${NOTE_MAX_LEN} characters).` };
  }

  const ticket = await getTicketIdByPublic(ctx.supabase, publicId);
  if (!ticket) return { ok: false, error: "Ticket not found." };

  const { error: evtErr } = await ctx.supabase
    .from("support_ticket_events")
    .insert({
      ticket_id: ticket.id,
      kind: "internal_note",
      actor_email: ctx.user.email ?? null,
      body: trimmed,
    });
  if (evtErr) {
    if (evtErr.code === "42P01") {
      return { ok: false, error: "Support tables not found. Apply migrations first." };
    }
    return { ok: false, error: evtErr.message };
  }

  await ctx.supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticket.id);

  revalidatePath(`/dev/support/${publicId.toLowerCase()}`);
  return { ok: true };
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function prettyStatus(s: DbSupportTicketStatus): string {
  switch (s) {
    case "open":        return "Open";
    case "waiting":     return "Waiting Client";
    case "in_progress": return "In Progress";
    case "resolved":    return "Resolved";
    case "closed":      return "Closed";
  }
}
