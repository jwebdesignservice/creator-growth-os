"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProvider, type ProviderKey } from "./providers";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Disconnect a platform: clear tokens, scopes, and connected_at. The row is
 * kept (so any historical follower_count / metrics stay) but the user must
 * re-authorize before further syncs.
 */
export async function disconnectPlatform(
  platform: ProviderKey,
): Promise<Result> {
  const provider = getProvider(platform);
  if (!provider) return { ok: false, error: "Unknown platform" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // RLS already restricts to the calling user; the .eq is belt-and-suspenders.
  const { error } = await supabase
    .from("social_accounts")
    .update({
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      scopes: null,
      connected_at: null,
      sync_status: "idle",
      sync_error: null,
    })
    .eq("user_id", user.id)
    .eq("platform", platform);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/performance");
  return { ok: true };
}
