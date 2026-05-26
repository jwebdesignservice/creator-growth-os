import { redirect } from "next/navigation";
import { EmailNav } from "@/components/admin/email-nav";
import { getAdminContext } from "@/lib/admin/is-admin";

/**
 * Email surface layout — drops in an inner sub-nav between the (compact)
 * admin sidebar and the page content. Every page under /admin/emails/*
 * shares this chrome.
 */
export default async function AdminEmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin/emails");
  if (!isAdmin) redirect("/dashboard");

  const adminName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Admin";
  const adminEmail = user.email ?? "";

  return (
    <div className="flex min-h-[calc(100vh-68px)] -mx-6 lg:-mx-8 -my-6 lg:-my-8">
      <EmailNav adminName={adminName} adminEmail={adminEmail} />
      <div className="flex-1 min-w-0 bg-cream-50/50 px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
