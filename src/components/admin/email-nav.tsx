import {
  AdminSurfaceSidebar,
  type SurfaceSidebarItem,
} from "./surface-sidebar";

/**
 * Email-section sidebar. Thin shell around the shared
 * `AdminSurfaceSidebar` — every visual / interactive concern lives in
 * the global component; this file owns only the email-specific items.
 *
 * Icons are string keys (resolved in `surface-sidebar.tsx`) — this file
 * runs as a server component, and React 19 forbids passing Lucide
 * component refs to the client `AdminSurfaceSidebar`.
 */
const EMAIL_NAV: SurfaceSidebarItem[] = [
  { label: "Compose",     href: "/admin/emails",             icon: "pen-square" },
  { label: "Campaigns",   href: "/admin/emails/campaigns",   icon: "send" },
  { label: "Automations", href: "/admin/emails/automations", icon: "workflow" },
  { label: "Templates",   href: "/admin/emails/templates",   icon: "file-text" },
  { label: "History",     href: "/admin/emails/history",     icon: "history" },
  { label: "Settings",    href: "/admin/emails/settings",    icon: "settings" },
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
      icon="mail"
      sectionLabel="Email"
      items={EMAIL_NAV}
      adminName={adminName}
      adminEmail={adminEmail}
    />
  );
}
