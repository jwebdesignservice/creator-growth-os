import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Allowlist of dev-approved email addresses.
 * Frontend-foundation gate — used until a proper `dev_users` table or
 * `profiles.role = "dev"` column is wired up. Replace `getDevContext`'s
 * lookup below with the real source when available.
 *
 * Dev access is independent of admin access. Admin !== Dev.
 */
const DEV_ALLOWLIST: ReadonlyArray<string> = [
  "deividas1.no@gmail.com",
  "hei@bwstudio.no",
];

export function isDevEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return DEV_ALLOWLIST.includes(email.toLowerCase().trim());
}

/**
 * Returns the current user plus whether they are a dev-approved account.
 * React-cached per request so the layout + page + sidebar share one lookup.
 * Safe to call in places where the user may not be signed in.
 */
export const getDevContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isDev: false };

  return { user, isDev: isDevEmail(user.email) };
});
