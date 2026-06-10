"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  SupportTicketPriority,
  SupportTicketTopic,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for the Support system.

   - submitSupportTicket: validates the form, optionally uploads an
     attachment to the `support-attachments` Storage bucket, inserts the
     ticket row, and revalidates the support pages.
   - addTicketMessage:    appends a user follow-up to an existing ticket.
   - closeTicket:         marks the user's own ticket as resolved.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const VALID_TOPICS: ReadonlyArray<SupportTicketTopic> = [
  "billing", "technical", "account", "content",
  "posting", "community", "coaching", "feature", "other",
];
const VALID_PRIORITIES: ReadonlyArray<SupportTicketPriority> = [
  "low", "medium", "high", "urgent",
];

const SUBJECT_MAX = 160;
const DESC_MIN = 10;
const DESC_MAX = 2000;
const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ATTACHMENT_BUCKET = "support-attachments";

function trimStr(v: FormDataEntryValue | null, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function isTopic(v: string): v is SupportTicketTopic {
  return (VALID_TOPICS as ReadonlyArray<string>).includes(v);
}
function isPriority(v: string): v is SupportTicketPriority {
  return (VALID_PRIORITIES as ReadonlyArray<string>).includes(v);
}

/* ─────────────────────────────────────────────────────────────────────────
   submitSupportTicket
   ───────────────────────────────────────────────────────────────────────── */

export async function submitSupportTicket(
  _prev: ActionResult<{ publicId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ publicId: string }>> {
  const supabase = await createClient();

  // Must be signed in. RLS would block the insert anyway, but failing
  // early gives the client a cleaner error message.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to submit a request." };

  /* ── Parse + validate ────────────────────────────────────────────── */
  const topicRaw       = trimStr(formData.get("topic"), 32).toLowerCase();
  const subject        = trimStr(formData.get("subject"), SUBJECT_MAX);
  const pageAffected   = trimStr(formData.get("pageAffected"), 64);
  const priorityRaw    = trimStr(formData.get("priority"), 16).toLowerCase();
  const device         = trimStr(formData.get("device"), 200);
  const description    = trimStr(formData.get("description"), DESC_MAX);
  const ticketRef      = trimStr(formData.get("ticketRef"), 120);
  const attachment     = formData.get("attachment");
  const attachmentFile = attachment instanceof File && attachment.size > 0 ? attachment : null;

  const fieldErrors: Record<string, string> = {};
  if (!subject)                          fieldErrors.subject      = "Please give your request a short title.";
  if (subject.length > SUBJECT_MAX)      fieldErrors.subject      = `Title must be ${SUBJECT_MAX} characters or fewer.`;
  if (!isTopic(topicRaw))                fieldErrors.topic        = "Choose a support topic to continue.";
  if (!pageAffected)                     fieldErrors.pageAffected = "Tell us which page or area is affected.";
  if (!isPriority(priorityRaw))          fieldErrors.priority     = "Choose a priority.";
  if (!device)                           fieldErrors.device       = "Tell us which device or browser you’re using.";
  if (description.length < DESC_MIN)     fieldErrors.description  = `Please describe the issue in at least ${DESC_MIN} characters.`;
  if (description.length > DESC_MAX)     fieldErrors.description  = `Description must be ${DESC_MAX} characters or fewer.`;
  if (attachmentFile && attachmentFile.size > ATTACHMENT_MAX_BYTES) {
    fieldErrors.attachment = "Attachment must be 10 MB or smaller.";
  }
  if (attachmentFile && !/^image\/(png|jpeg)$/i.test(attachmentFile.type)) {
    fieldErrors.attachment = "Attachment must be a PNG or JPG image.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  // After the validation above we can safely narrow.
  const topic    = topicRaw as SupportTicketTopic;
  const priority = priorityRaw as SupportTicketPriority;

  /* ── Optional attachment upload ──────────────────────────────────── */
  let attachmentPath: string | null = null;
  let attachmentName: string | null = null;
  let attachmentSize: number | null = null;

  if (attachmentFile) {
    // Path is namespaced by user id so the Storage RLS policy can
    // restrict reads/writes per-user without a separate join.
    const safeName = attachmentFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 80);
    const ts = Date.now();
    const path = `${user.id}/${ts}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, attachmentFile, {
        contentType: attachmentFile.type,
        upsert:      false,
      });

    if (uploadError) {
      // Bucket missing or storage RLS blocked us — log it and continue
      // so the ticket still saves. The dev-side migration includes setup
      // instructions for the bucket.
      console.warn("[support] attachment upload skipped:", uploadError.message);
    } else {
      attachmentPath = path;
      attachmentName = attachmentFile.name;
      attachmentSize = attachmentFile.size;
    }
  }

  /* ── Insert ticket row ───────────────────────────────────────────── */
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id:         user.id,
      subject,
      topic,
      page_affected:   pageAffected,
      priority,
      device,
      description,
      ticket_ref:      ticketRef || null,
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      attachment_size: attachmentSize,
    })
    .select("public_id")
    .single();

  if (error || !data) {
    // 42P01 = undefined_table. Make the message legible instead of leaking
    // the raw Postgres error code to the UI.
    if (error?.code === "42P01") {
      return {
        ok: false,
        error: "Support tickets table not found. Apply migration 0013_support.sql first.",
      };
    }
    return { ok: false, error: error?.message ?? "Could not submit your request." };
  }

  revalidatePath("/support");
  revalidatePath("/support/tickets");
  return { ok: true, data: { publicId: data.public_id as string } };
}

/* ─────────────────────────────────────────────────────────────────────────
   addTicketMessage — post a follow-up reply on an open ticket.
   ───────────────────────────────────────────────────────────────────────── */

export async function addTicketMessage(
  ticketId: string,
  body: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const trimmed = body.trim().slice(0, 4000);
  if (trimmed.length === 0) {
    return { ok: false, error: "Message cannot be empty." };
  }

  // Confirm the ticket belongs to the caller before inserting. RLS enforces
  // this too (support_messages_insert_own), but scoping here as well matches
  // closeTicket and keeps the action safe on its own.
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!ticket) return { ok: false, error: "Ticket not found." };

  const { error } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    author:    "user",
    author_email: user.email ?? null,
    body:      trimmed,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/support/tickets`);
  return { ok: true };
}

/* ─────────────────────────────────────────────────────────────────────────
   closeTicket — user marks their own ticket as resolved.
   ───────────────────────────────────────────────────────────────────────── */

export async function closeTicket(publicId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("support_tickets")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("public_id", publicId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/support");
  revalidatePath("/support/tickets");
  return { ok: true };
}
