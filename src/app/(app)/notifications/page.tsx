import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  getUserNotifications,
  getNotificationPreferences,
} from "@/lib/notifications/queries";
import { NotificationsPageClient } from "./notifications-panel";

export const metadata = { title: "Notifications · Creator Growth OS" };

export default async function NotificationsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const userId = ctx.user.id;

  // Run all three queries in parallel — getShellContext is cached so
  // unreadNotificationCount is already available without an extra round-trip.
  const [notifications, preferences] = await Promise.all([
    getUserNotifications(userId),
    getNotificationPreferences(userId),
  ]);

  return (
    <NotificationsPageClient
      notifications={notifications}
      preferences={preferences}
      unreadCount={ctx.unreadNotificationCount}
    />
  );
}
