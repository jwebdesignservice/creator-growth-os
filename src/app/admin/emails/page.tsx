import { createServiceClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/is-admin";
import { ComposeForm } from "./compose-form";

export const metadata = { title: "Compose · Email · Admin · Creator Growth OS" };

/**
 * /admin/emails — the Compose page. Server shell pulls the admin's info +
 * the total recipient count, then hands the interactive form off to a
 * client component.
 */
export default async function ComposeEmailPage() {
  const { user } = await getAdminContext();

  const adminName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Admin";
  const adminEmail = user?.email ?? "";

  // Real recipient count = distinct profiles in the system.
  const supabase = createServiceClient();
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Per-program counts power the Program/Segment dropdown.
  const { data: programs } = await supabase
    .from("programs")
    .select("id, slug, title")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  return (
    <ComposeForm
      adminName={adminName}
      adminEmail={adminEmail}
      totalUsers={totalUsers ?? 0}
      programs={(programs ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
      }))}
    />
  );
}
