"use client";

import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";

/**
 * Book-a-demo form — the right panel of /book-a-demo.
 *
 * Underline-style fields on the dark stage (label above · 18px value · 1px
 * underline · muted placeholder · rose 2px focus), a two-column grid, terms
 * line, and an oversized underlined "Book a Demo" submit pinned bottom-right —
 * matching the reference rhythm.
 *
 * The underline is a 1px background <span> whose height/colour are driven by
 * React focus/hover state (inline style) rather than a border: the design
 * system sets a global `* { border-color: … }` that overrides border-based
 * underlines, so a background span is the robust route.
 *
 * Frontend-only: submitting surfaces an inline confirmation. Wiring it to a
 * CRM / table is a separate, explicitly-scoped task (no backend/schema change
 * is made here).
 */

const NICHES = [
  "Lifestyle",
  "Beauty & Fashion",
  "Fitness & Health",
  "Food & Drink",
  "Travel",
  "Tech & Gaming",
  "Education",
  "Business & Finance",
  "Entertainment",
  "Music",
  "Other",
];

function underlineStyle(focused: boolean, hovered: boolean): CSSProperties {
  return {
    height: focused ? 2 : 1,
    backgroundColor: focused
      ? "#D08171" // rose-400
      : hovered
        ? "rgba(255,255,255,0.45)"
        : "rgba(255,255,255,0.25)",
  };
}

export function BookADemoForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col justify-center py-6">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-rose-400/15 ring-1 ring-rose-400/30">
          <Check className="size-7 text-rose-300" strokeWidth={2.5} />
        </span>
        <h2 className="mt-7 font-sans text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight text-white">
          You&apos;re on the list.
        </h2>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/55">
          Thanks for your interest. Our team will reach out shortly to schedule
          a personalized walkthrough tailored to your niche and growth goals.
        </p>
        <Link
          href="/"
          className="mt-8 self-start text-[15px] font-medium text-white/70 underline decoration-white/30 underline-offset-4 transition hover:text-white"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
      <div className="grid grid-cols-1 gap-x-9 gap-y-7 sm:grid-cols-2">
        <Field label="First Name" name="firstName" placeholder="Maya" autoComplete="given-name" />
        <Field label="Last Name" name="lastName" placeholder="Rivers" autoComplete="family-name" />
        <Field label="Phone Number" name="phone" type="tel" placeholder="1234567890" autoComplete="tel" />
        <Field label="Email" name="email" type="email" placeholder="maya@email.com" autoComplete="email" required />
        <Field label="Creator / Brand Name" name="brand" placeholder="Maya Rivers" />
        <SelectField label="Primary Niche" name="niche" options={NICHES} />
        <Field label="Main Channel" name="channel" placeholder="instagram.com/yourhandle" />
        <Field label="Audience Size" name="audience" placeholder="Total followers" />
      </div>

      <p className="mt-9 text-[15px] leading-relaxed text-white/40">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="text-white/70 underline decoration-white/30 underline-offset-2 transition hover:text-white"
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-white/70 underline decoration-white/30 underline-offset-2 transition hover:text-white"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <button
        type="submit"
        className="mt-auto self-start pt-12 text-[clamp(1.6rem,2.4vw,1.9rem)] font-semibold tracking-tight text-white underline decoration-1 underline-offset-[10px] transition-colors hover:text-rose-300 hover:decoration-rose-300 sm:self-end"
      >
        Book a Demo
      </button>
    </form>
  );
}

/* ── Field primitives ───────────────────────────────────────────────────── */

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <label className="block">
      <span className="block text-[14px] font-medium text-white/90">{label}</span>
      <span
        className="relative mt-3.5 block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full border-0 bg-transparent pb-3 text-[18px] text-white outline-none placeholder:text-white/35"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-200"
          style={underlineStyle(focused, hovered)}
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <label className="block">
      <span className="block text-[14px] font-medium text-white/90">{label}</span>
      <span
        className="relative mt-3.5 block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <select
          name={name}
          defaultValue=""
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full appearance-none border-0 bg-transparent pb-3 pr-8 text-[18px] text-white outline-none [&:invalid]:text-white/35 [&>option]:bg-ink-900 [&>option]:text-white"
        >
          <option value="" disabled>
            Select one…
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-200"
          style={underlineStyle(focused, hovered)}
        />
        <ChevronDown
          aria-hidden
          strokeWidth={2}
          className="pointer-events-none absolute bottom-3 right-0 size-5 text-white/45"
        />
      </span>
    </label>
  );
}
