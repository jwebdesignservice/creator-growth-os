# Supabase Auth Email Templates

These are branded HTML templates for Creator Growth OS to replace
Supabase's stock auth emails. Paste each into the Supabase dashboard:

  **Supabase → Authentication → Email Templates**

Each template uses Supabase's variable substitution:
  - `{{ .ConfirmationURL }}` — magic link / verification URL
  - `{{ .Token }}` — 6-digit OTP code (when applicable)
  - `{{ .Email }}` — the recipient's email address
  - `{{ .SiteURL }}` — your configured site URL

All templates are inline-styled, table-based, max 600px wide — same
rules as our welcome email so they render correctly across Gmail,
Outlook web, Apple Mail, etc.

---

## 1. Confirm signup

**Subject:** `Confirm your Creator Growth OS account`

```html
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAF4EE;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0 32px;text-align:left;">
                <div style="font-size:13px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;">Welcome to Creator Growth OS</div>
                <h1 style="margin:8px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1E1A17;">Confirm your email to get started</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#666060;">Click the button below to verify your email and unlock your personalized creator dashboard.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background:#C44659;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                        Confirm my email →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:13px;line-height:1.55;color:#888080;">Or paste this URL into your browser:</p>
                <p style="margin:4px 0 32px 0;font-size:13px;line-height:1.55;color:#C44659;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#C44659;text-decoration:underline;">{{ .ConfirmationURL }}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;border-top:1px solid #EEE3D6;">
                <p style="margin:24px 0 0 0;font-size:12px;line-height:1.55;color:#888080;">If you didn't create an account, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#999090;">Creator Growth OS · How To Become A Successful Social Media Influencer</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 2. Magic Link

**Subject:** `Your Creator Growth OS sign-in link`

```html
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAF4EE;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px;text-align:left;">
                <div style="font-size:13px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;">Sign in</div>
                <h1 style="margin:8px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1E1A17;">Tap to sign in</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#666060;">Use the secure link below to sign in to Creator Growth OS. It expires in 60 minutes.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background:#C44659;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                        Sign in →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:12px;line-height:1.55;color:#888080;">If you didn't request this, you can safely ignore this email — no one else can use this link.</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 3. Reset Password (Recovery)

**Subject:** `Reset your Creator Growth OS password`

```html
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAF4EE;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px;text-align:left;">
                <div style="font-size:13px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;">Password reset</div>
                <h1 style="margin:8px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1E1A17;">Pick a new password</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#666060;">We received a request to reset your password. Click the button below to choose a new one. The link expires in 1 hour.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background:#C44659;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                        Reset password →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:12px;line-height:1.55;color:#888080;">If you didn't request a password reset, you can safely ignore this email — your password will stay the same.</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new email address`

```html
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAF4EE;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px;text-align:left;">
                <div style="font-size:13px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;">Email change</div>
                <h1 style="margin:8px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1E1A17;">Confirm your new email</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#666060;">You asked to change your Creator Growth OS sign-in email to <strong>{{ .Email }}</strong>. Click below to confirm — until you do, your old email stays active.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background:#C44659;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                        Confirm new email →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:12px;line-height:1.55;color:#888080;">If you didn't request this change, contact support immediately.</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 5. Invite User

**Subject:** `You're invited to Creator Growth OS`

```html
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAF4EE;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px;text-align:left;">
                <div style="font-size:13px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;">You're invited</div>
                <h1 style="margin:8px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1E1A17;">Join Creator Growth OS</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#666060;">You've been invited to create your account on Creator Growth OS — the structured platform for turning influence into impact and income.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background:#C44659;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                        Accept invitation →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 6. Reauthentication

**Subject:** `Confirm it's you`

```html
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAF4EE;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px;text-align:left;">
                <div style="font-size:13px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;">Security check</div>
                <h1 style="margin:8px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1E1A17;">Confirm it's you</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.55;color:#666060;">For your safety we need to re-verify your identity before completing this action. Enter the 6-digit code below in the page that asked for it.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
                  <tr>
                    <td style="border-radius:12px;background:#FBE9EC;padding:16px 24px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:28px;letter-spacing:0.32em;color:#C44659;font-weight:700;">
                      {{ .Token }}
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 0 0;font-size:12px;line-height:1.55;color:#888080;">This code expires in 10 minutes. If you didn't trigger this, change your password immediately.</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## Brand color reference

If you tweak any of these templates, keep colors consistent with the
in-app design system:

| Token | Hex | Used for |
|---|---|---|
| `--cream-100` | `#FAF4EE` | Email backdrop |
| `--cream-200` | `#EEE3D6` | Card borders |
| `--ink-900` | `#1E1A17` | Headings |
| `--ink-700` | `#666060` | Body copy |
| `--ink-500` | `#888080` | Footnotes |
| `--rose-600` | `#C44659` | Primary CTA + accent |
| `--rose-50` | `#FBE9EC` | OTP code background |
