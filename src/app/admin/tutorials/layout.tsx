import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";
import { TutorialsSidebar } from "./tutorials-sidebar";

/**
 * Tutorials-surface layout. Mirrors the Email-surface pattern — a shared
 * middle sidebar drops in between the admin console's outer chrome and
 * the page content. Unlike Email, the tutorials sidebar is contextual:
 * on the editor route it replaces the surface root nav with the editor's
 * section tabs (Overview · Metadata · Thumbnail · …) so the editor no
 * longer needs its own third in-content rail.
 *
 * The contextual switch lives in `./tutorials-sidebar.tsx` (a client
 * component that reads `usePathname()` and the `?tab=…` search param).
 */
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
      <TutorialsSidebar adminName={adminName} adminEmail={adminEmail} />
      <div className="flex-1 min-w-0 bg-cream-50/50 px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
