# Supabase Auth Email Templates

These are branded HTML templates for Creator Growth OS to replace
Supabase's stock auth emails. Paste each into the Supabase dashboard:

  **Supabase → Authentication → Email Templates**

Each template uses Supabase's variable substitution:
  - `{{ .ConfirmationURL }}` — magic link / verification URL
  - `{{ .Token }}` — 6-digit OTP code (when applicable)
  - `{{ .Email }}` — the recipient's email address
  - `{{ .SiteURL }}` — your configured site URL

All templates use the same brand system as the in-app UI:
  - Fonts: **DM Sans** (body), **Cormorant Garamond** (display) — loaded via
    Google Fonts `<link>` for capable clients, with system fallbacks for
    Outlook desktop and other legacy clients.
  - Logo: the Creator Growth OS crown-M brand mark (inline SVG) centered
    in the header band of every email.
  - Layout: table-based, max 600px wide, centered card, centered content.

---

## 1. Confirm signup

**Subject:** `Confirm your Creator Growth OS account`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>@media (max-width:600px){.cgos-card{width:100%!important;border-radius:0!important}.cgos-pad{padding-left:22px!important;padding-right:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#FAF4EE;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Verify your email to unlock your Creator Growth OS dashboard.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF4EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#FBE9EC;padding:28px 32px 22px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#C44659" style="display:block;margin:0 auto;"><path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/><circle cx="14" cy="12" r="2.2"/><circle cx="34" cy="12" r="2.2"/></svg>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#1E1A17;line-height:1.1;margin-top:8px;letter-spacing:0.01em;">Creator Growth OS</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10.5px;letter-spacing:0.12em;color:#666060;text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Welcome to Creator Growth OS</div>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;color:#1E1A17;margin:0 0 16px;font-weight:600;">Confirm your email to get started</h1>
          <p style="font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#3A3631;margin:0 auto;max-width:440px;">Click the button below to verify your email and unlock your personalized creator dashboard.</p>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td style="background:#C44659;border-radius:12px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">Confirm my email →</a>
          </td></tr></table>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:8px 36px 32px;text-align:center;">
          <p style="font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.55;color:#888080;margin:16px 0 4px;">Or paste this URL into your browser:</p>
          <p style="font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.55;margin:0;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#C44659;text-decoration:underline;">{{ .ConfirmationURL }}</a></p>
        </td></tr>
        <tr><td style="background:#FAF4EE;padding:20px 32px;text-align:center;border-top:1px solid #EEE3D6;">
          <p style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#888080;margin:0;line-height:1.55;">If you didn&apos;t create an account, you can safely ignore this email.</p>
        </td></tr>
      </table>
      <p style="font-family:'DM Sans',sans-serif;margin:16px 0 0;font-size:11px;color:#999090;">Creator Growth OS · How To Become A Successful Social Media Influencer</p>
    </td></tr>
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>@media (max-width:600px){.cgos-card{width:100%!important;border-radius:0!important}.cgos-pad{padding-left:22px!important;padding-right:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#FAF4EE;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your secure sign-in link for Creator Growth OS — expires in 60 minutes.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF4EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#FBE9EC;padding:28px 32px 22px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#C44659" style="display:block;margin:0 auto;"><path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/><circle cx="14" cy="12" r="2.2"/><circle cx="34" cy="12" r="2.2"/></svg>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#1E1A17;line-height:1.1;margin-top:8px;letter-spacing:0.01em;">Creator Growth OS</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10.5px;letter-spacing:0.12em;color:#666060;text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Sign in</div>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;color:#1E1A17;margin:0 0 16px;font-weight:600;">Tap to sign in</h1>
          <p style="font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#3A3631;margin:0 auto;max-width:440px;">Use the secure link below to sign in to Creator Growth OS. It expires in 60 minutes.</p>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td style="background:#C44659;border-radius:12px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">Sign in →</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background:#FAF4EE;padding:20px 32px;text-align:center;border-top:1px solid #EEE3D6;">
          <p style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#888080;margin:0;line-height:1.55;">If you didn&apos;t request this, you can safely ignore this email — no one else can use this link.</p>
        </td></tr>
      </table>
      <p style="font-family:'DM Sans',sans-serif;margin:16px 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
    </td></tr>
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>@media (max-width:600px){.cgos-card{width:100%!important;border-radius:0!important}.cgos-pad{padding-left:22px!important;padding-right:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#FAF4EE;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Reset your Creator Growth OS password — link expires in 1 hour.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF4EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#FBE9EC;padding:28px 32px 22px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#C44659" style="display:block;margin:0 auto;"><path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/><circle cx="14" cy="12" r="2.2"/><circle cx="34" cy="12" r="2.2"/></svg>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#1E1A17;line-height:1.1;margin-top:8px;letter-spacing:0.01em;">Creator Growth OS</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10.5px;letter-spacing:0.12em;color:#666060;text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Password reset</div>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;color:#1E1A17;margin:0 0 16px;font-weight:600;">Pick a new password</h1>
          <p style="font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#3A3631;margin:0 auto;max-width:440px;">We received a request to reset your password. Click the button below to choose a new one. The link expires in 1 hour.</p>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td style="background:#C44659;border-radius:12px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">Reset password →</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background:#FAF4EE;padding:20px 32px;text-align:center;border-top:1px solid #EEE3D6;">
          <p style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#888080;margin:0;line-height:1.55;">If you didn&apos;t request a password reset, you can safely ignore this email — your password will stay the same.</p>
        </td></tr>
      </table>
      <p style="font-family:'DM Sans',sans-serif;margin:16px 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
    </td></tr>
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>@media (max-width:600px){.cgos-card{width:100%!important;border-radius:0!important}.cgos-pad{padding-left:22px!important;padding-right:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#FAF4EE;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Confirm the new email on your Creator Growth OS account.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF4EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#FBE9EC;padding:28px 32px 22px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#C44659" style="display:block;margin:0 auto;"><path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/><circle cx="14" cy="12" r="2.2"/><circle cx="34" cy="12" r="2.2"/></svg>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#1E1A17;line-height:1.1;margin-top:8px;letter-spacing:0.01em;">Creator Growth OS</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10.5px;letter-spacing:0.12em;color:#666060;text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Email change</div>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;color:#1E1A17;margin:0 0 16px;font-weight:600;">Confirm your new email</h1>
          <p style="font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#3A3631;margin:0 auto;max-width:460px;">You asked to change your Creator Growth OS sign-in email to <strong style="color:#1E1A17;">{{ .Email }}</strong>. Click below to confirm — until you do, your old email stays active.</p>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td style="background:#C44659;border-radius:12px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">Confirm new email →</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background:#FAF4EE;padding:20px 32px;text-align:center;border-top:1px solid #EEE3D6;">
          <p style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#888080;margin:0;line-height:1.55;">If you didn&apos;t request this change, contact support immediately.</p>
        </td></tr>
      </table>
      <p style="font-family:'DM Sans',sans-serif;margin:16px 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
    </td></tr>
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>@media (max-width:600px){.cgos-card{width:100%!important;border-radius:0!important}.cgos-pad{padding-left:22px!important;padding-right:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#FAF4EE;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">You&apos;ve been invited to Creator Growth OS.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF4EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#FBE9EC;padding:28px 32px 22px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#C44659" style="display:block;margin:0 auto;"><path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/><circle cx="14" cy="12" r="2.2"/><circle cx="34" cy="12" r="2.2"/></svg>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#1E1A17;line-height:1.1;margin-top:8px;letter-spacing:0.01em;">Creator Growth OS</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10.5px;letter-spacing:0.12em;color:#666060;text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">You&apos;re invited</div>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;color:#1E1A17;margin:0 0 16px;font-weight:600;">Join Creator Growth OS</h1>
          <p style="font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#3A3631;margin:0 auto;max-width:460px;">You&apos;ve been invited to create your account on Creator Growth OS — the structured platform for turning influence into impact and income.</p>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td style="background:#C44659;border-radius:12px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">Accept invitation →</a>
          </td></tr></table>
        </td></tr>
      </table>
      <p style="font-family:'DM Sans',sans-serif;margin:16px 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
    </td></tr>
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>@media (max-width:600px){.cgos-card{width:100%!important;border-radius:0!important}.cgos-pad{padding-left:22px!important;padding-right:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#FAF4EE;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E1A17;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Security check — confirm it&apos;s you on Creator Growth OS.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF4EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="cgos-card" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EEE3D6;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#FBE9EC;padding:28px 32px 22px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#C44659" style="display:block;margin:0 auto;"><path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/><circle cx="14" cy="12" r="2.2"/><circle cx="34" cy="12" r="2.2"/></svg>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#1E1A17;line-height:1.1;margin-top:8px;letter-spacing:0.01em;">Creator Growth OS</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10.5px;letter-spacing:0.12em;color:#666060;text-transform:uppercase;margin-top:4px;font-weight:500;">Grow · Inspire · Earn</div>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:40px 36px 8px;text-align:center;">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#C44659;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Security check</div>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;color:#1E1A17;margin:0 0 16px;font-weight:600;">Confirm it&apos;s you</h1>
          <p style="font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#3A3631;margin:0 auto;max-width:460px;">For your safety we need to re-verify your identity before completing this action. Enter the 6-digit code below in the page that asked for it.</p>
        </td></tr>
        <tr><td align="center" style="padding:20px 32px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td style="background:#FBE9EC;border-radius:12px;padding:18px 28px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:30px;letter-spacing:0.36em;color:#C44659;font-weight:700;text-align:center;">{{ .Token }}</td></tr></table>
        </td></tr>
        <tr><td class="cgos-pad" style="padding:16px 36px 32px;text-align:center;">
          <p style="font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.55;color:#888080;margin:0;">This code expires in 10 minutes. If you didn&apos;t trigger this, change your password immediately.</p>
        </td></tr>
      </table>
      <p style="font-family:'DM Sans',sans-serif;margin:16px 0 0;font-size:11px;color:#999090;">Creator Growth OS</p>
    </td></tr>
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
| `--cream-200` | `#EEE3D6` | Card borders / footer separator |
| `--header-bg` | `#FBE9EC` | Brand band background (also OTP chip) |
| `--ink-900` | `#1E1A17` | Headings |
| `--ink-700` | `#3A3631` | Body copy |
| `--ink-500` | `#666060` | Eyebrow microcopy |
| `--ink-400` | `#888080` | Footnotes |
| `--rose-600` | `#C44659` | Primary CTA + accent |

## Fonts

| Stack | Used for |
|---|---|
| `'Cormorant Garamond', Georgia, 'Times New Roman', serif` | Headings + brand wordmark |
| `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` | Body copy, eyebrow labels, buttons |

Both fonts load via Google Fonts `<link>` in each template's `<head>` for
capable clients (Apple Mail, iOS Mail, modern Gmail). Clients that strip
the link (Outlook desktop, some corporate filters) fall back to the system
serif and system sans defined in each stack — still on-brand, just less
custom.
