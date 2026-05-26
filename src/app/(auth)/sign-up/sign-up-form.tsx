"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { TextInput } from "@/components/ui/text-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrengthCard } from "@/components/auth/password-strength";
import { signUpWithPassword } from "../actions";

export function SignUpForm({ referralCode }: { referralCode: string | null }) {
  const [state, formAction, pending] = useActionState(signUpWithPassword, {});

  // Controlled so the shared strength card can react live — same meter +
  // rules as /reset-password. No confirm field: the live requirements
  // checklist + show-password toggle already let the user verify what they
  // typed, so a second box is redundant friction at signup.
  const [password, setPassword] = useState("");

  const passwordGateOpen = password.length >= 8;

  return (
    <form action={formAction} className="space-y-4">
      {referralCode && (
        <>
          <input type="hidden" name="referral_code" value={referralCode} />
          <div className="flex items-center gap-2 rounded-[10px] bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12.5px] text-emerald-800">
            <Sparkles className="size-3.5 shrink-0" strokeWidth={2} />
            <span>
              You were invited by a friend — they&apos;ll earn rewards once you
              subscribe.
            </span>
          </div>
        </>
      )}

      <TextInput
        label="Full name"
        name="full_name"
        autoComplete="name"
        placeholder="Enter your full name"
        icon={<User className="size-4" strokeWidth={2} />}
      />

      <TextInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        icon={<Mail className="size-4" strokeWidth={2} />}
      />

      <TextInput
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+47 123 45 678"
        icon={<Phone className="size-4" strokeWidth={2} />}
      />

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        placeholder="••••••••••••"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Live strength meter + rules — shared with /reset-password so the
          two screens are byte-for-byte identical. */}
      <PasswordStrengthCard password={password} />

      {/* Onboarding note */}
      <div className="flex items-start gap-3 rounded-[12px] bg-rose-50/60 border border-rose-100 px-4 py-3">
        <Sparkles
          className="size-4 text-rose-500 shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <p className="text-[12.5px] text-ink-700 leading-snug">
          Your creator category and growth path will be personalized after a
          short onboarding quiz.
        </p>
      </div>

      <Checkbox name="accept_terms" required defaultChecked>
        I agree to the{" "}
        <Link
          href="/terms"
          className="text-rose-600 font-medium hover:text-rose-700"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-rose-600 font-medium hover:text-rose-700"
        >
          Privacy Policy
        </Link>
        .
      </Checkbox>

      {state.error && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !passwordGateOpen}
        className="w-full h-12 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[15px] font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
      >
        {pending ? "Creating account…" : "Create Account & Start Free Trial"}
        {!pending && <ArrowRight className="size-4" strokeWidth={2} />}
      </button>
    </form>
  );
}
