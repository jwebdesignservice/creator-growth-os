import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Headset,
  Ticket,
  HelpCircle,
  BookOpen,
  Search,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Wrench,
  Lock,
  GraduationCap,
  CalendarDays,
  Users,
  TrendingUp,
  FileText,
  Mail,
  ClipboardList,
  CheckCircle2,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { PageShell } from "@/components/app-shell/page-shell";
import { cn } from "@/lib/cn";

export const metadata = { title: "Help & Support | Creator Growth OS" };

/**
 * Help & Support hub — the support landing at /support.
 *
 * Frontend-only, structured mock data (see the consts below). Real flows are
 * reachable from here: "Open support form" / "Contact support" → /support/new
 * (the ticket wizard), "View tickets" / "View all tickets" → /support/tickets.
 *
 * Layout: full-width header (eyebrow + title + subtitle + search), then a
 * two-column grid — main content (primary cards, topics, guides + recent
 * tickets, bottom CTA) and a right rail (direct help, process, quick links,
 * tip). Below xl the rail stacks under the main content so nothing is lost
 * on tablet / mobile.
 */

/* ─── Mock data (structured, frontend-only) ───────────────────────────── */

type CardVariant = "primary" | "outline";

const PRIMARY_CARDS: {
  key: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  cta: string;
  href: string;
  variant: CardVariant;
  badge?: string;
}[] = [
  {
    key: "contact",
    icon: Headset,
    title: "Contact Support",
    desc: "Submit a request and our team will get back to you.",
    cta: "Open support form",
    href: "/support/new",
    variant: "primary",
  },
  {
    key: "tickets",
    icon: Ticket,
    title: "My Tickets",
    desc: "View your existing tickets and track their status.",
    cta: "View tickets",
    href: "/support/tickets",
    variant: "outline",
    badge: "3 open",
  },
  {
    key: "faq",
    icon: HelpCircle,
    title: "FAQ",
    desc: "Browse answers to the most common questions.",
    cta: "Browse FAQs",
    href: "/tutorials",
    variant: "outline",
  },
  {
    key: "guides",
    icon: BookOpen,
    title: "Guides & Tutorials",
    desc: "Step-by-step guides to help you get the most out of CGOS.",
    cta: "Explore guides",
    href: "/tutorials",
    variant: "outline",
  },
];

const TOPICS: { key: string; icon: LucideIcon; title: string; sub: string; href: string }[] = [
  { key: "billing",   icon: CreditCard,    title: "Billing",          sub: "Payments & plans",       href: "/support/new?topic=billing"   },
  { key: "technical", icon: Wrench,        title: "Technical Issues", sub: "Fixes & troubleshooting", href: "/support/new?topic=technical" },
  { key: "account",   icon: Lock,          title: "Account & Login",  sub: "Access & security",      href: "/support/new?topic=account"   },
  { key: "programs",  icon: GraduationCap, title: "Programs",         sub: "Courses & content",      href: "/support/new?topic=content"   },
  { key: "posting",   icon: CalendarDays,  title: "Posting Plans",    sub: "Upload & manage",        href: "/support/new?topic=posting"   },
  { key: "community", icon: Users,         title: "Community",        sub: "Groups & discussions",   href: "/support/new?topic=community" },
  { key: "growth",    icon: TrendingUp,    title: "Growth Tips",      sub: "Best practices",         href: "/tutorials"                   },
];

const GUIDES: { key: string; icon: LucideIcon; title: string; cat: string; read: string; href: string }[] = [
  { key: "g1", icon: FileText,   title: "How to upload videos to Posting Plans", cat: "Posting Plans · Step-by-step guide",  read: "5 min read", href: "/tutorials" },
  { key: "g2", icon: Wrench,     title: "Fixing common upload issues",           cat: "Technical Issues · Troubleshooting",  read: "4 min read", href: "/tutorials" },
  { key: "g3", icon: CreditCard, title: "Managing your subscription",            cat: "Billing · Account & Plans",           read: "6 min read", href: "/tutorials" },
  { key: "g4", icon: Lock,       title: "How to access your Pro features",        cat: "Account & Login · Getting Started",   read: "3 min read", href: "/tutorials" },
];

type TicketStatus = "Open" | "Waiting" | "Resolved";

const RECENT_TICKETS: { id: string; subject: string; status: TicketStatus; updated: string }[] = [
  { id: "TK-48291", subject: "Videos not uploading on Posting Plans", status: "Open",     updated: "2 days ago"  },
  { id: "TK-48102", subject: "Need help accessing Pro Plan",          status: "Waiting",  updated: "4 days ago"  },
  { id: "TK-46877", subject: "Billing question about annual plan",    status: "Resolved", updated: "10 days ago" },
];

const TICKET_PILL: Record<TicketStatus, string> = {
  Open:     "bg-rose-100 text-rose-700",
  Waiting:  "bg-gold-500/15 text-gold-500",
  Resolved: "bg-success-bg text-success",
};

type StepState = "current" | "upcoming";

const PROCESS_STEPS: { key: string; icon: LucideIcon; title: string; desc: string; state: StepState }[] = [
  { key: "submit", icon: Mail,          title: "Submit request",     desc: "Tell us how we can help.",                       state: "current"  },
  { key: "review", icon: ClipboardList, title: "Support review",      desc: "Our team reviews and investigates.",             state: "upcoming" },
  { key: "reply",  icon: CheckCircle2,  title: "Reply or resolution", desc: "You'll get an email with an update or solution.", state: "upcoming" },
];

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Browse all FAQs",      href: "/tutorials" },
  { label: "Account settings",     href: "/settings"  },
  { label: "Billing help",         href: "/billing"   },
  { label: "Community guidelines", href: "/community" },
];

/* ─── Page ────────────────────────────────────────────────────────────── */

export default async function SupportHubPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[var(--container-dashboard)]">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="mb-6 sm:mb-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-rose-600 mb-2">
            Support Center
          </p>
          <h1 className="text-h2 sm:text-[36px] text-ink-900 leading-tight">
            Help &amp; Support
          </h1>
          <p className="mt-2 text-[13.5px] sm:text-[14px] text-ink-500 leading-relaxed max-w-2xl">
            Find answers, browse guides, and contact our support team when you
            need help.
          </p>

          {/* Page search */}
          <div className="relative mt-5">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-ink-400"
              strokeWidth={2}
              aria-hidden
            />
            <label htmlFor="support-search" className="sr-only">
              Search guides, FAQs, tickets, or topics
            </label>
            <input
              id="support-search"
              type="search"
              autoComplete="off"
              placeholder="Search guides, FAQs, tickets, or topics..."
              className="card w-full h-12 sm:h-[52px] pl-12 pr-4 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-colors"
            />
          </div>
        </header>

        {/* ── Body grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
          {/* MAIN */}
          <div className="space-y-6 min-w-0">
            {/* Primary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRIMARY_CARDS.map((c) => (
                <PrimaryCard key={c.key} card={c} />
              ))}
            </div>

            {/* Browse by topic */}
            <section>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-[15px] font-semibold text-ink-900">
                  Browse by topic
                </h2>
                <Link
                  href="/support/new"
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors"
                >
                  View all topics
                  <ArrowRight className="size-3.5" strokeWidth={2} />
                </Link>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                {TOPICS.map((t) => (
                  <TopicChip key={t.key} topic={t} />
                ))}
              </div>
            </section>

            {/* Guides & Answers + Recent tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Guides & Answers */}
              <section className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-[15px] font-semibold text-ink-900">
                    Guides &amp; Answers
                  </h2>
                  <Link
                    href="/tutorials"
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors"
                  >
                    View all guides
                    <ArrowRight className="size-3.5" strokeWidth={2} />
                  </Link>
                </div>
                <ul className="space-y-0.5">
                  {GUIDES.map((g) => (
                    <li key={g.key}>
                      <Link
                        href={g.href}
                        className="group flex items-center gap-3 rounded-[10px] p-2 hover:bg-cream-100 transition-colors"
                      >
                        <span className="inline-flex items-center justify-center size-9 rounded-[10px] bg-cream-100 text-ink-600 shrink-0">
                          <g.icon className="size-[16px]" strokeWidth={1.9} aria-hidden />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-ink-900 truncate group-hover:text-rose-700 transition-colors">
                            {g.title}
                          </span>
                          <span className="block text-[11.5px] text-ink-500 truncate">
                            {g.cat}
                          </span>
                        </span>
                        <span className="text-[11.5px] text-ink-400 shrink-0 tabular-nums">
                          {g.read}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recent support tickets */}
              <section className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-[15px] font-semibold text-ink-900">
                    Recent support tickets
                  </h2>
                  <Link
                    href="/support/tickets"
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors"
                  >
                    View all tickets
                    <ArrowRight className="size-3.5" strokeWidth={2} />
                  </Link>
                </div>

                {/* Column header — desktop only */}
                <div className="hidden sm:flex items-center gap-3 px-2 pb-2 text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">
                  <span className="w-[80px]">Ticket ID</span>
                  <span className="flex-1">Subject</span>
                  <span className="w-[84px]">Status</span>
                  <span className="w-[84px]">Updated</span>
                  <span className="w-4" aria-hidden />
                </div>

                <ul className="divide-y divide-ink-100">
                  {RECENT_TICKETS.map((t) => (
                    <li key={t.id}>
                      <Link
                        href="/support/tickets"
                        className="group flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 rounded-[10px] px-2 py-3 hover:bg-cream-100 transition-colors"
                      >
                        <span className="sm:w-[80px] text-[12.5px] font-medium text-ink-700 tabular-nums shrink-0">
                          {t.id}
                        </span>
                        <span className="flex-1 min-w-0 text-[12.5px] text-ink-900 truncate group-hover:text-rose-700 transition-colors">
                          {t.subject}
                        </span>
                        <span className="sm:w-[84px] shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 h-[22px] rounded-full text-[11px] font-semibold",
                              TICKET_PILL[t.status],
                            )}
                          >
                            {t.status}
                          </span>
                        </span>
                        <span className="sm:w-[84px] text-[12px] text-ink-500 shrink-0">
                          {t.updated}
                        </span>
                        <ArrowRight
                          className="hidden sm:block size-4 text-ink-300 group-hover:text-rose-600 transition-colors shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Bottom CTA */}
            <section className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <span
                aria-hidden
                className="inline-flex items-center justify-center size-12 rounded-full bg-rose-50 text-rose-600 shrink-0"
              >
                <Headset className="size-6" strokeWidth={1.8} />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-semibold text-ink-900">
                  Still need help?
                </h2>
                <p className="mt-0.5 text-[12.5px] text-ink-500 leading-snug">
                  Our support team is here for you. Submit a request and we&rsquo;ll
                  get back to you as soon as possible.
                </p>
              </div>
              <Link
                href="/support/new"
                className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold shrink-0 transition-colors shadow-sm"
              >
                Contact support
                <ExternalLink className="size-4" strokeWidth={2} aria-hidden />
              </Link>
            </section>
          </div>

          {/* RAIL */}
          <aside className="space-y-5 xl:sticky xl:top-4 self-start">
            {/* Need direct help */}
            <section className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-ink-900">
                  Need direct help?
                </h3>
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center size-9 rounded-full bg-rose-50 text-rose-600 shrink-0"
                >
                  <Headset className="size-[18px]" strokeWidth={1.9} />
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-ink-500 leading-snug">
                Our support team is here for you.
              </p>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">
                  Response time
                </p>
                <p className="mt-0.5 text-[12.5px] font-medium text-rose-600">
                  24 – 48 hours on business days
                </p>
              </div>
              <Link
                href="/support/new"
                className="mt-4 inline-flex items-center justify-center gap-1.5 w-full h-10 rounded-[10px] bg-white border border-ink-200 hover:bg-cream-100 text-ink-800 text-[13px] font-semibold transition-colors"
              >
                Contact support
                <ExternalLink className="size-3.5" strokeWidth={2} aria-hidden />
              </Link>
            </section>

            {/* What happens next */}
            <section className="card p-5">
              <h3 className="text-[14px] font-semibold text-ink-900 mb-4">
                What happens next
              </h3>
              <ol className="space-y-3.5">
                {PROCESS_STEPS.map((s, i) => (
                  <ProcessStep
                    key={s.key}
                    step={s}
                    isLast={i === PROCESS_STEPS.length - 1}
                  />
                ))}
              </ol>
            </section>

            {/* Quick links */}
            <section className="card p-5">
              <h3 className="text-[14px] font-semibold text-ink-900 mb-3">
                Quick links
              </h3>
              <ul className="space-y-0.5">
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-center gap-2 py-1.5 text-[12.5px] text-ink-700 hover:text-rose-700 transition-colors"
                    >
                      <span className="flex-1 min-w-0">{l.label}</span>
                      <ArrowRight
                        className="size-3.5 text-ink-400 shrink-0 group-hover:text-rose-600 transition-colors"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Creator tip */}
            <section className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-ink-900">
                  Creator tip
                </h3>
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center size-9 rounded-full bg-gold-500/15 text-gold-500 shrink-0"
                >
                  <Lightbulb className="size-[18px]" strokeWidth={1.9} />
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-ink-500 leading-snug">
                Find step-by-step guides and best practices to grow your creator
                journey.
              </p>
              <Link
                href="/tutorials"
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors"
              >
                Explore guides
                <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function PrimaryCard({
  card,
}: {
  card: {
    icon: LucideIcon;
    title: string;
    desc: string;
    cta: string;
    href: string;
    variant: CardVariant;
    badge?: string;
  };
}) {
  const Icon = card.icon;
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="inline-flex items-center justify-center size-11 rounded-[12px] bg-rose-50 text-rose-600 shrink-0"
        >
          <Icon className="size-5" strokeWidth={1.9} />
        </span>
        {card.badge && (
          <span className="inline-flex items-center px-2 h-[22px] rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold">
            {card.badge}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{card.title}</h3>
      <p className="mt-1 text-[12.5px] text-ink-500 leading-snug flex-1">
        {card.desc}
      </p>
      <Link
        href={card.href}
        className={cn(
          "mt-4 inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] text-[13px] font-semibold transition-colors",
          card.variant === "primary"
            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            : "bg-white border border-ink-200 text-ink-800 hover:bg-cream-100",
        )}
      >
        {card.cta}
      </Link>
    </div>
  );
}

function TopicChip({
  topic,
}: {
  topic: { icon: LucideIcon; title: string; sub: string; href: string };
}) {
  const Icon = topic.icon;
  return (
    <Link
      href={topic.href}
      className="card-flat shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 hover:border-rose-200 hover:bg-cream-50 transition-colors"
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center size-8 rounded-[9px] bg-cream-100 text-ink-600 shrink-0"
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-ink-900 whitespace-nowrap">
          {topic.title}
        </span>
        <span className="block text-[11px] text-ink-500 whitespace-nowrap">
          {topic.sub}
        </span>
      </span>
    </Link>
  );
}

function ProcessStep({
  step,
  isLast,
}: {
  step: { icon: LucideIcon; title: string; desc: string; state: StepState };
  isLast: boolean;
}) {
  const Icon = step.icon;
  const iconTone =
    step.state === "current"
      ? "bg-rose-100 text-rose-600 ring-2 ring-rose-200"
      : "bg-cream-200 text-ink-500";
  return (
    <li className="relative flex items-start gap-3">
      <div className="relative flex flex-col items-center">
        <span
          aria-hidden
          className={cn(
            "size-8 rounded-full inline-flex items-center justify-center shrink-0",
            iconTone,
          )}
        >
          <Icon className="size-[15px]" strokeWidth={1.9} />
        </span>
        {!isLast && (
          <span
            aria-hidden
            className="mt-1 flex-1 w-px border-l border-dashed border-ink-200 h-6"
          />
        )}
      </div>
      <div className="min-w-0 pt-0.5">
        <div className="text-[13px] font-semibold text-ink-900">{step.title}</div>
        <p className="text-[12px] text-ink-500 leading-snug">{step.desc}</p>
      </div>
    </li>
  );
}
