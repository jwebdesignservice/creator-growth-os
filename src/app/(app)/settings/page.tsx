import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/lib/notifications/queries";
import { SettingsPageClient } from "./settings-panel";

export const metadata = { title: "Settings · Creator Growth OS" };

export default async function SettingsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const supabase  = await createClient();
  const userId    = ctx.user.id;

  const [
    { data: profile },
    { data: socialAccounts },
    { data: pillars },
    preferences,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("social_accounts").select("*").eq("user_id", userId),
    supabase
      .from("content_pillars")
      .select("id, label, sort_order")
      .eq("user_id", userId)
      .order("sort_order"),
    getNotificationPreferences(userId),
  ]);

  return (
    <SettingsPageClient
      profile={profile}
      socialAccounts={socialAccounts ?? []}
      pillars={(pillars ?? []).map((p) => p.label)}
      preferences={preferences}
    />
  );
}
