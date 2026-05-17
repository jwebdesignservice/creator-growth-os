import { redirect } from "next/navigation";

/**
 * /profile is deprecated — the single user destination is /settings.
 * This server component issues a hard redirect so any old bookmarks,
 * external links, or topbar menu entries still resolve correctly.
 */
export const metadata = { title: "User Settings · Creator Growth OS" };

export default function ProfilePage() {
  redirect("/settings");
}
