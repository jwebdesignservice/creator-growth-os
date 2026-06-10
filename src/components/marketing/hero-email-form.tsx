"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

/**
 * Hero email-capture → sign-up hand-off.
 *
 * On submit we stash the typed email in sessionStorage (NOT the URL — keeps
 * personal data out of the query string / history) and route to /sign-up, where
 * the sign-up form reads it back and pre-fills the email field.
 */
export function HeroEmailForm() {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (email) {
      try {
        sessionStorage.setItem("signup_email", email);
      } catch {
        // sessionStorage unavailable (private mode / blocked) — proceed anyway
      }
    }
    router.push("/sign-up");
  }

  return (
    <form
      action="/sign-up"
      onSubmit={handleSubmit}
      className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center"
    >
      <input
        type="email"
        name="email"
        placeholder="Your email"
        aria-label="Your email"
        className="h-14 w-full rounded-[12px] bg-white/[0.06] px-5 text-[16px] text-white outline-none ring-1 ring-white/20 backdrop-blur-sm transition placeholder:text-white/45 focus:bg-white/[0.10] focus:ring-2 focus:ring-rose-400 sm:max-w-[320px]"
      />
      <button
        type="submit"
        className="self-start whitespace-nowrap text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-white underline decoration-[3px] underline-offset-[10px] transition-colors hover:text-rose-300 hover:decoration-rose-300 sm:self-auto"
      >
        Get started
      </button>
    </form>
  );
}
