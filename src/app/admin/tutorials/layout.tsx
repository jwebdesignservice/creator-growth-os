import { redirect } from "next/navigation";
import {
  AdminSurfaceSidebar,
  type SurfaceSidebarItem,
} from "@/components/admin/surface-sidebar";
import { getAdminContext } from "@/lib/admin/is-admin";

/**
 * Tutorials-surface layout. Mirrors the Email-surface pattern exactly —
 * a shared global `AdminSurfaceSidebar` drops in between the admin
 * console's outer chrome and the page content, so every page under
 * /admin/tutorials/* (list, edit, new, …) gets the same inner nav.
 *
 * Icon names are string keys (not component refs) because layouts are
 * server components and React 19 blocks passing Lucide component
 * references across the server→client boundary. The actual icons live
 * in `surface-sidebar.tsx`.
 */
const TUTORIALS_NAV: SurfaceSidebarItem[] = [
  { label: "All tutorials", href: "/admin/tutorials",     icon: "play-circle" },
  { label: "New tutorial",  href: "/admin/tutorials/new", icon: "plus" },
];

export default async function AdminTutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin/tutorials");
  if (!isAdmin) redirect("/dashboard");

  const adminName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Admin";
  const adminEmail = user.email ?? "";

  return (
    <div className="flex min-h-[calc(100vh-68px)] -mx-6 lg:-mx-8 -my-6 lg:-my-8">
      <AdminSurfaceSidebar
        sectionLabel="Tutorials"
        items={TUTORIALS_NAV}
        adminName={adminName}
        adminEmail={adminEmail}
      />
      <div className="flex-1 min-w-0 bg-cream-50/50 px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
