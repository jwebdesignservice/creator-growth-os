/* Page Designs ──────────────────────────────────────────────────────────
   Schematic app-shell layout skeletons (wireframes) for the page-structure
   patterns the product uses: single vs double sidebar, with / without top
   tabs, right rail, and centered/full-width. Rendered in the app's own
   tokens (cream / ink / rose). Exported as a ready gallery category via
   PAGE_DESIGN_CATEGORIES so the gallery only spreads it in.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { LayoutPanelLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Wireframe primitives ─────────────────────────────────────────────── */

function Topbar() {
  return (
    <div className="h-7 shrink-0 border-b border-ink-100 bg-white flex items-center gap-2 px-3">
      <div className="size-2.5 rounded-[4px] bg-rose-400" />
      <div className="h-1.5 w-10 rounded-full bg-ink-200" />
      <div className="ml-auto flex items-center gap-1.5">
        <div className="size-3 rounded-full bg-ink-100" />
        <div className="size-3 rounded-full bg-ink-100" />
        <div className="size-4 rounded-full bg-cream-300" />
      </div>
    </div>
  );
}

/* Narrow icon-only nav (the primary app rail) */
function IconRail() {
  return (
    <div className="w-10 shrink-0 border-r border-ink-100 bg-white flex flex-col items-center py-2.5 gap-2">
      <div className="size-4 rounded-[5px] bg-rose-400 mb-1" />
      <div className="size-4 rounded-[5px] bg-rose-200" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
    </div>
  );
}

/* Wider labelled nav rail */
function NavRail() {
  return (
    <div className="w-[92px] shrink-0 border-r border-ink-100 bg-white p-2.5 space-y-2">
      <div className="h-2 w-12 rounded bg-ink-200 mb-1.5" />
      <div className="h-2.5 rounded bg-rose-200" />
      <div className="h-2.5 rounded bg-ink-100" />
      <div className="h-2.5 rounded bg-ink-100" />
      <div className="h-2.5 rounded bg-ink-100" />
      <div className="h-2.5 w-3/4 rounded bg-ink-100" />
    </div>
  );
}

/* Narrow contextual right rail */
function RightRail() {
  return (
    <div className="w-[76px] shrink-0 border-l border-ink-100 bg-white p-2.5 space-y-2">
      <div className="h-10 rounded-md bg-cream-100" />
      <div className="h-2 rounded bg-ink-100" />
      <div className="h-2 w-2/3 rounded bg-ink-100" />
      <div className="h-8 rounded-md bg-cream-100 mt-1" />
    </div>
  );
}

function Tabs() {
  return (
    <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5 border-b border-ink-100">
      <div className="h-2.5 w-10 rounded-full bg-rose-400" />
      <div className="h-2.5 w-10 rounded-full bg-ink-100" />
      <div className="h-2.5 w-10 rounded-full bg-ink-100" />
    </div>
  );
}

function Header() {
  return (
    <div className="px-3.5 pt-3.5 pb-1">
      <div className="h-3 w-28 rounded bg-ink-300" />
      <div className="h-2 w-40 rounded bg-ink-100 mt-1.5" />
    </div>
  );
}

function ContentBlocks() {
  return (
    <div className="px-3.5 pb-3.5 pt-2.5 space-y-2.5">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-11 rounded-lg bg-white border border-ink-100" />
        <div className="h-11 rounded-lg bg-white border border-ink-100" />
        <div className="h-11 rounded-lg bg-white border border-ink-100" />
      </div>
      <div className="h-16 rounded-lg bg-white border border-ink-100" />
    </div>
  );
}

function Body({ tabs }: { tabs?: boolean }) {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      {tabs ? <Tabs /> : <Header />}
      <ContentBlocks />
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[560px] h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden flex flex-col shadow-sm">
      <Topbar />
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}

/* ── Variants ─────────────────────────────────────────────────────────── */

function SingleSidebar() {
  return (
    <Frame>
      <NavRail />
      <Body />
    </Frame>
  );
}

function DoubleSidebar() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <Body />
    </Frame>
  );
}

function SingleSidebarTabs() {
  return (
    <Frame>
      <NavRail />
      <Body tabs />
    </Frame>
  );
}

function DoubleSidebarTabs() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <Body tabs />
    </Frame>
  );
}

function SidebarRightRail() {
  return (
    <Frame>
      <NavRail />
      <Body />
      <RightRail />
    </Frame>
  );
}

function FullWidthCentered() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50">
        <div className="mx-auto h-full max-w-[78%] border-x border-ink-100/70 bg-white/40">
          <Header />
          <ContentBlocks />
        </div>
      </div>
    </Frame>
  );
}

/* ── Content-pattern variants ─────────────────────────────────────────── */

function SplitBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="flex-1 border-r border-ink-100 p-3 space-y-2">
        <div className="h-2.5 w-16 rounded bg-ink-200" />
        <div className="h-20 rounded-lg bg-white border border-ink-100" />
        <div className="h-2 w-full rounded bg-ink-100" />
        <div className="h-2 w-2/3 rounded bg-ink-100" />
      </div>
      <div className="flex-1 p-3 space-y-2 bg-white/40">
        <div className="h-2.5 w-12 rounded bg-rose-200" />
        <div className="h-28 rounded-lg bg-white border border-ink-100" />
      </div>
    </div>
  );
}

function ListDetailBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[112px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn("h-7 rounded-md border", i === 1 ? "border-rose-200 bg-rose-50" : "border-ink-100 bg-cream-50")}
          />
        ))}
      </div>
      <div className="flex-1 p-3.5 space-y-2.5">
        <div className="h-3 w-32 rounded bg-ink-300" />
        <div className="h-2 w-24 rounded bg-ink-100" />
        <div className="h-20 rounded-lg bg-white border border-ink-100 mt-1" />
      </div>
    </div>
  );
}

function KanbanBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5 overflow-hidden">
      {["bg-rose-200", "bg-ink-200", "bg-emerald-200", "bg-amber-200"].map((head, c) => (
        <div key={head} className="flex-1 space-y-2">
          <div className={cn("h-2 rounded-full", head)} />
          <div className="h-10 rounded-md bg-white border border-ink-100" />
          <div className="h-10 rounded-md bg-white border border-ink-100" />
          {c % 2 === 0 && <div className="h-10 rounded-md bg-white border border-ink-100" />}
        </div>
      ))}
    </div>
  );
}

function EmptyBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex flex-col items-center justify-center gap-2.5 p-4">
      <div className="size-12 rounded-full bg-rose-100" />
      <div className="h-2.5 w-32 rounded bg-ink-200" />
      <div className="h-2 w-44 rounded bg-ink-100" />
      <div className="h-7 w-24 rounded-lg bg-rose-400 mt-1" />
    </div>
  );
}

function GridBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3.5">
      <div className="h-2.5 w-20 rounded bg-ink-200 mb-2.5" />
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[52px] rounded-lg bg-white border border-ink-100" />
        ))}
      </div>
    </div>
  );
}

function WizardBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3.5">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="size-4 rounded-full bg-rose-400" />
        <div className="h-0.5 w-6 bg-ink-100" />
        <div className="size-4 rounded-full bg-rose-200" />
        <div className="h-0.5 w-6 bg-ink-100" />
        <div className="size-4 rounded-full bg-ink-100" />
      </div>
      <div className="mx-auto max-w-[72%] space-y-2.5">
        <div className="h-9 rounded-lg bg-white border border-ink-100" />
        <div className="h-9 rounded-lg bg-white border border-ink-100" />
        <div className="h-7 w-24 rounded-lg bg-rose-400 ml-auto mt-1" />
      </div>
    </div>
  );
}

function SplitView() {
  return (
    <Frame>
      <NavRail />
      <SplitBody />
    </Frame>
  );
}
function ListDetail() {
  return (
    <Frame>
      <NavRail />
      <ListDetailBody />
    </Frame>
  );
}
function KanbanBoard() {
  return (
    <Frame>
      <NavRail />
      <KanbanBody />
    </Frame>
  );
}
function EmptyStateLayout() {
  return (
    <Frame>
      <NavRail />
      <EmptyBody />
    </Frame>
  );
}
function CardGrid() {
  return (
    <Frame>
      <NavRail />
      <GridBody />
    </Frame>
  );
}
function WizardSteps() {
  return (
    <Frame>
      <NavRail />
      <WizardBody />
    </Frame>
  );
}

/* ── More page patterns ───────────────────────────────────────────────── */

function ChatBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[100px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("flex items-center gap-1.5 p-1 rounded", i === 0 && "bg-rose-50")}>
            <div className="size-5 rounded-full bg-ink-100 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-3 space-y-2">
          <div className="h-6 w-2/3 rounded-xl bg-white border border-ink-100" />
          <div className="h-6 w-1/2 rounded-xl bg-rose-100 ml-auto" />
          <div className="h-6 w-3/5 rounded-xl bg-white border border-ink-100" />
          <div className="h-6 w-2/5 rounded-xl bg-rose-100 ml-auto" />
        </div>
        <div className="border-t border-ink-100 p-2">
          <div className="h-7 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </div>
  );
}

function CalendarBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2.5 w-16 rounded bg-ink-300" />
        <div className="ml-auto h-5 w-12 rounded-md bg-white border border-ink-100" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(28).keys()].map((i) => (
          <div
            key={i}
            className={cn("h-[30px] rounded bg-white border border-ink-100", (i === 9 || i === 16) && "bg-rose-50 border-rose-200")}
          />
        ))}
      </div>
    </div>
  );
}

function AnalyticsBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-11 rounded-lg bg-white border border-ink-100 p-1.5">
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            <div className="h-2.5 w-1/2 rounded bg-rose-200 mt-1.5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 h-[88px] rounded-lg bg-white border border-ink-100 p-2 flex items-end gap-1.5">
          {[40, 70, 50, 85, 60, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="h-[88px] rounded-lg bg-white border border-ink-100 flex items-center justify-center">
          <div className="size-12 rounded-full border-[5px] border-rose-300" />
        </div>
      </div>
    </div>
  );
}

function FeedBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      <div className="mx-auto max-w-[62%] py-3 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="size-5 rounded-full bg-ink-100" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
            </div>
            <div className="h-2 rounded bg-ink-100" />
            <div className="h-2 w-3/4 rounded bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsFormBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[96px] shrink-0 p-2.5 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("h-2.5 rounded", i === 0 ? "bg-rose-300 w-3/4" : "bg-ink-100 w-2/3")} />
        ))}
      </div>
      <div className="flex-1 p-3 space-y-2">
        <div className="h-2.5 w-20 rounded bg-ink-300 mb-1" />
        <div className="h-8 rounded-lg bg-white border border-ink-100" />
        <div className="h-8 rounded-lg bg-white border border-ink-100" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 rounded-lg bg-white border border-ink-100" />
          <div className="h-8 rounded-lg bg-white border border-ink-100" />
        </div>
        <div className="h-7 w-20 rounded-lg bg-rose-400 ml-auto mt-1" />
      </div>
    </div>
  );
}

function TableViewBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-6 w-24 rounded-md bg-white border border-ink-100" />
        <div className="ml-auto h-6 w-14 rounded-md bg-rose-400" />
      </div>
      <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
        <div className="h-6 bg-cream-100 border-b border-ink-100" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 border-b border-ink-100 last:border-0 flex items-center gap-2 px-2">
            <div className="size-3 rounded-full bg-ink-100" />
            <div className="h-1.5 flex-1 rounded bg-ink-100" />
            <div className="h-3 w-10 rounded-full bg-emerald-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileDetailBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50">
      <div className="h-14 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200 flex items-end p-2.5">
        <div className="size-9 rounded-full bg-white border-2 border-white shadow-sm" />
        <div className="ml-2 mb-1 h-2 w-20 rounded bg-white/70" />
      </div>
      <div className="flex gap-2.5 p-3">
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-16 rounded-lg bg-white border border-ink-100" />
        </div>
        <div className="w-[88px] shrink-0 space-y-2">
          <div className="h-10 rounded-lg bg-white border border-ink-100" />
          <div className="h-10 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </div>
  );
}

function ChatLayout() {
  return (
    <Frame>
      <NavRail />
      <ChatBody />
    </Frame>
  );
}
function CalendarLayout() {
  return (
    <Frame>
      <NavRail />
      <CalendarBody />
    </Frame>
  );
}
function AnalyticsDashboard() {
  return (
    <Frame>
      <NavRail />
      <AnalyticsBody />
    </Frame>
  );
}
function FeedTimeline() {
  return (
    <Frame>
      <NavRail />
      <FeedBody />
    </Frame>
  );
}
function SettingsForm() {
  return (
    <Frame>
      <NavRail />
      <SettingsFormBody />
    </Frame>
  );
}
function DataTableView() {
  return (
    <Frame>
      <NavRail />
      <TableViewBody />
    </Frame>
  );
}
function ProfileDetail() {
  return (
    <Frame>
      <NavRail />
      <ProfileDetailBody />
    </Frame>
  );
}
function CollapsedSidebar() {
  return (
    <Frame>
      <IconRail />
      <Body />
    </Frame>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type PdCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const PAGE_DESIGN_CATEGORIES: PdCategory[] = [
  {
    id: "page-designs",
    label: "Page Designs",
    icon: LayoutPanelLeft,
    blurb: "App-shell layouts — single / double sidebar, top tabs, right rail.",
    items: [
      { label: "Single sidebar", code: "SingleSidebar", node: <SingleSidebar /> },
      { label: "Double sidebar", code: "DoubleSidebar", node: <DoubleSidebar /> },
      { label: "Single sidebar · top tabs", code: "SingleSidebarTabs", node: <SingleSidebarTabs /> },
      { label: "Double sidebar · top tabs", code: "DoubleSidebarTabs", node: <DoubleSidebarTabs /> },
      { label: "Sidebar + right rail", code: "SidebarRightRail", node: <SidebarRightRail /> },
      { label: "Full-width · centered", code: "FullWidthCentered", node: <FullWidthCentered /> },
      { label: "Split view", code: "SplitView", node: <SplitView /> },
      { label: "List + detail", code: "ListDetail", node: <ListDetail /> },
      { label: "Kanban board", code: "KanbanBoard", node: <KanbanBoard /> },
      { label: "Empty / onboarding", code: "EmptyStateLayout", node: <EmptyStateLayout /> },
      { label: "Card grid", code: "CardGrid", node: <CardGrid /> },
      { label: "Wizard / steps", code: "WizardSteps", node: <WizardSteps /> },
      { label: "Collapsed sidebar", code: "CollapsedSidebar", node: <CollapsedSidebar /> },
      { label: "Chat / messaging", code: "ChatLayout", node: <ChatLayout /> },
      { label: "Calendar", code: "CalendarLayout", node: <CalendarLayout /> },
      { label: "Analytics dashboard", code: "AnalyticsDashboard", node: <AnalyticsDashboard /> },
      { label: "Feed / timeline", code: "FeedTimeline", node: <FeedTimeline /> },
      { label: "Settings form", code: "SettingsForm", node: <SettingsForm /> },
      { label: "Data table view", code: "DataTableView", node: <DataTableView /> },
      { label: "Profile / detail", code: "ProfileDetail", node: <ProfileDetail /> },
    ],
  },
];
