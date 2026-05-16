import { redirect } from "next/navigation";
import { DevShell } from "@/components/dev-dashboard/dev-shell";
import { getDevContext } from "@/lib/dev-dashboard/dev-access";

export const metadata = {
  title: "Dev Dashboard · Creator Growth OS",
  robots: { index: false, follow: false },
};

export default async function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isDev } = await getDevContext();
  if (!user) redirect("/sign-in?redirect=/dev");
  if (!isDev) redirect("/dashboard");

  return <DevShell>{children}</DevShell>;
}
