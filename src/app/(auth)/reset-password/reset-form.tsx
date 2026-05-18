"use client";

import { useActionState, useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePassword } from "../actions";
import { cn } from "@/lib/cn";

/**
 * Reset-password form.
 *
 * Behaviour: unchanged. Submits `password` + `confirm` to `updatePassword`
 * and redirects on success.
 *
 * Visual / interaction layer:
 *  • Independent password-visibility toggles on both fields.
 *  • Live strength meter (Weak / Medium / Strong) over three rules.
 *  • Per-rule indicators (✓ / ✕) — animated in/out together with the card.
 *  • Smooth slide-down + fade entry on the strength card using
 *    `grid-template-rows: 0fr → 1fr` so height animates without
 *    measuring or hardcoded max-heights.
 *  • Staggered fade-in on individual rules for the polish detail you'd
 *    expect on a top-tier auth screen.
 *
 * Strength is a UX nudge — the server only enforces the 8-char minimum
 * and matching confirmation, so we never block submission for "weak" but
 * server-valid passwords.
 */
export function ResetForm() {
  const [state, formAction, pending] = useActionState(updatePassword, {});
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (state?.success) {
      const t = window.setTimeout(() => router.push("/sign-in"), 1500);
      return () => window.clearTimeout(t);
    }
  }, [state, router]);

  const rules = useMemo(() => {
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
  }, [password]);

  const metCount = rules.filter((r) => r.met).length;
  const strength: "empty" | "weak" | "medium" | "strong" =
    password.length === 0 ? "empty"
    : metCount <= 1 ? "weak"
    : metCount === 2 ? "medium"
    : "strong";

  const confirmMismatch = confirm.length > 0 && confirm !== password;
  const submitDisabled =
    pending || password.length < 8 || confirm.length === 0 || confirm !== password;

  const cardOpen = password.length > 0;

  return (
    <form action={formAction} className="space-y-4 sm:space-y-5">
      {/* ── New password ─────────────────────────────────────────────── */}
      <PasswordField
        label="New Password"
        name="password"
        value={password}
        onChange={setPassword}
        visible={showPassword}
        onToggleVisible={() => setShowPassword((v) => !v)}
        autoComplete="new-password"
        placeholder="••••••••"
      />

      {/* Strength + rules block — animates open/closed via grid-rows.
          Always rendered so the transition has both endpoints to animate
          between (otherwise the first frame skips). */}
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

      {/* ── Confirm new password ─────────────────────────────────────── */}
      <PasswordField
        label="Confirm New Password"
        name="confirm"
        value={confirm}
        onChange={setConfirm}
        visible={showConfirm}
        onToggleVisible={() => setShowConfirm((v) => !v)}
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        error={confirmMismatch ? "Passwords do not match." : undefined}
      />

      {state?.error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          role="status"
          className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success"
        >
          {state.success} Redirecting to sign in…
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitDisabled}
        className="w-full h-12 text-[14.5px] font-semibold bg-ink-900 hover:bg-ink-700 disabled:bg-ink-300 disabled:cursor-not-allowed"
      >
        {pending ? "Saving…" : "Create New Password"}
      </Button>
    </form>
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
        cardOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-0.5",
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

/* ─── Password field with show/hide toggle ─────────────────────────────── */

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  autoComplete: string;
  placeholder: string;
  error?: string;
}) {
  const id = useId();
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-ink-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full h-12 pl-4 pr-12 rounded-[12px] bg-white border text-ink-900 placeholder:text-ink-400 text-[14px] sm:text-[14.5px] transition-colors",
            "focus:outline-none focus:ring-2",
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
              : "border-ink-200 focus:border-rose-400 focus:ring-rose-100",
          )}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-10 rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-100 active:bg-cream-200 transition-colors"
        >
          <Icon className="size-[18px]" strokeWidth={1.9} />
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-[12px] text-rose-700 leading-snug">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Strength meter ───────────────────────────────────────────────────── */

function StrengthMeter({
  strength,
}: {
  strength: "empty" | "weak" | "medium" | "strong";
}) {
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
