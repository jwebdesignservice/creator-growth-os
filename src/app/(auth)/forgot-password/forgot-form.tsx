"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "../actions";

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
      />

      {state.error && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success">
          {state.success}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
