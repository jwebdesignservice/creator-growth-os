import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getReferralActivity, getReferralStats } from "@/lib/referrals/queries";
import { InvitesPanel } from "./invites-panel";

export const metadata = { title: "Invites · Settings · Creator Growth OS" };

export default async function InvitesSettingsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const [stats, activity] = await Promise.all([
    getReferralStats(),
    getReferralActivity(),
  ]);
  if (!stats) redirect("/sign-in");

  return <InvitesPanel stats={stats} activity={activity} />;
}
