import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Set new password · Creator Growth OS" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The recovery flow signs the user in temporarily after they click the link.
  // If there's no session, the link is invalid or expired.
  if (!user) {
    redirect("/forgot-password?error=expired");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink-900 leading-tight">
          Set a new password
        </h1>
        <p className="mt-3 text-ink-500 text-[14px]">
          Choose something strong — at least 8 characters.
        </p>
      </div>

      <ResetForm />

      <p className="mt-8 text-[13px] text-ink-500 text-center">
        Back to{" "}
        <Link
          href="/sign-in"
          className="text-rose-600 font-medium hover:text-rose-700"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
