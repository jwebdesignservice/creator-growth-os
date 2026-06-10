/* ─────────────────────────────────────────────────────────────────────
   /design — design system gallery.

   Admin-only, hidden from the sidebar. The page itself is a thin auth
   gate; the browsable "Explore the components" UI lives in the client
   component below. Templates live in src/design-templates/ and are
   registered in design-gallery.tsx → CATEGORIES.
   ───────────────────────────────────────────────────────────────────── */

import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";
import { DesignGalleryLazy } from "./design-gallery-lazy";

export const metadata = { title: "Design system · Profluencer" };

export default async function DesignGalleryPage() {
  const { isAdmin } = await getAdminContext();
  if (!isAdmin) redirect("/dashboard");

  return <DesignGalleryLazy />;
}
