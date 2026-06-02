/* ─────────────────────────────────────────────────────────────────────
   /design — "Explore the components" gallery (client).

   Presents every template in src/design-templates/ as a browsable
   component library: sticky category sidebar + a grid of live preview
   cards per category, each opening a full-size detail modal.

   Add a variant: import it below and append to the relevant CATEGORY
   → items[]. Add a category: append a CATEGORY entry (give it an id +
   a lucide icon). Nothing else to wire up — the sidebar, counts,
   scroll-spy and modal all derive from CATEGORIES.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AppWindow,
  ArrowLeft,
  Bell,
  ChartColumn,
  CircleUser,
  ClipboardList,
  Compass,
  DollarSign,
  Gauge,
  GraduationCap,
  Info,
  KeyRound,
  Layers,
  LayoutGrid,
  LayoutPanelTop,
  LayoutTemplate,
  Menu,
  MessageSquare,
  MessagesSquare,
  MousePointerClick,
  NotebookPen,
  PanelLeft,
  PanelTop,
  Route,
  Send,
  Sparkles,
  Table2,
  Tag,
  TextCursorInput,
  ToggleLeft,
  Trophy,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  IconButton,
  DisabledButton,
} from "@/design-templates/buttons";
import { FOUNDATION_CATEGORIES } from "@/design-templates/foundations";
import {
  TextInput,
  TextInputWithError,
  SearchInput,
  Textarea,
} from "@/design-templates/inputs";
import { ToggleSwitch, Checkbox, RadioGroup } from "@/design-templates/toggles";
import {
  AvatarInitial,
  AvatarImage,
  AvatarWithStatus,
  AvatarGroup,
} from "@/design-templates/avatars";
import { Badge, BadgeWithDot, CountBadge, BadgeRow } from "@/design-templates/badges";
import { TooltipAbove } from "@/design-templates/tooltips";
import { AllAlerts } from "@/design-templates/notifications";
import { BasicCard, CardWithCta, KpiTile } from "@/design-templates/cards";
import { PricingGrid } from "@/design-templates/pricing";
import {
  UsersTable,
  AdminUsersTable,
  SupportTicketsTable,
  PlannedPostsTable,
  DealTrackerTable,
  EmailHistoryTable,
  DevMonitoringTable,
} from "@/design-templates/tables";
import { ModalLauncher } from "@/design-templates/modals";
import { TabStrip } from "@/design-templates/tabs";
import { AppTopbar, MarketingNavbar } from "@/design-templates/navbars";
import { AppSidebar, CompactSidebar } from "@/design-templates/sidebars";
import {
  Breadcrumbs,
  Pagination,
  Stepper,
  SegmentedControl,
  DropdownMenu,
} from "@/design-templates/navigation";
import {
  EmptyState,
  Banner,
  ProgressBars,
  SkeletonList,
  Accordion,
} from "@/design-templates/feedback";
import { SelectField, FileDropzone, FilterChips } from "@/design-templates/forms";
import {
  DashboardPage,
  SettingsPage,
  AuthPage,
} from "@/design-templates/page-layouts";
import {
  PlatformGlyphs,
  PostCard,
  PostStatusPill,
  PipelineProgress,
} from "@/design-templates/posting";
import { StatTile, StatRow, DeltaStats } from "@/design-templates/stats";
import { Sparkline, DonutRing, BarChart, SegmentedBar } from "@/design-templates/charts";
import { PageHeader, SectionCard, FilterBar } from "@/design-templates/sections";
import { OAuthButtons, PasswordStrength } from "@/design-templates/auth-blocks";
import { ToastStack, ConfirmDialog, CommandPalette } from "@/design-templates/overlays";
import { MessageThread, ChatComposer, ChannelList } from "@/design-templates/chat";
import { ProgramCard, CurriculumAccordion, VideoPlayer } from "@/design-templates/learning";
import { SelectionCards, StepHeader, ProgressRail } from "@/design-templates/onboarding";
import { MissionCard, StreakCard, RewardBar } from "@/design-templates/missions";
import { ReadinessScore, DealCard, RevenueStat } from "@/design-templates/monetization";
import { ActivityTimeline, CommunicationThread } from "@/design-templates/timeline";
import { NoteCard, NoteEditorToolbar } from "@/design-templates/notes";

// ─────────────────────────────────────────────────────────────────────────────
// Data — one entry per template variant. `scale` shrinks wide/tall previews so
// they read as thumbnails; the detail modal always renders at full size.
// ─────────────────────────────────────────────────────────────────────────────

type Variant = { label: string; code: string; node: ReactNode; scale?: number };
type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scale?: number; // default preview scale for the category
  items: Variant[];
};

const CATEGORIES: Category[] = [
  ...FOUNDATION_CATEGORIES,
  {
    id: "buttons",
    label: "Buttons",
    icon: MousePointerClick,
    blurb: "Calls to action across emphasis levels.",
    items: [
      { label: "Primary button", code: "PrimaryButton", node: <PrimaryButton /> },
      { label: "Secondary button", code: "SecondaryButton", node: <SecondaryButton /> },
      { label: "Ghost button", code: "GhostButton", node: <GhostButton /> },
      { label: "Danger button", code: "DangerButton", node: <DangerButton /> },
      { label: "Icon button", code: "IconButton", node: <IconButton /> },
      { label: "Disabled button", code: "DisabledButton", node: <DisabledButton /> },
    ],
  },
  {
    id: "inputs",
    label: "Inputs",
    icon: TextCursorInput,
    blurb: "Text fields, search, error states, textarea.",
    items: [
      { label: "Text input", code: "TextInput", node: <TextInput /> },
      { label: "Text input · error", code: "TextInputWithError", node: <TextInputWithError /> },
      { label: "Search input", code: "SearchInput", node: <SearchInput /> },
      { label: "Textarea", code: "Textarea", node: <Textarea /> },
    ],
  },
  {
    id: "toggles",
    label: "Toggles",
    icon: ToggleLeft,
    blurb: "Switches, checkboxes and radio groups.",
    items: [
      { label: "Toggle switch", code: "ToggleSwitch", node: <ToggleSwitch /> },
      { label: "Checkbox", code: "Checkbox", node: <Checkbox /> },
      { label: "Radio group", code: "RadioGroup", node: <RadioGroup /> },
    ],
  },
  {
    id: "avatars",
    label: "Avatars",
    icon: CircleUser,
    blurb: "Initials, photos, status dots, stacked groups.",
    items: [
      { label: "Avatar · initial", code: "AvatarInitial", node: <AvatarInitial /> },
      { label: "Avatar · image", code: "AvatarImage", node: <AvatarImage /> },
      { label: "Avatar · status", code: "AvatarWithStatus", node: <AvatarWithStatus /> },
      { label: "Avatar group", code: "AvatarGroup", node: <AvatarGroup /> },
    ],
  },
  {
    id: "badges",
    label: "Badges",
    icon: Tag,
    blurb: "Status chips, dot indicators, counts.",
    items: [
      { label: "Badge", code: "Badge", node: <Badge>Rose</Badge> },
      { label: "Badge · dot", code: "BadgeWithDot", node: <BadgeWithDot /> },
      { label: "Count badge", code: "CountBadge", node: <CountBadge /> },
      { label: "Badge row", code: "BadgeRow", node: <BadgeRow /> },
    ],
  },
  {
    id: "tooltips",
    label: "Tooltips",
    icon: MessageSquare,
    blurb: "Hover-revealed labels for icon controls.",
    items: [{ label: "Tooltip", code: "TooltipAbove", node: <TooltipAbove /> }],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    blurb: "Inline alert banners — success, info, warning, error.",
    scale: 0.95,
    items: [{ label: "Alert banners", code: "AllAlerts", node: <AllAlerts /> }],
  },
  {
    id: "cards",
    label: "Cards",
    icon: LayoutGrid,
    blurb: "Content surfaces, CTA cards and KPI tiles.",
    items: [
      { label: "Basic card", code: "BasicCard", node: <BasicCard /> },
      { label: "Card · CTA", code: "CardWithCta", node: <CardWithCta /> },
      { label: "KPI tile", code: "KpiTile", node: <KpiTile /> },
    ],
  },
  {
    id: "posting",
    label: "Posting",
    icon: Send,
    blurb: "Content-calendar elements — post card, platform glyphs, status pill, pipeline progress.",
    items: [
      { label: "Post card", code: "PostCard", node: <PostCard /> },
      { label: "Platform glyphs", code: "PlatformGlyphs", node: <PlatformGlyphs /> },
      { label: "Status pill", code: "PostStatusPill", node: <PostStatusPill /> },
      { label: "Pipeline progress", code: "PipelineProgress", node: <PipelineProgress /> },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: DollarSign,
    blurb: "Plan tiers with feature comparison.",
    scale: 0.8,
    items: [{ label: "Pricing grid", code: "PricingGrid", node: <PricingGrid /> }],
  },
  {
    id: "tables",
    label: "Tables",
    icon: Table2,
    blurb: "Record lists, data grids, pipelines and delivery tables.",
    scale: 0.78,
    items: [
      { label: "Basic table", code: "UsersTable", node: <UsersTable /> },
      { label: "Advanced data table", code: "AdminUsersTable", node: <AdminUsersTable /> },
      { label: "Support tickets", code: "SupportTicketsTable", node: <SupportTicketsTable /> },
      { label: "Planned posts", code: "PlannedPostsTable", node: <PlannedPostsTable /> },
      { label: "Brand deal tracker", code: "DealTrackerTable", node: <DealTrackerTable /> },
      { label: "Email history", code: "EmailHistoryTable", node: <EmailHistoryTable /> },
      { label: "Dev monitoring table", code: "DevMonitoringTable", node: <DevMonitoringTable />, scale: 0.72 },
    ],
  },
  {
    id: "modals",
    label: "Modals",
    icon: AppWindow,
    blurb: "Dialog surfaces with backdrop and close.",
    items: [{ label: "Modal dialog", code: "ModalLauncher", node: <ModalLauncher /> }],
  },
  {
    id: "tabs",
    label: "Tabs",
    icon: PanelTop,
    blurb: "Tab strips switching between panels.",
    scale: 0.95,
    items: [{ label: "Tab strip", code: "TabStrip", node: <TabStrip /> }],
  },
  {
    id: "navbars",
    label: "Navbars",
    icon: Menu,
    blurb: "Top navigation — in-app topbar and marketing navbar.",
    scale: 0.9,
    items: [
      { label: "App topbar", code: "AppTopbar", node: <AppTopbar /> },
      { label: "Marketing navbar", code: "MarketingNavbar", node: <MarketingNavbar /> },
    ],
  },
  {
    id: "sidebars",
    label: "Sidebars",
    icon: PanelLeft,
    blurb: "Navigation rails — full sectioned nav and an icon-only rail.",
    scale: 0.8,
    items: [
      { label: "App sidebar", code: "AppSidebar", node: <AppSidebar /> },
      { label: "Compact sidebar", code: "CompactSidebar", node: <CompactSidebar /> },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    icon: Route,
    blurb: "Breadcrumbs, pagination, steppers, segmented controls, menus.",
    items: [
      { label: "Breadcrumbs", code: "Breadcrumbs", node: <Breadcrumbs /> },
      { label: "Pagination", code: "Pagination", node: <Pagination /> },
      { label: "Stepper", code: "Stepper", node: <Stepper /> },
      { label: "Segmented control", code: "SegmentedControl", node: <SegmentedControl /> },
      { label: "Dropdown menu", code: "DropdownMenu", node: <DropdownMenu /> },
    ],
  },
  {
    id: "forms",
    label: "Forms",
    icon: ClipboardList,
    blurb: "Selects, file dropzones, and multi-select filter chips.",
    items: [
      { label: "Select field", code: "SelectField", node: <SelectField /> },
      { label: "File dropzone", code: "FileDropzone", node: <FileDropzone /> },
      { label: "Filter chips", code: "FilterChips", node: <FilterChips /> },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: Info,
    blurb: "Empty states, banners, progress, skeletons, and accordions.",
    items: [
      { label: "Empty state", code: "EmptyState", node: <EmptyState /> },
      { label: "Banner", code: "Banner", node: <Banner /> },
      { label: "Progress bars", code: "ProgressBars", node: <ProgressBars /> },
      { label: "Skeleton list", code: "SkeletonList", node: <SkeletonList /> },
      { label: "Accordion", code: "Accordion", node: <Accordion /> },
    ],
  },
  {
    id: "page-layouts",
    label: "Page layouts",
    icon: LayoutTemplate,
    blurb: "Full-page compositions — dashboard, settings, and auth screens.",
    scale: 0.9,
    items: [
      { label: "Dashboard page", code: "DashboardPage", node: <DashboardPage /> },
      { label: "Settings page", code: "SettingsPage", node: <SettingsPage /> },
      { label: "Auth page", code: "AuthPage", node: <AuthPage /> },
    ],
  },
  {
    id: "stats",
    label: "Stats",
    icon: Gauge,
    blurb: "KPI and metric tiles used across dashboard, performance and admin.",
    items: [
      { label: "Stat tile", code: "StatTile", node: <StatTile /> },
      { label: "Stat row", code: "StatRow", node: <StatRow />, scale: 0.78 },
      { label: "Delta stats", code: "DeltaStats", node: <DeltaStats />, scale: 0.9 },
    ],
  },
  {
    id: "charts",
    label: "Charts",
    icon: ChartColumn,
    blurb: "Sparklines, progress rings, bar charts and distribution bars.",
    items: [
      { label: "Sparkline", code: "Sparkline", node: <Sparkline /> },
      { label: "Donut ring", code: "DonutRing", node: <DonutRing /> },
      { label: "Bar chart", code: "BarChart", node: <BarChart /> },
      { label: "Segmented bar", code: "SegmentedBar", node: <SegmentedBar /> },
    ],
  },
  {
    id: "sections",
    label: "Sections",
    icon: LayoutPanelTop,
    blurb: "Page headers, section cards, and filter / toolbar rows.",
    items: [
      { label: "Page header", code: "PageHeader", node: <PageHeader /> },
      { label: "Section card", code: "SectionCard", node: <SectionCard /> },
      { label: "Filter bar", code: "FilterBar", node: <FilterBar />, scale: 0.85 },
    ],
  },
  {
    id: "auth",
    label: "Auth",
    icon: KeyRound,
    blurb: "OAuth provider buttons and the live password-strength meter.",
    items: [
      { label: "OAuth buttons", code: "OAuthButtons", node: <OAuthButtons /> },
      { label: "Password strength", code: "PasswordStrength", node: <PasswordStrength /> },
    ],
  },
  {
    id: "overlays",
    label: "Overlays",
    icon: Layers,
    blurb: "Toast stack, confirm dialog, and the command palette.",
    items: [
      { label: "Toast stack", code: "ToastStack", node: <ToastStack /> },
      { label: "Confirm dialog", code: "ConfirmDialog", node: <ConfirmDialog /> },
      { label: "Command palette", code: "CommandPalette", node: <CommandPalette /> },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessagesSquare,
    blurb: "Community message bubbles, composer, and channel list.",
    items: [
      { label: "Message thread", code: "MessageThread", node: <MessageThread /> },
      { label: "Chat composer", code: "ChatComposer", node: <ChatComposer /> },
      { label: "Channel list", code: "ChannelList", node: <ChannelList /> },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    icon: GraduationCap,
    blurb: "Program card, curriculum accordion, and the lesson video player.",
    items: [
      { label: "Program card", code: "ProgramCard", node: <ProgramCard /> },
      { label: "Curriculum accordion", code: "CurriculumAccordion", node: <CurriculumAccordion /> },
      { label: "Video player", code: "VideoPlayer", node: <VideoPlayer /> },
    ],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    icon: Compass,
    blurb: "Selectable cards, a step header with progress, and a progress rail.",
    items: [
      { label: "Selection cards", code: "SelectionCards", node: <SelectionCards />, scale: 0.85 },
      { label: "Step header", code: "StepHeader", node: <StepHeader /> },
      { label: "Progress rail", code: "ProgressRail", node: <ProgressRail /> },
    ],
  },
  {
    id: "missions",
    label: "Missions",
    icon: Trophy,
    blurb: "Mission card, weekly streak, and an XP / level reward bar.",
    items: [
      { label: "Mission card", code: "MissionCard", node: <MissionCard />, scale: 0.85 },
      { label: "Streak card", code: "StreakCard", node: <StreakCard /> },
      { label: "Reward bar", code: "RewardBar", node: <RewardBar /> },
    ],
  },
  {
    id: "monetization",
    label: "Monetization",
    icon: Wallet,
    blurb: "Readiness score, brand-deal pipeline, and a revenue stat.",
    items: [
      { label: "Readiness score", code: "ReadinessScore", node: <ReadinessScore />, scale: 0.78 },
      { label: "Deal pipeline", code: "DealCard", node: <DealCard /> },
      { label: "Revenue stat", code: "RevenueStat", node: <RevenueStat /> },
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: Activity,
    blurb: "Vertical activity feed and a support communication thread.",
    items: [
      { label: "Activity timeline", code: "ActivityTimeline", node: <ActivityTimeline /> },
      { label: "Communication thread", code: "CommunicationThread", node: <CommunicationThread /> },
    ],
  },
  {
    id: "notes",
    label: "Notes",
    icon: NotebookPen,
    blurb: "Saved rich-note card and the rich-text editor toolbar.",
    items: [
      { label: "Note card", code: "NoteCard", node: <NoteCard /> },
      { label: "Editor toolbar", code: "NoteEditorToolbar", node: <NoteEditorToolbar /> },
    ],
  },
];

const TOTAL = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

function plural(n: number) {
  return `${n} component${n === 1 ? "" : "s"}`;
}

// ─────────────────────────────────────────────────────────────────────────────

type Selected = { label: string; code: string; node: ReactNode } | null;

export function DesignGallery() {
  const [activeId, setActiveId] = useState<string>(CATEGORIES[0].id);
  const [selected, setSelected] = useState<Selected>(null);

  // Scroll-spy: highlight the category nearest the top of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -75% 0px", threshold: 0 },
    );
    for (const c of CATEGORIES) {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Close the detail modal on Escape.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-ink-100 bg-cream-50/85 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] h-full px-5 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-7 rounded-[8px] bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="size-4" strokeWidth={2} />
            </span>
            <span className="text-[14px] font-semibold text-ink-900 truncate">
              Design system
            </span>
            <span className="hidden sm:inline-flex items-center h-[20px] px-2 rounded-full bg-cream-200 text-ink-500 text-[10.5px] font-semibold uppercase tracking-wide">
              Internal
            </span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-medium text-ink-600 hover:text-ink-900 hover:bg-cream-200 transition-colors"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} />
            Back to app
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[232px_1fr] gap-8 lg:gap-12 pb-24">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-[72px] py-10 space-y-7">
            <div>
              <p className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Start here
              </p>
              <div className="flex flex-col gap-0.5">
                <a
                  href="#top"
                  className="flex items-center gap-2.5 h-9 px-2.5 rounded-[9px] text-[13px] text-ink-600 hover:bg-cream-200 hover:text-ink-900 transition-colors"
                >
                  <LayoutGrid className="size-4 shrink-0 text-ink-400" strokeWidth={1.9} />
                  Overview
                </a>
                <a
                  href="#buttons"
                  className="flex items-center gap-2.5 h-9 px-2.5 rounded-[9px] text-[13px] text-ink-600 hover:bg-cream-200 hover:text-ink-900 transition-colors"
                >
                  <Sparkles className="size-4 shrink-0 text-ink-400" strokeWidth={1.9} />
                  All components
                  <span className="ml-auto text-[11px] text-ink-300 tabular-nums">
                    {TOTAL}
                  </span>
                </a>
              </div>
            </div>

            <div>
              <p className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Components
              </p>
              <div className="flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => {
                  const active = activeId === cat.id;
                  const Icon = cat.icon;
                  return (
                    <a
                      key={cat.id}
                      href={`#${cat.id}`}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 h-9 px-2.5 rounded-[9px] text-[13px] transition-colors",
                        active
                          ? "bg-rose-50 text-rose-700 font-semibold"
                          : "text-ink-600 hover:bg-cream-200 hover:text-ink-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-rose-600" : "text-ink-400",
                        )}
                        strokeWidth={1.9}
                      />
                      {cat.label}
                      <span
                        className={cn(
                          "ml-auto text-[11px] tabular-nums",
                          active ? "text-rose-400" : "text-ink-300",
                        )}
                      >
                        {cat.items.length}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 py-10">
          <header id="top" className="scroll-mt-20 mb-10">
            <p className="text-rose-600 font-semibold text-[12.5px] mb-2">
              Internal · Admin only
            </p>
            <h1 className="text-page-title text-ink-900">Explore the components</h1>
            <p className="text-ink-500 text-[14px] mt-2 max-w-[60ch] leading-relaxed">
              Every reusable surface in the product, rendered live. Click any
              card to inspect it full-size. Edit variants under{" "}
              <code className="text-[12px] bg-cream-200 text-ink-700 px-1.5 py-0.5 rounded-md">
                src/design-templates/
              </code>
              .
            </p>
          </header>

          <div className="space-y-12">
            {CATEGORIES.map((cat) => (
              <section key={cat.id} id={cat.id} className="scroll-mt-20">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-h4 text-ink-900">{cat.label}</h2>
                    <p className="text-[12.5px] text-ink-500 mt-0.5 truncate">
                      {cat.blurb}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-400 tabular-nums">
                    {plural(cat.items.length)}
                  </span>
                </div>

                {/* One component per full-width row (stacked, not a grid). */}
                <div className="space-y-5">
                  {cat.items.map((item) => {
                    const scale = item.scale ?? cat.scale ?? 1;
                    const open = () =>
                      setSelected({
                        label: item.label,
                        code: item.code,
                        node: item.node,
                      });
                    return (
                      <div key={item.code}>
                        {/* Pill label + export name */}
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <span className="inline-flex items-center h-8 px-3.5 rounded-full bg-white border border-ink-200 text-[13px] font-semibold text-ink-800 shadow-sm">
                            {item.label}
                          </span>
                          <span className="hidden sm:block text-[11.5px] font-mono text-ink-300 truncate">
                            {item.code}
                          </span>
                        </div>

                        {/* Dashed preview panel. The panel is the click target;
                            the preview is pointer-events-none (it contains its
                            own <button>s) so clicks fall through to open. */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`Inspect ${item.label}`}
                          onClick={open}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              open();
                            }
                          }}
                          className="cursor-pointer overflow-hidden rounded-[18px] border border-dashed border-ink-200 bg-cream-50/60 px-6 sm:px-12 py-10 min-h-[156px] flex items-center transition-colors hover:border-rose-300 hover:bg-cream-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
                        >
                          <div
                            className="pointer-events-none origin-left"
                            style={{ transform: `scale(${scale})` }}
                          >
                            {item.node}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-16 border-t border-ink-100 pt-6 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink-400">
            <span>
              {CATEGORIES.length} categories · {TOTAL} components
            </span>
            <span className="font-mono">src/design-templates/README.md</span>
          </footer>
        </main>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.label} preview`}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-sm cursor-default"
          />
          <div className="relative card w-full max-w-3xl max-h-[86vh] overflow-auto p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-h4 text-ink-900">{selected.label}</h3>
                <p className="text-[12px] text-ink-400 font-mono mt-0.5">
                  {selected.code}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelected(null)}
                className="shrink-0 inline-flex items-center justify-center size-9 rounded-full bg-cream-100 hover:bg-cream-200 text-ink-500 transition-colors"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
            <div className="mt-6 rounded-[14px] border border-ink-100 bg-cream-50 p-8 flex items-center justify-center min-h-[220px]">
              {selected.node}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
