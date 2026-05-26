import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getReferralStats } from "@/lib/referrals/queries";
import { ReferralsPanel } from "./referrals-panel";

export const metadata = { title: "Referrals | Creator Growth OS" };

export default async function ReferralsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const stats = await getReferralStats();
  if (!stats) redirect("/sign-in");

  return <ReferralsPanel stats={stats} />;
}
