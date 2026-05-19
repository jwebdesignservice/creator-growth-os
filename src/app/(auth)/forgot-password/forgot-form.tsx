"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "../actions";

/**
 * Forgot-password form.
 *
 * Behaviour unchanged — wraps the `requestPasswordReset` server action,
 * renders a single email input, and surfaces success/error states inline.
 * Styling has been tightened so it sits cleanly inside the new two-column
 * page layout.
 */
export function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@creator.com"
        className="h-12"
      />

      {state.error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700"
        >
          {state.error}
        </div>
      )}
      {state.success && (
        <div
          role="status"
          className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success"
        >
          {state.success}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 text-[14.5px] font-semibold"
        disabled={pending}
      >
        {pending ? "Sending…" : "Reset password"}
      </Button>
    </form>
  );
}
