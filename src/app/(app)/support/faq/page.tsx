import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Rocket,
  GraduationCap,
  CalendarDays,
  CreditCard,
  Lock,
  Wrench,
  Gift,
  Headset,
  type LucideIcon,
} from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { PageShell } from "@/components/app-shell/page-shell";

export const metadata = { title: "FAQ · Help & Support" };

/**
 * Frequently Asked Questions.
 *
 * Real, self-contained help content — replaces the old "FAQ" card that just
 * dumped users on the tutorials library. Pure server component: each Q&A is a
 * native <details>/<summary> so it expands with zero client JS and stays
 * accessible + keyboard-friendly. Sections carry stable ids so the support
 * hub's guide links can deep-link straight to the relevant group
 * (e.g. /support/faq#billing).
 */

type Qa = { q: string; a: React.ReactNode };
type Section = { id: string; title: string; icon: LucideIcon; items: Qa[] };

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: Rocket,
    items: [
      {
        q: "How do I set up my creator profile?",
        a: (
          <>
            Head to{" "}
            <FaqLink href="/settings">Settings</FaqLink> to add your name, bio,
            niche, links, and avatar. A complete profile powers your dashboard
            snapshot and your public media kit.
          </>
        ),
      },
      {
        q: "How do I connect my social accounts?",
        a: (
          <>
            Go to{" "}
            <FaqLink href="/settings/connected-accounts">
              Settings → Connected accounts
            </FaqLink>{" "}
            and connect Instagram, TikTok, or YouTube. Once connected, your
            Performance page syncs followers, reach, and engagement
            automatically.
          </>
        ),
      },
      {
        q: "What should I do first?",
        a: (
          <>
            Start with the <strong>Start Here</strong> program on your{" "}
            <FaqLink href="/programs">Programs</FaqLink> page. It unlocks the
            rest of the library and seeds your first tasks.
          </>
        ),
      },
    ],
  },
  {
    id: "learning",
    title: "Programs & tutorials",
    icon: GraduationCap,
    items: [
      {
        q: "What's the difference between Programs and Tutorials?",
        a: (
          <>
            <strong>Programs</strong> are structured, sequenced growth tracks
            with lessons and tasks. <strong>Tutorials</strong> are the same
            video lessons available à la carte, so you can jump to a single
            skill without following a full track.
          </>
        ),
      },
      {
        q: "How is my progress tracked?",
        a: (
          <>
            Marking a lesson complete updates your program progress and your
            dashboard automatically. Completing lessons can also unlock new
            tasks on your{" "}
            <FaqLink href="/missions">Tasks</FaqLink> page.
          </>
        ),
      },
    ],
  },
  {
    id: "posting",
    title: "Posting plans",
    icon: CalendarDays,
    items: [
      {
        q: "How do I create a posting plan and schedule posts?",
        a: (
          <>
            On the{" "}
            <FaqLink href="/posting">Posting Plans</FaqLink> page, create a
            weekly plan, then add posts to it. Use the calendar view to
            schedule each piece by day.
          </>
        ),
      },
      {
        q: "How do I move a post from idea to posted?",
        a: (
          <>
            Each post has a status (Idea → Scripted → Filmed → Edited →
            Posted). Update it from the planned-posts table or the calendar as
            the content moves through your pipeline.
          </>
        ),
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & subscription",
    icon: CreditCard,
    items: [
      {
        q: "What plans are available?",
        a: (
          <>
            Free, Basic, and Pro. Pro unlocks every program track, premium
            resources, and advanced analytics. Compare and upgrade on the{" "}
            <FaqLink href="/billing">Billing</FaqLink> page.
          </>
        ),
      },
      {
        q: "Is there a free trial?",
        a: (
          <>
            Yes — paid plans include a 7-day free trial for first-time
            subscribers. It begins when you choose a paid plan at checkout, and
            you can cancel anytime before it ends.
          </>
        ),
      },
      {
        q: "How do I cancel, and where are my invoices?",
        a: (
          <>
            Manage or cancel your subscription from the{" "}
            <FaqLink href="/billing">Billing</FaqLink> page. Your invoices are
            listed there too, each with a downloadable PDF receipt.
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    title: "Account & access",
    icon: Lock,
    items: [
      {
        q: "How do I reset my password?",
        a: (
          <>
            Sign out and use{" "}
            <FaqLink href="/forgot-password">Forgot password</FaqLink> on the
            sign-in screen — we&apos;ll email you a secure reset link.
          </>
        ),
      },
      {
        q: "I upgraded but can't see Pro features. What now?",
        a: (
          <>
            Pro unlocks the moment your payment is confirmed. If a lesson still
            shows as locked, refresh the page; if it persists, open a request
            from <FaqLink href="/support/new">Contact support</FaqLink>.
          </>
        ),
      },
    ],
  },
  {
    id: "technical",
    title: "Technical issues",
    icon: Wrench,
    items: [
      {
        q: "A video or upload isn't working — what should I try?",
        a: (
          <>
            Refresh the page, check your connection, and make sure the file is a
            supported format. If it still fails, note the page and device and{" "}
            <FaqLink href="/support/new">contact support</FaqLink> so we can
            investigate.
          </>
        ),
      },
      {
        q: "Which browsers are supported?",
        a: (
          <>
            The latest versions of Chrome, Safari, Edge, and Firefox on desktop
            and mobile are all fully supported.
          </>
        ),
      },
    ],
  },
  {
    id: "referrals",
    title: "Referrals & rewards",
    icon: Gift,
    items: [
      {
        q: "How do referrals work?",
        a: (
          <>
            Share your link from{" "}
            <FaqLink href="/settings/invites">Settings → Invites</FaqLink>
            . When invited creators subscribe to a paid plan, you earn free
            months — 1 month free at 3 referrals and 3 months free at 9.
          </>
        ),
      },
    ],
  },
];

export default async function FaqPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[var(--container-content)]">
        {/* Back to hub */}
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-rose-700 transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
          Back to Help &amp; Support
        </Link>

        {/* Header */}
        <header className="mt-4 mb-6 sm:mb-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-rose-600 mb-2">
            Support Center
          </p>
          <h1 className="text-h2 sm:text-[36px] text-ink-900 leading-tight">
            Frequently asked questions
          </h1>
          <p className="mt-2 text-[13.5px] sm:text-[14px] text-ink-500 leading-relaxed max-w-2xl">
            Quick answers to the most common questions. Can&apos;t find what
            you&apos;re looking for? Our team is one message away.
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="card p-5 sm:p-6 scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center size-10 rounded-[12px] bg-rose-50 text-rose-600 shrink-0"
                  >
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <h2 className="text-[16px] font-semibold text-ink-900">
                    {section.title}
                  </h2>
                </div>

                <div className="divide-y divide-ink-100">
                  {section.items.map((item, i) => (
                    <details key={i} className="group py-1">
                      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none py-3">
                        <span className="text-[13.5px] font-semibold text-ink-900">
                          {item.q}
                        </span>
                        <ChevronDown
                          className="size-4 text-ink-400 shrink-0 transition-transform group-open:rotate-180"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </summary>
                      <p className="pb-3 pr-7 text-[13px] text-ink-600 leading-relaxed">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Still need help */}
        <section className="card mt-6 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
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
              If your question isn&apos;t answered here, open a request and
              we&apos;ll get back to you within 24–48 hours.
            </p>
          </div>
          <Link
            href="/support/new"
            className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold shrink-0 transition-colors shadow-sm"
          >
            Contact support
          </Link>
        </section>
      </div>
    </PageShell>
  );
}

function FaqLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-rose-600 font-medium hover:text-rose-700 transition-colors"
    >
      {children}
    </Link>
  );
}
