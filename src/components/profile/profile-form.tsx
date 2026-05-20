"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Pencil, Save, Check } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { updateProfileDetails } from "@/app/(app)/profile/actions";
import { cn } from "@/lib/cn";

type Props = {
  initial: {
    name: string;
    email: string;
    phone: string;
    follower_base: string;
    handle: string;
    niche: string;
    primary_platform: string;
    bio: string;
    avatar_url: string | null;
    category_label: string;
  };
};

export function ProfileForm({ initial }: Props) {
  const initialState: { ok: true } | { ok: false; error: string } = {
    ok: false,
    error: "",
  };
  const [state, formAction, pending] = useActionState<
    { ok: true } | { ok: false; error: string },
    FormData
  >(updateProfileDetails, initialState);
  const [bio, setBio] = useState(initial.bio);

  const errMessage = state.ok ? null : state.error;

  return (
    <form action={formAction} className="space-y-6">
      {/* Avatar row */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar name={initial.name} src={initial.avatar_url ?? undefined} size={96} />
          <button
            type="button"
            className="absolute bottom-0 right-0 size-8 rounded-full bg-rose-500 text-white inline-flex items-center justify-center shadow-sm hover:bg-rose-600 cursor-pointer"
            aria-label="Edit photo"
          >
            <Pencil className="size-3.5" strokeWidth={2} />
          </button>
        </div>
        <div>
          <button
            type="button"
            className="text-[13px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer mb-1 block"
          >
            Edit photo
          </button>
          <p className="text-[11.5px] text-ink-500">
            JPG, PNG or WebP. Max 5MB.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          name="full_name"
          label="Full Name"
          defaultValue={initial.name}
          placeholder="Your name"
        />
        <Field
          name="email"
          label="Email Address"
          defaultValue={initial.email}
          readOnly
          help="To change your email, contact support."
        />
        <Field
          name="phone"
          label="Phone Number"
          defaultValue={initial.phone}
          placeholder="+47 123 45 678"
        />
        <Select
          name="follower_base"
          label="Follower Base"
          defaultValue={initial.follower_base}
          options={[
            { value: "", label: "Select your range" },
            { value: "0-1k", label: "0 – 1K" },
            { value: "1k-10k", label: "1K – 10K" },
            { value: "10k-50k", label: "10K – 50K" },
            { value: "50k+", label: "50K+" },
          ]}
        />
        <div>
          <label className="block">
            <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
              Creator Category
            </span>
            <div className="flex items-center gap-2 h-11 px-4 rounded-[12px] bg-cream-100 border border-ink-100 text-[14px] text-ink-700">
              {initial.category_label}
            </div>
            <p className="mt-1 text-[11px] text-ink-500 flex items-center gap-1">
              Categories are managed by our team.
            </p>
          </label>
        </div>
        <Field
          name="handle"
          label="Username / Handle"
          defaultValue={initial.handle ? `@${initial.handle}` : ""}
          placeholder="@yourhandle"
        />
        <Select
          name="primary_platform"
          label="Primary Platform"
          defaultValue={initial.primary_platform}
          options={[
            { value: "", label: "Select platform" },
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
            { value: "snapchat", label: "Snapchat" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "multiple", label: "Multiple" },
          ]}
        />
        <Field
          name="niche"
          label="Niche / Audience Focus"
          defaultValue={initial.niche}
          placeholder="e.g. Personal Growth, Content Creation"
          help="Who do you create for?"
        />
      </div>

      {/* Bio */}
      <label className="block">
        <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
          Bio / Creator Description
        </span>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 1000))}
          rows={4}
          maxLength={1000}
          placeholder="A short intro that shows up in your public profile and media kit."
          className="w-full px-4 py-2.5 rounded-[12px] bg-white border border-ink-200 text-ink-900 placeholder:text-ink-400 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none"
        />
        <div className="mt-1 text-right text-[11px] text-ink-500 tabular-nums">
          {bio.length} / 1000
        </div>
      </label>

      {errMessage && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {errMessage}
        </div>
      )}
      {state.ok && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success inline-flex items-center gap-1.5">
          <Check className="size-4" strokeWidth={2.5} />
          Profile saved.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100">
        <Link
          href={initial.handle ? `https://instagram.com/${initial.handle}` : "#"}
          className={cn(
            "text-[12.5px] font-medium",
            initial.handle ? "text-rose-600 hover:text-rose-700" : "text-ink-300 pointer-events-none",
          )}
        >
          instagram.com/{initial.handle || "yourhandle"}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium cursor-pointer transition-colors shadow-sm"
        >
          <Save className="size-4" strokeWidth={2} />
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  readOnly,
  help,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  readOnly?: boolean;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          "w-full h-11 px-4 rounded-[12px] border text-[14px] transition-colors",
          readOnly
            ? "bg-cream-100 border-ink-100 text-ink-700 cursor-not-allowed"
            : "bg-white border-ink-200 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100",
        )}
      />
      {help && <p className="mt-1 text-[11px] text-ink-500">{help}</p>}
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
