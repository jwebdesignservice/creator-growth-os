import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Search, MessageSquare } from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getAllHelpArticles } from "@/lib/support/queries";
import { PageShell } from "@/components/app-shell/page-shell";

export const metadata = { title: "Help Center | Creator Growth OS" };

export default async function HelpCenterPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const articles = await getAllHelpArticles();

  // Group by category for a clean landing layout.
  const byCategory = new Map<string, typeof articles>();
  for (const a of articles) {
    const cat = a.category ?? "General";
    const list = byCategory.get(cat) ?? [];
    list.push(a);
    byCategory.set(cat, list);
  }

  return (
    <PageShell>
      <div className="max-w-[var(--container-content)] space-y-6">
        <header>
          <h1 className="font-display text-[26px] sm:text-[30px] text-ink-900 leading-tight">
            Help Center
          </h1>
          <p className="mt-1.5 text-[13.5px] sm:text-[14px] text-ink-500 max-w-2xl leading-relaxed">
            Guides and answers to common questions. Can’t find what you need?{" "}
            <Link href="/support" className="text-rose-700 font-semibold hover:text-rose-600 transition-colors">
              Contact support
            </Link>
            .
          </p>
        </header>

        {/*
          Search field — UI-only placeholder until the help search
          backend lands. Rendered as visually-disabled with a "Coming
          soon" pill so users don't type and wonder why nothing happens.
          Mirrors the same honest-disabled treatment used elsewhere in
          the app for not-yet-wired controls.
        */}
        <div className="relative max-w-xl">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-ink-300"
            strokeWidth={1.9}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search articles…"
            aria-label="Search help articles — coming soon"
            aria-disabled="true"
            disabled
            title="Search is coming soon. Browse the categories below or contact support."
            className="w-full h-11 pl-9 pr-28 rounded-[12px] bg-cream-100 border border-ink-100 text-[13.5px] text-ink-700 placeholder:text-ink-400 cursor-not-allowed"
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-2 h-6 rounded-full text-[10.5px] font-semibold tracking-wider uppercase bg-cream-200 text-ink-500 border border-ink-200"
            aria-hidden
          >
            Coming soon
          </span>
        </div>

        {articles.length === 0 ? (
          <EmptyHelp />
        ) : (
          <div className="space-y-6">
            {[...byCategory.entries()].map(([cat, list]) => (
              <section key={cat} className="space-y-3">
                <h2 className="text-[13px] uppercase tracking-wider font-semibold text-ink-500">
                  {cat}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((a) => (
                    <Link
                      key={a.id}
                      href={`/help/${a.slug}`}
                      className="card p-4 hover:border-rose-200 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0" aria-hidden>
                          <BookOpen className="size-[18px]" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-semibold text-ink-900 truncate group-hover:text-rose-700 transition-colors">
                            {a.title}
                          </div>
                          {a.excerpt && (
                            <p className="mt-1 text-[12.5px] text-ink-500 leading-snug line-clamp-2">
                              {a.excerpt}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="size-4 text-ink-400 shrink-0 group-hover:text-rose-600 transition-colors" strokeWidth={2} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* "Still need help" CTA */}
        <section className="card p-5 sm:p-6 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className="size-10 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0" aria-hidden>
              <MessageSquare className="size-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-ink-900">Still need help?</h3>
              <p className="text-[12.5px] text-ink-500 leading-snug max-w-md">
                Open a ticket and our team will get back to you with a tailored answer.
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] text-[14px] font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
          >
            Contact support
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </section>
      </div>
    </PageShell>
  );
}

function EmptyHelp() {
  return (
    <section className="card p-8 text-center">
      <div className="mx-auto size-12 rounded-full inline-flex items-center justify-center bg-cream-200 text-ink-500">
        <BookOpen className="size-5" strokeWidth={1.8} />
      </div>
      <h2 className="mt-3 text-[16px] font-semibold text-ink-900">No articles yet</h2>
      <p className="mt-1 text-[13px] text-ink-500 max-w-md mx-auto leading-relaxed">
        We’re building out the help center. In the meantime,{" "}
        <Link href="/support" className="text-rose-700 font-semibold hover:text-rose-600 transition-colors">
          open a support ticket
        </Link>{" "}
        and we’ll get back to you.
      </p>
    </section>
  );
}
