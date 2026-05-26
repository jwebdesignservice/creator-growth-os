import { notFound, redirect } from "next/navigation";
import { ProgramNav } from "@/components/admin/program-nav";
import { getAdminContext } from "@/lib/admin/is-admin";
import { createServiceClient } from "@/lib/supabase/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

/**
 * Single-program admin surface layout — drops in an inner sub-nav between
 * the (compact) admin sidebar and the page content. Every page under
 * /admin/programs/[id]/* shares this chrome.
 *
 * Mirrors the email layout exactly:
 *  • negative margins escape the parent admin <main> padding so the inner
 *    nav sits flush left
 *  • inner nav is 240px, content gets its own padded scroll area
 *  • the parent <AdminSidebar /> collapses to a 68px icon-only rail when
 *    pathname matches /admin/programs/<id>/… (see sidebar.tsx)
 */
export default async function AdminProgramLayout({
  children,
  params,
}: Props) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin/programs");
  if (!isAdmin) redirect("/dashboard");

  const { id } = await params;

  // Pull the program title so the inner nav's brand strip is contextual.
  // Falls back to a generic label if the row is missing — the child page
  // (`page.tsx`) already calls `notFound()` in that case, but defending
  // here keeps the layout pure and avoids a double-fetch hard-error.
  const supabase = createServiceClient();
  const { data: program } = await supabase
    .from("programs")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  const adminName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Admin";
  const adminEmail = user.email ?? "";

  return (
    <div className="flex min-h-[calc(100vh-68px)] -mx-6 lg:-mx-8 -my-6 lg:-my-8">
      <ProgramNav
        programId={program.id}
        programTitle={program.title}
        adminName={adminName}
        adminEmail={adminEmail}
      />
      <div className="flex-1 min-w-0 bg-cream-50/50 px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
