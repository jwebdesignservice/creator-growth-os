/**
 * Welcome email — branded template (brand name from lib/brand BRAND_NAME).
 * Matches the website fonts (DM Sans + Cormorant Garamond) and brand mark.
 * Email-safe inline-styled HTML. Table-based layout, max width 600px,
 * centered content. Google Fonts link for capable clients; system fallbacks
 * for the rest (Outlook desktop, etc.).
 */

import { BRAND_NAME } from "@/lib/brand";

type Summary = {
  category?: string;
  primary_platform?: string;
  main_goal?: string;
  weekly_pace?: string;
};

type WelcomeEmailParams = {
  firstName: string;
  dashboardUrl: string;
  summary?: Summary;
};

// Brand tokens (mirror docs/supabase-email-templates.md)
const CREAM_BG     = "#FAF4EE";
const CARD_BG      = "#FFFFFF";
const CARD_BORDER  = "#EEE3D6";
const HEADER_BG    = "#FBE9EC";
const ROSE         = "#C44659";
const INK_900      = "#1E1A17";
const INK_700      = "#3A3631";
const INK_500      = "#666060";
const INK_400      = "#888080";

const FONT_BODY    = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const FONT_DISPLAY = "'Cormorant Garamond',Georgia,'Times New Roman',serif";

export function renderWelcomeEmail({
  firstName,
  dashboardUrl,
  summary,
}: WelcomeEmailParams): { subject: string; html: string; text: string } {
  const subject = `Welcome to ${BRAND_NAME}, ${firstName} — your dashboard is ready 🎉`;

  const summaryRows: { label: string; value: string }[] = [];
  if (summary?.category) summaryRows.push({ label: "Your category", value: summary.category });
  if (summary?.primary_platform) summaryRows.push({ label: "Primary platform", value: summary.primary_platform });
  if (summary?.main_goal) summaryRows.push({ label: "Main goal", value: summary.main_goal });
  if (summary?.weekly_pace) summaryRows.push({ label: "Weekly pace", value: summary.weekly_pace });

  const summaryHtml =
    summaryRows.length === 0
      ? ""
      : `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;background:${CREAM_BG};border:1px solid ${CARD_BORDER};border-radius:14px;">
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <div style="font-family:${FONT_DISPLAY};font-size:15px;font-weight:600;color:${INK_900};margin-bottom:12px;">Your personalized setup</div>
            ${summaryRows
              .map(
                (r) => `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 6px;">
                <tr>
                  <td style="font-family:${FONT_BODY};font-size:13px;color:${INK_500};padding:4px 12px 4px 0;text-align:right;">${escapeHtml(r.label)}</td>
                  <td style="font-family:${FONT_BODY};font-size:13px;color:${INK_900};font-weight:600;padding:4px 0;text-align:left;">${escapeHtml(r.value)}</td>
                </tr>
              </table>
            `,
              )
              .join("")}
          </td>
        </tr>
      </table>
    `;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @media (max-width: 600px) {
      .cgos-card { width: 100% !important; border-radius: 0 !important; }
      .cgos-pad  { padding-left: 22px !important; padding-right: 22px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${CREAM_BG};font-family:${FONT_BODY};color:${INK_900};">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your personalized dashboard, posting plans, tutorials and missions are ready to go.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${CREAM_BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:${CARD_BG};border-radius:20px;overflow:hidden;border:1px solid ${CARD_BORDER};">

          <!-- Header / brand -->
          <tr>
            <td style="background:${HEADER_BG};padding:28px 32px 22px;text-align:center;">
              ${BRAND_MARK_SVG}
              <div style="font-family:${FONT_DISPLAY};font-size:18px;font-weight:700;color:${INK_900};line-height:1.1;margin-top:8px;letter-spacing:0.01em;">${BRAND_NAME}</div>
              <div style="font-family:${FONT_BODY};font-size:10.5px;letter-spacing:0.12em;color:${INK_500};text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
              <div style="font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${ROSE};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">✦ Thanks for joining us</div>
              <h1 style="font-family:${FONT_DISPLAY};font-size:32px;line-height:1.15;color:${INK_900};margin:0 0 18px;font-weight:600;">
                Welcome aboard, ${escapeHtml(firstName)} 👋
              </h1>
              <p style="font-family:${FONT_BODY};font-size:15px;line-height:1.65;color:${INK_700};margin:0 auto;max-width:480px;">
                Your personalized creator dashboard is ready. We&apos;ve used your onboarding answers to tailor your programs, posting plans, tutorials, and daily missions — so every action moves you closer to growth and income.
              </p>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td class="cgos-pad" style="padding:0 36px;">
              ${summaryHtml}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:8px 32px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="background:${ROSE};border-radius:12px;">
                    <a href="${escapeAttr(dashboardUrl)}"
                       style="display:inline-block;padding:14px 30px;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">
                      Go to my dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td class="cgos-pad" style="padding:0 36px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${CARD_BORDER};">
                <tr>
                  <td style="padding-top:24px;text-align:center;">
                    <h2 style="font-family:${FONT_DISPLAY};font-size:20px;color:${INK_900};margin:0 0 16px;font-weight:600;">What you can do first</h2>
                    ${bulletRow("Complete today&apos;s mission to start your streak")}
                    ${bulletRow("Watch your first recommended tutorial")}
                    ${bulletRow("Plan your week with your posting calendar")}
                    ${bulletRow("Update your weekly performance entry on Sunday")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${CREAM_BG};padding:24px 32px;text-align:center;border-top:1px solid ${CARD_BORDER};">
              <p style="font-family:${FONT_BODY};font-size:12px;color:${INK_500};margin:0 0 6px;line-height:1.5;">
                Need a hand? Just reply to this email — a real human reads every one.
              </p>
              <p style="font-family:${FONT_BODY};font-size:11px;color:${INK_400};margin:0;">
                ${BRAND_NAME} · You&apos;re receiving this because you signed up for a ${BRAND_NAME} account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to ${BRAND_NAME}, ${firstName}!

Your personalized creator dashboard is ready. We've used your onboarding
answers to tailor your programs, posting plans, tutorials, and daily
missions — so every action you take moves you closer to growth and income.

${summaryRows.length ? summaryRows.map((r) => `- ${r.label}: ${r.value}`).join("\n") + "\n\n" : ""}Open your dashboard: ${dashboardUrl}

What you can do first:
- Complete today's mission to start your streak
- Watch your first recommended tutorial
- Plan your week with your posting calendar
- Update your weekly performance entry on Sunday

Need a hand? Just reply to this email.
— ${BRAND_NAME}`;

  return { subject, html, text };
}

const BRAND_MARK_SVG = `<svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="${ROSE}" style="display:block;margin:0 auto;">
  <path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/>
  <circle cx="14" cy="12" r="2.2"/>
  <circle cx="34" cy="12" r="2.2"/>
</svg>`;

function bulletRow(text: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px;max-width:380px;">
      <tr>
        <td valign="top" width="22" style="padding-top:3px;">
          <span style="display:inline-block;width:18px;height:18px;border-radius:9px;background:${HEADER_BG};text-align:center;line-height:18px;color:${ROSE};font-family:${FONT_BODY};font-size:11px;font-weight:700;">✓</span>
        </td>
        <td style="font-family:${FONT_BODY};font-size:13.5px;line-height:1.55;color:${INK_700};padding-left:10px;text-align:left;">
          ${text}
        </td>
      </tr>
    </table>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s: string) {
  return escapeHtml(s);
}
