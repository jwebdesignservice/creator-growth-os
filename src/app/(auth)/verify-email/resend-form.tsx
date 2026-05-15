"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";
import { resendVerificationEmail } from "../actions";

export function ResendForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmail,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending || !email}
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium transition-colors w-full sm:w-auto"
      >
        <RefreshCw
          className={`size-4 ${pending ? "animate-spin" : ""}`}
          strokeWidth={2}
        />
        {pending ? "Sending…" : "Resend confirmation email"}
      </button>

      {state.error && (
        <div className="px-3 py-2 rounded-[10px] bg-rose-50 border border-rose-200 text-[12.5px] text-rose-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="px-3 py-2 rounded-[10px] bg-success-bg border border-success/30 text-[12.5px] text-success">
          {state.success}
        </div>
      )}
    </form>
  );
}
