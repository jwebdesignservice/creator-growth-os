import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";
import { ResendForm } from "./resend-form";

export const metadata = { title: "Verify your email · Creator Growth OS" };

type SearchParams = Promise<{ email?: string; from?: string }>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { email = "", from } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 lg:px-12 py-6 flex items-center gap-3">
        <BrandMark size={36} />
        <div className="leading-tight">
          <div className="text-[14px] font-semibold text-ink-900">
            {BRAND_NAME}
          </div>
          <div className="text-[11px] text-ink-500 tracking-wide uppercase">
            How To Become A Successful Social Media Influencer
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[520px]">
          <div className="card p-8 lg:p-10 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-rose-100 text-rose-600 mb-5">
              <Mail className="size-7" strokeWidth={1.8} />
            </div>

            <h1 className="text-h1 text-ink-900 leading-tight mb-3">
              {from === "sign-in"
                ? "Confirm your email first"
                : "Check your inbox"}
            </h1>

            <p className="text-ink-700 text-[14.5px] leading-relaxed mb-1">
              {from === "sign-in"
                ? "We sent a confirmation link to"
                : "We just sent a confirmation link to"}
            </p>
            <p className="text-ink-900 font-semibold text-[15px] mb-6 break-all">
              {email || "your email address"}
            </p>

            <p className="text-ink-500 text-[13.5px] leading-relaxed mb-7">
              Click the link in that email to verify your account and unlock
              your dashboard. The link expires in 24 hours.
            </p>

            <ResendForm email={email} />

            <div className="mt-8 pt-6 border-t border-ink-100 space-y-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-rose-600 hover:text-rose-700"
              >
                I&apos;ve confirmed — sign in
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
              <div className="text-[12px] text-ink-500">
                Wrong email?{" "}
                <Link
                  href="/sign-up"
                  className="text-ink-700 hover:text-rose-600 underline-offset-4 underline decoration-ink-200"
                >
                  Start over
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-ink-500">
            <ShieldCheck className="size-3.5" strokeWidth={2} />
            We never share your information.
          </div>
        </div>
      </main>
    </div>
  );
}
