import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";
import { CreateNewPicker } from "./picker";

export const metadata = { title: "Choose what to create" };

/**
 * Full-screen format picker reached from the admin dashboard's
 * "+ Create New" button. Lets an admin pick what they want to build
 * (program, video, task, or posting plan) before jumping into the
 * matching admin builder. Admin-only.
 */
export default async function CreateNewPage() {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in");
  if (!isAdmin) redirect("/dashboard");

  return <CreateNewPicker />;
}
