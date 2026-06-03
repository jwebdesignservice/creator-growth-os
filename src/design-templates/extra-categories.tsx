/* Extra categories ───────────────────────────────────────────────────────────
   Self-contained gallery categories bundled into one spread so the gallery only
   needs `...EXTRA_CATEGORIES`. Keeps registration to a single import + spread
   (low-collision) instead of editing the contended CATEGORIES tail directly.

   Covers many product-facing surfaces missing from the core gallery — across
   monetization, security, content, marketing, forms, scheduling and more.
   Strictly product UI: no dev / ops surfaces, ever (project rule).
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import {
  Plug,
  Lock,
  HardDrive,
  Tags,
  Copy,
  ShieldCheck,
  ShoppingCart,
  LifeBuoy,
  Award,
  Megaphone,
  KeyRound,
  MessageCircle,
  HelpCircle,
  Inbox,
  Quote,
  Timer,
  BadgeCheck,
  Mail,
  Compass,
  ArrowLeftRight,
  Palette,
  ListTree,
  SquareMousePointer,
  Cookie,
  Camera,
  Share2,
  QrCode,
  Gift,
  Star,
  CalendarClock,
  Pencil,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

import { ConnectedPlatformRow, PlatformConnectGrid, IntegrationCard, PlatformConnecting } from "./integrations";
import { LockedKpiTile, PaywallOverlay, UpgradeCard } from "./plan-gating";
import { StorageMeter, PlanLimitMeter, UsageBreakdown } from "./usage";
import { TagInput, TagInputWithSuggestions, AddTagButton, TagInputError } from "./tag-input";
import { CopyLinkField, InviteCodeField } from "./copy-field";
import { TwoFactorCard, ActiveSessionsList, LoginHistory } from "./security";
import { OrderSummary, PromoCodeField, PaymentMethodSelect, OrderProcessing } from "./checkout";
import { TicketList, TicketThread, TicketBadges } from "./support";
import { CompletionCertificate, CertificateEarnedCard } from "./certificate";
import { AnnouncementBanner, ChangelogFeed, AnnouncementCard } from "./announcement";
import { AccessTierSelector, EnrollmentRulesCard } from "./access-tiers";
import { CommentThread, CommentComposer, CommentRow } from "./comments";
import { FaqAccordion, FaqSearch } from "./faq";
import { NoProgramsEmpty, NoPostsEmpty, NoResultsEmpty } from "./empty-states";
import { TestimonialCard, TestimonialQuote, TestimonialGrid } from "./testimonials";
import { CountdownTimer, LaunchBanner } from "./countdown";
import { GuaranteeBadge, SecureCheckout, TrustStrip } from "./trust";
import { NewsletterSignup, LeadMagnet, WaitlistForm, NewsletterSubscribed } from "./email-capture";
import { Coachmark, TourStep } from "./tour";
import { BeforeAfterSlider, BeforeAfterStats } from "./before-after";
import { ColorSwatches, ColorPickerPopover } from "./color-picker";
import { CurriculumTree, FolderTree } from "./tree-view";
import { RichPopover, MenuPopover } from "./popover";
import { CookieBanner, ConsentPreferences } from "./consent";
import { AvatarUploader, AvatarCropper } from "./avatar-upload";
import { ShareSheet, ShareRow } from "./share-sheet";
import { QrCard, QrInline } from "./qr-code";
import { GiftCard, RedeemCode, RedeemError } from "./gift-redeem";
import { StarRatingInput, FeedbackPrompt, RatingSubmitted } from "./rating-input";
import { TimeSlotPicker, BookingConfirm } from "./booking";
import { InlineEditField, InlineEditTitle } from "./inline-edit";
import { WeeklyScorecard, GradeStrip } from "./scorecard";
import { PAGE_DESIGNS_CREATOR } from "./page-designs-creator";
import { PAGE_DESIGNS_GROWTH } from "./page-designs-growth";
import { PAGE_DESIGNS_MOBILE } from "./page-designs-mobile";

type ExtraCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scale?: number;
  items: { label: string; code: string; node: ReactNode; scale?: number }[];
};

export const EXTRA_CATEGORIES: ExtraCategory[] = [
  ...PAGE_DESIGNS_CREATOR,
  ...PAGE_DESIGNS_GROWTH,
  ...PAGE_DESIGNS_MOBILE,
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    blurb: "Connect social platforms for analytics sync — connected, not-connected & setup-pending states.",
    scale: 0.92,
    items: [
      { label: "Connected row", code: "ConnectedPlatformRow", node: <ConnectedPlatformRow /> },
      { label: "Connect grid", code: "PlatformConnectGrid", node: <PlatformConnectGrid /> },
      { label: "Integration card", code: "IntegrationCard", node: <IntegrationCard /> },
      { label: "Connecting", code: "PlatformConnecting", node: <PlatformConnecting /> },
    ],
  },
  {
    id: "plan-gating",
    label: "Plan gating",
    icon: Lock,
    blurb: "Monetization paywalls — locked KPI tile, blur overlay, and the upgrade prompt.",
    scale: 0.92,
    items: [
      { label: "Locked KPI", code: "LockedKpiTile", node: <LockedKpiTile /> },
      { label: "Paywall overlay", code: "PaywallOverlay", node: <PaywallOverlay /> },
      { label: "Upgrade card", code: "UpgradeCard", node: <UpgradeCard /> },
    ],
  },
  {
    id: "usage",
    label: "Usage & limits",
    icon: HardDrive,
    blurb: "Quota meters — video storage, plan limits, and a multi-resource breakdown.",
    scale: 0.95,
    items: [
      { label: "Storage meter", code: "StorageMeter", node: <StorageMeter /> },
      { label: "Plan-limit meter", code: "PlanLimitMeter", node: <PlanLimitMeter /> },
      { label: "Usage breakdown", code: "UsageBreakdown", node: <UsageBreakdown /> },
    ],
  },
  {
    id: "tag-input",
    label: "Tag input",
    icon: Tags,
    blurb: "Editable tag fields — content pillars with add/remove and a suggestions menu.",
    scale: 0.95,
    items: [
      { label: "Tag input", code: "TagInput", node: <TagInput /> },
      { label: "With suggestions", code: "TagInputWithSuggestions", node: <TagInputWithSuggestions /> },
      { label: "Add button", code: "AddTagButton", node: <AddTagButton /> },
      { label: "Error / limit", code: "TagInputError", node: <TagInputError /> },
    ],
  },
  {
    id: "copy-field",
    label: "Copy & share",
    icon: Copy,
    blurb: "Referral-link and invite-code fields with copy / share actions.",
    scale: 0.95,
    items: [
      { label: "Copy link", code: "CopyLinkField", node: <CopyLinkField /> },
      { label: "Invite code", code: "InviteCodeField", node: <InviteCodeField /> },
    ],
  },
  {
    id: "security",
    label: "Account security",
    icon: ShieldCheck,
    blurb: "Two-factor setup, active sessions/devices, and recent login history.",
    scale: 0.9,
    items: [
      { label: "Two-factor", code: "TwoFactorCard", node: <TwoFactorCard /> },
      { label: "Active sessions", code: "ActiveSessionsList", node: <ActiveSessionsList /> },
      { label: "Login history", code: "LoginHistory", node: <LoginHistory /> },
    ],
  },
  {
    id: "checkout",
    label: "Checkout",
    icon: ShoppingCart,
    blurb: "Upgrade flow — order summary, promo code, and payment-method select.",
    scale: 0.95,
    items: [
      { label: "Order summary", code: "OrderSummary", node: <OrderSummary /> },
      { label: "Promo code", code: "PromoCodeField", node: <PromoCodeField /> },
      { label: "Payment method", code: "PaymentMethodSelect", node: <PaymentMethodSelect /> },
      { label: "Processing", code: "OrderProcessing", node: <OrderProcessing /> },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
    blurb: "Resolution center — ticket list, the conversation thread, and status badges.",
    scale: 0.9,
    items: [
      { label: "Ticket list", code: "TicketList", node: <TicketList /> },
      { label: "Ticket thread", code: "TicketThread", node: <TicketThread /> },
      { label: "Status badges", code: "TicketBadges", node: <TicketBadges /> },
    ],
  },
  {
    id: "certificate",
    label: "Certificate",
    icon: Award,
    blurb: "Course-completion certificate and the earned-it reward card.",
    scale: 0.85,
    items: [
      { label: "Certificate", code: "CompletionCertificate", node: <CompletionCertificate /> },
      { label: "Earned card", code: "CertificateEarnedCard", node: <CertificateEarnedCard /> },
    ],
  },
  {
    id: "announcement",
    label: "Announcements",
    icon: Megaphone,
    blurb: "What's-new banner, a changelog feed, and a product announcement card.",
    scale: 0.92,
    items: [
      { label: "Banner", code: "AnnouncementBanner", node: <AnnouncementBanner /> },
      { label: "Changelog feed", code: "ChangelogFeed", node: <ChangelogFeed /> },
      { label: "Announcement card", code: "AnnouncementCard", node: <AnnouncementCard /> },
    ],
  },
  {
    id: "access-tiers",
    label: "Access tiers",
    icon: KeyRound,
    blurb: "Admin access governance — Free/Basic/Pro tier selector + enrollment rules.",
    scale: 0.92,
    items: [
      { label: "Tier selector", code: "AccessTierSelector", node: <AccessTierSelector /> },
      { label: "Enrollment rules", code: "EnrollmentRulesCard", node: <EnrollmentRulesCard /> },
    ],
  },
  {
    id: "comments",
    label: "Comments",
    icon: MessageCircle,
    blurb: "Threaded comments on lessons & posts — replies, likes, composer, moderation row.",
    scale: 0.92,
    items: [
      { label: "Comment thread", code: "CommentThread", node: <CommentThread /> },
      { label: "Composer", code: "CommentComposer", node: <CommentComposer /> },
      { label: "Moderation row", code: "CommentRow", node: <CommentRow /> },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    blurb: "Expandable Q&A accordion and a searchable FAQ with category chips.",
    scale: 0.95,
    items: [
      { label: "FAQ accordion", code: "FaqAccordion", node: <FaqAccordion /> },
      { label: "Searchable FAQ", code: "FaqSearch", node: <FaqSearch /> },
    ],
  },
  {
    id: "empty-states",
    label: "Empty states",
    icon: Inbox,
    blurb: "Context-specific empty states — no programs, no scheduled posts, no results.",
    scale: 0.95,
    items: [
      { label: "No programs", code: "NoProgramsEmpty", node: <NoProgramsEmpty /> },
      { label: "No posts", code: "NoPostsEmpty", node: <NoPostsEmpty /> },
      { label: "No results", code: "NoResultsEmpty", node: <NoResultsEmpty /> },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: Quote,
    blurb: "Social proof — testimonial card with rating, a pull quote, and a proof grid.",
    scale: 0.92,
    items: [
      { label: "Testimonial card", code: "TestimonialCard", node: <TestimonialCard /> },
      { label: "Pull quote", code: "TestimonialQuote", node: <TestimonialQuote /> },
      { label: "Proof grid", code: "TestimonialGrid", node: <TestimonialGrid /> },
    ],
  },
  {
    id: "countdown",
    label: "Countdown",
    icon: Timer,
    blurb: "Launch & limited-offer timers — digit-block countdown and an urgency banner.",
    scale: 0.95,
    items: [
      { label: "Countdown timer", code: "CountdownTimer", node: <CountdownTimer /> },
      { label: "Launch banner", code: "LaunchBanner", node: <LaunchBanner /> },
    ],
  },
  {
    id: "trust",
    label: "Trust & guarantees",
    icon: BadgeCheck,
    blurb: "Reassurance — money-back guarantee, secure-checkout row, and a social-proof strip.",
    scale: 0.95,
    items: [
      { label: "Guarantee badge", code: "GuaranteeBadge", node: <GuaranteeBadge /> },
      { label: "Secure checkout", code: "SecureCheckout", node: <SecureCheckout /> },
      { label: "Trust strip", code: "TrustStrip", node: <TrustStrip /> },
    ],
  },
  {
    id: "email-capture",
    label: "Email capture",
    icon: Mail,
    blurb: "Audience building — newsletter signup, lead-magnet card, and a waitlist form.",
    scale: 0.95,
    items: [
      { label: "Newsletter signup", code: "NewsletterSignup", node: <NewsletterSignup /> },
      { label: "Lead magnet", code: "LeadMagnet", node: <LeadMagnet /> },
      { label: "Waitlist", code: "WaitlistForm", node: <WaitlistForm /> },
      { label: "Subscribed", code: "NewsletterSubscribed", node: <NewsletterSubscribed /> },
    ],
  },
  {
    id: "tour",
    label: "Product tour",
    icon: Compass,
    blurb: "In-context guidance — a spotlight coachmark and a tour step card.",
    scale: 0.95,
    items: [
      { label: "Coachmark", code: "Coachmark", node: <Coachmark /> },
      { label: "Tour step", code: "TourStep", node: <TourStep /> },
    ],
  },
  {
    id: "before-after",
    label: "Before / after",
    icon: ArrowLeftRight,
    blurb: "Transformation — an image-compare slider and a metric before→after delta.",
    scale: 0.95,
    items: [
      { label: "Compare slider", code: "BeforeAfterSlider", node: <BeforeAfterSlider /> },
      { label: "Metric delta", code: "BeforeAfterStats", node: <BeforeAfterStats /> },
    ],
  },
  {
    id: "color-picker",
    label: "Color picker",
    icon: Palette,
    blurb: "Color selection — a brand swatch grid and a picker popover with hex input.",
    scale: 0.95,
    items: [
      { label: "Swatches", code: "ColorSwatches", node: <ColorSwatches /> },
      { label: "Picker popover", code: "ColorPickerPopover", node: <ColorPickerPopover /> },
    ],
  },
  {
    id: "tree-view",
    label: "Tree view",
    icon: ListTree,
    blurb: "Hierarchical lists — an expandable curriculum tree and a nested folder tree.",
    scale: 0.95,
    items: [
      { label: "Curriculum tree", code: "CurriculumTree", node: <CurriculumTree /> },
      { label: "Folder tree", code: "FolderTree", node: <FolderTree /> },
    ],
  },
  {
    id: "popover",
    label: "Popover",
    icon: SquareMousePointer,
    blurb: "Anchored panels — a rich info popover with actions, and an action menu.",
    scale: 0.95,
    items: [
      { label: "Rich popover", code: "RichPopover", node: <RichPopover /> },
      { label: "Menu popover", code: "MenuPopover", node: <MenuPopover /> },
    ],
  },
  {
    id: "consent",
    label: "Consent",
    icon: Cookie,
    blurb: "Privacy — a cookie consent banner and a per-category preferences panel.",
    scale: 0.92,
    items: [
      { label: "Cookie banner", code: "CookieBanner", node: <CookieBanner /> },
      { label: "Preferences", code: "ConsentPreferences", node: <ConsentPreferences /> },
    ],
  },
  {
    id: "avatar-upload",
    label: "Avatar upload",
    icon: Camera,
    blurb: "Profile-photo editing — the uploader row and a circular crop with zoom.",
    scale: 0.95,
    items: [
      { label: "Uploader", code: "AvatarUploader", node: <AvatarUploader /> },
      { label: "Cropper", code: "AvatarCropper", node: <AvatarCropper /> },
    ],
  },
  {
    id: "share-sheet",
    label: "Share sheet",
    icon: Share2,
    blurb: "Sharing — a share-to grid with socials + copy link, and an inline share row.",
    scale: 0.95,
    items: [
      { label: "Share sheet", code: "ShareSheet", node: <ShareSheet /> },
      { label: "Inline share", code: "ShareRow", node: <ShareRow /> },
    ],
  },
  {
    id: "qr-code",
    label: "QR code",
    icon: QrCode,
    blurb: "Scan-to-open — a profile QR card with download, and a compact inline QR.",
    scale: 0.95,
    items: [
      { label: "QR card", code: "QrCard", node: <QrCard /> },
      { label: "Inline QR", code: "QrInline", node: <QrInline /> },
    ],
  },
  {
    id: "gift-redeem",
    label: "Gift & redeem",
    icon: Gift,
    blurb: "Gift a program to someone, and the redeem-a-code flow that unlocks access.",
    scale: 0.95,
    items: [
      { label: "Gift card", code: "GiftCard", node: <GiftCard /> },
      { label: "Redeem code", code: "RedeemCode", node: <RedeemCode /> },
      { label: "Invalid code", code: "RedeemError", node: <RedeemError /> },
    ],
  },
  {
    id: "rating-input",
    label: "Rating input",
    icon: Star,
    blurb: "Collect feedback — an interactive star-rating prompt and a helpful / not-helpful prompt.",
    scale: 0.95,
    items: [
      { label: "Star rating", code: "StarRatingInput", node: <StarRatingInput /> },
      { label: "Helpful prompt", code: "FeedbackPrompt", node: <FeedbackPrompt /> },
      { label: "Submitted", code: "RatingSubmitted", node: <RatingSubmitted /> },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    icon: CalendarClock,
    blurb: "Schedule a 1:1 — a time-slot picker and the booking-confirmed card with join link.",
    scale: 0.92,
    items: [
      { label: "Time-slot picker", code: "TimeSlotPicker", node: <TimeSlotPicker /> },
      { label: "Booking confirmed", code: "BookingConfirm", node: <BookingConfirm /> },
    ],
  },
  {
    id: "inline-edit",
    label: "Inline edit",
    icon: Pencil,
    blurb: "Click-to-edit fields — a value row that becomes an input in place, and an editable title.",
    scale: 0.95,
    items: [
      { label: "Edit field", code: "InlineEditField", node: <InlineEditField /> },
      { label: "Edit title", code: "InlineEditTitle", node: <InlineEditTitle /> },
    ],
  },
  {
    id: "scorecard",
    label: "Scorecard",
    icon: ClipboardCheck,
    blurb: "Coaching summary — a weekly creator scorecard with letter grades and trends.",
    scale: 0.95,
    items: [
      { label: "Weekly scorecard", code: "WeeklyScorecard", node: <WeeklyScorecard /> },
      { label: "Grade strip", code: "GradeStrip", node: <GradeStrip /> },
    ],
  },
];
