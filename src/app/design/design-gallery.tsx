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
  Award,
  Banknote,
  Bell,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  ChartPie,
  CircleGauge,
  CircleUser,
  Clapperboard,
  ClipboardList,
  Clock,
  Coffee,
  Columns3,
  Compass,
  DollarSign,
  Eye,
  Flag,
  Flame,
  Funnel,
  GalleryHorizontal,
  Gauge,
  Gift,
  GraduationCap,
  Grid3x3,
  Hash,
  IdCard,
  Images,
  Inbox,
  Info,
  Keyboard,
  KeyRound,
  Layers,
  LayoutGrid,
  LayoutPanelTop,
  LayoutTemplate,
  Lightbulb,
  Link2,
  ListChecks,
  LoaderCircle,
  Megaphone,
  Menu,
  MessageCircleMore,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareWarning,
  MessagesSquare,
  MousePointerClick,
  NotebookPen,
  OctagonAlert,
  PanelLeft,
  PanelRight,
  PanelRightOpen,
  PanelTop,
  Paperclip,
  Quote,
  Receipt,
  Rocket,
  Route,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  SquareKanban,
  SquareMenu,
  SquarePen,
  Star,
  Table2,
  Tag,
  Target,
  TextCursorInput,
  Ticket,
  ToggleLeft,
  TrendingUp,
  Trophy,
  Users,
  UsersRound,
  Vote,
  Wallet,
  Workflow,
  Wrench,
  X,
  type LucideIcon,
  ChevronRight,
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
import { PAGE_DESIGN_CATEGORIES } from "@/design-templates/page-designs";
import { PAGE_EXPLORATION_CATEGORIES } from "@/design-templates/page-explorations";
import { EXTRA_CATEGORIES } from "@/design-templates/extra-categories";
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
  ActivePlanCard,
} from "@/design-templates/posting";
import {
  TodaysPlanTimeline,
  AudienceGrowthCard,
  ContentActivityCard,
  TodaysProgressCard,
  GettingStartedCard,
} from "@/design-templates/dashboard";
import {
  FeaturedLessonHero,
  TutorialCard,
  CreatorDrillRow,
} from "@/design-templates/tutorials";
import {
  ConnectSocialCard,
  PerformanceKpiTiles,
  PlatformMixDonut,
} from "@/design-templates/performance";
import {
  FeaturedHero,
  WhatYoullLearn,
  TemplatesDownloads,
} from "@/design-templates/program-surfaces";
import { AnalyticsPanel, TrendChartEmpty } from "@/design-templates/analytics";
import { AdminStatTiles, ActiveBuildCard, UsersBreakdown } from "@/design-templates/admin";
import { ProfileCompletionCard, AudienceSnapshotCard } from "@/design-templates/profile";
import { CurrentPlanCard, UpgradeProCard, PaymentMethodRow } from "@/design-templates/billing";
import { NotificationCenterPanel } from "@/design-templates/notification-center";
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
import { ContentCalendar, MiniCalendar } from "@/design-templates/calendar";
import { MediaKitCard, ProfileHeader } from "@/design-templates/media-kit";
import { UpcomingWidget, SuggestionWidget, LeaderboardWidget } from "@/design-templates/widgets";
import { SpaceCard, DiscussionRow, ReactionBar } from "@/design-templates/community";
import { SearchResults, EmptyResults } from "@/design-templates/search";
import { ConnectedAccounts, SettingsToggleRows, DangerZone } from "@/design-templates/settings";
import { NotFoundState, InlineError, MaintenanceState } from "@/design-templates/errors";
import { Spinner, BrandLoader, LoadingButton, SkeletonCard } from "@/design-templates/loading";
import { VideoListItem, VideoUploadCard } from "@/design-templates/video";
import { InvoiceCard, PlanBillingRow } from "@/design-templates/invoices";
import { BottomNav, MobileDrawer } from "@/design-templates/mobile";
import { ProfileMenu, NotificationsDropdown } from "@/design-templates/menus";
import { Callout, Blockquote, CodeBlock } from "@/design-templates/content";
import { StarRating, ReviewCard, RatingSummary } from "@/design-templates/ratings";
import { FeatureMatrix, BillingToggle } from "@/design-templates/comparison";
import { DateRangePicker, TimePicker, Combobox } from "@/design-templates/pickers";
import { KanbanBoard, TaskCard } from "@/design-templates/board";
import { RangeSlider, DualRangeSlider, SteppedSlider } from "@/design-templates/sliders";
import { MediaGrid, Lightbox } from "@/design-templates/gallery";
import { WelcomeHero, SnapshotCard } from "@/design-templates/hero";
import { SetupChecklist, ChecklistProgress } from "@/design-templates/checklist";
import { ContributionHeatmap, WeeklyActivity } from "@/design-templates/heatmap";
import { WizardPanel, WizardComplete } from "@/design-templates/wizard";
import { AnnouncementBar, PinnedBanner, InfoBanner } from "@/design-templates/banners";
import { ReplyComposer, CommentBox } from "@/design-templates/composer";
import { CardCarousel, Dots } from "@/design-templates/carousel";
import { DetailDrawer, FilterDrawer } from "@/design-templates/drawer";
import { TrendStatCard, TrendStatRow } from "@/design-templates/trends";
import { InlineEdit, NumberStepper, TagInput } from "@/design-templates/fields";
import { SelectionToolbar, TableToolbar } from "@/design-templates/toolbar";
import { ShortcutsSheet } from "@/design-templates/shortcuts";
import { CommentThread } from "@/design-templates/threads";
import { AttachmentList, AttachmentChips } from "@/design-templates/attachments";
import { DayAgenda, EventCard } from "@/design-templates/agenda";
import { ReferralCard, ReferralTiers } from "@/design-templates/referral";
import { OtpInput, VerifyEmail } from "@/design-templates/verification";
import { AudienceFunnel, RetentionCohort } from "@/design-templates/funnels";
import { ScoreGauge, GoalMeter } from "@/design-templates/gauges";
import { RegionBreakdown, DeviceBreakdown } from "@/design-templates/breakdowns";
import { GoalCard, GoalRing } from "@/design-templates/goals";
import { LinkInBioCard, SocialLinksRow } from "@/design-templates/link-in-bio";
import { AgeGenderBars, TopFans } from "@/design-templates/audience";
import { PitchTemplateCard, OutreachTracker } from "@/design-templates/outreach";
import { BestTimeHeatmap, FormatPerformance } from "@/design-templates/posting-insights";
import { HashtagResearch, HashtagSet } from "@/design-templates/hashtags";
import { CaptionGenerator, HookSuggestions } from "@/design-templates/ai-assist";
import { IgPostPreview, PostGridPreview } from "@/design-templates/post-preview";
import { AchievementUnlocked, BadgeShelf } from "@/design-templates/achievement";
import { EarningsOverview, PayoutSchedule } from "@/design-templates/earnings";
import { IdeaCaptureCard, IdeasList } from "@/design-templates/ideas";
import { TrendingSounds, TrendingTopics } from "@/design-templates/trending";
import { ProductCard, CheckoutSummary } from "@/design-templates/products";
import { PromoCodeCard, DiscountBanner } from "@/design-templates/promo";
import { TipJarCard, SupporterList } from "@/design-templates/support-creator";
import { CommentsInbox, PollResult } from "@/design-templates/engagement";
import { CountdownCard, WaitlistForm } from "@/design-templates/launch";
import {
  DeleteConfirm,
  LeaveConfirm,
  WarningConfirm,
  AlertAcknowledge,
  SuccessDialog,
  PromptDialog,
} from "@/design-templates/dialogs";

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
  ...PAGE_DESIGN_CATEGORIES,
  ...PAGE_EXPLORATION_CATEGORIES,
  ...EXTRA_CATEGORIES,
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
      { label: "Active plan card", code: "ActivePlanCard", node: <ActivePlanCard />, scale: 0.85 },
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Gauge,
    blurb: "Learner-home composites — Today's Plan timeline, KPI cards, getting-started links.",
    items: [
      { label: "Today's Plan timeline", code: "TodaysPlanTimeline", node: <TodaysPlanTimeline /> },
      { label: "Audience Growth card", code: "AudienceGrowthCard", node: <AudienceGrowthCard /> },
      { label: "Content Activity card", code: "ContentActivityCard", node: <ContentActivityCard /> },
      { label: "Today's Progress card", code: "TodaysProgressCard", node: <TodaysProgressCard /> },
      { label: "Getting Started card", code: "GettingStartedCard", node: <GettingStartedCard /> },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: Activity,
    blurb: "Analytics surfaces — connect-social rows, KPI tiles with empty state, platform-mix donut.",
    items: [
      { label: "Connect social card", code: "ConnectSocialCard", node: <ConnectSocialCard />, scale: 0.9 },
      { label: "KPI tiles · empty state", code: "PerformanceKpiTiles", node: <PerformanceKpiTiles /> },
      { label: "Platform mix donut", code: "PlatformMixDonut", node: <PlatformMixDonut /> },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartColumn,
    blurb: "The weekly overview panel — range tabs, delta stat rows, line chart with tooltip.",
    scale: 0.85,
    items: [
      { label: "Analytics panel", code: "AnalyticsPanel", node: <AnalyticsPanel /> },
      { label: "Trend chart · empty", code: "TrendChartEmpty", node: <TrendChartEmpty /> },
    ],
  },
  {
    id: "program-surfaces",
    label: "Program surfaces",
    icon: GraduationCap,
    blurb: "Program-detail surfaces — featured hero, what-you'll-learn outcomes, templates & downloads.",
    scale: 0.85,
    items: [
      { label: "Featured hero", code: "FeaturedHero", node: <FeaturedHero /> },
      { label: "What you'll learn", code: "WhatYoullLearn", node: <WhatYoullLearn /> },
      { label: "Templates & downloads", code: "TemplatesDownloads", node: <TemplatesDownloads /> },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: Wrench,
    blurb: "Admin-console surfaces — metric stat tiles, active-build project card, breakdown bars.",
    items: [
      { label: "Stat tiles", code: "AdminStatTiles", node: <AdminStatTiles /> },
      { label: "Active build card", code: "ActiveBuildCard", node: <ActiveBuildCard /> },
      { label: "Users breakdown", code: "UsersBreakdown", node: <UsersBreakdown /> },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: IdCard,
    blurb: "Profile & settings rail — completion ring with checklist, audience snapshot.",
    items: [
      { label: "Profile completion", code: "ProfileCompletionCard", node: <ProfileCompletionCard /> },
      { label: "Audience snapshot", code: "AudienceSnapshotCard", node: <AudienceSnapshotCard /> },
    ],
  },
  {
    id: "tutorials",
    label: "Tutorials",
    icon: Clapperboard,
    blurb: "Tutorials library — featured-lesson hero, tutorial grid card, creator-drill row.",
    scale: 0.9,
    items: [
      { label: "Featured lesson hero", code: "FeaturedLessonHero", node: <FeaturedLessonHero /> },
      { label: "Tutorial card", code: "TutorialCard", node: <TutorialCard /> },
      { label: "Creator drill row", code: "CreatorDrillRow", node: <CreatorDrillRow /> },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: Wallet,
    blurb: "Subscription surfaces — current-plan summary, Upgrade-to-Pro accent, payment method.",
    items: [
      { label: "Current plan card", code: "CurrentPlanCard", node: <CurrentPlanCard /> },
      { label: "Upgrade Pro card", code: "UpgradeProCard", node: <UpgradeProCard /> },
      { label: "Payment method row", code: "PaymentMethodRow", node: <PaymentMethodRow /> },
    ],
  },
  {
    id: "notification-center",
    label: "Notification center",
    icon: Bell,
    blurb: "The full notifications inbox — filter tabs, mark-all-read, category-bordered rows.",
    scale: 0.95,
    items: [
      { label: "Notification center", code: "NotificationCenterPanel", node: <NotificationCenterPanel /> },
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
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    blurb: "Multi-day content calendar strip and a month date picker.",
    items: [
      { label: "Content calendar", code: "ContentCalendar", node: <ContentCalendar />, scale: 0.82 },
      { label: "Mini calendar", code: "MiniCalendar", node: <MiniCalendar /> },
    ],
  },
  {
    id: "media-kit",
    label: "Media kit",
    icon: IdCard,
    blurb: "Creator one-pager and the profile header.",
    items: [
      { label: "Media kit card", code: "MediaKitCard", node: <MediaKitCard /> },
      { label: "Profile header", code: "ProfileHeader", node: <ProfileHeader /> },
    ],
  },
  {
    id: "widgets",
    label: "Widgets",
    icon: PanelRight,
    blurb: "Right-rail widgets — upcoming list, suggestion card, leaderboard.",
    items: [
      { label: "Upcoming", code: "UpcomingWidget", node: <UpcomingWidget /> },
      { label: "Suggestion", code: "SuggestionWidget", node: <SuggestionWidget /> },
      { label: "Leaderboard", code: "LeaderboardWidget", node: <LeaderboardWidget /> },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: UsersRound,
    blurb: "Space card, discussion row, and a reaction bar.",
    items: [
      { label: "Space card", code: "SpaceCard", node: <SpaceCard /> },
      { label: "Discussion row", code: "DiscussionRow", node: <DiscussionRow /> },
      { label: "Reaction bar", code: "ReactionBar", node: <ReactionBar /> },
    ],
  },
  {
    id: "search",
    label: "Search",
    icon: Search,
    blurb: "Grouped search results with highlighting, and an empty state.",
    items: [
      { label: "Search results", code: "SearchResults", node: <SearchResults /> },
      { label: "Empty results", code: "EmptyResults", node: <EmptyResults /> },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    blurb: "Connected accounts, toggle rows, and a danger zone.",
    items: [
      { label: "Connected accounts", code: "ConnectedAccounts", node: <ConnectedAccounts /> },
      { label: "Toggle rows", code: "SettingsToggleRows", node: <SettingsToggleRows /> },
      { label: "Danger zone", code: "DangerZone", node: <DangerZone /> },
    ],
  },
  {
    id: "errors",
    label: "Errors",
    icon: OctagonAlert,
    blurb: "404, inline error with retry, and a maintenance screen.",
    items: [
      { label: "Not found (404)", code: "NotFoundState", node: <NotFoundState /> },
      { label: "Inline error", code: "InlineError", node: <InlineError /> },
      { label: "Maintenance", code: "MaintenanceState", node: <MaintenanceState /> },
    ],
  },
  {
    id: "loading",
    label: "Loading",
    icon: LoaderCircle,
    blurb: "Spinner, brand loader, busy buttons, and a content skeleton.",
    items: [
      { label: "Spinner", code: "Spinner", node: <Spinner /> },
      { label: "Brand loader", code: "BrandLoader", node: <BrandLoader /> },
      { label: "Busy buttons", code: "LoadingButton", node: <LoadingButton /> },
      { label: "Skeleton card", code: "SkeletonCard", node: <SkeletonCard /> },
    ],
  },
  {
    id: "video",
    label: "Video",
    icon: Clapperboard,
    blurb: "Lesson playlist row and a video upload / processing card.",
    items: [
      { label: "Playlist row", code: "VideoListItem", node: <VideoListItem /> },
      { label: "Upload card", code: "VideoUploadCard", node: <VideoUploadCard /> },
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: Receipt,
    blurb: "Invoice / receipt with line items, and a plan billing row.",
    items: [
      { label: "Invoice", code: "InvoiceCard", node: <InvoiceCard /> },
      { label: "Plan billing row", code: "PlanBillingRow", node: <PlanBillingRow /> },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    blurb: "Mobile chrome — bottom tab bar and a slide-in nav drawer.",
    items: [
      { label: "Bottom nav", code: "BottomNav", node: <BottomNav /> },
      { label: "Nav drawer", code: "MobileDrawer", node: <MobileDrawer /> },
    ],
  },
  {
    id: "menus",
    label: "Menus",
    icon: SquareMenu,
    blurb: "Header dropdowns — profile / account menu and notifications.",
    items: [
      { label: "Profile menu", code: "ProfileMenu", node: <ProfileMenu /> },
      { label: "Notifications", code: "NotificationsDropdown", node: <NotificationsDropdown /> },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: Quote,
    blurb: "Rich-content blocks — callouts, a testimonial blockquote, a code block.",
    items: [
      { label: "Callouts", code: "Callout", node: <Callout /> },
      { label: "Blockquote", code: "Blockquote", node: <Blockquote /> },
      { label: "Code block", code: "CodeBlock", node: <CodeBlock /> },
    ],
  },
  {
    id: "ratings",
    label: "Ratings",
    icon: Star,
    blurb: "Star scale, review card, and an aggregate rating summary.",
    items: [
      { label: "Star rating", code: "StarRating", node: <StarRating /> },
      { label: "Review card", code: "ReviewCard", node: <ReviewCard /> },
      { label: "Rating summary", code: "RatingSummary", node: <RatingSummary /> },
    ],
  },
  {
    id: "comparison",
    label: "Comparison",
    icon: Columns3,
    blurb: "Plan feature matrix and a monthly / yearly billing toggle.",
    items: [
      { label: "Feature matrix", code: "FeatureMatrix", node: <FeatureMatrix /> },
      { label: "Billing toggle", code: "BillingToggle", node: <BillingToggle /> },
    ],
  },
  {
    id: "pickers",
    label: "Pickers",
    icon: CalendarRange,
    blurb: "Date-range picker, time picker, and a searchable combobox.",
    items: [
      { label: "Date range", code: "DateRangePicker", node: <DateRangePicker /> },
      { label: "Time picker", code: "TimePicker", node: <TimePicker /> },
      { label: "Combobox", code: "Combobox", node: <Combobox /> },
    ],
  },
  {
    id: "dialogs",
    label: "Dialogs",
    icon: MessageSquareWarning,
    blurb: "Confirm, alert & prompt dialogs that replace the browser's native window.confirm / alert / prompt.",
    scale: 0.85,
    items: [
      { label: "Delete confirm", code: "DeleteConfirm", node: <DeleteConfirm /> },
      { label: "Leave confirm", code: "LeaveConfirm", node: <LeaveConfirm /> },
      { label: "Warning confirm", code: "WarningConfirm", node: <WarningConfirm /> },
      { label: "Alert", code: "AlertAcknowledge", node: <AlertAcknowledge /> },
      { label: "Success", code: "SuccessDialog", node: <SuccessDialog /> },
      { label: "Prompt", code: "PromptDialog", node: <PromptDialog /> },
    ],
  },
  {
    id: "board",
    label: "Board",
    icon: SquareKanban,
    blurb: "Kanban board with status columns and a rich task card.",
    items: [
      { label: "Kanban board", code: "KanbanBoard", node: <KanbanBoard />, scale: 0.85 },
      { label: "Task card", code: "TaskCard", node: <TaskCard /> },
    ],
  },
  {
    id: "sliders",
    label: "Sliders",
    icon: SlidersHorizontal,
    blurb: "Range inputs — single value, dual min/max, and stepped.",
    items: [
      { label: "Range slider", code: "RangeSlider", node: <RangeSlider /> },
      { label: "Dual range", code: "DualRangeSlider", node: <DualRangeSlider /> },
      { label: "Stepped slider", code: "SteppedSlider", node: <SteppedSlider /> },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Images,
    blurb: "Media thumbnail grid and a lightbox with a thumbnail strip.",
    items: [
      { label: "Media grid", code: "MediaGrid", node: <MediaGrid /> },
      { label: "Lightbox", code: "Lightbox", node: <Lightbox /> },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    icon: Megaphone,
    blurb: "Dashboard welcome hero (gradient + CTAs) and a snapshot card.",
    scale: 0.85,
    items: [
      { label: "Welcome hero", code: "WelcomeHero", node: <WelcomeHero /> },
      { label: "Snapshot card", code: "SnapshotCard", node: <SnapshotCard /> },
    ],
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: ListChecks,
    blurb: "Guided setup steps and a progress checklist with a bar.",
    items: [
      { label: "Setup checklist", code: "SetupChecklist", node: <SetupChecklist /> },
      { label: "Progress checklist", code: "ChecklistProgress", node: <ChecklistProgress /> },
    ],
  },
  {
    id: "heatmap",
    label: "Heatmap",
    icon: Grid3x3,
    blurb: "Contribution-style activity heatmap and a weekly activity bar.",
    items: [
      { label: "Contribution heatmap", code: "ContributionHeatmap", node: <ContributionHeatmap /> },
      { label: "Weekly activity", code: "WeeklyActivity", node: <WeeklyActivity /> },
    ],
  },
  {
    id: "wizard",
    label: "Wizard",
    icon: Workflow,
    blurb: "Full multi-step form panel and a completion step.",
    scale: 0.85,
    items: [
      { label: "Wizard panel", code: "WizardPanel", node: <WizardPanel /> },
      { label: "Complete step", code: "WizardComplete", node: <WizardComplete /> },
    ],
  },
  {
    id: "banners",
    label: "Banners",
    icon: Flag,
    blurb: "Announcement bar, pinned-message strip, and a subtle info banner.",
    items: [
      { label: "Announcement bar", code: "AnnouncementBar", node: <AnnouncementBar /> },
      { label: "Pinned banner", code: "PinnedBanner", node: <PinnedBanner /> },
      { label: "Info banner", code: "InfoBanner", node: <InfoBanner /> },
    ],
  },
  {
    id: "composer",
    label: "Composer",
    icon: MessageSquarePlus,
    blurb: "Support reply box (reply/note toggle) and a simple comment box.",
    items: [
      { label: "Reply composer", code: "ReplyComposer", node: <ReplyComposer /> },
      { label: "Comment box", code: "CommentBox", node: <CommentBox /> },
    ],
  },
  {
    id: "carousel",
    label: "Carousel",
    icon: GalleryHorizontal,
    blurb: "Horizontal card carousel with arrows + dots, and a dot stepper.",
    items: [
      { label: "Card carousel", code: "CardCarousel", node: <CardCarousel /> },
      { label: "Dots", code: "Dots", node: <Dots /> },
    ],
  },
  {
    id: "drawer",
    label: "Drawer",
    icon: PanelRightOpen,
    blurb: "Right-side detail drawer and a filter drawer.",
    scale: 0.85,
    items: [
      { label: "Detail drawer", code: "DetailDrawer", node: <DetailDrawer /> },
      { label: "Filter drawer", code: "FilterDrawer", node: <FilterDrawer /> },
    ],
  },
  {
    id: "trends",
    label: "Trend stats",
    icon: TrendingUp,
    blurb: "KPI tiles with an embedded sparkline + delta.",
    items: [
      { label: "Trend stat card", code: "TrendStatCard", node: <TrendStatCard /> },
      { label: "Trend stat row", code: "TrendStatRow", node: <TrendStatRow />, scale: 0.78 },
    ],
  },
  {
    id: "fields",
    label: "Fields",
    icon: SquarePen,
    blurb: "Inline-edit, number stepper, and a tag input.",
    items: [
      { label: "Inline edit", code: "InlineEdit", node: <InlineEdit /> },
      { label: "Number stepper", code: "NumberStepper", node: <NumberStepper /> },
      { label: "Tag input", code: "TagInput", node: <TagInput /> },
    ],
  },
  {
    id: "toolbar",
    label: "Toolbar",
    icon: Wrench,
    blurb: "Bulk-selection action bar and a table toolbar.",
    items: [
      { label: "Selection toolbar", code: "SelectionToolbar", node: <SelectionToolbar /> },
      { label: "Table toolbar", code: "TableToolbar", node: <TableToolbar /> },
    ],
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    icon: Keyboard,
    blurb: "Keyboard-shortcuts cheat sheet with grouped key bindings.",
    items: [
      { label: "Shortcuts sheet", code: "ShortcutsSheet", node: <ShortcutsSheet /> },
    ],
  },
  {
    id: "threads",
    label: "Threads",
    icon: MessageCircleMore,
    blurb: "Nested comment thread with replies, likes, and reply actions.",
    items: [
      { label: "Comment thread", code: "CommentThread", node: <CommentThread /> },
    ],
  },
  {
    id: "attachments",
    label: "Attachments",
    icon: Paperclip,
    blurb: "Uploaded-file list (with progress) and inline attachment chips.",
    items: [
      { label: "Attachment list", code: "AttachmentList", node: <AttachmentList /> },
      { label: "Attachment chips", code: "AttachmentChips", node: <AttachmentChips /> },
    ],
  },
  {
    id: "agenda",
    label: "Agenda",
    icon: CalendarClock,
    blurb: "Day agenda with positioned events, and a single event card.",
    items: [
      { label: "Day agenda", code: "DayAgenda", node: <DayAgenda /> },
      { label: "Event card", code: "EventCard", node: <EventCard /> },
    ],
  },
  {
    id: "referral",
    label: "Referral",
    icon: Gift,
    blurb: "Invite & earn card with a code, and a reward-tier track.",
    items: [
      { label: "Referral card", code: "ReferralCard", node: <ReferralCard /> },
      { label: "Reward tiers", code: "ReferralTiers", node: <ReferralTiers /> },
    ],
  },
  {
    id: "verification",
    label: "Verification",
    icon: ShieldCheck,
    blurb: "One-time-code (OTP) input and a verify-email card.",
    items: [
      { label: "OTP input", code: "OtpInput", node: <OtpInput /> },
      { label: "Verify email", code: "VerifyEmail", node: <VerifyEmail /> },
    ],
  },
  {
    id: "funnels",
    label: "Funnel",
    icon: Funnel,
    blurb: "Creator audience funnel (reach → customers) and audience retention.",
    items: [
      { label: "Audience funnel", code: "AudienceFunnel", node: <AudienceFunnel /> },
      { label: "Retention cohort", code: "RetentionCohort", node: <RetentionCohort /> },
    ],
  },
  {
    id: "gauges",
    label: "Scores",
    icon: CircleGauge,
    blurb: "Readiness score dial and a goal-progress meter.",
    items: [
      { label: "Score gauge", code: "ScoreGauge", node: <ScoreGauge /> },
      { label: "Goal meter", code: "GoalMeter", node: <GoalMeter /> },
    ],
  },
  {
    id: "breakdowns",
    label: "Breakdowns",
    icon: ChartPie,
    blurb: "Audience distribution — by region and by device.",
    items: [
      { label: "Region breakdown", code: "RegionBreakdown", node: <RegionBreakdown /> },
      { label: "Device breakdown", code: "DeviceBreakdown", node: <DeviceBreakdown /> },
    ],
  },
  {
    id: "goals",
    label: "Goals",
    icon: Target,
    blurb: "Creator growth goals — a goal card and a circular goal ring.",
    items: [
      { label: "Goal card", code: "GoalCard", node: <GoalCard /> },
      { label: "Goal ring", code: "GoalRing", node: <GoalRing /> },
    ],
  },
  {
    id: "link-in-bio",
    label: "Link in bio",
    icon: Link2,
    blurb: "A creator's public link-in-bio page and a social-stats row.",
    items: [
      { label: "Link-in-bio card", code: "LinkInBioCard", node: <LinkInBioCard /> },
      { label: "Social links row", code: "SocialLinksRow", node: <SocialLinksRow /> },
    ],
  },
  {
    id: "audience",
    label: "Audience",
    icon: Users,
    blurb: "Audience demographics (age + gender) and a top-fans list.",
    items: [
      { label: "Age & gender", code: "AgeGenderBars", node: <AgeGenderBars /> },
      { label: "Top fans", code: "TopFans", node: <TopFans /> },
    ],
  },
  {
    id: "outreach",
    label: "Outreach",
    icon: Send,
    blurb: "Brand-pitch templates and an outreach tracker (sent → replied).",
    items: [
      { label: "Pitch templates", code: "PitchTemplateCard", node: <PitchTemplateCard /> },
      { label: "Outreach tracker", code: "OutreachTracker", node: <OutreachTracker /> },
    ],
  },
  {
    id: "posting-insights",
    label: "Posting insights",
    icon: Clock,
    blurb: "Best-time-to-post heatmap and format-performance breakdown.",
    items: [
      { label: "Best time", code: "BestTimeHeatmap", node: <BestTimeHeatmap /> },
      { label: "Format performance", code: "FormatPerformance", node: <FormatPerformance /> },
    ],
  },
  {
    id: "hashtags",
    label: "Hashtags",
    icon: Hash,
    blurb: "Hashtag research (volume + difficulty) and a saved hashtag set.",
    items: [
      { label: "Hashtag research", code: "HashtagResearch", node: <HashtagResearch /> },
      { label: "Saved set", code: "HashtagSet", node: <HashtagSet /> },
    ],
  },
  {
    id: "ai-assist",
    label: "AI assist",
    icon: Sparkles,
    blurb: "AI caption generator and AI hook suggestions.",
    items: [
      { label: "Caption generator", code: "CaptionGenerator", node: <CaptionGenerator /> },
      { label: "Hook suggestions", code: "HookSuggestions", node: <HookSuggestions /> },
    ],
  },
  {
    id: "post-preview",
    label: "Post preview",
    icon: Eye,
    blurb: "Instagram-style post mock and a 3×3 profile-grid preview.",
    items: [
      { label: "Post preview", code: "IgPostPreview", node: <IgPostPreview /> },
      { label: "Grid preview", code: "PostGridPreview", node: <PostGridPreview /> },
    ],
  },
  {
    id: "achievement",
    label: "Achievement",
    icon: Award,
    blurb: "Achievement-unlocked celebration and a badge shelf.",
    items: [
      { label: "Unlocked", code: "AchievementUnlocked", node: <AchievementUnlocked /> },
      { label: "Badge shelf", code: "BadgeShelf", node: <BadgeShelf /> },
    ],
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: Banknote,
    blurb: "Income by source and a payout schedule.",
    items: [
      { label: "Earnings overview", code: "EarningsOverview", node: <EarningsOverview /> },
      { label: "Payout schedule", code: "PayoutSchedule", node: <PayoutSchedule /> },
    ],
  },
  {
    id: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    blurb: "Quick idea capture and a saved-ideas list with status.",
    items: [
      { label: "Idea capture", code: "IdeaCaptureCard", node: <IdeaCaptureCard /> },
      { label: "Ideas list", code: "IdeasList", node: <IdeasList /> },
    ],
  },
  {
    id: "trending",
    label: "Trending",
    icon: Flame,
    blurb: "Trending sounds (with waveform) and trending topics.",
    items: [
      { label: "Trending sounds", code: "TrendingSounds", node: <TrendingSounds /> },
      { label: "Trending topics", code: "TrendingTopics", node: <TrendingTopics /> },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: ShoppingBag,
    blurb: "A digital-product / course card and a checkout order summary.",
    items: [
      { label: "Product card", code: "ProductCard", node: <ProductCard /> },
      { label: "Checkout summary", code: "CheckoutSummary", node: <CheckoutSummary /> },
    ],
  },
  {
    id: "promo",
    label: "Promo",
    icon: Ticket,
    blurb: "A promo-code card and a discount announcement banner.",
    items: [
      { label: "Promo code", code: "PromoCodeCard", node: <PromoCodeCard /> },
      { label: "Discount banner", code: "DiscountBanner", node: <DiscountBanner /> },
    ],
  },
  {
    id: "tip-jar",
    label: "Tip jar",
    icon: Coffee,
    blurb: "A fan tip-jar card and a recent-supporters list.",
    items: [
      { label: "Tip jar", code: "TipJarCard", node: <TipJarCard /> },
      { label: "Supporters", code: "SupporterList", node: <SupporterList /> },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    icon: Inbox,
    blurb: "Incoming-comments inbox and a story-poll result.",
    items: [
      { label: "Comments inbox", code: "CommentsInbox", node: <CommentsInbox /> },
      { label: "Poll result", code: "PollResult", node: <PollResult /> },
    ],
  },
  {
    id: "launch",
    label: "Launch",
    icon: Rocket,
    blurb: "A launch countdown timer and a waitlist signup.",
    items: [
      { label: "Countdown", code: "CountdownCard", node: <CountdownCard /> },
      { label: "Waitlist", code: "WaitlistForm", node: <WaitlistForm /> },
    ],
  },
];

/* ── Category order ────────────────────────────────────────
   The style guide reads top → bottom in a deliberate sequence. CATEGORIES is
   sorted in place by this list; any id NOT listed falls to the end, so a
   newly-added category is never dropped — just appended until ranked here. */
const CATEGORY_ORDER: string[] = [
  // Brand
  "brand",
  // Foundations · type
  "typography", "type-details", "text-sizes", "html-tags",
  // Foundations · color
  "colors", "color-roles",
  // Foundations · iconography
  "icons", "icon-sizes",
  // Foundations · shape & elevation
  "border-radius", "shadows",
  // Foundations · spacing & sizing
  "paddings", "margins", "spacers", "control-sizes",
  // Foundations · layout
  "max-widths", "responsive", "structure",
  // Guidelines
  "microcopy", "formatting", "accessibility",
  // Components · form controls
  "buttons", "inputs", "fields", "tag-input", "copy-field", "forms", "toggles", "pickers", "sliders",
  "color-picker", "rating-input", "avatar-upload", "inline-edit",
  // Components · display atoms
  "badges", "avatars", "tooltips", "ratings", "tabs",
  // Components · surfaces & overlays
  "cards", "sections", "banners", "modals", "dialogs", "drawer", "overlays", "popover", "share-sheet", "shortcuts", "attachments",
  // Components · navigation
  "navbars", "sidebars", "navigation", "menus", "toolbar", "tree-view",
  // Components · feedback & states
  "notifications", "feedback", "loading", "errors", "empty-states",
  // Components · data display
  "tables", "stats", "scorecard", "charts", "trends", "heatmap", "analytics", "audience", "posting-insights", "trending", "funnels", "gauges", "breakdowns", "survey",
  "board", "gallery", "carousel", "hero", "testimonials", "checklist", "comparison", "before-after", "calendar", "agenda", "booking",
  // Content & messaging
  "content", "composer", "chat", "threads", "comments", "ideas",
  // Page layouts
  "page-designs",
  // Page designs · explorations (full-page wireframe studies, V1–V4)
  "pdx-app-shell", "pdx-dashboard", "pdx-bento", "pdx-report",
  // platform surfaces — programs, content, monetization, audience
  "pdx-program", "pdx-scheduler", "pdx-deals", "pdx-revenue", "pdx-shop", "pdx-audience", "pdx-moderation", "pdx-email", "pdx-affiliate", "pdx-events",
  "pdx-data-table", "pdx-list-detail", "pdx-tabs", "pdx-document", "pdx-scaffold",
  "pdx-profile", "pdx-creator", "pdx-members", "pdx-account", "pdx-settings", "pdx-prefs",
  "pdx-kanban", "pdx-gantt", "pdx-calendar", "pdx-booking", "pdx-tracker",
  "pdx-inbox", "pdx-chat", "pdx-feed", "pdx-community", "pdx-activity", "pdx-heatmap", "pdx-reviews",
  "pdx-search", "pdx-filters", "pdx-command",
  "pdx-grid", "pdx-media",
  "pdx-forms", "pdx-wizard", "pdx-survey", "pdx-import",
  "pdx-auth",
  "pdx-pricing", "pdx-compare", "pdx-checkout", "pdx-billing", "pdx-calc", "pdx-channels",
  "pdx-docs", "pdx-changelog", "pdx-consent", "pdx-empty", "pdx-error", "pdx-landing", "pdx-modals", "pdx-workspace", "pdx-tags",
  "page-layouts", "email-designs",
  // Feature blocks · core
  "dashboard", "performance", "posting", "program-surfaces", "admin",
  // Feature blocks · learning & onboarding
  "learning", "tutorials", "certificate", "onboarding", "wizard", "tour", "faq",
  // Feature blocks · engagement
  "missions", "achievement", "goals", "engagement", "community", "referral", "countdown", "launch", "gift-redeem",
  // Feature blocks · monetization
  "monetization", "pricing", "plan-gating", "access-tiers", "products", "promo", "checkout", "billing", "usage", "invoices", "tip-jar", "earnings", "trust",
  // Feature blocks · creator surfaces
  "timeline", "notes", "media-kit", "profile", "link-in-bio", "post-preview", "hashtags", "email-capture",
  // Feature blocks · utility & connections
  "widgets", "integrations", "search", "settings", "support", "video", "mobile", "ai-assist", "qr-code", "outreach",
  // Feature blocks · account & security
  "auth", "security", "verification", "notification-center", "announcement", "consent",
];

const orderRank = (id: string) => {
  const i = CATEGORY_ORDER.indexOf(id);
  return i === -1 ? CATEGORY_ORDER.length : i;
};
CATEGORIES.sort((a, b) => orderRank(a.id) - orderRank(b.id));

const TOTAL = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

/* Sidebar grouping — collapse the categories into logical, collapsible sections.
   Grouped by source membership (robust to the orderRank sort above). */
const _idsOf = (arr: Category[]) => new Set(arr.map((c) => c.id));
const _foundIds = _idsOf(FOUNDATION_CATEGORIES);
const _pageDesignIds = _idsOf(PAGE_DESIGN_CATEGORIES);
const _pageExploreIds = _idsOf(PAGE_EXPLORATION_CATEGORIES);
const _extraIds = _idsOf(EXTRA_CATEGORIES);
const NAV_GROUPS: { label: string; cats: Category[]; defaultOpen: boolean }[] = [
  { label: "Foundations", cats: CATEGORIES.filter((c) => _foundIds.has(c.id)), defaultOpen: false },
  {
    label: "Elements",
    cats: CATEGORIES.filter(
      (c) => !_foundIds.has(c.id) && !_pageDesignIds.has(c.id) && !_pageExploreIds.has(c.id) && !_extraIds.has(c.id),
    ),
    defaultOpen: true,
  },
  { label: "Patterns", cats: CATEGORIES.filter((c) => _extraIds.has(c.id)), defaultOpen: true },
  { label: "Page designs", cats: CATEGORIES.filter((c) => _pageDesignIds.has(c.id)), defaultOpen: false },
  { label: "Page explorations", cats: CATEGORIES.filter((c) => _pageExploreIds.has(c.id)), defaultOpen: false },
].filter((g) => g.cats.length > 0);

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
          <nav className="sticky top-[72px] max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden py-8 pr-1 space-y-6">
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
              <div className="flex flex-col gap-1">
                {NAV_GROUPS.map((group) => (
                  <details key={group.label} open={group.defaultOpen} className="group">
                    <summary className="flex items-center gap-2 h-8 px-2.5 rounded-[9px] text-[12px] font-semibold text-ink-700 cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden hover:bg-cream-200 transition-colors">
                      <ChevronRight
                        className="size-3.5 shrink-0 text-ink-400 transition-transform group-open:rotate-90"
                        strokeWidth={2}
                      />
                      {group.label}
                      <span className="ml-auto text-[10.5px] text-ink-300 tabular-nums">{group.cats.length}</span>
                    </summary>
                    <div className="flex flex-col gap-0.5 mt-0.5 mb-1.5 ml-3 pl-2.5 border-l border-ink-100">
                      {group.cats.map((cat) => {
                        const active = activeId === cat.id;
                        const Icon = cat.icon;
                        return (
                          <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            aria-current={active ? "true" : undefined}
                            className={cn(
                              "flex items-center gap-2.5 h-8 px-2.5 rounded-[9px] text-[12.5px] transition-colors",
                              active
                                ? "bg-rose-50 text-rose-700 font-semibold"
                                : "text-ink-600 hover:bg-cream-200 hover:text-ink-900",
                            )}
                          >
                            <Icon
                              className={cn("size-3.5 shrink-0", active ? "text-rose-600" : "text-ink-400")}
                              strokeWidth={1.9}
                            />
                            <span className="truncate">{cat.label}</span>
                            <span
                              className={cn(
                                "ml-auto text-[10.5px] tabular-nums shrink-0",
                                active ? "text-rose-400" : "text-ink-300",
                              )}
                            >
                              {cat.items.length}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </details>
                ))}
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
