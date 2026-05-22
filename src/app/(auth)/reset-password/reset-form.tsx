"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePassword } from "../actions";
import { PasswordStrengthCard } from "@/components/auth/password-strength";
import { cn } from "@/lib/cn";

/**
 * Reset-password form.
 *
 * Behaviour: unchanged. Submits `password` + `confirm` to `updatePassword`
 * and redirects on success.
 *
 * Visual / interaction layer:
 *  • Independent password-visibility toggles on both fields.
 *  • Live strength meter + per-rule indicators via the shared
 *    `<PasswordStrengthCard />` (also used on /sign-up — single source of
 *    truth so the two screens stay identical).
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

  const confirmMismatch = confirm.length > 0 && confirm !== password;
  const submitDisabled =
    pending || password.length < 8 || confirm.length === 0 || confirm !== password;

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

      {/* Strength + rules — shared component, animates open/closed. */}
      <PasswordStrengthCard password={password} />

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
