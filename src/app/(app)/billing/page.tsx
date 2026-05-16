import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { BillingPageClient } from "./billing-panel";

export const metadata = { title: "Billing · Creator Growth OS" };

export default async function BillingPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  return <BillingPageClient plan={ctx.plan} />;
}
