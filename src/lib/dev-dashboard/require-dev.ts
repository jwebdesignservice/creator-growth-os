import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDevContext } from "./dev-access";

type RequireDevOk = {
  ok: true;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: NonNullable<Awaited<ReturnType<typeof getDevContext>>["user"]>;
};
type RequireDevErr = { ok: false; error: string };

/**
 * Guards a server action / query and returns a Supabase client + the
 * authenticated dev user. Use this anywhere a non-dev caller must be
 * refused (form submissions, exports, etc.).
 *
 * UI routes under /dev are already guarded by the layout — this is
 * defense-in-depth for non-route code paths.
 */
export async function requireDevClient(): Promise<RequireDevOk | RequireDevErr> {
  const { user, isDev } = await getDevContext();
  if (!user) return { ok: false, error: "Not authenticated." };
  if (!isDev) return { ok: false, error: "Forbidden — dev access required." };

  const supabase = await createClient();
  return { ok: true, supabase, user };
}
