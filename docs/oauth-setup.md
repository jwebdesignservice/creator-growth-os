# Social OAuth Setup

The Performance page's "Connect Social Accounts" card uses real OAuth.
Each platform needs you to register a developer app and add the resulting
client credentials to your environment.

## How the flow works

1. User clicks **Connect** on a platform → browser navigates to
   `/api/oauth/<platform>/start`.
2. We generate state (+ PKCE if needed) into an HTTP-only cookie, then
   302-redirect to the provider's authorize URL.
3. User approves on the provider's screen → provider redirects back to
   `/api/oauth/<platform>/callback?code=…&state=…`.
4. We validate state, exchange the code for tokens at the provider's
   token endpoint, and upsert the row into `social_accounts` (token,
   refresh token, expiry, scopes).
5. User lands back on `/performance?connect=ok&p=<platform>`.

The card's `connectionStatus` reflects DB state:

- `connected` — `access_token` is non-null. Shows "Connected as @handle".
- `not_connected` — env credentials exist; row has no token. **Connect** works.
- `setup_pending` — env credentials missing. Button is disabled with a tooltip
  telling the admin which env vars to set.

## Redirect URI

For every provider, the **exact** redirect URI you register in their
dashboard must be:

```
${NEXT_PUBLIC_APP_URL}/api/oauth/<platform>/callback
```

For local dev that's `http://localhost:8080/api/oauth/<platform>/callback`.
For production, set `NEXT_PUBLIC_APP_URL` to your live domain.

## Per-platform setup

### Instagram (priority — first end-to-end)

1. Go to <https://developers.facebook.com/apps>, create a new app.
   Choose type "Business".
2. In the app dashboard, add the **Instagram Graph API** product.
3. Go to **App settings → Basic** and grab the **App ID** and **App Secret**.
4. Under **Instagram Graph API → API setup with Instagram Login**, add
   the redirect URI `${APP_URL}/api/oauth/instagram/callback`.
5. Set these env vars:
   - `INSTAGRAM_CLIENT_ID` = App ID
   - `INSTAGRAM_CLIENT_SECRET` = App Secret
6. The scopes we request: `instagram_basic`, `pages_show_list`,
   `pages_read_engagement`, `instagram_manage_insights`.
7. **Important — App Review:** Until your app is in Live mode and reviewed,
   only people listed as Admins/Developers/Testers in **Roles → Roles** can
   complete the OAuth flow. To go live for all users, submit each scope for
   App Review with screencasts of how the app uses them. Meta typically
   takes 1–3 weeks. `instagram_manage_insights` is the slowest to clear.
8. **The user being connected must have an Instagram Business or Creator
   account** linked to a Facebook Page — personal Instagram accounts cannot
   grant insights scopes.

### Facebook

Use the same Meta Developer app as Instagram (Meta apps support both
products). Set:

- `FACEBOOK_CLIENT_ID` = same App ID as Instagram (or a different app
  if you want them separated)
- `FACEBOOK_CLIENT_SECRET` = same App Secret

Scopes: `public_profile`, `email`, `pages_show_list`, `pages_read_engagement`.

### YouTube

1. Go to <https://console.cloud.google.com>, create a project.
2. Enable **YouTube Data API v3** under APIs & Services → Library.
3. Configure the OAuth consent screen (External user type for production).
4. Create OAuth 2.0 Client ID under **Credentials**, type "Web application".
5. Add `${APP_URL}/api/oauth/youtube/callback` as an authorized redirect URI.
6. Copy Client ID and Client Secret. Set env vars:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
7. Scope: `https://www.googleapis.com/auth/youtube.readonly`.
8. Until the consent screen is verified by Google, you can only authorize
   users you've added under **Test users**. Submit for verification when
   you're ready to release publicly.

### TikTok

1. Go to <https://developers.tiktok.com>, register an app under
   **Manage Apps**.
2. Add the **Login Kit** capability.
3. Under **Login Kit → Web**, add the redirect URI.
4. Get **Client Key** and **Client Secret**:
   - `TIKTOK_CLIENT_KEY`
   - `TIKTOK_CLIENT_SECRET`
5. Scopes: `user.info.basic`, `user.info.stats`.
6. **Note**: full analytics access requires the Display API + a separate
   partner program approval. The basic flow gives you profile info and
   public video counts only.

### LinkedIn

1. Go to <https://www.linkedin.com/developers/apps>, create an app.
2. Add the **Sign In with LinkedIn using OpenID Connect** product.
3. Under **Auth**, add the redirect URI.
4. Get Client ID + Client Secret:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
5. Scopes: `openid profile email`.
6. For analytics on a LinkedIn Page or Company, apply to the **LinkedIn
   Marketing Developer Platform** — basic OIDC gives profile info only.

### Snapchat

1. Go to <https://kit.snapchat.com>, create an app via the Snap Kit Portal.
2. Add **Login Kit**.
3. Add redirect URI under OAuth2 redirect URIs.
4. Set env vars:
   - `SNAPCHAT_CLIENT_ID`
   - `SNAPCHAT_CLIENT_SECRET`
5. Scope: `https://auth.snapchat.com/oauth2/api/user.display_name`.
6. Snap exposes very limited data — display name, Bitmoji avatar.
   No follower or content analytics via Login Kit.

## Adding env vars

In dev, add to `.env.local`:

```
NEXT_PUBLIC_APP_URL=http://localhost:8080
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...
# ...etc
```

In production (Vercel/Cloudflare/etc.), add them as Environment Variables in
your hosting dashboard. Restart the app after changing them.

A provider with missing env vars renders as **Setup pending** in the UI —
the button is disabled and the admin sees the hint. It does NOT break the
app or the page.

## What's still TODO after credentials are set

This scaffold handles auth-code → access-token + storage. The next phase
per platform is **data sync** — actually calling the provider's API to
fetch follower count, views, etc., and writing them into the
`social_accounts` and `performance_entries` tables. That lives in
`src/lib/social/<provider>.ts` and is implemented per-platform.

## Production review / verification status

> Snapshot as of **2026-06-03**. This tracks what each platform is waiting
> on before OAuth works for *all* users (not just admins/test users).
> Update this section whenever a status changes.

### TikTok — ⏳ awaiting production review

- **Submitted** for production review. TikTok quotes ~48h to hear back.
- **Works now for:** the app's own sandbox/developer accounts only.
- **Temporary code state (revert after approval):**
  - `src/lib/social/providers.ts` — scope reduced to `["user.info.basic"]`;
    `user.info.stats` was removed because sandbox wouldn't grant it.
  - `src/lib/social/tiktok.ts` — `fetchUserInfo` does a two-pass fetch
    (tries the stats fields, falls back to basic fields on a 401
    `scope_not_authorized`). Safe to keep, but the stats path only returns
    data once the scope is approved.
- **🔖 Come back to:** once approved, restore `user.info.stats` to
  `PROVIDERS.tiktok.scopes`, redeploy, reconnect, and confirm follower/like
  stats flow through.
- Domain verification files live in `/public` (both the trailing-slash and
  no-slash prefix variants TikTok required).

### Instagram + Facebook (one Meta app) — ⏳ in App Review

- **App is LIVE.** Login **works today for Admins / Developers / Testers and
  test users only** — not the general public yet.
- **Business Verification:** submitted (~48h wait).
- **🔖 Come back to:** after Business Verification clears, complete the
  per-permission App Review forms (each needs a screencast) for:
  `instagram_basic`, `pages_show_list`, `pages_read_engagement`,
  `instagram_manage_insights`. `instagram_manage_insights` is the slowest to
  clear. Until every scope is approved, only roled/test users can connect.
- **Already configured:** App Domains, OAuth redirect URIs, Website platform,
  Terms of Service URL, Privacy Policy URL.
- Reminder: the connecting user needs an Instagram **Business/Creator**
  account linked to a Facebook Page.

### YouTube (Google) — ⏸️ PAUSED (blocked on custom domain)

- **In Testing mode.** Only accounts added under **Test users** can connect
  (e.g. jackshopify22@gmail.com, jwebdesign.service@gmail.com).
- `youtube.readonly` is a **sensitive scope** and is declared under Data
  access.
- **App-name mismatch error:** ✅ FIXED — the `/` landing page now renders the
  "Profluencer" name Google's verifier cross-checks (confirmed resolved).
- **Blocker:** Google branding/OAuth verification requires proving domain
  ownership in Google Search Console, but we're on a shared `*.vercel.app`
  subdomain we don't own → can't verify. Decision was to **pause** Google
  verification until we have a custom domain.
- **🔖 Come back to:** after buying a custom domain → verify it in Search
  Console → resume the OAuth verification → submit the sensitive-scope review.
  Until then, only test users can connect.

### 🔖 When the custom domain is acquired (affects all platforms)

1. Update `NEXT_PUBLIC_APP_URL` everywhere (`.env.local` + Vercel env).
2. Update the redirect URIs in **all** provider dashboards (TikTok, Meta,
   Google) to the new domain.
3. Re-do domain verification for the new domain: TikTok verification files,
   Meta **App Domains**, Google **Search Console**.
4. Resume the paused Google YouTube verification.
