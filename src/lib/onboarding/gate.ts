import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Onboarding gate — Phase 2.

   New users must complete the "Start Here" program (100%) before the rest of
   the platform's programs and tutorials unlock. The gate is a SOFT lock:
   other content stays visible but disabled, with a CTA back to Start Here.
   Enforced server-side (this module), not just hidden in the UI.

   Bypass rules:
   • Admins (a row in admin_users) always bypass.
   • The Start Here program (and its lessons) are never locked.
   Every other non-admin user is gated until Start Here is 100% complete.

   No schema change: "complete" is derived from real lesson_progress.
   Fail-open — if Start Here is missing/unseeded we never lock anyone.
   ───────────────────────────────────────────────────────────────────────── */

/** Slug of the onboarding program that unlocks the rest of the platform. */
export const ONBOARDING_PROGRAM_SLUG = "start-here";

export type OnboardingGate = {
  /** True when this specific user should have non-onboarding content locked. */
  enabled: boolean;
  /** Has the user finished the Start Here program (100%)? */
  complete: boolean;
  /** Start Here completion percent (0–100). */
  percent: number;
  /** Whether the signed-in user is an admin (admins bypass the gate). */
  isAdmin: boolean;
  /** The onboarding program slug, for building CTAs. */
  programSlug: string;
};

const OPEN: OnboardingGate = {
  enabled: false,
  complete: true,
  percent: 100,
  isAdmin: false,
  programSlug: ONBOARDING_PROGRAM_SLUG,
};

/**
 * Compute the onboarding gate for the current user. Cached per request so the
 * many surfaces that consult it (programs list, detail, lessons, tutorials)
 * share a single set of queries.
 */
export const getOnboardingGate = cache(async (): Promise<OnboardingGate> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return OPEN;

  // Admins bypass entirely. The admin check and the Start Here program
  // lookup are independent of each other — run them in parallel.
  // Fail open if the program isn't seeded — never lock everyone out.
  const [{ data: admin }, { data: program }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("programs")
      .select("id")
      .eq("slug", ONBOARDING_PROGRAM_SLUG)
      .maybeSingle(),
  ]);
  const isAdmin = !!admin;

  // Derive Start Here completion from real progress. Fail open if the program
  // has no lessons — never lock everyone out.
  if (!program) return { ...OPEN, isAdmin };

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("program_id", program.id);
  const total = lessons?.length ?? 0;
  if (total === 0) return { ...OPEN, isAdmin };

  const ids = lessons!.map((l) => l.id);
  const { data: done } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true)
    .in("lesson_id", ids);
  const completedCount = done?.length ?? 0;
  const percent = Math.round((completedCount / total) * 100);
  const complete = completedCount >= total;

  return {
    enabled: !isAdmin && !complete,
    complete,
    percent,
    isAdmin,
    programSlug: ONBOARDING_PROGRAM_SLUG,
  };
});

/**
 * Should content be shown locked for this view? True for genuinely-gated
 * users, OR for an admin explicitly previewing the gate (`?previewGate=1`).
 * The Start Here program itself is handled by the caller (never locked).
 */
export function isGateActive(gate: OnboardingGate, preview = false): boolean {
  return gate.enabled || (preview && gate.isAdmin);
}

/** Parse the `previewGate` search param into a boolean. */
export function readPreviewGate(
  value: string | string[] | undefined,
): boolean {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "1" || v === "true";
}
