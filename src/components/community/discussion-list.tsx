"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  SmilePlus,
  CornerUpLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  CommunityPost,
  CommunityReply,
  PostVotes,
  PostReaction,
  PostAttachment,
} from "@/lib/community/queries";
import {
  createReply,
  votePost,
  reactToPost,
  reactToReply,
} from "@/app/(app)/community/actions";
import { POST_REACTIONS } from "@/lib/community/reactions";

type Result = { ok: true } | { ok: false; error: string };

type PostWithReplies = CommunityPost & {
  replies: CommunityReply[];
  votes: PostVotes;
  reactions: PostReaction[];
  attachments: PostAttachment[];
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

export function DiscussionList({
  posts,
  flat = false,
}: {
  posts: PostWithReplies[];
  /** When true, render as divided rows inside a parent panel (no per-row card). */
  flat?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <div className={`p-8 text-center${flat ? "" : " card"}`}>
        <MessageCircle className="size-8 text-ink-300 mx-auto mb-3" strokeWidth={1.6} />
        <h3 className="text-h4 text-ink-900 mb-1">No discussions yet</h3>
        <p className="text-[13px] text-ink-500">
          Start the first conversation — share a win, ask for feedback, or
          drop a question.
        </p>
      </div>
    );
  }

  return (
    <ul className={flat ? "" : "space-y-3"}>
      {posts.map((p) => (
        <DiscussionRow key={p.id} post={p} flat={flat} />
      ))}
    </ul>
  );
}

function DiscussionRow({ post, flat = false }: { post: PostWithReplies; flat?: boolean }) {
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const replies = post.replies;
  const replyCount = Math.max(post.reply_count, replies.length);
  const repliers = Array.from(new Set(replies.map((r) => r.author_name)));

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

  return (
    <li className={flat ? "p-4 sm:p-5 border-b border-ink-100 last:border-0" : "card p-5"}>
      <div className="flex items-start gap-3">
        <Avatar name={post.author_name} src={post.author_avatar} />
        <div className="flex-1 min-w-0">
          {/* meta */}
          <div className="flex items-center gap-2 mb-1 flex-wrap text-[12px] text-ink-500">
            <span className="text-[13.5px] font-semibold text-ink-900">
              {post.author_name}
            </span>
            <span aria-hidden className="text-ink-400">·</span>
            <span>{post.space_name}</span>
            <span aria-hidden className="text-ink-400">·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          <h4 className="text-h5 text-ink-900 leading-snug mb-1">{post.title}</h4>
          <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-line">
            {post.body}
          </p>

          <MediaGrid attachments={post.attachments} />

          {/* action bar — likes/dislikes + reactions on the left, comments on the right */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <VoteButtons
              postId={post.id}
              votes={post.votes}
              onError={setActionError}
            />
            <span aria-hidden className="h-5 w-px bg-ink-100" />
            <ReactionBar
              reactions={post.reactions}
              onReact={(emoji) => reactToPost(post.id, emoji)}
              onError={setActionError}
            />

            <div className="flex items-center gap-2 ml-auto">
              {!open && repliers.length > 0 && <Facepile names={repliers} />}
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12.5px] font-medium text-ink-500 hover:text-rose-600 hover:bg-cream-100 transition-colors"
              >
                <MessageCircle className="size-4" strokeWidth={2} />
                {open
                  ? "Hide comments"
                  : `${replyCount} ${replyCount === 1 ? "Comment" : "Comments"}`}
              </button>
            </div>
          </div>
          {actionError && (
            <p className="mt-2 text-[12px] text-rose-700">{actionError}</p>
          )}

          {/* expanded thread */}
          {open && (
            <div className="mt-4 space-y-4">
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
        </div>
      </div>
    </li>
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

function VoteButtons({
  postId,
  votes,
  onError,
}: {
  postId: string;
  votes: PostVotes;
  onError: (msg: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const cast = (value: 1 | -1) => {
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
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => cast(1)}
        disabled={pending}
        aria-pressed={votes.myVote === 1}
        title="Like"
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12.5px] font-medium transition-colors disabled:opacity-50",
          votes.myVote === 1
            ? "bg-rose-50 text-rose-600"
            : "text-ink-500 hover:text-rose-600 hover:bg-cream-100",
        )}
      >
        <ThumbsUp
          className="size-4"
          strokeWidth={2}
          fill={votes.myVote === 1 ? "currentColor" : "none"}
        />
        {votes.likes}
      </button>
      <button
        type="button"
        onClick={() => cast(-1)}
        disabled={pending}
        aria-pressed={votes.myVote === -1}
        title="Dislike"
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12.5px] font-medium transition-colors disabled:opacity-50",
          votes.myVote === -1
            ? "bg-ink-100 text-ink-900"
            : "text-ink-500 hover:text-ink-900 hover:bg-cream-100",
        )}
      >
        <ThumbsDown
          className="size-4"
          strokeWidth={2}
          fill={votes.myVote === -1 ? "currentColor" : "none"}
        />
        {votes.dislikes}
      </button>
    </span>
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

function Facepile({ names }: { names: string[] }) {
  const shown = names.slice(0, 3);
  const extra = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      <span className="flex -space-x-2">
        {shown.map((n, i) => (
          <span
            key={i}
            className="size-6 rounded-full bg-cream-200 text-ink-600 ring-2 ring-white inline-flex items-center justify-center text-[10px] font-semibold"
          >
            {n.charAt(0).toUpperCase()}
          </span>
        ))}
      </span>
      {extra > 0 && <span className="ml-1.5 text-[11.5px] text-ink-500">+{extra}</span>}
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
