"use server";

import { Resend } from "resend";
import { getAllPreviewTemplates } from "./templates";

export type SendPreviewState = {
  success?: string;
  error?: string;
  results?: { name: string; status: "sent" | "failed"; detail: string }[];
};

export async function sendAllPreviewsToInbox(
  _prev: SendPreviewState,
  formData: FormData,
): Promise<SendPreviewState> {
  if (process.env.NODE_ENV === "production") {
    return { error: "Disabled in production." };
  }

  const to = String(formData.get("to") ?? "").trim();
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return { error: "Enter a valid email address." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      error:
        "RESEND_API_KEY missing from .env.local — add it and restart the dev server.",
    };
  }

  const from =
    process.env.EMAIL_FROM ??
    "Profluencer <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const templates = await getAllPreviewTemplates();
  const results: NonNullable<SendPreviewState["results"]> = [];

  for (const t of templates) {
    try {
      const r = await resend.emails.send({
        from,
        to,
        subject: `[Preview] ${t.subject}`,
        html: t.html,
      });
      if (r.error) {
        results.push({
          name: t.name,
          status: "failed",
          detail: r.error.message,
        });
      } else {
        results.push({
          name: t.name,
          status: "sent",
          detail: r.data?.id ?? "queued",
        });
      }
    } catch (err) {
      results.push({
        name: t.name,
        status: "failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const sentCount = results.filter((r) => r.status === "sent").length;
  const failedCount = results.length - sentCount;
  return {
    success:
      failedCount === 0
        ? `Queued all ${sentCount} templates to ${to}. Check inbox + Resend dashboard for delivery status.`
        : `Sent ${sentCount}/${results.length}. ${failedCount} failed — see details below.`,
    results,
  };
}
