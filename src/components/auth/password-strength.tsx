"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Shared password-strength system.
 *
 * Single source of truth for the live strength meter + per-rule indicators
 * used on BOTH /reset-password and /sign-up. Extracted so the two screens
 * stay byte-for-byte identical — change a rule or an animation here and it
 * updates everywhere at once.
 *
 *  • `PasswordStrengthCard` — the animated card (Weak / Medium / Strong
 *    meter over three rules). Slides open/closed via the
 *    `grid-template-rows: 0fr → 1fr` technique so height animates without
 *    measuring or hardcoded max-heights, and respects prefers-reduced-motion.
 *  • `getPasswordRules` / `getPasswordStrength` — the same logic exposed as
 *    pure functions so a form can drive its own submit-gating without
 *    re-deriving the rules.
 *
 * Strength is a UX nudge — callers should only hard-block on the 8-char
 * minimum + matching confirmation, never on "weak but valid" passwords.
 */

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export type PasswordRule = {
  key: string;
  label: string;
  met: boolean;
};

/* ─── Pure logic ──────────────────────────────────────────────────────── */

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    {
      key: "length",
      label: "Be at least 8 characters long",
      met: password.length >= 8,
    },
    {
      key: "upper",
      label: "At least one uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      key: "special",
      label: "At least one special character (!@#$%^&*)",
      met: /[!@#$%^&*]/.test(password),
    },
  ];
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "empty";
  const metCount = getPasswordRules(password).filter((r) => r.met).length;
  if (metCount <= 1) return "weak";
  if (metCount === 2) return "medium";
  return "strong";
}

/* ─── Strength card ───────────────────────────────────────────────────── */

export function PasswordStrengthCard({ password }: { password: string }) {
  const rules = useMemo(() => getPasswordRules(password), [password]);
  const strength = getPasswordStrength(password);
  const cardOpen = password.length > 0;

  return (
    // Always rendered so the transition has both endpoints to animate
    // between (otherwise the first frame skips).
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity,transform] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        cardOpen
          ? "grid-rows-[1fr] opacity-100 translate-y-0"
          : "grid-rows-[0fr] opacity-0 -translate-y-1 pointer-events-none",
      )}
      aria-hidden={!cardOpen}
    >
      <div className="overflow-hidden">
        <div className="rounded-[14px] bg-cream-100 border border-ink-100 p-3.5 sm:p-4 mt-1">
          <StrengthMeter strength={strength} />
          <ul className="mt-3 space-y-2">
            {rules.map((r, i) => (
              <RuleRow key={r.key} rule={r} index={i} cardOpen={cardOpen} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── Rule row with staggered fade-in ─────────────────────────────────── */

function RuleRow({
  rule,
  index,
  cardOpen,
}: {
  rule: { label: string; met: boolean };
  index: number;
  cardOpen: boolean;
}) {
  // Each row slides in slightly later than the previous one so the card
  // feels alive rather than cardboard. Disabled under prefers-reduced-motion.
  const delay = `${80 + index * 60}ms`;
  return (
    <li
      className={cn(
        "flex items-start gap-2 text-[12.5px] sm:text-[13px] transition-[opacity,transform] duration-[260ms] ease-out motion-reduce:transition-none",
        cardOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-0.5",
      )}
      style={cardOpen ? { transitionDelay: delay } : undefined}
    >
      <span
        className={cn(
          "size-4 rounded-full inline-flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200",
          rule.met ? "bg-success/15" : "bg-ink-100",
        )}
        aria-hidden
      >
        {rule.met ? (
          <Check className="size-2.5 text-success" strokeWidth={3} />
        ) : (
          <X className="size-2.5 text-ink-500" strokeWidth={3} />
        )}
      </span>
      <span
        className={cn(
          "transition-colors duration-200 leading-snug",
          rule.met ? "text-ink-900" : "text-ink-500",
        )}
      >
        {rule.label}
      </span>
    </li>
  );
}

/* ─── Strength meter ───────────────────────────────────────────────────── */

function StrengthMeter({ strength }: { strength: PasswordStrength }) {
  const filledCount =
    strength === "strong" ? 3 :
    strength === "medium" ? 2 :
    strength === "weak"   ? 1 :
    0;

  const fillTone =
    strength === "strong" ? "bg-success" :
    strength === "medium" ? "bg-gold-500" :
    "bg-rose-500";

  const dotTone =
    strength === "strong" ? "text-success bg-success/15" :
    strength === "medium" ? "text-gold-500 bg-gold-500/15" :
    "text-rose-600 bg-rose-100";

  const label =
    strength === "strong" ? "Strong" :
    strength === "medium" ? "Medium" :
    "Weak";

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className={cn(
            "inline-flex items-center justify-center size-4 rounded-full transition-colors duration-200",
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
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={filledCount}
        aria-label={`Password strength: ${label}`}
        className="grid grid-cols-3 gap-1"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-colors duration-300",
              i < filledCount ? fillTone : "bg-ink-100",
            )}
          />
        ))}
      </div>
    </div>
  );
}
