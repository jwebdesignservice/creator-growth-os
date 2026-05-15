"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  User,
  Mail,
  Phone,
  Users as FollowerIcon,
  MonitorSmartphone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { TextInput } from "@/components/ui/text-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OAuthButtons } from "@/components/ui/oauth-buttons";
import { signUpWithPassword } from "../actions";

const FOLLOWER_RANGES = [
  { value: "0-1k", label: "0 – 1,000 followers" },
  { value: "1k-10k", label: "1K – 10K followers" },
  { value: "10k-50k", label: "10K – 50K followers" },
  { value: "50k+", label: "50K+ followers" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "snapchat", label: "Snapchat" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "multiple", label: "Multiple platforms" },
];

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, {});

  return (
    <form action={formAction} className="space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="••••••••••••"
          minLength={8}
        />
        <PasswordInput
          label="Confirm password"
          name="confirm_password"
          autoComplete="new-password"
          required
          placeholder="••••••••••••"
          minLength={8}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Follower Base"
          name="follower_base"
          placeholder="Select your range"
          options={FOLLOWER_RANGES}
          icon={<FollowerIcon className="size-4" strokeWidth={2} />}
        />
        <Select
          label="Primary Platform"
          name="primary_platform"
          placeholder="Select your platform"
          options={PLATFORMS}
          icon={<MonitorSmartphone className="size-4" strokeWidth={2} />}
        />
      </div>

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
        disabled={pending}
        className="w-full h-12 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[15px] font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
      >
        {pending ? "Creating account…" : "Create Account & Start Free Trial"}
        {!pending && <ArrowRight className="size-4" strokeWidth={2} />}
      </button>

      <div className="flex items-center gap-4 text-[12px] text-ink-500">
        <div className="h-px flex-1 bg-ink-100" />
        or continue with
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <OAuthButtons redirectTo="/onboarding" />
    </form>
  );
}
