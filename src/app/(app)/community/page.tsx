import { redirect } from "next/navigation";
import {
  Users,
  MessageSquare,
  Hash,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import {
  listSpaces,
  listRecentPosts,
  listAllEvents,
  listMemberSpotlight,
  listRepliesForPosts,
  getPostVotes,
  getPostReactions,
  getPostAttachments,
  getPostPolls,
  type PostVotes,
  type PostReaction,
  type PostAttachment,
  type PostPoll,
} from "@/lib/community/queries";
import { FeedView } from "@/components/community/feed-view";
import { InlineComposer } from "@/components/community/inline-composer";
import { ChatTab } from "@/components/community/chat-tab";
import { EventsExplorer } from "@/components/community/events-explorer";
import {
  WorkspaceShell,
  WorkspaceHeader,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";

export const metadata = { title: "Community" };

type CommunityTab = "feed" | "chat" | "events" | "members";

const VALID_TABS: CommunityTab[] = ["feed", "chat", "events", "members"];

const COMMUNITY_TABS: WorkspaceTab[] = [
  { key: "feed", label: "Feed", icon: MessageSquare, href: "/community" },
  { key: "chat", label: "Chat", icon: Hash, href: "/community?tab=chat" },
  {
    key: "events",
    label: "Events",
    icon: CalendarDays,
    href: "/community?tab=events",
  },
  { key: "members", label: "Members", icon: Users, href: "/community?tab=members" },
];

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

  // Fetch only what the active tab needs. Chat fetches its own data inside
  // <ChatTab>, so the other tabs stay lean. Independent queries run in two
  // parallel batches instead of a serial waterfall.
  const supabase = await createClient();
  const [spaces, posts, isAdminRes] = await Promise.all([
    listSpaces(),
    active === "feed" ? listRecentPosts(20) : Promise.resolve([]),
    // Admins can pin threads — surface the controls only to them.
    active === "feed" ? supabase.rpc("is_admin") : Promise.resolve(null),
  ]);
  const spaceOptions = spaces.map((s) => ({ slug: s.slug, name: s.name }));
  const isAdmin = isAdminRes?.data === true;

  // Pull each post's replies + like/dislike tallies so the feed can show the
  // conversation and votes inline. Each helper early-returns an empty Map with
  // zero network calls when postIds is empty (non-feed tabs / empty feed).
  const postIds = posts.map((p) => p.id);
  const [
    repliesByPost,
    votesByPost,
    reactionsByPost,
    attachmentsByPost,
    pollsByPost,
  ]: [
    Awaited<ReturnType<typeof listRepliesForPosts>>,
    Map<string, PostVotes>,
    Map<string, PostReaction[]>,
    Map<string, PostAttachment[]>,
    Map<string, PostPoll>,
  ] = await Promise.all([
    listRepliesForPosts(postIds, ctx.user.id),
    getPostVotes(postIds, ctx.user.id),
    getPostReactions(postIds, ctx.user.id),
    getPostAttachments(postIds),
    getPostPolls(postIds, ctx.user.id),
  ]);
  const feedPosts = posts.map((p) => ({
    ...p,
    replies: repliesByPost.get(p.id) ?? [],
    votes: votesByPost.get(p.id) ?? NO_VOTES,
    reactions: reactionsByPost.get(p.id) ?? [],
    attachments: attachmentsByPost.get(p.id) ?? [],
    poll: pollsByPost.get(p.id) ?? null,
  }));
  const events = active === "events" ? await listAllEvents(100) : [];
  const members = active === "members" ? await listMemberSpotlight(12) : [];

  return (
    <PageShell>
      <WorkspaceShell
        title="Creator Community"
        icon={Users}
        tabs={COMMUNITY_TABS}
        activeKey={active}
        flush={active === "chat"}
      >
        {active === "feed" && (
          <FeedView
            composer={
              <div className="card overflow-hidden">
                <InlineComposer
                  spaces={spaceOptions}
                  userId={ctx.user.id}
                  flat
                />
              </div>
            }
            posts={feedPosts}
            isAdmin={isAdmin}
          />
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

        {active === "events" && <EventsExplorer events={events} />}

        {active === "members" && (
          <div className="space-y-4">
            <WorkspaceHeader title="Members" />
            <div className="card overflow-hidden">
              <MembersSection members={members} />
            </div>
          </div>
        )}
      </WorkspaceShell>
    </PageShell>
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
