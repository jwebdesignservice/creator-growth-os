// Social OAuth provider registry.
//
// Each provider declares everything the generic /api/oauth/[platform] routes
// need to start an OAuth flow and exchange a code for tokens. The actual
// per-platform API data-fetching (followers, views, etc.) is handled in
// separate modules — this file is auth only.
//
// Adding a new platform: append a config below, set the env vars, done.

export type ProviderKey =
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "snapchat";

export type ProviderConfig = {
  key: ProviderKey;
  label: string;
  /** Full URL the user is redirected to to start auth. */
  authUrl: string;
  /** Endpoint that exchanges auth-code → access-token (POST). */
  tokenUrl: string;
  /** Permissions we request — combined with " " (or "," for some providers). */
  scopes: readonly string[];
  /** Separator the provider expects in its `scope` query param. */
  scopeSeparator: " " | ",";
  /** Env var names that must be set for this provider to be usable. */
  clientIdEnv: string;
  clientSecretEnv: string;
  /**
   * Optional env var holding a Meta "Facebook Login for Business"
   * Configuration ID. When present at runtime, the OAuth start route
   * passes `config_id=...` to the authorize URL and OMITS the `scope`
   * param — scopes are baked into the Configuration on Meta's side.
   */
  configIdEnv?: string;
  /** Where the dev should go to register an app. */
  setupDocsUrl: string;
  /** Extra params to merge into the authorize URL. */
  extraAuthParams?: Record<string, string>;
  /** Whether to use PKCE (Proof Key for Code Exchange). */
  usePkce?: boolean;
};

// ── Provider configs ─────────────────────────────────────────────────

export const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
  // Instagram via the Facebook Login + Instagram Graph API stack.
  // Requires the user's Instagram account to be a Business or Creator
  // account, linked to a Facebook Page. Plain personal accounts can't
  // grant insights scopes.
  instagram: {
    key: "instagram",
    label: "Instagram",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    scopes: [
      "instagram_basic",
      "pages_show_list",
      "pages_read_engagement",
      "instagram_manage_insights",
    ],
    scopeSeparator: ",",
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    configIdEnv: "INSTAGRAM_CONFIG_ID",
    setupDocsUrl: "https://developers.facebook.com/docs/instagram-api/getting-started",
  },

  // Facebook Login (Pages + Profile). Same Meta Developer app as
  // Instagram in most cases — the env vars can point at the same app.
  facebook: {
    key: "facebook",
    label: "Facebook",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    scopes: ["public_profile", "email", "pages_show_list", "pages_read_engagement"],
    scopeSeparator: ",",
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
    configIdEnv: "FACEBOOK_CONFIG_ID",
    setupDocsUrl: "https://developers.facebook.com/docs/facebook-login/web",
  },

  // Google OAuth → YouTube Data API. Easiest to set up.
  youtube: {
    key: "youtube",
    label: "YouTube",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
    scopeSeparator: " ",
    clientIdEnv: "YOUTUBE_CLIENT_ID",
    clientSecretEnv: "YOUTUBE_CLIENT_SECRET",
    setupDocsUrl: "https://developers.google.com/youtube/v3/getting-started",
    extraAuthParams: {
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
    },
  },

  // TikTok for Developers. Display API gives basic profile + open videos;
  // analytics is gated behind a separate partner program.
  tiktok: {
    key: "tiktok",
    label: "TikTok",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "user.info.stats"],
    scopeSeparator: ",",
    clientIdEnv: "TIKTOK_CLIENT_KEY",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
    setupDocsUrl: "https://developers.tiktok.com/doc/login-kit-web",
    usePkce: true,
  },

  // LinkedIn OAuth 2.0. Profile + email easy; analytics needs MDP partner.
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email"],
    scopeSeparator: " ",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    setupDocsUrl: "https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow",
  },

  // Snap Login Kit. Very limited public-facing data.
  snapchat: {
    key: "snapchat",
    label: "Snapchat",
    authUrl: "https://accounts.snapchat.com/accounts/oauth2/auth",
    tokenUrl: "https://accounts.snapchat.com/accounts/oauth2/token",
    scopes: ["https://auth.snapchat.com/oauth2/api/user.display_name"],
    scopeSeparator: " ",
    clientIdEnv: "SNAPCHAT_CLIENT_ID",
    clientSecretEnv: "SNAPCHAT_CLIENT_SECRET",
    setupDocsUrl: "https://kit.snapchat.com/docs/login-kit-web",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────

export function getProvider(key: string): ProviderConfig | null {
  return (PROVIDERS as Record<string, ProviderConfig>)[key] ?? null;
}

export function isConfigured(p: ProviderConfig): boolean {
  return Boolean(process.env[p.clientIdEnv] && process.env[p.clientSecretEnv]);
}

export function getClientCredentials(p: ProviderConfig): {
  clientId: string;
  clientSecret: string;
} | null {
  const clientId = process.env[p.clientIdEnv];
  const clientSecret = process.env[p.clientSecretEnv];
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/**
 * Absolute URL the provider will redirect the user back to after they
 * approve/deny. Must match the URL registered in the provider's dashboard.
 */
export function getRedirectUri(providerKey: ProviderKey): string {
  // Use `||` (not `??`) so an env var set to an empty string also falls
  // back. A truthy default is critical here: OAuth providers reject any
  // redirect_uri that isn't a fully-qualified absolute URL, so an empty
  // appUrl would silently produce `/api/oauth/.../callback` and the
  // provider returns a "Can't load URL" / "redirect_uri mismatch" error.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
  // Defensive: strip a single trailing slash so the join is always clean.
  const base = appUrl.replace(/\/$/, "");
  return `${base}/api/oauth/${providerKey}/callback`;
}
