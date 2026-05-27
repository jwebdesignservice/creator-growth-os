import {
  PenSquare,
  Send,
  Workflow,
  FileText,
  History,
  Settings,
} from "lucide-react";
import {
  AdminSurfaceSidebar,
  type SurfaceSidebarItem,
} from "./surface-sidebar";

/**
 * Email-section sidebar. Thin shell around the shared
 * `AdminSurfaceSidebar` — every visual / interactive concern lives in
 * the global component; this file owns only the email-specific items.
 */
const EMAIL_NAV: SurfaceSidebarItem[] = [
  { label: "Compose",     href: "/admin/emails",             icon: PenSquare },
  { label: "Campaigns",   href: "/admin/emails/campaigns",   icon: Send },
  { label: "Automations", href: "/admin/emails/automations", icon: Workflow },
  { label: "Templates",   href: "/admin/emails/templates",   icon: FileText },
  { label: "History",     href: "/admin/emails/history",     icon: History },
  { label: "Settings",    href: "/admin/emails/settings",    icon: Settings },
];

export function EmailNav({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  return (
    <AdminSurfaceSidebar
      sectionLabel="Email"
      items={EMAIL_NAV}
      adminName={adminName}
      adminEmail={adminEmail}
    />
  );
}
