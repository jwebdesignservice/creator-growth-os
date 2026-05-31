import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { TopbarSearch } from "@/components/admin/topbar-search";
import { ProfileMenu } from "@/components/app-shell/profile-menu";
import { getAdminContext } from "@/lib/admin/is-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin");
  if (!isAdmin) redirect("/dashboard");

  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="flex min-h-screen bg-cream-100 text-ink-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-cream-100/85 backdrop-blur supports-[backdrop-filter]:bg-cream-100/70 border-b border-ink-100">
          <div className="flex items-center gap-4 h-[68px] px-6 lg:px-8">
            <div className="flex-1 max-w-[480px]">
              <TopbarSearch />
            </div>
            <div className="flex-1" />
            <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] bg-rose-100 text-rose-700 text-[12px] font-semibold uppercase tracking-wider">
              Admin Mode
            </span>
            <ProfileMenu
              user={{
                name,
                avatar_url: null,
                plan: "Admin",
              }}
            />
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
