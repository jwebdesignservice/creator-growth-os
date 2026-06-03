import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  listSpaces,
  listRecentPosts,
  listUpcomingEvents,
  listMemberSpotlight,
  listRepliesForPosts,
  getPostVotes,
  getPostReactions,
  getPostAttachments,
  type CommunityEvent,
  type PostVotes,
  type PostReaction,
  type PostAttachment,
} from "@/lib/community/queries";
import { DiscussionList } from "@/components/community/discussion-list";
import { InlineComposer } from "@/components/community/inline-composer";
import {
  CommunityTabs,
  type CommunityTab,
} from "@/components/community/community-tabs";
import { ChatTab } from "@/components/community/chat-tab";

export const metadata = { title: "Community · Creator Growth OS" };

const VALID_TABS: CommunityTab[] = ["feed", "chat", "events", "members"];

const NO_VOTES: PostVotes = { likes: 0, dislikes: 0, myVote: 0 };

type SearchParams = Promise<{ tab?: string; c?: string }>;

/**
 * Community hub — a single connected panel: the page title sits above one
 * card that holds the segmented tabs (header) and the active section's
 * content, divided by hairlines instead of separate floating boxes. Only one
 * mode (Feed / Chat / Events / Members) shows at a time.
 *
 * Front-end only: every section reuses the existing community queries.
 */
export default async function CommunityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { tab, c } = await searchParams;
  const active: CommunityTab = VALID_TABS.includes(tab as CommunityTab)
    ? (tab as CommunityTab)
    : "feed";

  const spaces = await listSpaces();
  const spaceOptions = spaces.map((s) => ({ slug: s.slug, name: s.name }));

  // Fetch only what the active tab needs. Chat fetches its own data inside
  // <ChatTab>, so the other tabs stay lean.
  const posts = active === "feed" ? await listRecentPosts(20) : [];
  // Pull each post's replies + like/dislike tallies so the feed can show the
  // conversation and votes inline.
  const repliesByPost =
    active === "feed" && posts.length
      ? await listRepliesForPosts(posts.map((p) => p.id), ctx.user.id)
      : new Map();
  const votesByPost: Map<string, PostVotes> =
    active === "feed" && posts.length
      ? await getPostVotes(posts.map((p) => p.id), ctx.user.id)
      : new Map();
  const reactionsByPost: Map<string, PostReaction[]> =
    active === "feed" && posts.length
      ? await getPostReactions(posts.map((p) => p.id), ctx.user.id)
      : new Map();
  const attachmentsByPost: Map<string, PostAttachment[]> =
    active === "feed" && posts.length
      ? await getPostAttachments(posts.map((p) => p.id))
      : new Map();
  const feedPosts = posts.map((p) => ({
    ...p,
    replies: repliesByPost.get(p.id) ?? [],
    votes: votesByPost.get(p.id) ?? NO_VOTES,
    reactions: reactionsByPost.get(p.id) ?? [],
    attachments: attachmentsByPost.get(p.id) ?? [],
  }));
  const events = active === "events" ? await listUpcomingEvents(12) : [];
  const members = active === "members" ? await listMemberSpotlight(12) : [];

  return (
    <PageShell>
      <div className="space-y-4">
        {/* Page title */}
        <header className="flex items-center gap-2.5">
          <span className="size-9 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Users className="size-[18px]" strokeWidth={2} />
          </span>
          <h1 className="text-h3 text-ink-900 leading-none">
            Creator Community
          </h1>
        </header>

        {/* Tabs — standalone navigation, separate from the content below */}
        <CommunityTabs active={active} />

        {/* Feed — composer + feed together in one panel */}
        {active === "feed" && (
          <div className="card overflow-hidden">
            <div className="border-b border-ink-100">
              <InlineComposer
                spaces={spaceOptions}
                userId={ctx.user.id}
                flat
              />
            </div>
            <DiscussionList posts={feedPosts} flat />
          </div>
        )}

        {/* Chat — full real-time chat (its own two-pane surface) */}
        {active === "chat" && (
          <ChatTab
            activeSlug={c}
            userId={ctx.user.id}
            userName={ctx.name}
            userAvatar={ctx.profile?.avatar_url ?? null}
          />
        )}

        {active === "events" && (
          <div className="card overflow-hidden">
            <EventsSection events={events} />
          </div>
        )}
        {active === "members" && (
          <div className="card overflow-hidden">
            <MembersSection members={members} />
          </div>
        )}
      </div>
    </PageShell>
  );
}

/* ─── Events tab (flat divided rows inside the panel) ─────────────────── */

function EventsSection({ events }: { events: CommunityEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No upcoming events"
        body="Live sessions, Q&As and workshops will show up here. Check back soon."
      />
    );
  }

  return (
    <ul>
      {events.map((e) => {
        const date = new Date(e.starts_at);
        return (
          <li
            key={e.id}
            className="p-4 sm:p-5 border-b border-ink-100 last:border-0 flex items-start gap-4"
          >
            <div className="flex flex-col items-center justify-center size-14 rounded-[14px] bg-rose-100 text-rose-700 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {date.toLocaleString(undefined, { month: "short" })}
              </span>
              <span className="text-[18px] font-bold leading-none">
                {date.getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-h5 text-ink-900 leading-snug">{e.title}</h3>
              {e.description && (
                <p className="text-[13px] text-ink-500 leading-snug mt-0.5 line-clamp-2">
                  {e.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2.5 flex-wrap text-[12px] text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" strokeWidth={2} />
                  {date.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span aria-hidden>·</span>
                <span>{e.host_name ?? "Coach"}</span>
                <span aria-hidden>·</span>
                <span>{e.joined_count} joined</span>
              </div>
            </div>
            {e.url && (
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors shrink-0 self-center"
              >
                Join
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Members tab (borderless tiles inside the panel) ─────────────────── */

function MembersSection({
  members,
}: {
  members: Awaited<ReturnType<typeof listMemberSpotlight>>;
}) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members to show yet"
        body="As creators join and complete onboarding, they'll appear here."
      />
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
        {members.map((m) => {
          const name = m.display_name ?? m.full_name ?? "Creator";
          return (
            <li
              key={m.id}
              className="p-3 flex items-center gap-3 rounded-[12px] hover:bg-cream-50 transition-colors"
            >
              {m.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.avatar_url}
                  alt={name}
                  className="size-11 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="size-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold text-[15px] shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink-900 truncate">
                  {name}
                </div>
                <div className="text-[12px] text-ink-500 capitalize truncate">
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

/* ─── Shared empty state (flat — sits inside the panel) ───────────────── */

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="p-10 text-center">
      <span className="inline-flex items-center justify-center size-12 rounded-full bg-rose-50 text-rose-500 mb-3">
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <h3 className="text-h4 text-ink-900 mb-1">{title}</h3>
      <p className="text-[13px] text-ink-500 max-w-sm mx-auto">{body}</p>
    </div>
  );
}
