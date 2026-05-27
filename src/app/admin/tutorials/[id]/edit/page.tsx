import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAdminContext } from "@/lib/admin/is-admin";

export const metadata = {
  title: "Edit tutorial · Admin · Creator Growth OS",
};

type Params = Promise<{ id: string }>;

/**
 * /admin/tutorials/[id]/edit — destination for clicking a tutorial card
 * on the admin Tutorials grid. The full edit experience is forthcoming;
 * for now this is a placeholder so the navigation works end-to-end and
 * design / build can happen in a follow-up pass without breaking the
 * grid's click target.
 */
export default async function TutorialEditPage({ params }: { params: Params }) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin/tutorials");
  if (!isAdmin) redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="max-w-[920px] mx-auto py-6">
      <Link
        href="/admin/tutorials"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-ink-900 mb-4 transition-colors"
      >
        <ChevronLeft className="size-3.5" strokeWidth={2} />
        Back to Tutorials
      </Link>

      <h1 className="text-h1 text-ink-900 leading-tight mb-1">
        Edit tutorial
      </h1>
      <p className="text-[12.5px] text-ink-400 font-mono mb-8">
        id: {id}
      </p>

      <div className="card p-10 text-center">
        <p className="text-[14px] text-ink-500">development</p>
      </div>
    </div>
  );
}
