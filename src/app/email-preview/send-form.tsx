"use client";

import { useActionState } from "react";
import { sendAllPreviewsToInbox, type SendPreviewState } from "./actions";

const INITIAL: SendPreviewState = {};

export function SendForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction, pending] = useActionState(
    sendAllPreviewsToInbox,
    INITIAL,
  );

  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-sm overflow-hidden">
      <form action={formAction} className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Send all 7 to your inbox
            </h2>
            <p className="text-[12.5px] text-ink-500 mt-1 leading-relaxed">
              Each template is sent via Resend with subject prefixed{" "}
              <code className="text-ink-700">[Preview]</code>. Links inside use
              sample values and won&apos;t resolve.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            name="to"
            required
            defaultValue={defaultEmail}
            placeholder="you@example.com"
            className="flex-1 h-11 px-4 rounded-xl bg-cream-50 border border-ink-100 text-[14px] focus:outline-none focus:border-rose-400 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-11 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[14px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Sending…" : "Send all 7 →"}
          </button>
        </div>

        <p className="mt-3 text-[11.5px] text-ink-400 leading-relaxed">
          ⚠ Resend&apos;s shared <code>onboarding@resend.dev</code> sender only
          delivers to the email registered on your Resend account. To send
          anywhere else, verify a domain in Resend and set{" "}
          <code>EMAIL_FROM</code> in <code>.env.local</code>.
        </p>
      </form>

      {(state.success || state.error) && (
        <div
          className={`px-5 sm:px-6 py-4 border-t border-ink-100 ${
            state.error ? "bg-rose-50" : "bg-emerald-50/60"
          }`}
        >
          <p
            className={`text-[13px] font-medium ${
              state.error ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {state.error ?? state.success}
          </p>

          {state.results && state.results.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {state.results.map((r) => (
                <li
                  key={r.name}
                  className="text-[12px] flex items-center gap-2"
                >
                  <span
                    className={`inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold ${
                      r.status === "sent"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {r.status === "sent" ? "✓" : "✗"}
                  </span>
                  <span className="text-ink-700 font-medium">{r.name}</span>
                  <span className="text-ink-400">— {r.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
