"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyTaskCompleted } from "@/lib/notifications/service";

/**
 * Toggle mission completion. Returns an empty object so the client can
 * pass this directly into a useTransition without needing a return value.
 */
export async function toggleMissionComplete(
  missionId: string,
  completed: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("missions")
    .select("title, status")
    .eq("id", missionId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("missions")
    .update({
      status: completed ? "completed" : "pending",
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", missionId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  if (completed && existing && existing.status !== "completed") {
    await notifyTaskCompleted(user.id, existing.title);
  }

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  // Refresh the cached app-shell layout so the sidebar "Tasks" badge
  // (ctx.openTaskCount) stays in sync with the mission list.
  revalidatePath("/", "layout");
  return { ok: true };
}
