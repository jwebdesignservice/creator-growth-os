import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RequireAdminOk = {
  ok: true;
  supabase: SupabaseClient;
};
export type RequireAdminErr = {
  ok: false;
  error: string;
};
export type RequireAdminResult = RequireAdminOk | RequireAdminErr;

/**
 * Helper for admin server actions. Returns either the Supabase client
 * (when the caller is an admin) or an error envelope ready to be
 * returned to the client.
 */
export async function requireAdminClient(): Promise<RequireAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return { ok: false, error: "Admin only." };
  return { ok: true, supabase };
}
