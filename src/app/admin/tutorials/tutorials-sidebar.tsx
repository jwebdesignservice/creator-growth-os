"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AdminSurfaceSidebar,
  type SurfaceSidebarItem,
} from "@/components/admin/surface-sidebar";

/* ─────────────────────────────────────────────────────────────────────────
   Tutorials sidebar (client) — only rendered for the editor route.

   • On `/admin/tutorials` (list) and `/admin/tutorials/new`:
       returns `null`. The list page already has its own filter chips
       (All / Drafts / Published / Archived) plus a "New tutorial" CTA
       in the page header, so the middle nav adds nothing — hiding it
       lets the grid use the full canvas.
   • On `/admin/tutorials/[id]` (the editor):
       renders the section-tab rail that used to live inside the editor —
       All tutorials · Overview · Metadata · Thumbnail · Lesson path ·
       Creator drill · Resources · Controls · Access. Tab state is driven
       by the `?tab=…` search param so the link-based sidebar can
       highlight the right item without lifting React state across the
       layout boundary.
   ───────────────────────────────────────────────────────────────────────── */

const EDITOR_TABS: ReadonlyArray<{
  key: string;
  label: string;
  icon: SurfaceSidebarItem["icon"];
  beta?: boolean;
}> = [
  { key: "overview",      label: "Overview",      icon: "info" },
  { key: "metadata",      label: "Metadata",      icon: "sparkles" },
  { key: "thumbnail",     label: "Thumbnail",     icon: "image" },
  { key: "lesson-path",   label: "Lesson path",   icon: "route", beta: true },
  { key: "resources",     label: "Resources",     icon: "folder" },
  { key: "controls",      label: "Controls",      icon: "sliders-horizontal" },
  { key: "access",        label: "Access",        icon: "lock" },
];

/** Default tab when the URL doesn't carry one — matches the editor default. */
const DEFAULT_TAB = "metadata";

export function TutorialsSidebar({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  /* Editor mode triggers on any /admin/tutorials/<id> route other than the
     `/new` create page. We extract the id segment to build per-tab links. */
  const editorMatch = useMemo(() => {
    if (!pathname?.startsWith("/admin/tutorials/")) return null;
    const tail = pathname.slice("/admin/tutorials/".length);
    const [first] = tail.split("/");
    if (!first || first === "new") return null;
    return { id: first };
  }, [pathname]);

  if (!editorMatch) return null;

  const currentTab = searchParams?.get("tab") ?? DEFAULT_TAB;
  const editorBase = `/admin/tutorials/${editorMatch.id}`;

  const items: SurfaceSidebarItem[] = [
    {
      label: "All tutorials",
      href:  "/admin/tutorials",
      icon:  "chevron-left",
      // Stays muted while editing — it's a back-link, not the active tab.
      active: false,
    },
    ...EDITOR_TABS.map((t) => ({
      label:  t.label,
      href:   `${editorBase}?tab=${t.key}`,
      icon:   t.icon,
      active: currentTab === t.key,
      beta:   t.beta,
    })),
  ];

  return (
    <AdminSurfaceSidebar
      sectionLabel="Editing"
      items={items}
      adminName={adminName}
      adminEmail={adminEmail}
    />
  );
}
