/**
 * Welcome email — clean, professional, cream + rose brand.
 * Email-safe inline-styled HTML. No external CSS, no scripts, no JS.
 * Tested against Gmail, Outlook web, Apple Mail rendering rules:
 *   - All styles inline on the element
 *   - Table-based layout for legacy clients
 *   - Max width 600px
 *   - Web-safe fallback fonts
 */

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

export function renderWelcomeEmail({
  firstName,
  dashboardUrl,
  summary,
}: WelcomeEmailParams): { subject: string; html: string; text: string } {
  const subject = `Welcome to Creator Growth OS, ${firstName} — your dashboard is ready 🎉`;

  const summaryRows: { label: string; value: string }[] = [];
  if (summary?.category) summaryRows.push({ label: "Your category", value: summary.category });
  if (summary?.primary_platform) summaryRows.push({ label: "Primary platform", value: summary.primary_platform });
  if (summary?.main_goal) summaryRows.push({ label: "Main goal", value: summary.main_goal });
  if (summary?.weekly_pace) summaryRows.push({ label: "Weekly pace", value: summary.weekly_pace });

  const summaryHtml =
    summaryRows.length === 0
      ? ""
      : `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;background:#FAF6F2;border:1px solid #ECE8E3;border-radius:14px;">
        <tr>
          <td style="padding:20px 24px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:600;color:#1A1816;margin-bottom:12px;">Your personalized setup</div>
            ${summaryRows
              .map(
                (r) => `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:6px;">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#756E66;width:140px;padding:4px 0;">${escapeHtml(r.label)}</td>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1816;font-weight:600;padding:4px 0;">${escapeHtml(r.value)}</td>
                </tr>
              </table>
            `,
              )
              .join("")}
          </td>
        </tr>
      </table>
    `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#FAF6F2;font-family:Arial,Helvetica,sans-serif;color:#1A1816;">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your personalized dashboard, posting plans, tutorials and missions are ready to go.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF6F2;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #ECE8E3;">

          <!-- Header band -->
          <tr>
            <td style="background:#F7E1DC;padding:28px 32px;text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <!-- Brand mark -->
                    <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#B9485C">
                      <path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/>
                      <circle cx="14" cy="12" r="2.2"/>
                      <circle cx="34" cy="12" r="2.2"/>
                    </svg>
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;color:#1A1816;line-height:1.2;">Creator Growth OS</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.06em;color:#756E66;text-transform:uppercase;margin-top:2px;">Grow. Inspire. Earn.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:40px 32px 8px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#B9485C;letter-spacing:0.04em;margin-bottom:10px;">✦ THANKS FOR JOINING US</div>
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:#1A1816;margin:0 0 16px;font-weight:600;">
                Welcome aboard, ${escapeHtml(firstName)} 👋
              </h1>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3A3631;margin:0;">
                Your personalized creator dashboard is ready. We&apos;ve used your onboarding answers to tailor your programs, posting plans, tutorials, and daily missions — so every action you take moves you closer to growth and income.
              </p>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:0 32px;">
              ${summaryHtml}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:8px 32px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#B9485C;border-radius:14px;">
                    <a href="${escapeAttr(dashboardUrl)}"
                       style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">
                      Go to my dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #ECE8E3;">
                <tr>
                  <td style="padding-top:24px;">
                    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#1A1816;margin:0 0 14px;font-weight:600;">What you can do first</h2>
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
            <td style="background:#FAF6F2;padding:24px 32px;text-align:center;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:11.5px;color:#756E66;margin:0 0 6px;line-height:1.5;">
                Need a hand? Just reply to this email — a real human reads every one.
              </p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9B928A;margin:0;">
                Creator Growth OS · You&apos;re receiving this because you signed up at creator-growth-os.com.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to Creator Growth OS, ${firstName}!

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
— Creator Growth OS`;

  return { subject, html, text };
}

function bulletRow(text: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">
      <tr>
        <td valign="top" width="22" style="padding-top:2px;">
          <span style="display:inline-block;width:18px;height:18px;border-radius:9px;background:#F7E1DC;text-align:center;line-height:18px;color:#B9485C;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;">✓</span>
        </td>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.5;color:#3A3631;padding-left:8px;">
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
