"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { linkReferral } from "@/lib/referrals/service";
import { REF_COOKIE, sanitizeReferralCode } from "@/lib/referrals/cookie";

type FormResult = { error?: string; success?: string };

/**
 * Only allow internal absolute paths as a post-login destination — blocks
 * open-redirects and protocol-relative ("//evil.com") URLs.
 */
function safeInternalPath(
  value: FormDataEntryValue | null,
  fallback = "/dashboard",
): string {
  const target = typeof value === "string" ? value.trim() : "";
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  return target;
}

export async function signInWithPassword(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeInternalPath(formData.get("redirect_to"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Guard the auth call: a thrown error here (network blip, transient dev
  // recompile, mis-set env) otherwise crashes the action and surfaces in the
  // browser as "An unexpected response was received from the server." We turn
  // it into a friendly returned message instead. `redirect()` stays OUTSIDE
  // the try/catch — it works by throwing a control-flow signal that must not
  // be swallowed.
  const supabase = await createClient();
  let needsConfirmation = false;
  let errorMessage: string | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Email-not-confirmed is the most common cause; nudge them toward the
      // verify screen instead of a wall of red.
      if (/confirm|not.*confirmed|email/i.test(error.message)) {
        needsConfirmation = true;
      } else {
        errorMessage = error.message;
      }
    }
  } catch {
    errorMessage =
      "We couldn't reach the sign-in service. Please try again in a moment.";
  }

  if (needsConfirmation) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&from=sign-in`);
  }
  if (errorMessage) {
    return { error: errorMessage };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signUpWithPassword(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const acceptTerms = formData.get("accept_terms") === "on";
  // The hidden field is populated by the sign-up page (from `?ref=` or the
  // cookie). Fall back to the cookie directly here too, in case the page was
  // server-rendered before the cookie was readable or the field was stripped.
  const cookieStore = await cookies();
  const referralCode =
    sanitizeReferralCode(String(formData.get("referral_code") ?? "")) ??
    sanitizeReferralCode(cookieStore.get(REF_COOKIE)?.value);

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!acceptTerms) return { error: "You need to accept the Terms of Service to continue." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split("@")[0],
        display_name: fullName || email.split("@")[0],
        phone: phone || undefined,
      },
    },
  });

  if (error) return { error: error.message };

  // Link referral if a code was supplied. Best-effort — failures (bad code,
  // self-referral, already linked) don't block signup.
  if (referralCode && data.user) {
    await linkReferral(data.user.id, referralCode);
  }

  // Clear the attribution cookie now that this signup has consumed it, so it
  // can't bleed into a different signup later on the same browser. Safe no-op
  // when the cookie was never set.
  if (cookieStore.get(REF_COOKIE)) {
    cookieStore.delete({ name: REF_COOKIE, path: "/" });
  }

  // If Supabase auto-confirms (confirmation disabled) we land directly in
  // the app; otherwise we send the user to the verify-email screen so they
  // know to check their inbox.
  const needsConfirmation = !data.session;
  revalidatePath("/", "layout");
  if (needsConfirmation) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }
  redirect("/onboarding");
}

export async function requestPasswordReset(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };

  const supabase = await createClient();
  // Derive the origin from the request headers (same pattern as
  // onboarding/actions.ts) so the reset link always points at the host the
  // user is actually on, instead of a hardcoded localhost fallback.
  const hdrs = await headers();
  const host = hdrs.get("host");
  const appUrl = host
    ? `${host.startsWith("localhost") ? "http" : "https"}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?type=recovery&next=/reset-password`,
  });
  if (error) return { error: error.message };

  return { success: "Check your inbox for a reset link." };
}

export async function updatePassword(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Password updated. You can now sign in." };
}

export async function resendVerificationEmail(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is missing." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });
  if (error) return { error: error.message };
  return { success: "We sent a fresh confirmation link to your inbox." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
