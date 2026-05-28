// Generic OAuth callback: /api/oauth/[platform]/callback
// 1. Validate state cookie matches `?state=` query param (CSRF check).
// 2. Exchange `?code=` for access/refresh tokens at the provider's token URL.
// 3. Upsert tokens + scopes into social_accounts.
// 4. Redirect back to /performance with a status flag.
//
// Per-platform metric-fetching is a separate concern — handled in
// src/lib/social/<provider>.ts once we wire up data sync.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getProvider,
  getClientCredentials,
  getRedirectUri,
  type ProviderConfig,
} from "@/lib/social/providers";

export const runtime = "nodejs";

type Params = { platform: string };

const STATE_COOKIE_PREFIX = "social_oauth_state_";

function backTo(origin: string, status: "ok" | "denied" | "error", platform: string, msg?: string) {
  const url = new URL("/performance", origin);
  url.searchParams.set("connect", status);
  url.searchParams.set("p", platform);
  if (msg) url.searchParams.set("msg", msg.slice(0, 200));
  return NextResponse.redirect(url);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { platform } = await params;
  const origin = new URL(req.url).origin;

  const provider = getProvider(platform);
  if (!provider) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }

  const queryUrl = new URL(req.url);
  const code = queryUrl.searchParams.get("code");
  const returnedState = queryUrl.searchParams.get("state");
  const errorParam = queryUrl.searchParams.get("error");

  // User clicked "Cancel" on the provider screen, or scope denied.
  if (errorParam) {
    return backTo(origin, "denied", platform, errorParam);
  }
  if (!code || !returnedState) {
    return backTo(origin, "error", platform, "missing_code_or_state");
  }

  // ── Verify state cookie ────────────────────────────────────────────
  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get(`${STATE_COOKIE_PREFIX}${provider.key}`)?.value;
  if (!cookieRaw) return backTo(origin, "error", platform, "state_cookie_missing");

  let parsed: { state: string; verifier: string | null; userId: string };
  try {
    parsed = JSON.parse(cookieRaw);
  } catch {
    return backTo(origin, "error", platform, "state_cookie_malformed");
  }
  if (parsed.state !== returnedState) {
    return backTo(origin, "error", platform, "state_mismatch");
  }

  // Drop the cookie either way — it's single-use.
  cookieStore.delete(`${STATE_COOKIE_PREFIX}${provider.key}`);

  const creds = getClientCredentials(provider);
  if (!creds) return backTo(origin, "error", platform, "not_configured");

  // ── Exchange code → tokens ─────────────────────────────────────────
  let tokenJson: TokenResponse;
  try {
    tokenJson = await exchangeCodeForToken(provider, code, creds, parsed.verifier);
  } catch (err) {
    console.error(`[oauth ${platform}] token exchange failed:`, err);
    return backTo(origin, "error", platform, "token_exchange_failed");
  }

  if (!tokenJson.access_token) {
    return backTo(origin, "error", platform, "no_access_token");
  }

  // ── Persist to social_accounts ─────────────────────────────────────
  const svc = createServiceClient();
  const expiresAt =
    tokenJson.expires_in && typeof tokenJson.expires_in === "number"
      ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
      : null;

  const { error: upsertErr } = await svc.from("social_accounts").upsert(
    {
      user_id: parsed.userId,
      platform: platform,
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token ?? null,
      token_expires_at: expiresAt,
      scopes: provider.scopes as unknown as string[],
      connected_at: new Date().toISOString(),
      sync_status: "idle",
      sync_error: null,
    },
    { onConflict: "user_id,platform" },
  );

  if (upsertErr) {
    console.error(`[oauth ${platform}] upsert failed:`, upsertErr);
    return backTo(origin, "error", platform, "db_upsert_failed");
  }

  // ── 4. Fire off platform-specific sync so the user lands on a
  //      populated dashboard. Failures are recorded on social_accounts
  //      (sync_error) — they don't block the OAuth success page.
  if (platform === "instagram") {
    const { syncInstagramAccount } = await import("@/lib/social/instagram");
    await syncInstagramAccount(parsed.userId);
  } else if (platform === "facebook") {
    const { syncFacebookAccount } = await import("@/lib/social/facebook");
    await syncFacebookAccount(parsed.userId);
  }

  return backTo(origin, "ok", platform);
}

// ── Token exchange ───────────────────────────────────────────────────

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

async function exchangeCodeForToken(
  provider: ProviderConfig,
  code: string,
  creds: { clientId: string; clientSecret: string },
  pkceVerifier: string | null,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(provider.key),
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
  });
  if (pkceVerifier) {
    body.set("code_verifier", pkceVerifier);
  }

  // Facebook (instagram + facebook providers) requires GET with query params
  // for token exchange instead of POST. Special-case here.
  const isMeta = provider.tokenUrl.includes("facebook.com");
  if (isMeta) {
    const url = new URL(provider.tokenUrl);
    body.forEach((v, k) => url.searchParams.set(k, v));
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Meta token exchange failed: ${res.status} ${await res.text()}`);
    }
    return (await res.json()) as TokenResponse;
  }

  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}
