"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import {
  substituteVariables,
  type VariableContext,
} from "@/lib/email/variables";
import {
  planCampaignSend,
  validateSendContent,
  type Recipient as SafeRecipient,
} from "@/lib/email/safety";
import { BRAND_NAME } from "@/lib/brand";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions backing the /admin/emails Compose page.
   - `sendCampaign` resolves the audience filter to a list of recipients,
     personalises subject + body per recipient, and sends via Resend.
   - `sendTestEmail` sends a single message to the calling admin's own
     inbox using sample variable substitutions.
   ───────────────────────────────────────────────────────────────────────── */

export type Audience = "all" | "active" | "program";

export type ComposeInput = {
  audience:     Audience;
  programId:    string;   // "" if not in program mode
  subject:      string;
  message:      string;   // plain text + light markdown (**bold**, *italic*, [text](url))
  useTemplate:  boolean;
  trackOpens:   boolean;
  templateId?:  string;   // optional reference back to the source template
};

export type SendResult =
  | {
      ok: true;
      sent: number;
      skipped: number;
      firstId?: string;
      messageId?: string;
      /** Present when the safety layer changed delivery (e.g. safe mode). */
      notice?: string;
      mode?: "live" | "safe";
    }
  | { ok: false; error: string };

export type SimpleResult =
  | { ok: true;  id?: string }
  | { ok: false; error: string };

/* ── Public actions ──────────────────────────────────────────────────────── */

export async function sendCampaign(input: ComposeInput): Promise<SendResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { data: { user: adminUser } } = await guard.supabase.auth.getUser();
  const adminUserId = adminUser?.id ?? null;

  // Validate content before doing any audience resolution or sending.
  const contentCheck = validateSendContent(input.subject, input.message);
  if (!contentCheck.ok) return { ok: false, error: contentCheck.error };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email backend not configured (RESEND_API_KEY missing). Add the key in .env.local and Vercel to enable sending.",
    };
  }

  // Service client bypasses RLS so an admin can read every profile email.
  const service = createServiceClient();
  const recipients = await resolveAudience(service, input);
  if (recipients.length === 0) {
    return { ok: false, error: "No matching recipients for this audience." };
  }

  let programName = "";
  if (input.programId) {
    const { data: prog } = await service
      .from("programs")
      .select("title")
      .eq("id", input.programId)
      .maybeSingle();
    programName = (prog?.title as string | undefined) ?? "";
  }

  // ── SAFETY GATE ────────────────────────────────────────────────────────
  // Decide the real delivery targets. In safe mode this redirects to the
  // test inbox and caps the send; in live mode it validates + enforces the
  // max-recipient cap. Either way nothing has been emailed yet.
  const plan = planCampaignSend(recipients as SafeRecipient[], adminUser?.email);
  if (!plan.ok) return { ok: false, error: plan.error };

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? `${BRAND_NAME} <onboarding@resend.dev>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorgrowth.app";

  // Resolve sender + send-time values once — both are constant for the whole
  // campaign loop, so doing it inside the per-recipient block would waste
  // work and risk drift between recipients.
  const senderName =
    (adminUser?.user_metadata?.full_name as string | undefined) ??
    (adminUser?.user_metadata?.display_name as string | undefined) ??
    adminUser?.email?.split("@")[0] ??
    "";
  const currentDate = formatDateForEmail(new Date());

  let sent = 0;
  let skipped = 0;
  let firstId: string | undefined;
  let firstError: string | undefined;

  for (const r of plan.targets) {
    const ctx: VariableContext = {
      first_name:    firstNameFrom(r.full_name) || "there",
      full_name:     r.full_name ?? "",
      email:         r.email,
      plan_name:     planLabel(r.plan),
      program_name:  programName,
      cta_link:      `${appUrl}/dashboard`,
      platform_name: BRAND_NAME,
      sender_name:   senderName,
      current_date:  currentDate,
      custom_field:  "",
    };
    const subject = plan.subjectPrefix + substituteVariables(input.subject, ctx);
    const text    = (plan.bodyBanner ?? "") + substituteVariables(input.message, ctx);
    const html    = renderEmailHtml({
      subject,
      bodyText:    text,
      useTemplate: input.useTemplate,
      appUrl,
    });

    try {
      const res = await resend.emails.send({
        from,
        to: r.email,
        subject,
        html,
        text,
      });
      if (res.error) {
        skipped += 1;
        if (!firstError) firstError = res.error.message ?? String(res.error);
        console.error("[email/campaign] Resend error:", res.error);
        continue;
      }
      if (!firstId && res.data?.id) firstId = res.data.id;
      sent += 1;
    } catch (err) {
      skipped += 1;
      if (!firstError) firstError = err instanceof Error ? err.message : String(err);
      console.error("[email/campaign] Send failure:", err);
    }
  }

  // Persist a single row representing this campaign in email_messages so
  // /admin/emails/history can list / resend / delete it. recipients_total is
  // the full resolved audience (what a live send would reach) so the History
  // log stays honest even when safe mode redirected the actual delivery.
  const status: EmailMessageStatus = sent > 0 ? "sent" : "failed";
  const messageId = await recordCampaignMessage(service, {
    sent_by:              adminUserId,
    template_id:          input.templateId ?? null,
    audience:             input.audience,
    program_id:           input.programId || null,
    audience_label:
      plan.mode === "safe"
        ? `${audienceLabel(input.audience, programName)} · Safe mode preview`
        : audienceLabel(input.audience, programName),
    recipients_total:     plan.audienceTotal,
    recipients_delivered: sent,
    subject:              input.subject,
    body:                 input.message,
    status,
    sent_at:              status === "sent" ? new Date().toISOString() : null,
    use_branded_template: input.useTemplate,
    track_opens:          input.trackOpens,
    error_message:        status === "failed" ? (firstError ?? "All recipients failed to send.") : null,
  });

  revalidatePath("/admin/emails/history");

  return { ok: true, sent, skipped, firstId, messageId, notice: plan.notice ?? undefined, mode: plan.mode };
}

export async function sendTestEmail(input: ComposeInput): Promise<SendResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "Email backend not configured (RESEND_API_KEY missing).",
    };
  }

  const {
    data: { user },
  } = await guard.supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, error: "Could not determine your email address." };
  }

  const adminFullName =
    (user.user_metadata?.full_name as string | undefined) ?? "";
  const adminFirstName = firstNameFrom(adminFullName) || "there";

  const ctx: VariableContext = {
    first_name:    adminFirstName,
    full_name:     adminFullName,
    email:         user.email ?? "",
    plan_name:     "Pro",
    program_name:  "Sample Program",
    cta_link:      `${process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorgrowth.app"}/dashboard`,
    platform_name: BRAND_NAME,
    sender_name:   adminFullName,
    current_date:  formatDateForEmail(new Date()),
    custom_field:  "",
  };

  const subject = `[TEST] ${substituteVariables(input.subject || "Untitled campaign", ctx)}`;
  const text    = substituteVariables(input.message || "(empty message)", ctx);
  const html    = renderEmailHtml({
    subject,
    bodyText:    text,
    useTemplate: input.useTemplate,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorgrowth.app",
  });

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? `${BRAND_NAME} <onboarding@resend.dev>`,
      to: user.email,
      subject,
      html,
      text,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, sent: 1, skipped: 0, firstId: result.data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/* ── Audience resolution ─────────────────────────────────────────────────── */

type DbRecipient = {
  id: string;
  email: string;
  full_name: string | null;
  /** "free" | "basic" | "pro" — surfaced so `{{ plan_name }}` can render. */
  plan: string | null;
};
type DbProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  plan?: string | null;
};

async function resolveAudience(
  service: SupabaseClient,
  input: ComposeInput,
): Promise<DbRecipient[]> {
  if (input.audience === "program" && input.programId) {
    const { data: progress } = await service
      .from("program_progress")
      .select("user_id")
      .eq("program_id", input.programId);
    const userIds = (progress ?? []).map((r: { user_id: string }) => r.user_id);
    if (userIds.length === 0) return [];

    const profiles = await fetchProfilesWithEmail(service, userIds);
    return profiles;
  }

  // "all" or "active" — pull every profile, optionally filter onboarded.
  const profiles = await fetchProfilesWithEmail(
    service,
    null,
    input.audience === "active",
  );
  return profiles;
}

/**
 * Load profiles + their auth email. `profiles.email` may or may not be
 * mirrored, so we read `auth.users.email` via the admin API for the
 * canonical address and merge it onto the profile row.
 */
async function fetchProfilesWithEmail(
  service: SupabaseClient,
  userIdFilter: string[] | null,
  activeOnly = false,
): Promise<DbRecipient[]> {
  let q = service.from("profiles").select("id, full_name, plan");
  if (activeOnly) q = q.eq("onboarded", true);
  if (userIdFilter) q = q.in("id", userIdFilter);
  const { data } = await q;
  const profileRows = (data ?? []) as DbProfileRow[];
  if (profileRows.length === 0) return [];

  // Resolve emails via auth.admin.listUsers — bounded to 1000 by default,
  // which fits the scale of any one campaign for the foreseeable future.
  const { data: authData } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const emailById = new Map<string, string>();
  for (const u of authData?.users ?? []) {
    if (u.id && u.email) emailById.set(u.id, u.email);
  }

  const recipients: DbRecipient[] = [];
  for (const p of profileRows) {
    const email = emailById.get(p.id);
    if (!email) continue; // skip profiles without a usable auth email
    recipients.push({
      id: p.id,
      email,
      full_name: p.full_name ?? null,
      plan: p.plan ?? null,
    });
  }
  return recipients;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function firstNameFrom(full: string | null): string {
  if (!full) return "";
  return full.trim().split(/\s+/)[0] ?? "";
}

/** Title-case the plan column ("pro" → "Pro"). Returns "" when unknown
 *  so an absent value renders as an empty token rather than "null". */
function planLabel(plan: string | null): string {
  if (!plan) return "";
  return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
}

/** Human-friendly send-time date — "May 27, 2026". Kept locale-pinned so
 *  the rendered email is stable regardless of server locale. */
function formatDateForEmail(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Lightweight markdown → HTML so admins can use **bold** / *italic* / [link](url)
 *  in the composer textarea and get sensible rendering in the inbox. */
function renderEmailHtml({
  subject,
  bodyText,
  useTemplate,
  appUrl,
}: {
  subject: string;
  bodyText: string;
  useTemplate: boolean;
  appUrl: string;
}): string {
  const html = escapeHtml(bodyText)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*[^*\s]|[^*\s])\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#e11d48;text-decoration:underline;">$1</a>')
    .replace(/\n/g, "<br>");

  if (useTemplate) {
    return `<!doctype html>
<html><body style="margin:0;background:#fff8f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #f1d6d6;border-radius:16px;padding:32px;">
        <tr><td>
          <a href="${appUrl}" style="text-decoration:none;color:#e11d48;font-weight:700;font-size:18px;">${escapeHtml(BRAND_NAME)}</a>
          <h1 style="font-size:24px;margin:16px 0 12px;color:#1a1a1a;line-height:1.3;">${escapeHtml(subject)}</h1>
          <div style="font-size:15px;line-height:1.6;color:#1f2937;">${html}</div>
          <hr style="border:none;border-top:1px solid #f1d6d6;margin:28px 0 16px;">
          <p style="font-size:12px;color:#6b7280;margin:0;">Sent by ${escapeHtml(BRAND_NAME)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  }
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;font-size:15px;line-height:1.6;padding:24px;">${html}</body></html>`;
}

/* ──────────────────────────────────────────────────────────────────────────
   Email message persistence (history page)
   ────────────────────────────────────────────────────────────────────────── */

export type EmailMessageStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "canceled";

type EmailMessageInsert = {
  sent_by:              string | null;
  template_id:          string | null;
  audience:             string;
  program_id:           string | null;
  audience_label:       string;
  recipients_total:     number;
  recipients_delivered: number;
  subject:              string;
  body:                 string;
  status:               EmailMessageStatus;
  scheduled_for?:       string | null;
  sent_at?:             string | null;
  canceled_at?:         string | null;
  use_branded_template: boolean;
  track_opens:          boolean;
  error_message:        string | null;
};

/** Insert a single email_messages row and return its id (or undefined if
 *  the insert fails — failures are non-fatal so we never block a send). */
async function recordCampaignMessage(
  service: SupabaseClient,
  row: EmailMessageInsert,
): Promise<string | undefined> {
  const { data, error } = await service
    .from("email_messages")
    .insert(row)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[email/history] Failed to record message:", error);
    return undefined;
  }
  return (data?.id as string | undefined) ?? undefined;
}

/** Friendly label rendered in the History table's "Audience" cell. */
function audienceLabel(audience: Audience, programName: string): string {
  if (audience === "program") return programName ? `Program · ${programName}` : "Program members";
  if (audience === "active") return "Active users";
  return "All users";
}

/* ──────────────────────────────────────────────────────────────────────────
   Draft / Schedule / Cancel / Resend / Delete
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Save (or update) a campaign as a draft inside email_messages so the
 * History page can list it under the "Draft" status. Drafts are server-
 * side rows — distinct from the local-storage autosave the Composer
 * uses for in-flight editing.
 */
export async function saveAsDraft(
  input: ComposeInput,
  draftId?: string,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!input.subject.trim() && !input.message.trim()) {
    return { ok: false, error: "Nothing to save — write a subject or message first." };
  }

  const { data: { user: adminUser } } = await guard.supabase.auth.getUser();
  const service = createServiceClient();

  let programName = "";
  if (input.programId) {
    const { data: prog } = await service
      .from("programs")
      .select("title")
      .eq("id", input.programId)
      .maybeSingle();
    programName = (prog?.title as string | undefined) ?? "";
  }

  const recipientsTotal = await estimateRecipients(service, input);

  const payload = {
    sent_by:              adminUser?.id ?? null,
    template_id:          input.templateId ?? null,
    audience:             input.audience,
    program_id:           input.programId || null,
    audience_label:       audienceLabel(input.audience, programName),
    recipients_total:     recipientsTotal,
    subject:              input.subject,
    body:                 input.message,
    status:               "draft" as EmailMessageStatus,
    use_branded_template: input.useTemplate,
    track_opens:          input.trackOpens,
    error_message:        null,
  };

  if (draftId) {
    const { error } = await service
      .from("email_messages")
      .update(payload)
      .eq("id", draftId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/emails/history");
    return { ok: true, id: draftId };
  }

  const { data, error } = await service
    .from("email_messages")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/history");
  return { ok: true, id: data?.id as string | undefined };
}

/**
 * Persist a scheduled campaign. We don't yet have a cron worker that
 * actually fires the send at `scheduledFor`, so this stores everything
 * the row needs (status='scheduled', scheduled_for, snapshot of content)
 * and surfaces it on the History page where an admin can Cancel or
 * manually Resend after the scheduled time.
 */
export async function scheduleCampaign(
  input: ComposeInput,
  scheduledForIso: string,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!input.subject.trim()) return { ok: false, error: "Subject is required." };
  if (!input.message.trim()) return { ok: false, error: "Message is required." };
  if (!scheduledForIso) return { ok: false, error: "Pick a date and time first." };

  const when = new Date(scheduledForIso);
  if (Number.isNaN(when.getTime())) return { ok: false, error: "Invalid schedule time." };
  if (when.getTime() <= Date.now()) {
    return { ok: false, error: "Schedule time must be in the future." };
  }

  const { data: { user: adminUser } } = await guard.supabase.auth.getUser();
  const service = createServiceClient();

  let programName = "";
  if (input.programId) {
    const { data: prog } = await service
      .from("programs")
      .select("title")
      .eq("id", input.programId)
      .maybeSingle();
    programName = (prog?.title as string | undefined) ?? "";
  }

  const recipientsTotal = await estimateRecipients(service, input);

  const { data, error } = await service
    .from("email_messages")
    .insert({
      sent_by:              adminUser?.id ?? null,
      template_id:          input.templateId ?? null,
      audience:             input.audience,
      program_id:           input.programId || null,
      audience_label:       audienceLabel(input.audience, programName),
      recipients_total:     recipientsTotal,
      subject:              input.subject,
      body:                 input.message,
      status:               "scheduled" as EmailMessageStatus,
      scheduled_for:        when.toISOString(),
      use_branded_template: input.useTemplate,
      track_opens:          input.trackOpens,
      error_message:        null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/history");
  return { ok: true, id: data?.id as string | undefined };
}

export type ProcessResult =
  | { ok: true; processed: number; sent: number; failed: number; skipped: number }
  | { ok: false; error: string };

/**
 * Deliver every scheduled campaign whose time has arrived.
 *
 * Safe to call from:
 *   - an admin (interactive "run now") — gated by requireAdminClient, OR
 *   - the secured cron route (/api/admin/emails/run-scheduled) which has
 *     already validated CRON_SECRET and passes { cronAuthorized: true }.
 *
 * Each due row is atomically claimed (status scheduled → sending via a
 * conditional update) so two concurrent runs can't double-send, then routed
 * through the same safety gate (planCampaignSend) as a manual send. The row
 * is updated in place to sent/failed with real delivery counts.
 */
export async function processDueScheduledEmails(
  opts?: { cronAuthorized?: boolean },
): Promise<ProcessResult> {
  if (!opts?.cronAuthorized) {
    const guard = await requireAdminClient();
    if (!guard.ok) return { ok: false, error: guard.error };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "Email backend not configured (RESEND_API_KEY missing)." };

  const service = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: due, error } = await service
    .from("email_messages")
    .select("id, audience, program_id, subject, body, use_branded_template, track_opens, sent_by")
    .eq("status", "scheduled")
    .lte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .limit(50);
  if (error) return { ok: false, error: error.message };

  const rows = due ?? [];
  if (rows.length === 0) return { ok: true, processed: 0, sent: 0, failed: 0, skipped: 0 };

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? `${BRAND_NAME} <onboarding@resend.dev>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorgrowth.app";
  const currentDate = formatDateForEmail(new Date());

  let sentCount = 0;
  let failedCount = 0;
  let skippedClaims = 0;

  for (const row of rows) {
    // Atomic claim: only proceed if WE flipped scheduled → sending.
    const { data: claimed } = await service
      .from("email_messages")
      .update({ status: "sending" as EmailMessageStatus })
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();
    if (!claimed) {
      skippedClaims += 1;
      continue;
    }

    // Resolve the scheduler's email so safe mode can redirect to them.
    let schedulerEmail: string | null = null;
    if (row.sent_by) {
      try {
        const { data: au } = await service.auth.admin.getUserById(row.sent_by as string);
        schedulerEmail = au?.user?.email ?? null;
      } catch {
        schedulerEmail = null;
      }
    }

    const input: ComposeInput = {
      audience:    (row.audience as Audience) ?? "all",
      programId:   (row.program_id as string | null) ?? "",
      subject:     row.subject as string,
      message:     row.body as string,
      useTemplate: Boolean(row.use_branded_template),
      trackOpens:  Boolean(row.track_opens),
    };

    const recipients = await resolveAudience(service, input);
    const plan = planCampaignSend(recipients as SafeRecipient[], schedulerEmail);
    if (!plan.ok) {
      await service
        .from("email_messages")
        .update({ status: "failed" as EmailMessageStatus, error_message: plan.error })
        .eq("id", row.id);
      failedCount += 1;
      continue;
    }

    let programName = "";
    if (input.programId) {
      const { data: prog } = await service
        .from("programs").select("title").eq("id", input.programId).maybeSingle();
      programName = (prog?.title as string | undefined) ?? "";
    }

    let sent = 0;
    let firstError: string | undefined;
    for (const r of plan.targets) {
      const ctx: VariableContext = {
        first_name:    firstNameFrom(r.full_name) || "there",
        full_name:     r.full_name ?? "",
        email:         r.email,
        plan_name:     planLabel(r.plan),
        program_name:  programName,
        cta_link:      `${appUrl}/dashboard`,
        platform_name: BRAND_NAME,
        sender_name:   "",
        current_date:  currentDate,
        custom_field:  "",
      };
      const subject = plan.subjectPrefix + substituteVariables(input.subject, ctx);
      const text    = (plan.bodyBanner ?? "") + substituteVariables(input.message, ctx);
      const html    = renderEmailHtml({ subject, bodyText: text, useTemplate: input.useTemplate, appUrl });
      try {
        const res = await resend.emails.send({ from, to: r.email, subject, html, text });
        if (res.error) {
          if (!firstError) firstError = res.error.message ?? String(res.error);
          continue;
        }
        sent += 1;
      } catch (err) {
        if (!firstError) firstError = err instanceof Error ? err.message : String(err);
      }
    }

    const ok = sent > 0;
    await service
      .from("email_messages")
      .update({
        status:               (ok ? "sent" : "failed") as EmailMessageStatus,
        recipients_total:     plan.audienceTotal,
        recipients_delivered: sent,
        sent_at:              ok ? new Date().toISOString() : null,
        error_message:        ok ? null : (firstError ?? "All recipients failed to send."),
      })
      .eq("id", row.id);

    if (ok) sentCount += 1;
    else failedCount += 1;
  }

  revalidatePath("/admin/emails/history");
  return { ok: true, processed: rows.length, sent: sentCount, failed: failedCount, skipped: skippedClaims };
}

/** Mark a scheduled message as canceled — keeps the row for audit history. */
export async function cancelScheduledMessage(id: string): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  const { error } = await service
    .from("email_messages")
    .update({
      status:       "canceled" as EmailMessageStatus,
      canceled_at:  new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "scheduled");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/history");
  return { ok: true };
}

/**
 * Resend a previously sent (or failed) campaign. We re-run the send
 * pipeline from the stored snapshot so the recipient list is recomputed
 * "now" rather than reused from the original send.
 */
export async function resendCampaign(id: string): Promise<SendResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  const { data: row, error } = await service
    .from("email_messages")
    .select(
      "audience, program_id, subject, body, use_branded_template, track_opens, template_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!row) return { ok: false, error: "Original message not found." };

  const audience = (row.audience as Audience | undefined) ?? "all";
  return sendCampaign({
    audience,
    programId:   (row.program_id as string | null) ?? "",
    subject:     row.subject as string,
    message:     row.body as string,
    useTemplate: Boolean(row.use_branded_template),
    trackOpens:  Boolean(row.track_opens),
    templateId:  (row.template_id as string | null) ?? undefined,
  });
}

/** Permanently delete an email_messages row. */
export async function deleteEmailMessage(id: string): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  const { error } = await service.from("email_messages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/history");
  return { ok: true };
}

/* ──────────────────────────────────────────────────────────────────────────
   Email templates CRUD
   ────────────────────────────────────────────────────────────────────────── */

export type EmailTemplateInput = {
  name:                string;
  subject:             string;
  body:                string;
  useBrandedTemplate?: boolean;
  trackOpens?:         boolean;
};

export async function createEmailTemplate(
  input: EmailTemplateInput,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const name    = input.name.trim();
  const subject = input.subject.trim();
  const body    = input.body.trim();
  if (!name)    return { ok: false, error: "Template name is required." };
  if (!subject) return { ok: false, error: "Subject is required." };
  if (!body)    return { ok: false, error: "Body is required." };

  const { data: { user: adminUser } } = await guard.supabase.auth.getUser();
  const service = createServiceClient();
  const { data, error } = await service
    .from("email_templates")
    .insert({
      name,
      subject,
      body,
      use_branded_template: input.useBrandedTemplate ?? false,
      track_opens:          input.trackOpens ?? true,
      created_by:           adminUser?.id ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/templates");
  return { ok: true, id: data?.id as string | undefined };
}

export async function updateEmailTemplate(
  id: string,
  patch: Partial<EmailTemplateInput>,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    const n = patch.name.trim();
    if (!n) return { ok: false, error: "Template name cannot be empty." };
    update.name = n;
  }
  if (patch.subject !== undefined) {
    const s = patch.subject.trim();
    if (!s) return { ok: false, error: "Subject cannot be empty." };
    update.subject = s;
  }
  if (patch.body !== undefined) {
    const b = patch.body.trim();
    if (!b) return { ok: false, error: "Body cannot be empty." };
    update.body = b;
  }
  if (patch.useBrandedTemplate !== undefined) update.use_branded_template = patch.useBrandedTemplate;
  if (patch.trackOpens !== undefined)         update.track_opens          = patch.trackOpens;

  if (Object.keys(update).length === 0) return { ok: true, id };

  const service = createServiceClient();
  const { error } = await service.from("email_templates").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/templates");
  return { ok: true, id };
}

export async function archiveEmailTemplate(
  id: string,
  archived: boolean,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  const { error } = await service
    .from("email_templates")
    .update({ archived })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/templates");
  return { ok: true, id };
}

export async function deleteEmailTemplate(id: string): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  const { error } = await service.from("email_templates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/templates");
  return { ok: true };
}

/** Duplicate an existing template into a fresh "(copy)" row owned by the
 *  calling admin. Returns the new template id. */
export async function duplicateEmailTemplate(id: string): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { data: { user: adminUser } } = await guard.supabase.auth.getUser();
  const service = createServiceClient();

  const { data: src, error: readErr } = await service
    .from("email_templates")
    .select("name, subject, body, use_branded_template, track_opens")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!src) return { ok: false, error: "Template not found." };

  const { data, error } = await service
    .from("email_templates")
    .insert({
      name:                 `${src.name as string} (copy)`,
      subject:              src.subject as string,
      body:                 src.body as string,
      use_branded_template: Boolean(src.use_branded_template),
      track_opens:          Boolean(src.track_opens),
      created_by:           adminUser?.id ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emails/templates");
  return { ok: true, id: data?.id as string | undefined };
}

/* ──────────────────────────────────────────────────────────────────────────
   Usage / quota — real 24h delivery numbers for Settings + Compose banners.
   ────────────────────────────────────────────────────────────────────────── */

export type EmailUsage = { sent24h: number; campaigns24h: number };

/** Sum of recipients actually delivered across campaigns in the last 24h.
 *  Read-only; safe to call from server components. Returns zeros on error so
 *  a missing table never breaks the page. */
export async function getEmailUsage(): Promise<EmailUsage> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { sent24h: 0, campaigns24h: 0 };

  const service = createServiceClient();
  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await service
    .from("email_messages")
    .select("recipients_delivered")
    .eq("status", "sent")
    .gte("sent_at", sinceIso);
  if (error || !data) return { sent24h: 0, campaigns24h: 0 };

  const sent24h = data.reduce(
    (sum, r) => sum + ((r.recipients_delivered as number | null) ?? 0),
    0,
  );
  return { sent24h, campaigns24h: data.length };
}

/* ──────────────────────────────────────────────────────────────────────────
   Recipient-count estimator (shared by draft + schedule actions so the
   History row shows a meaningful "Recipients" number before send).
   ────────────────────────────────────────────────────────────────────────── */

async function estimateRecipients(
  service: SupabaseClient,
  input: ComposeInput,
): Promise<number> {
  try {
    const recipients = await resolveAudience(service, input);
    return recipients.length;
  } catch {
    return 0;
  }
}
