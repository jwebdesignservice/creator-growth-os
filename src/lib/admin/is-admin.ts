import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user along with whether they're an admin.
 * React-cached per request so admin layout + page can share a single
 * lookup. Returns `{ user: null, isAdmin: false }` when no session.
 */
export const getAdminContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };

  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, isAdmin: !!row };
});
