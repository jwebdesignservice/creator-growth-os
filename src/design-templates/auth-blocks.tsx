/* Auth blocks ───────────────────────────────────────────────────────────
   Authentication building blocks shared by sign-in / sign-up / reset —
   the OAuth provider buttons and the live password-strength meter (weak /
   medium / strong) with its rule checklist.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function OAuthButtons() {
  return (
    <div className="w-[320px] space-y-2.5">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 hover:bg-cream-100 active:bg-cream-200 text-[14px] font-medium text-ink-900 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          <GoogleLogo />
          Google
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-white border border-ink-200 hover:bg-cream-100 active:bg-cream-200 text-[14px] font-medium text-ink-900 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          <AppleLogo />
          Apple
        </button>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-ink-100" />
        <span className="text-[11.5px] text-ink-400">or continue with email</span>
        <span className="h-px flex-1 bg-ink-100" />
      </div>
    </div>
  );
}

type Rule = { label: string; met: boolean };
function rulesFor(pw: string): Rule[] {
  return [
    { label: "Be at least 8 characters long", met: pw.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(pw) },
    { label: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*]/.test(pw) },
  ];
}

export function PasswordStrength() {
  const [pw, setPw] = useState("Creator!");
  const rules = rulesFor(pw);
  const met = rules.filter((r) => r.met).length;
  const strength = pw.length === 0 ? "empty" : met <= 1 ? "weak" : met === 2 ? "medium" : "strong";
  const filled = strength === "strong" ? 3 : strength === "medium" ? 2 : strength === "weak" ? 1 : 0;
  const fillTone =
    strength === "strong" ? "bg-success" : strength === "medium" ? "bg-amber-500" : "bg-rose-500";
  const dotTone =
    strength === "strong"
      ? "text-success bg-success/15"
      : strength === "medium"
        ? "text-amber-600 bg-amber-500/15"
        : "text-rose-600 bg-rose-100";
  const label = strength === "strong" ? "Strong" : strength === "medium" ? "Medium" : "Weak";

  return (
    <div className="w-[340px] max-w-full">
      <label className="block text-[12.5px] font-medium text-ink-700 mb-1.5">Password</label>
      <input
        type="text"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        className="w-full h-11 px-3.5 rounded-[12px] bg-white border border-ink-200 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
      />

      <div className="rounded-[14px] bg-cream-100 border border-ink-100 p-4 mt-3">
        {/* Meter */}
        <div className="flex items-center gap-1.5 mb-2" aria-live="polite">
          <span
            className={cn(
              "inline-flex items-center justify-center size-4 rounded-full",
              dotTone,
            )}
            aria-hidden
          >
            {strength === "strong" ? (
              <Check className="size-2.5" strokeWidth={3} />
            ) : (
              <X className="size-2.5" strokeWidth={3} />
            )}
          </span>
          <span className="text-[13px] font-semibold text-ink-900">{label}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                i < filled ? fillTone : "bg-ink-100",
              )}
            />
          ))}
        </div>

        {/* Rules */}
        <ul className="mt-3 space-y-2">
          {rules.map((r) => (
            <li key={r.label} className="flex items-start gap-2 text-[12.5px]">
              <span
                className={cn(
                  "size-4 rounded-full inline-flex items-center justify-center shrink-0 mt-0.5",
                  r.met ? "bg-success/15" : "bg-ink-100",
                )}
                aria-hidden
              >
                {r.met ? (
                  <Check className="size-2.5 text-success" strokeWidth={3} />
                ) : (
                  <X className="size-2.5 text-ink-500" strokeWidth={3} />
                )}
              </span>
              <span className={cn("leading-snug", r.met ? "text-ink-900" : "text-ink-500")}>
                {r.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Provider logos (inline SVG, copied from ui/oauth-buttons) ─────────── */

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
