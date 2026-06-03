"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  SmilePlus,
  CornerUpLeft,
  ChevronDown,
  Play,
  CheckCircle2,
  ExternalLink,
  Link2,
  BarChart3,
  Pin,
  ShieldCheck,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  CommunityPost,
  CommunityReply,
  PostVotes,
  PostReaction,
  PostAttachment,
  PostPoll,
} from "@/lib/community/queries";
import {
  createReply,
  votePost,
  reactToPost,
  reactToReply,
  votePoll,
  setPostPinned,
} from "@/app/(app)/community/actions";
import { POST_REACTIONS } from "@/lib/community/reactions";

type Result = { ok: true } | { ok: false; error: string };

type PostWithReplies = CommunityPost & {
  replies: CommunityReply[];
  votes: PostVotes;
  reactions: PostReaction[];
  attachments: PostAttachment[];
  poll: PostPoll | null;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

type SortKey = "recent" | "popular" | "liked" | "commented";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "popular", label: "Most popular" },
  { value: "liked", label: "Most liked" },
  { value: "commented", label: "Most commented" },
];

function commentCount(p: PostWithReplies) {
  return Math.max(p.reply_count, p.replies.length);
}
function popularity(p: PostWithReplies) {
  const reactionTotal = p.reactions.reduce((s, r) => s + r.count, 0);
  return p.votes.likes + commentCount(p) + reactionTotal;
}

export function DiscussionList({
  posts,
  isAdmin = false,
}: {
  posts: PostWithReplies[];
  /** When true, show admin-only controls (pin / unpin). */
  isAdmin?: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [sortOpen, setSortOpen] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...posts];
    arr.sort((a, b) => {
      // Pinned threads always stay on top, whatever the sort.
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      switch (sort) {
        case "liked":
          return b.votes.likes - a.votes.likes;
        case "commented":
          return commentCount(b) - commentCount(a);
        case "popular":
          return popularity(b) - popularity(a);
        case "recent":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
    return arr;
  }, [posts, sort]);

  if (posts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MessageCircle className="size-8 text-ink-300 mx-auto mb-3" strokeWidth={1.6} />
        <h3 className="text-h4 text-ink-900 mb-1">No discussions yet</h3>
        <p className="text-[13px] text-ink-500">
          Start the first conversation — share a win, ask for feedback, or
          drop a question.
        </p>
      </div>
    );
  }

  const currentLabel =
    SORTS.find((s) => s.value === sort)?.label ?? "Most recent";

  return (
    <div className="space-y-3">
      {/* Sort filters */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] text-ink-500">
          {posts.length} {posts.length === 1 ? "discussion" : "discussions"}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
          >
            <ListFilter className="size-3.5 text-ink-500" strokeWidth={2} />
            {currentLabel}
            <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[190px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setSort(s.value);
                    setSortOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-1.5 text-[13px] hover:bg-cream-100 cursor-pointer",
                    sort === s.value
                      ? "text-rose-700 font-semibold"
                      : "text-ink-700",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {sorted.map((p) => (
          <DiscussionRow key={p.id} post={p} isAdmin={isAdmin} />
        ))}
      </ul>
    </div>
  );
}

function DiscussionRow({
  post,
  isAdmin,
}: {
  post: PostWithReplies;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const replies = post.replies;
  const replyCount = Math.max(post.reply_count, replies.length);
  const mediaAtts = post.attachments.filter((a) => a.type !== "link");
  const linkAtts = post.attachments.filter((a) => a.type === "link");
  const imageAtt = mediaAtts.find((a) => a.type === "image");
  const videoAtt = mediaAtts.find((a) => a.type === "video");
  const extraMedia = mediaAtts.length - 1;

  // Build the reply tree from parent_reply_id.
  const childrenByParent = new Map<string, CommunityReply[]>();
  for (const r of replies) {
    if (r.parent_reply_id) {
      const arr = childrenByParent.get(r.parent_reply_id);
      if (arr) arr.push(r);
      else childrenByParent.set(r.parent_reply_id, [r]);
    }
  }
  const topLevel = replies.filter((r) => !r.parent_reply_id);

  // Unique commenters for the avatar facepile.
  const commenters: { name: string; avatar: string | null }[] = [];
  const seenCommenters = new Set<string>();
  for (const r of replies) {
    if (!seenCommenters.has(r.author_name)) {
      seenCommenters.add(r.author_name);
      commenters.push({ name: r.author_name, avatar: r.author_avatar });
    }
  }

  return (
    <li className="card p-4 sm:p-5">
      {/* pinned badge */}
      {post.pinned && (
        <div className="inline-flex items-center gap-1.5 mb-3 h-6 px-2.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-semibold">
          <Pin className="size-3" strokeWidth={2.5} fill="currentColor" />
          Pinned
        </div>
      )}

      {/* author row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar name={post.author_name} src={post.author_avatar} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-ink-900 truncate">
              {post.author_name}
            </span>
            {post.author_is_admin && (
              <ShieldCheck
                className="size-3.5 text-rose-500 shrink-0"
                strokeWidth={2.2}
              />
            )}
          </div>
          <div className="text-[12px] text-ink-500 flex items-center gap-1.5 flex-wrap">
            <span>
              {timeAgo(post.created_at)} in {post.space_name}
            </span>
            {post.poll && (
              <span className="chip chip-rose inline-flex items-center gap-1 text-[10px]">
                <BarChart3 className="size-3" strokeWidth={2.5} />
                Poll
              </span>
            )}
          </div>
        </div>
        {isAdmin && (
          <PinButton
            postId={post.id}
            pinned={post.pinned}
            onError={setActionError}
          />
        )}
      </div>

      {/* title + body — clickable to open when collapsed; full when expanded */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full text-left"
        >
          <div className="flex gap-3 min-h-[60px]">
            <div className="flex-1 min-w-0">
              <h4 className="text-h5 text-ink-900 leading-snug mb-1 line-clamp-1">
                {post.title}
              </h4>
              <p className="text-[13.5px] text-ink-700 leading-relaxed line-clamp-2">
                {post.body}
              </p>
            </div>
            {(imageAtt || videoAtt) && (
              <div className="relative size-16 shrink-0">
                {imageAtt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageAtt.url}
                    alt=""
                    className="size-16 rounded-[10px] object-cover border border-ink-100"
                  />
                ) : (
                  <div className="size-16 rounded-[10px] bg-ink-900 text-white/90 flex items-center justify-center border border-ink-100">
                    <Play className="size-5 ml-0.5" fill="currentColor" />
                  </div>
                )}
                {extraMedia > 0 && (
                  <span className="absolute bottom-1 right-1 rounded-md bg-ink-900/80 px-1 text-[10px] font-semibold text-white leading-tight">
                    +{extraMedia}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>
      ) : (
        <div>
          <h4 className="text-h5 text-ink-900 leading-snug mb-1">
            {post.title}
          </h4>
          <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-line">
            {post.body}
          </p>
          <MediaGrid attachments={mediaAtts} />
          <LinkList links={linkAtts} />
        </div>
      )}

      {/* poll — visible whether the thread is collapsed or expanded */}
      {post.poll && (
        <PollBlock
          postId={post.id}
          poll={post.poll}
          onError={setActionError}
        />
      )}

      {/* action bar — like · dislike · reactions · comments · commenters */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <VoteButton
          postId={post.id}
          votes={post.votes}
          value={1}
          onError={setActionError}
        />
        <VoteButton
          postId={post.id}
          votes={post.votes}
          value={-1}
          onError={setActionError}
        />
        <ReactionBar
          reactions={post.reactions}
          onReact={(emoji) => reactToPost(post.id, emoji)}
          onError={setActionError}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-rose-600 transition-colors"
        >
          <MessageCircle className="size-[18px]" strokeWidth={2} />
          {replyCount}
        </button>
        {commenters.length > 0 && (
          <CommenterFacepile commenters={commenters} />
        )}

        <div className="ml-auto flex items-center gap-3">
          {!open && post.last_reply_at && (
            <span className="text-[11.5px] text-ink-400 hidden sm:inline">
              New comment {timeAgo(post.last_reply_at)}
            </span>
          )}
          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-500 hover:text-rose-600 transition-colors"
            >
              Collapse
              <ChevronDown className="size-4 rotate-180" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      {actionError && (
        <p className="mt-2 text-[12px] text-rose-700">{actionError}</p>
      )}

      {/* comments */}
      {open && (
        <div className="mt-4 space-y-4 border-t border-ink-100 pt-4">
          {topLevel.length > 0 && (
            <div className="space-y-4">
              {topLevel.map((r) => (
                <ReplyNode
                  key={r.id}
                  reply={r}
                  childrenByParent={childrenByParent}
                  postId={post.id}
                  depth={0}
                  onError={setActionError}
                />
              ))}
            </div>
          )}
          <ReplyComposer postId={post.id} placeholder="Write a comment…" />
        </div>
      )}
    </li>
  );
}

function PinButton({
  postId,
  pinned,
  onError,
}: {
  postId: string;
  pinned: boolean;
  onError: (msg: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    onError(null);
    startTransition(async () => {
      const res = await setPostPinned(postId, !pinned);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={pinned}
      title={pinned ? "Unpin thread" : "Pin to top"}
      className={cn(
        "size-8 rounded-lg inline-flex items-center justify-center transition-colors shrink-0",
        pinned
          ? "text-rose-600 bg-rose-50"
          : "text-ink-400 hover:text-rose-600 hover:bg-cream-100",
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" strokeWidth={2} />
      ) : (
        <Pin
          className="size-4"
          strokeWidth={2}
          fill={pinned ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}

/* ── Media (images + video) ─────────────────────────────────────────── */

function MediaGrid({ attachments }: { attachments: PostAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div
      className={cn(
        "mt-3 grid gap-2 sm:max-w-lg",
        attachments.length === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {attachments.map((a) =>
        a.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-[12px] overflow-hidden border border-ink-100"
          >
            <img src={a.url} alt={a.name} className="w-full h-44 object-cover" />
          </a>
        ) : (
          <video
            key={a.url}
            src={a.url}
            controls
            preload="metadata"
            className="w-full h-44 rounded-[12px] border border-ink-100 bg-black"
          />
        ),
      )}
    </div>
  );
}

/* ── Links + poll ───────────────────────────────────────────────────── */

function LinkList({ links }: { links: PostAttachment[] }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[10px] border border-ink-200 px-3 py-2 text-[13px] hover:border-rose-200 hover:bg-rose-50/40 transition-colors"
        >
          <Link2 className="size-4 text-rose-500 shrink-0" strokeWidth={2} />
          <span className="truncate text-ink-700">{l.name || l.url}</span>
          <ExternalLink
            className="size-3.5 text-ink-400 ml-auto shrink-0"
            strokeWidth={2}
          />
        </a>
      ))}
    </div>
  );
}

function PollBlock({
  postId,
  poll,
  onError,
}: {
  postId: string;
  poll: PostPoll;
  onError: (msg: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const vote = (optionId: string) => {
    onError(null);
    startTransition(async () => {
      const res = await votePoll(postId, optionId);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      router.refresh();
    });
  };

  const total = poll.totalVotes;
  return (
    <div className="mt-3 space-y-2">
      {poll.options.map((o) => {
        const pct = total > 0 ? Math.round((o.votes / total) * 100) : 0;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => vote(o.id)}
            disabled={pending}
            aria-pressed={o.mine}
            className={cn(
              "relative w-full overflow-hidden rounded-[10px] border px-3 py-2 text-left transition-colors disabled:opacity-70",
              o.mine ? "border-rose-300" : "border-ink-200 hover:border-rose-200",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 rounded-[10px] transition-[width]",
                o.mine ? "bg-rose-100" : "bg-cream-100",
              )}
              style={{ width: `${pct}%` }}
            />
            <span className="relative flex items-center justify-between gap-2 text-[13px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-ink-800 min-w-0">
                {o.mine && (
                  <CheckCircle2
                    className="size-3.5 text-rose-600 shrink-0"
                    strokeWidth={2.5}
                  />
                )}
                <span className="truncate">{o.text}</span>
              </span>
              <span className="text-ink-500 tabular-nums shrink-0">{pct}%</span>
            </span>
          </button>
        );
      })}
      <div className="text-[11.5px] text-ink-400">
        {total} {total === 1 ? "vote" : "votes"}
        {poll.voted ? " · tap to change your vote" : " · tap an option to vote"}
      </div>
    </div>
  );
}

/* ── Replies (nested) ───────────────────────────────────────────────── */

function ReplyNode({
  reply,
  childrenByParent,
  postId,
  depth,
  onError,
}: {
  reply: CommunityReply;
  childrenByParent: Map<string, CommunityReply[]>;
  postId: string;
  depth: number;
  onError: (msg: string | null) => void;
}) {
  const [replying, setReplying] = useState(false);
  const children = childrenByParent.get(reply.id) ?? [];

  return (
    <div className="flex items-start gap-2.5">
      <Avatar name={reply.author_name} src={reply.author_avatar} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
          <span className="text-[12.5px] font-semibold text-ink-900">
            {reply.author_name}
          </span>
          <span aria-hidden className="text-ink-400">·</span>
          <span>{timeAgo(reply.created_at)}</span>
        </div>
        <p className="text-[13px] text-ink-700 leading-relaxed mt-0.5 whitespace-pre-line">
          {reply.body}
        </p>

        {/* per-comment reactions + reply */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <ReactionBar
            reactions={reply.reactions}
            onReact={(emoji) => reactToReply(reply.id, emoji)}
            onError={onError}
            compact
          />
          <button
            type="button"
            onClick={() => setReplying((o) => !o)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-medium text-ink-500 hover:text-rose-600 hover:bg-cream-100 transition-colors"
          >
            <CornerUpLeft className="size-3.5" strokeWidth={2} />
            Reply
          </button>
        </div>

        {replying && (
          <div className="mt-2">
            <ReplyComposer
              postId={postId}
              parentReplyId={reply.id}
              autoFocus
              placeholder={`Reply to ${reply.author_name.split(" ")[0]}…`}
              onDone={() => setReplying(false)}
            />
          </div>
        )}

        {children.length > 0 && (
          <div
            className={cn(
              "mt-3 space-y-3",
              depth < 3 && "pl-3 border-l-2 border-rose-100",
            )}
          >
            {children.map((c) => (
              <ReplyNode
                key={c.id}
                reply={c}
                childrenByParent={childrenByParent}
                postId={postId}
                depth={depth + 1}
                onError={onError}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyComposer({
  postId,
  parentReplyId,
  placeholder = "Write a reply…",
  autoFocus = false,
  onDone,
}: {
  postId: string;
  parentReplyId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = () => {
    if (!reply.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createReply(postId, reply, parentReplyId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReply("");
      onDone?.();
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-start gap-2">
        <textarea
          autoFocus={autoFocus}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className="flex-1 rounded-[10px] border border-ink-200 bg-white p-3 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition resize-y"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || !reply.trim()}
          className="inline-flex items-center justify-center size-10 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white transition-colors shrink-0"
          aria-label="Send reply"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <Send className="size-4" strokeWidth={2} />
          )}
        </button>
      </div>
      {error && <div className="mt-2 text-[12px] text-rose-700">{error}</div>}
    </div>
  );
}

/* ── Votes + reactions ──────────────────────────────────────────────── */

function VoteButton({
  postId,
  votes,
  value,
  onError,
}: {
  postId: string;
  votes: PostVotes;
  value: 1 | -1;
  onError: (msg: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const active = votes.myVote === value;
  const count = value === 1 ? votes.likes : votes.dislikes;
  const Icon = value === 1 ? ThumbsUp : ThumbsDown;

  const cast = () => {
    onError(null);
    startTransition(async () => {
      const res = await votePost(postId, value);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={cast}
      disabled={pending}
      aria-pressed={active}
      title={value === 1 ? "Like" : "Dislike"}
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors disabled:opacity-50",
        active
          ? value === 1
            ? "text-rose-600"
            : "text-ink-900"
          : "text-ink-500 hover:text-rose-600",
      )}
    >
      <Icon
        className="size-[18px]"
        strokeWidth={2}
        fill={active ? "currentColor" : "none"}
      />
      {count}
    </button>
  );
}

function ReactionBar({
  reactions,
  onReact,
  onError,
  compact = false,
}: {
  reactions: PostReaction[];
  onReact: (emoji: string) => Promise<Result>;
  onError: (msg: string | null) => void;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const router = useRouter();

  const react = (emoji: string) => {
    onError(null);
    setPickerOpen(false);
    startTransition(async () => {
      const res = await onReact(emoji);
      if (!res.ok) {
        onError(res.error);
        return;
      }
      router.refresh();
    });
  };

  const reactedSet = new Set(
    reactions.filter((r) => r.reacted).map((r) => r.emoji),
  );
  const chips = reactions.filter((r) => r.count > 0);

  return (
    <span className="relative inline-flex items-center gap-1">
      {chips.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => react(r.emoji)}
          disabled={pending}
          aria-pressed={r.reacted}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50",
            r.reacted
              ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
              : "text-ink-600 hover:bg-cream-100",
          )}
        >
          <span className="text-[14px] leading-none">{r.emoji}</span>
          {r.count}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setPickerOpen((o) => !o)}
        disabled={pending}
        aria-label="Add a reaction"
        aria-expanded={pickerOpen}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-ink-400 hover:text-rose-600 hover:bg-cream-100 transition-colors disabled:opacity-50",
          compact ? "size-6" : "size-7",
        )}
      >
        <SmilePlus className={compact ? "size-3.5" : "size-4"} strokeWidth={2} />
      </button>

      {pickerOpen && (
        <span
          role="menu"
          className="absolute z-20 top-full left-0 mt-1 inline-flex items-center gap-0.5 rounded-[12px] border border-ink-100 bg-white p-1 shadow-lg"
        >
          {POST_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="menuitem"
              onClick={() => react(emoji)}
              aria-pressed={reactedSet.has(emoji)}
              className={cn(
                "size-8 rounded-lg text-[17px] leading-none transition-colors hover:bg-cream-100",
                reactedSet.has(emoji) && "bg-rose-50 ring-1 ring-rose-200",
              )}
            >
              {emoji}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

/* ── Misc ────────────────────────────────────────────────────────────── */

function CommenterFacepile({
  commenters,
}: {
  commenters: { name: string; avatar: string | null }[];
}) {
  const shown = commenters.slice(0, 5);
  const extra = commenters.length - shown.length;
  return (
    <span
      className="inline-flex items-center"
      title={`${commenters.length} ${commenters.length === 1 ? "commenter" : "commenters"}`}
    >
      <span className="flex -space-x-2">
        {shown.map((c, i) =>
          c.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={c.avatar}
              alt={c.name}
              className="size-6 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <span
              key={i}
              className="size-6 rounded-full bg-cream-200 text-ink-600 ring-2 ring-white inline-flex items-center justify-center text-[10px] font-semibold"
            >
              {c.name.charAt(0).toUpperCase()}
            </span>
          ),
        )}
      </span>
      {extra > 0 && (
        <span className="ml-1.5 text-[11.5px] text-ink-500">+{extra}</span>
      )}
    </span>
  );
}

function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src: string | null;
  size?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
