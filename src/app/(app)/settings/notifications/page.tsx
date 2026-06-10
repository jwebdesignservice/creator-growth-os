import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getNotificationPreferences } from "@/lib/notifications/queries";
import { PageShell } from "@/components/app-shell/page-shell";
import { NotificationsForm } from "./notifications-form";

export const metadata = {
  title: "Notifications · Settings · Profluencer",
};

export default async function NotificationsSettingsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const preferences = await getNotificationPreferences(ctx.user.id);

  return (
    <PageShell>
      <div className="container-app">
        <NotificationsForm initial={preferences} />
      </div>
    </PageShell>
  );
}
