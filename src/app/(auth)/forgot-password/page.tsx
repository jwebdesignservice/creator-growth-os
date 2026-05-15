import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Reset password · Creator Growth OS" };

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink-900 leading-tight">
          Reset your password
        </h1>
        <p className="mt-3 text-ink-500 text-[14px]">
          We&apos;ll send a reset link to your inbox.
        </p>
      </div>

      <ForgotForm />

      <p className="mt-8 text-[13px] text-ink-500 text-center">
        Back to{" "}
        <Link href="/sign-in" className="text-rose-600 font-medium hover:text-rose-700">
          Sign in
        </Link>
      </p>
    </>
  );
}
