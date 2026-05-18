"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FormResult = { error?: string; success?: string };

export async function signInWithPassword(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Email-not-confirmed is the most common cause; nudge them toward the
    // verify screen instead of a wall of red.
    if (/confirm|not.*confirmed|email/i.test(error.message)) {
      redirect(`/verify-email?email=${encodeURIComponent(email)}&from=sign-in`);
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpWithPassword(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const followerBase = String(formData.get("follower_base") ?? "").trim();
  const primaryPlatform = String(formData.get("primary_platform") ?? "").trim();
  const acceptTerms = formData.get("accept_terms") === "on";

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords don't match." };
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
        follower_base: followerBase || undefined,
        primary_platform: primaryPlatform || undefined,
      },
    },
  });

  if (error) return { error: error.message };

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
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
