import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getUserNotifications } from "@/lib/notifications/queries";
import { NotificationsPageClient } from "./notifications-panel";

export const metadata = { title: "Notifications | Profluencer" };

export default async function NotificationsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const userId = ctx.user.id;
  const firstName =
    (ctx.profile?.display_name ?? ctx.profile?.full_name ?? ctx.user.email?.split("@")[0] ?? "Creator")
      .split(" ")[0];

  const notifications = await getUserNotifications(userId);

  return (
    <NotificationsPageClient
      notifications={notifications}
      firstName={firstName}
    />
  );
}
