"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireDevClient } from "./require-dev";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for /dev/support.

   Every action is double-gated:
   1. requireDevClient() refuses non-dev callers using the auth-scoped
      cookie session (defense-in-depth — the layout already redirects
      non-devs, but actions can be hit by direct POSTs).
   2. The actual DB write goes through the SERVICE-ROLE client so it
      can read/write any user's ticket without tripping RLS.

   Every mutation revalidates /dev/support so the page re-renders with
   fresh data on success.
   ───────────────────────────────────────────────────────────────────────── */

export type DevActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const VALID_TOPICS = [
  "billing", "technical", "account", "content",
  "posting", "community", "coaching", "feature", "other",
] as const;
const VALID_STATUSES = ["open", "waiting", "in_progress", "resolved", "closed"] as const;
const VALID_ESCALATIONS = [
  "Escalated to Engineering",
  "Awaiting Client Reply",
  "Awaiting Internal Review",
] as const;
const VALID_SOURCES = ["Web Portal", "Email", "API", "Chat"] as const;

function f(v: FormDataEntryValue | null, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

/* ── createSupportTicket ─────────────────────────────────────────────
   Used by the "Create Ticket" modal. The dev fills in: client email (we
   look up the user_id), subject, category, priority, description, plus
   optional source / affected area / SLA deadline.                       */

export async function createSupportTicket(
  _prev: DevActionResult<{ publicId: string }> | null,
  formData: FormData,
): Promise<DevActionResult<{ publicId: string }>> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };

  const clientEmail   = f(formData.get("clientEmail"), 200).toLowerCase();
  const subject       = f(formData.get("subject"), 160);
  const category      = f(formData.get("category"), 64);
  const topicRaw      = f(formData.get("topic"), 32).toLowerCase() || "technical";
  const priorityRaw   = f(formData.get("priority"), 16).toLowerCase() || "medium";
  const sourceRaw     = f(formData.get("source"), 32) || "Web Portal";
  const affectedArea  = f(formData.get("affectedArea"), 64);
  const slaDeadlineIn = f(formData.get("slaDeadline"), 64);
  const description   = f(formData.get("description"), 2000);

  const fieldErrors: Record<string, string> = {};
  if (!clientEmail || !/^\S+@\S+\.\S+$/.test(clientEmail))                fieldErrors.clientEmail = "Enter a valid client email.";
  if (!subject)                                                           fieldErrors.subject     = "Give the ticket a short title.";
  if (description.length < 10)                                            fieldErrors.description = "Description must be at least 10 characters.";
  if (!(VALID_PRIORITIES as readonly string[]).includes(priorityRaw))     fieldErrors.priority    = "Pick a priority.";
  if (!(VALID_TOPICS as readonly string[]).includes(topicRaw))            fieldErrors.topic       = "Pick a topic.";
  if (!(VALID_SOURCES as readonly string[]).includes(sourceRaw))          fieldErrors.source      = "Pick a source.";
  let slaDeadline: string | null = null;
  if (slaDeadlineIn) {
    const t = new Date(slaDeadlineIn).getTime();
    if (Number.isNaN(t)) fieldErrors.slaDeadline = "Invalid SLA deadline.";
    else slaDeadline = new Date(t).toISOString();
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const service = createServiceClient();

  // Look the client up by email (case-insensitive).
  const { data: profile } = await service
    .from("profiles")
    .select("id")
    .ilike("email", clientEmail)
    .maybeSingle();
  if (!profile) {
    return { ok: false, error: `No profile found for ${clientEmail}.`, fieldErrors: { clientEmail: "Unknown client." } };
  }

  const { data, error } = await service
    .from("support_tickets")
    .insert({
      user_id:        (profile as { id: string }).id,
      subject,
      topic:          topicRaw,
      priority:       priorityRaw,
      page_affected:  affectedArea || null,
      device:         "Created via /dev/support",
      description,
      source:         sourceRaw,
      category:       category || null,
      affected_area:  affectedArea || null,
      sla_deadline:   slaDeadline,
      assignee_user_id: gate.user.id,
    })
    .select("public_id")
    .single();

  if (error || !data) {
    if (error?.code === "42P01") {
      return { ok: false, error: "Support schema not found. Apply migrations 0013 and 0016 first." };
    }
    if (error?.code === "42703") {
      return { ok: false, error: "Support columns missing. Apply migration 0016_dev_support.sql." };
    }
    return { ok: false, error: error?.message ?? "Could not create the ticket." };
  }

  await service.from("support_ticket_events").insert({
    ticket_id:     null, // resolved below
    kind:          "status_change",
    actor_user_id: gate.user.id,
    actor_email:   gate.user.email ?? null,
    body:          `Ticket created via dev console (assigned to ${gate.user.email ?? "dev"}).`,
    meta:          { source: sourceRaw, priority: priorityRaw },
  // We don't have the new uuid in `data` (we only selected public_id),
  // so resolve via a follow-up read and then patch the inserted event.
  });
  // Patch the orphan event we just inserted so it links to the new ticket.
  const publicId = data.public_id as string;
  await service
    .from("support_ticket_events")
    .update({ ticket_id: await idForPublic(service, publicId) })
    .is("ticket_id", null)
    .eq("body", `Ticket created via dev console (assigned to ${gate.user.email ?? "dev"}).`);

  revalidatePath("/dev/support");
  return { ok: true, data: { publicId } };
}

/* ── updateInternalNotes ─────────────────────────────────────────── */

export async function updateInternalNotes(
  ticketPublicId: string,
  notes: string,
): Promise<DevActionResult> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  const service = createServiceClient();
  const trimmed = notes.trim().slice(0, 4000);

  const { error } = await service
    .from("support_tickets")
    .update({ internal_notes: trimmed })
    .eq("public_id", ticketPublicId);
  if (error) return { ok: false, error: error.message };

  await logEvent(service, ticketPublicId, {
    kind: "internal_note",
    body: trimmed || "(notes cleared)",
    actorUserId: gate.user.id,
    actorEmail: gate.user.email ?? null,
  });
  revalidatePath("/dev/support");
  return { ok: true };
}

/* ── escalateTicket ──────────────────────────────────────────────── */

export async function escalateTicket(
  ticketPublicId: string,
  state: (typeof VALID_ESCALATIONS)[number] = "Escalated to Engineering",
): Promise<DevActionResult> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!(VALID_ESCALATIONS as readonly string[]).includes(state)) {
    return { ok: false, error: "Invalid escalation state." };
  }
  const service = createServiceClient();

  const { error } = await service
    .from("support_tickets")
    .update({ escalation_state: state, escalated_at: new Date().toISOString() })
    .eq("public_id", ticketPublicId);
  if (error) return { ok: false, error: error.message };

  await logEvent(service, ticketPublicId, {
    kind: "escalation",
    body: `Ticket escalated — ${state}.`,
    actorUserId: gate.user.id,
    actorEmail: gate.user.email ?? null,
    meta: { state },
  });
  revalidatePath("/dev/support");
  return { ok: true };
}

/* ── assignTicket ───────────────────────────────────────────────── */

export async function assignTicket(
  ticketPublicId: string,
  assigneeUserId: string | null,
): Promise<DevActionResult> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  const service = createServiceClient();
  const { error } = await service
    .from("support_tickets")
    .update({ assignee_user_id: assigneeUserId })
    .eq("public_id", ticketPublicId);
  if (error) return { ok: false, error: error.message };

  await logEvent(service, ticketPublicId, {
    kind: "assignment",
    body: assigneeUserId ? `Assigned to ${assigneeUserId}.` : "Unassigned.",
    actorUserId: gate.user.id,
    actorEmail: gate.user.email ?? null,
  });
  revalidatePath("/dev/support");
  return { ok: true };
}

/* ── updateStatus ───────────────────────────────────────────────── */

export async function updateStatus(
  ticketPublicId: string,
  status: (typeof VALID_STATUSES)[number],
): Promise<DevActionResult> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const service = createServiceClient();

  const patch: Record<string, unknown> = { status };
  if (status === "resolved" || status === "closed") {
    patch.resolved_at = new Date().toISOString();
  }
  const { error } = await service
    .from("support_tickets")
    .update(patch)
    .eq("public_id", ticketPublicId);
  if (error) return { ok: false, error: error.message };

  await logEvent(service, ticketPublicId, {
    kind: "status_change",
    body: `Status changed to "${status}".`,
    actorUserId: gate.user.id,
    actorEmail: gate.user.email ?? null,
    meta: { status },
  });
  revalidatePath("/dev/support");
  return { ok: true };
}

/* ── resetCsatRating ─────────────────────────────────────────────
   Lets a dev record a CSAT score for a resolved ticket — feeds the
   metric card on next render.                                       */
export async function setCsatRating(
  ticketPublicId: string,
  rating: number,
): Promise<DevActionResult> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be an integer 1–5." };
  }
  const service = createServiceClient();
  const { error } = await service
    .from("support_tickets")
    .update({ csat_rating: rating })
    .eq("public_id", ticketPublicId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dev/support");
  return { ok: true };
}

/* ── exportTicketsCsv ────────────────────────────────────────────── */

export async function exportTicketsCsv(): Promise<DevActionResult<{ csv: string; filename: string }>> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  const service = createServiceClient();
  const { data, error } = await service
    .from("support_tickets")
    .select(
      "public_id, subject, category, topic, priority, status, source, affected_area, escalation_state, sla_deadline, created_at, updated_at, resolved_at, assigned_to_email",
    )
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error || !data) return { ok: false, error: error?.message ?? "Could not read tickets." };

  const cols = [
    "public_id", "subject", "category", "topic", "priority", "status",
    "source", "affected_area", "escalation_state", "sla_deadline",
    "created_at", "updated_at", "resolved_at", "assigned_to_email",
  ];
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(",");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data as any[]).map((r) => cols.map((c) => escape(r[c])).join(","));
  const csv = [header, ...rows].join("\n");
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return { ok: true, data: { csv, filename: `support-tickets-${ts}.csv` } };
}

/* ── postReply ────────────────────────────────────────────────────
   Internal-side reply that appears in the timeline (and is visible
   to the client on /support).                                          */
export async function postReply(
  ticketPublicId: string,
  body: string,
): Promise<DevActionResult> {
  const gate = await requireDevClient();
  if (!gate.ok) return { ok: false, error: gate.error };
  const trimmed = body.trim().slice(0, 4000);
  if (trimmed.length === 0) return { ok: false, error: "Reply cannot be empty." };
  const service = createServiceClient();
  const ticketId = await idForPublic(service, ticketPublicId);
  if (!ticketId) return { ok: false, error: "Ticket not found." };

  const { error } = await service.from("support_ticket_messages").insert({
    ticket_id:    ticketId,
    author:       "support",
    author_email: gate.user.email ?? null,
    body:         trimmed,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dev/support");
  return { ok: true };
}

/* ── Helpers ─────────────────────────────────────────────────────── */

async function idForPublic(
  service: ReturnType<typeof createServiceClient>,
  publicId: string,
): Promise<string | null> {
  const { data } = await service
    .from("support_tickets")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function logEvent(
  service: ReturnType<typeof createServiceClient>,
  ticketPublicId: string,
  evt: {
    kind: string;
    body: string;
    actorUserId: string | null;
    actorEmail: string | null;
    meta?: Record<string, unknown>;
  },
) {
  const ticketId = await idForPublic(service, ticketPublicId);
  if (!ticketId) return;
  await service.from("support_ticket_events").insert({
    ticket_id:     ticketId,
    kind:          evt.kind,
    actor_user_id: evt.actorUserId,
    actor_email:   evt.actorEmail,
    body:          evt.body,
    meta:          evt.meta ?? null,
  });
}
