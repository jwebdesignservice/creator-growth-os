import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getAdminContext } from "@/lib/admin/is-admin";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  // Bounce to onboarding if profile exists but the user hasn't finished it
  if (ctx.profile && ctx.profile.onboarded === false) {
    redirect("/onboarding");
  }

  const { isAdmin } = await getAdminContext();

  return (
    <div className="flex min-h-screen bg-cream-100 text-ink-900">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={ctx.topUser} unreadNotificationCount={ctx.unreadNotificationCount} />
        {children}
      </div>
    </div>
  );
}
