"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { redirectTo?: string };

export function OAuthButtons({ redirectTo = "/dashboard" }: Props) {
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(provider: "google" | "apple") {
    setError(null);
    setBusy(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(
        error.message.includes("not enabled")
          ? `${provider === "google" ? "Google" : "Apple"} sign-in isn't enabled yet — enable it in Supabase Authentication → Providers.`
          : error.message,
      );
      setBusy(null);
    }
    // On success, the browser redirects to the OAuth provider.
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => signInWith("google")}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 hover:bg-cream-100 disabled:opacity-50 text-[14px] font-medium text-ink-900 transition-colors"
        >
          <GoogleLogo />
          {busy === "google" ? "Redirecting…" : "Google"}
        </button>
        <button
          type="button"
          onClick={() => signInWith("apple")}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 hover:bg-cream-100 disabled:opacity-50 text-[14px] font-medium text-ink-900 transition-colors"
        >
          <AppleLogo />
          {busy === "apple" ? "Redirecting…" : "Apple"}
        </button>
      </div>
      {error && (
        <div className="px-3 py-2 rounded-[10px] bg-rose-50 border border-rose-200 text-[12px] text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
      <path d="M16.37 1.43c0 1.14-.46 2.27-1.22 3.09-.82.9-2.16 1.6-3.27 1.51-.13-1.1.42-2.27 1.16-3.04.82-.86 2.21-1.5 3.33-1.56Zm3.86 17.3c-.66 1.5-1 2.16-1.85 3.5-1.18 1.86-2.85 4.18-4.92 4.2-1.84.02-2.31-1.2-4.8-1.18-2.5.02-3.02 1.2-4.86 1.18-2.07-.02-3.65-2.12-4.83-3.98C-3.7 18.13-3 11.96.45 8.78c1.4-1.28 3.34-2.04 5.13-2.04 1.8 0 3.13.99 4.71.99 1.55 0 2.49-1 4.6-1 1.83 0 3.77 1 5.13 2.72-4.5 2.47-3.78 8.92.21 11.28Z" />
    </svg>
  );
}
