import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { MobileSearch } from "@/components/app-shell/mobile-search";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getAdminContext } from "@/lib/admin/is-admin";
import { getDevContext } from "@/lib/dev-dashboard/dev-access";

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

  const [{ isAdmin }, { isDev }] = await Promise.all([
    getAdminContext(),
    getDevContext(),
  ]);

  return (
    <div className="flex min-h-screen bg-cream-100 text-ink-900">
      <Sidebar plan={ctx.plan} isAdmin={isAdmin} isDev={isDev} taskCount={ctx.openTaskCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={ctx.topUser}
          unreadNotificationCount={ctx.unreadNotificationCount}
          plan={ctx.plan}
          isAdmin={isAdmin}
          isDev={isDev}
        />
        <MobileSearch />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
