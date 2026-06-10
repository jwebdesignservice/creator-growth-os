import "server-only";
import { Resend } from "resend";
import { renderWelcomeEmail } from "./welcome-template";

/**
 * Sends a transactional email via Resend.
 *
 * Configuration:
 *   - RESEND_API_KEY: required to actually send. Without it, we log and
 *     no-op so onboarding completes regardless.
 *   - EMAIL_FROM: optional. Defaults to `Profluencer <onboarding@resend.dev>`
 *     which works without verifying a domain in development.
 *     In production, set a verified-domain sender like
 *     `Profluencer <welcome@your-domain.com>`.
 */
function getFromAddress() {
  return (
    process.env.EMAIL_FROM ??
    "Profluencer <onboarding@resend.dev>"
  );
}

type SendWelcomeArgs = {
  to: string;
  firstName: string;
  dashboardUrl: string;
  summary?: {
    category?: string;
    primary_platform?: string;
    main_goal?: string;
    weekly_pace?: string;
  };
};

export async function sendWelcomeEmail(args: SendWelcomeArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const { subject, html, text } = renderWelcomeEmail({
    firstName: args.firstName,
    dashboardUrl: args.dashboardUrl,
    summary: args.summary,
  });

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping welcome email send. To enable, add the key to .env.local and Vercel.",
    );
    return { skipped: true as const };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: args.to,
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error("[email] Resend returned an error:", result.error);
      return { error: result.error.message };
    }
    return { id: result.data?.id };
  } catch (err) {
    console.error("[email] Failed to send welcome email:", err);
    return { error: err instanceof Error ? err.message : "Unknown send error" };
  }
}
