"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { TextInput } from "@/components/ui/text-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { signInWithPassword } from "../actions";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signInWithPassword, {});

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      )}
      <TextInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="emma.larsen@example.com"
        icon={<Mail className="size-4" strokeWidth={2} />}
      />

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        required
        placeholder="••••••••••••"
      />

      <div className="flex items-center justify-between">
        <Checkbox name="remember_me" defaultChecked>
          <span className="text-[13px] text-ink-700">Remember me</span>
        </Checkbox>
        <Link
          href="/forgot-password"
          className="text-[13px] font-medium text-rose-600 hover:text-rose-700"
        >
          Forgot password?
        </Link>
      </div>

      {state.error && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[15px] font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
      >
        {pending ? "Signing in…" : "Log In"}
        {!pending && <ArrowRight className="size-4" strokeWidth={2} />}
      </button>
    </form>
  );
}
