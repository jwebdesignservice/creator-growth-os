/* ─────────────────────────────────────────────────────────────────────
   /design — design template gallery.

   Admin-only, hidden from sidebar. Renders every template in
   src/design-templates/ under category sections, with a sticky left
   table-of-contents so you can jump between sections.

   Add a new variant: import the component below, append an entry to
   the relevant SECTION → items[]. Add a brand new category: append a
   SECTION entry.
   ───────────────────────────────────────────────────────────────────── */

import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";

import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  IconButton,
  DisabledButton,
} from "@/design-templates/buttons";
import {
  TextInput,
  TextInputWithError,
  SearchInput,
  Textarea,
} from "@/design-templates/inputs";
import {
  ToggleSwitch,
  Checkbox,
  RadioGroup,
} from "@/design-templates/toggles";
import {
  AvatarInitial,
  AvatarImage,
  AvatarWithStatus,
  AvatarGroup,
} from "@/design-templates/avatars";
import {
  Badge,
  BadgeWithDot,
  CountBadge,
  BadgeRow,
} from "@/design-templates/badges";
import { TooltipAbove } from "@/design-templates/tooltips";
import { AllAlerts } from "@/design-templates/notifications";
import { BasicCard, CardWithCta, KpiTile } from "@/design-templates/cards";
import { PricingGrid } from "@/design-templates/pricing";
import { UsersTable } from "@/design-templates/tables";
import { ModalLauncher } from "@/design-templates/modals";
import { TabStrip } from "@/design-templates/tabs";

export const metadata = { title: "Design templates · Creator Growth OS" };

type Section = {
  id: string;
  title: string;
  note?: string;
  items: { name: string; render: () => React.ReactNode }[];
};

const SECTIONS: Section[] = [
  {
    id: "buttons",
    title: "Buttons",
    note: "Primary, secondary, ghost, danger, icon-only, disabled.",
    items: [
      { name: "PrimaryButton",    render: () => <PrimaryButton /> },
      { name: "SecondaryButton",  render: () => <SecondaryButton /> },
      { name: "GhostButton",      render: () => <GhostButton /> },
      { name: "DangerButton",     render: () => <DangerButton /> },
      { name: "IconButton",       render: () => <IconButton /> },
      { name: "DisabledButton",   render: () => <DisabledButton /> },
    ],
  },
  {
    id: "inputs",
    title: "Inputs",
    note: "Text inputs, search, error states, textarea.",
    items: [
      { name: "TextInput",          render: () => <TextInput /> },
      { name: "TextInputWithError", render: () => <TextInputWithError /> },
      { name: "SearchInput",        render: () => <SearchInput /> },
      { name: "Textarea",           render: () => <Textarea /> },
    ],
  },
  {
    id: "toggles",
    title: "Toggles",
    note: "Switches, checkboxes, radio groups.",
    items: [
      { name: "ToggleSwitch", render: () => <ToggleSwitch /> },
      { name: "Checkbox",     render: () => <Checkbox /> },
      { name: "RadioGroup",   render: () => <RadioGroup /> },
    ],
  },
  {
    id: "avatars",
    title: "Avatars",
    note: "Initial, image, status dot, stacked group.",
    items: [
      { name: "AvatarInitial",    render: () => <AvatarInitial /> },
      { name: "AvatarImage",      render: () => <AvatarImage /> },
      { name: "AvatarWithStatus", render: () => <AvatarWithStatus /> },
      { name: "AvatarGroup",      render: () => <AvatarGroup /> },
    ],
  },
  {
    id: "badges",
    title: "Badges",
    note: "Colored status chips, dotted indicator, count badge.",
    items: [
      { name: "Badge (rose)",    render: () => <Badge>Rose</Badge> },
      { name: "BadgeWithDot",    render: () => <BadgeWithDot /> },
      { name: "CountBadge",      render: () => <CountBadge /> },
      { name: "BadgeRow",        render: () => <BadgeRow /> },
    ],
  },
  {
    id: "tooltips",
    title: "Tooltips",
    note: "Hover-revealed labels for icon buttons.",
    items: [
      { name: "TooltipAbove (hover the icon)", render: () => <TooltipAbove /> },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    note: "Inline alert banners — success, info, warning, error.",
    items: [
      { name: "AllAlerts", render: () => <AllAlerts /> },
    ],
  },
  {
    id: "cards",
    title: "Cards",
    note: "Content cards, KPI tiles, CTA cards.",
    items: [
      { name: "BasicCard",   render: () => <BasicCard /> },
      { name: "CardWithCta", render: () => <CardWithCta /> },
      { name: "KpiTile",     render: () => <KpiTile /> },
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    note: "Plan tiers with feature comparison.",
    items: [
      { name: "PricingGrid", render: () => <PricingGrid /> },
    ],
  },
  {
    id: "tables",
    title: "Tables",
    note: "User / record lists with status and actions.",
    items: [
      { name: "UsersTable", render: () => <UsersTable /> },
    ],
  },
  {
    id: "modals",
    title: "Modals",
    note: "Dialog surfaces with backdrop + close.",
    items: [
      { name: "ModalLauncher (click to open)", render: () => <ModalLauncher /> },
    ],
  },
  {
    id: "tabs",
    title: "Tabs",
    note: "Tab strip switching between content panels.",
    items: [
      { name: "TabStrip", render: () => <TabStrip /> },
    ],
  },
];

export default async function DesignGalleryPage() {
  const { isAdmin } = await getAdminContext();
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">
        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-10">
            <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-3">
              Components
            </p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-[13.5px] text-ink-700 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-[8px] transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 space-y-14">
          <header>
            <p className="text-rose-600 font-medium text-[13px] mb-2">
              Internal · Admin only
            </p>
            <h1 className="text-h1 text-ink-900 mb-1">Design templates</h1>
            <p className="text-ink-500 text-[14px] max-w-prose">
              Sketchpad for new visuals. Edit components under{" "}
              <code className="text-[12px] bg-cream-200 px-1.5 py-0.5 rounded">
                src/design-templates/
              </code>
              ; register variants in{" "}
              <code className="text-[12px] bg-cream-200 px-1.5 py-0.5 rounded">
                src/app/design/page.tsx
              </code>
              .
            </p>
          </header>

          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-10">
              <header className="mb-5 pb-3 border-b border-ink-100">
                <h2 className="text-h3 text-ink-900">{section.title}</h2>
                {section.note && (
                  <p className="text-ink-500 text-[13px] mt-1">
                    {section.note}
                  </p>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-[14px] border border-ink-100 bg-cream-50/60 p-5 flex flex-col gap-4"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-center min-h-[100px]">
                      {item.render()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <footer className="border-t border-ink-100 pt-6 text-[13px] text-ink-500">
            See{" "}
            <code className="text-[12px] bg-cream-200 px-1.5 py-0.5 rounded">
              src/design-templates/README.md
            </code>{" "}
            for the workflow.
          </footer>
        </main>
      </div>
    </div>
  );
}
