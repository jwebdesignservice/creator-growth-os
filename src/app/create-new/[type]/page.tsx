import { notFound, redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";
import { CreateWizard } from "./wizard";
import { WIZARD_TYPES, type WizardType } from "./types";

export const metadata = { title: "Create new · Profluencer" };

type Params = Promise<{ type: string }>;

export default async function CreateWizardPage({ params }: { params: Params }) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in");
  if (!isAdmin) redirect("/dashboard");

  const { type } = await params;
  if (!WIZARD_TYPES.includes(type as WizardType)) {
    notFound();
  }

  return <CreateWizard type={type as WizardType} />;
}
