import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, CalendarDays, Star, MessageSquare, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  listSpaces,
  listRecentPosts,
  listUpcomingEvents,
  listMemberSpotlight,
} from "@/lib/community/queries";
import { SpaceCard } from "@/components/community/space-card";
import { DiscussionList } from "@/components/community/discussion-list";
import { NewPostForm } from "@/components/community/new-post-form";

export const metadata = { title: "Community · Creator Growth OS" };

const HUES = ["rose", "cream", "warm"] as const;

export default async function CommunityPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const [spaces, posts, events, spotlight] = await Promise.all([
    listSpaces(),
    listRecentPosts(),
    listUpcomingEvents(),
    listMemberSpotlight(),
  ]);

  const firstName = ctx.name.split(" ")[0];
  const featured = spaces.find((s) => s.featured) ?? spaces[0];
  const spaceOptions = spaces.map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <PageShell>
      <div className="space-y-7 max-w-[1600px] mx-auto">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
              <Sparkles className="size-4" strokeWidth={2} />
              Welcome to the Community, {firstName}
            </div>
            <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-1">
              Creator Community
            </h1>
            <p className="text-ink-500 text-[14px]">
              Connect with creators in your category, join accountability spaces
              and ask questions.
            </p>
          </div>
          <NewPostForm spaces={spaceOptions} />
        </header>

        {featured && <FeaturedSpace space={featured} />}

        <section>
          <h2 className="text-[16px] font-semibold text-ink-900 mb-3">
            Category spaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {spaces.map((s, i) => (
              <SpaceCard
                key={s.id}
                slug={s.slug}
                name={s.name}
                description={s.description}
                member_count={s.member_count}
                featured={s.featured}
                hue={HUES[i % HUES.length]}
              />
            ))}
          </div>
        </section>

        <section>
          <Link
            href="/community/chat"
            className="relative block overflow-hidden rounded-[24px] bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 border-2 border-rose-200 hover:border-rose-300 hover:shadow-lg transition-all group"
          >
            {/* Decorative floating chat bubbles */}
            <div className="absolute right-8 top-6 size-12 rounded-[14px] bg-white shadow-md rotate-[8deg] flex items-center justify-center opacity-90 hidden md:flex">
              <MessageSquare className="size-5 text-rose-500" strokeWidth={2} />
            </div>
            <div className="absolute right-28 top-16 size-10 rounded-[12px] bg-rose-300/30 rotate-[-12deg] hidden md:block" />
            <div className="absolute right-16 bottom-6 size-8 rounded-[10px] bg-white/80 shadow-sm rotate-[15deg] hidden md:block" />

            <div className="relative p-7 lg:p-9 grid lg:grid-cols-[1fr_auto] items-center gap-6">
              <div className="flex items-start gap-5">
                <div className="size-16 rounded-[18px] bg-rose-600 flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="size-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live now
                    </span>
                  </div>
                  <h2 className="font-display text-[26px] lg:text-[32px] text-ink-900 leading-tight mb-1">
                    Community Chat
                  </h2>
                  <p className="text-[14px] text-ink-700 max-w-xl">
                    Talk to other creators, ask questions, and get real-time answers
                    from coaches.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 h-12 px-5 rounded-[14px] bg-rose-600 group-hover:bg-rose-700 text-white text-[14.5px] font-semibold shadow-sm transition-colors">
                  Join chat
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          </Link>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <div>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">
              Recent discussions
            </h2>
            <DiscussionList posts={posts} />
          </div>

          <div className="space-y-5">
            <UpcomingEvents events={events} />
            <MemberSpotlight members={spotlight} />
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function FeaturedSpace({
  space,
}: {
  space: {
    slug: string;
    name: string;
    description: string | null;
    member_count: number;
  };
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-rose-50/60 border border-rose-100 p-6 lg:p-8">
      <div className="relative z-10 grid lg:grid-cols-[1fr_auto] items-center gap-6">
        <div>
          <div className="text-rose-600 font-medium text-[12px] uppercase tracking-wide mb-2">
            Featured Circle
          </div>
          <h2 className="font-display text-[28px] lg:text-[32px] text-ink-900 leading-tight mb-2">
            {space.name}
          </h2>
          <p className="text-[14px] text-ink-700 max-w-2xl">
            {space.description}
          </p>
          <div className="text-[12.5px] text-ink-500 mt-3">
            {space.member_count.toLocaleString()} active members
          </div>
        </div>
        <Link
          href={`/community?space=${space.slug}`}
          className="inline-flex items-center justify-center h-12 px-6 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14.5px] font-semibold transition-colors shadow-sm shrink-0"
        >
          Enter circle
        </Link>
      </div>
    </section>
  );
}

function UpcomingEvents({
  events,
}: {
  events: Awaited<ReturnType<typeof listUpcomingEvents>>;
}) {
  return (
    <div className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900">
          Upcoming events
        </h3>
        <CalendarDays className="size-4 text-ink-400" strokeWidth={2} />
      </header>
      {events.length === 0 ? (
        <p className="text-[13px] text-ink-500">No events scheduled yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const date = new Date(e.starts_at);
            return (
              <li key={e.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center size-12 rounded-[10px] bg-rose-100 text-rose-700 shrink-0">
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    {date.toLocaleString(undefined, { month: "short" })}
                  </span>
                  <span className="text-[15px] font-semibold leading-none">
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink-900 line-clamp-1">
                    {e.title}
                  </div>
                  <div className="text-[11.5px] text-ink-500">
                    {date.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    · {e.host_name ?? "Coach"} · {e.joined_count} joined
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MemberSpotlight({
  members,
}: {
  members: Awaited<ReturnType<typeof listMemberSpotlight>>;
}) {
  if (members.length === 0) return null;
  return (
    <div className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900">
          Member spotlight
        </h3>
        <Star className="size-4 text-ink-400" strokeWidth={2} />
      </header>
      <ul className="space-y-3">
        {members.map((m) => {
          const name = m.display_name ?? m.full_name ?? "Creator";
          const initial = name.charAt(0).toUpperCase();
          return (
            <li key={m.id} className="flex items-center gap-3">
              {m.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.avatar_url}
                  alt={name}
                  className="size-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold text-[14px] shrink-0">
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900 truncate">
                  {name}
                </div>
                <div className="text-[11.5px] text-ink-500 capitalize">
                  {m.category ?? "creator"}
                  {m.primary_platform ? ` · ${m.primary_platform}` : ""}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
