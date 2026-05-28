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
