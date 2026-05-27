// Generic OAuth start route: /api/oauth/[platform]/start
// Reads provider config from the registry, generates state (+ PKCE if the
// provider needs it), stashes both in a signed HTTP-only cookie, and
// 302-redirects to the provider's authorize URL.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  getProvider,
  getClientCredentials,
  getRedirectUri,
} from "@/lib/social/providers";

export const runtime = "nodejs";

type Params = { platform: string };

const STATE_COOKIE_PREFIX = "social_oauth_state_";
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

function randomToken(bytes = 32): string {
  // Base64URL — no padding — URL-safe for OAuth params and cookies.
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function pkcePair() {
  const verifier = randomToken(48);
  // SHA-256(verifier) → base64url for code_challenge
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const challenge = Buffer.from(hash)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return { verifier, challenge };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { platform } = await params;

  const provider = getProvider(platform);
  if (!provider) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }

  const creds = getClientCredentials(provider);
  if (!creds) {
    return NextResponse.json(
      {
        error: "Provider not configured",
        message: `Set ${provider.clientIdEnv} and ${provider.clientSecretEnv} in env to enable ${provider.label}.`,
        docsUrl: provider.setupDocsUrl,
      },
      { status: 503 },
    );
  }

  // Must be signed in — we'll associate the resulting tokens with this user.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/sign-in?next=/performance", new URL(_req.url).origin),
    );
  }

  // Generate state (CSRF protection) and optionally PKCE verifier.
  const state = randomToken(32);
  const pkce = provider.usePkce ? await pkcePair() : null;

  // Build authorize URL.
  const url = new URL(provider.authUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", creds.clientId);
  url.searchParams.set("redirect_uri", getRedirectUri(provider.key));
  url.searchParams.set("scope", provider.scopes.join(provider.scopeSeparator));
  url.searchParams.set("state", state);
  if (pkce) {
    url.searchParams.set("code_challenge", pkce.challenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  if (provider.extraAuthParams) {
    for (const [k, v] of Object.entries(provider.extraAuthParams)) {
      url.searchParams.set(k, v);
    }
  }

  // Stash state + PKCE verifier in HTTP-only cookie. The callback validates
  // them. Cookie is platform-scoped so simultaneous connects don't collide.
  const cookieStore = await cookies();
  const payload = JSON.stringify({
    state,
    verifier: pkce?.verifier ?? null,
    userId: user.id,
  });
  cookieStore.set(`${STATE_COOKIE_PREFIX}${provider.key}`, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });

  return NextResponse.redirect(url);
}
