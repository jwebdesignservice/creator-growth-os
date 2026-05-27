import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";
import { TutorialUploadForm } from "./upload-form";

export const metadata = { title: "New Tutorial · Admin" };

/**
 * /admin/tutorials/new — Step 1 of 3 of the dedicated tutorial-upload flow.
 *
 * Frontend-only for now: lets the admin pick or drop a video file, surfaces
 * best-practice tips, a "what happens next" preview, and an upload
 * checklist. "Upload & continue" advances to the (yet-to-be-built) details
 * step. Real upload wiring will land in a follow-up pass.
 */
export default async function AdminNewTutorialPage() {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin/tutorials/new");
  if (!isAdmin) redirect("/dashboard");

  return <TutorialUploadForm />;
}
