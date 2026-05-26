"use server";

import "server-only";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import {
  substituteVariables,
  type VariableContext,
} from "@/lib/email/variables";
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
};

export type SendResult =
  | { ok: true;  sent: number; skipped: number; firstId?: string }
  | { ok: false; error: string };

/* ── Public actions ──────────────────────────────────────────────────────── */

export async function sendCampaign(input: ComposeInput): Promise<SendResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!input.subject.trim()) return { ok: false, error: "Subject is required." };
  if (!input.message.trim()) return { ok: false, error: "Message is required." };

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

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? `${BRAND_NAME} <onboarding@resend.dev>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorgrowth.app";

  let sent = 0;
  let skipped = 0;
  let firstId: string | undefined;

  for (const r of recipients) {
    const ctx: VariableContext = {
      first_name:    firstNameFrom(r.full_name) || "there",
      full_name:     r.full_name ?? "",
      program_name:  programName,
      cta_link:      `${appUrl}/dashboard`,
      platform_name: BRAND_NAME,
    };
    const subject = substituteVariables(input.subject, ctx);
    const text    = substituteVariables(input.message, ctx);
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
        console.error("[email/campaign] Resend error:", res.error);
        continue;
      }
      if (!firstId && res.data?.id) firstId = res.data.id;
      sent += 1;
    } catch (err) {
      skipped += 1;
      console.error("[email/campaign] Send failure:", err);
    }
  }

  return { ok: true, sent, skipped, firstId };
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
    program_name:  "Sample Program",
    cta_link:      `${process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorgrowth.app"}/dashboard`,
    platform_name: BRAND_NAME,
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

type DbRecipient = { id: string; email: string; full_name: string | null };
type DbProfileRow = { id: string; email?: string | null; full_name?: string | null };

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
  let q = service.from("profiles").select("id, full_name");
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
    });
  }
  return recipients;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function firstNameFrom(full: string | null): string {
  if (!full) return "";
  return full.trim().split(/\s+/)[0] ?? "";
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
