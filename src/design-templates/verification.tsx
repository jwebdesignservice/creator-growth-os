/* Verification ────────────────────────────────────────────────────────────
   Auth verification surfaces — a one-time-code (OTP) input and a
   "check your inbox" verify-email card. Grounded in the verify-email /
   reset-password auth flows.
   ───────────────────────────────────────────────────────────────────── */

import { MailCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export function OtpInput() {
  const digits = ["4", "2", "9", "", "", ""];
  const active = 3;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {digits.map((d, i) => (
          <span
            key={i}
            className={cn(
              "size-12 rounded-[12px] border-2 inline-flex items-center justify-center text-[20px] font-bold text-ink-900",
              i === active ? "border-rose-500 ring-2 ring-rose-100" : d ? "border-ink-200" : "border-ink-100",
            )}
          >
            {d}
            {i === active && <span className="w-px h-5 bg-rose-500 animate-pulse" />}
          </span>
        ))}
      </div>
      <span className="text-[12px] text-ink-500">Enter the 6-digit code we sent you</span>
    </div>
  );
}

export function VerifyEmail() {
  return (
    <div className="card p-8 w-[400px] max-w-full flex flex-col items-center text-center">
      <span className="size-14 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-4">
        <MailCheck className="size-7" strokeWidth={1.8} />
      </span>
      <h3 className="text-h4 text-ink-900">Check your inbox</h3>
      <p className="text-[13px] text-ink-500 mt-1.5 leading-snug max-w-[34ch]">
        We sent a verification link to <span className="font-medium text-ink-900">jack@profluencer.app</span>. Click it to activate your account.
      </p>
      <span className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-cream-200 text-ink-900 text-[13.5px] font-medium">Resend email</span>
      <span className="text-[12px] text-ink-400 mt-3">Didn&apos;t get it? Check spam or resend.</span>
    </div>
  );
}
