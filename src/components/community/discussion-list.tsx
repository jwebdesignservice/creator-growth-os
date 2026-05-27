"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { CommunityPost } from "@/lib/community/queries";
import { createReply } from "@/app/(app)/community/actions";

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

export function DiscussionList({ posts }: { posts: CommunityPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MessageCircle className="size-8 text-ink-300 mx-auto mb-3" strokeWidth={1.6} />
        <h3 className="text-h4 text-ink-900 mb-1">
          No discussions yet
        </h3>
        <p className="text-[13px] text-ink-500">
          Start the first conversation — share a win, ask for feedback, or
          drop a question.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <DiscussionRow key={p.id} post={p} />
      ))}
    </ul>
  );
}

function DiscussionRow({ post }: { post: CommunityPost }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!reply.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createReply(post.id, reply);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReply("");
      setOpen(false);
    });
  };

  return (
    <li className="card p-5">
      <div className="flex items-start gap-3">
        <Avatar name={post.author_name} src={post.author_avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-[13.5px] font-medium text-ink-900">
              {post.author_name}
            </span>
            <span className="text-[11.5px] text-ink-400">·</span>
            <span className="text-[11.5px] text-ink-500">{post.space_name}</span>
            <span className="text-[11.5px] text-ink-400">·</span>
            <span className="text-[11.5px] text-ink-500">
              {timeAgo(post.created_at)}
            </span>
          </div>
          <h4 className="text-h5 text-ink-900 leading-snug mb-1">
            {post.title}
          </h4>
          <p className="text-[13.5px] text-ink-700 leading-relaxed line-clamp-3 mb-3">
            {post.body}
          </p>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-rose-600 transition-colors"
          >
            <MessageCircle className="size-3.5" strokeWidth={2} />
            {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
          </button>

          {open && (
            <div className="mt-3 flex items-start gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                placeholder="Write a reply…"
                className="flex-1 rounded-[10px] border border-ink-200 bg-white p-3 text-[13px] text-ink-900 focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={submit}
                disabled={pending || !reply.trim()}
                className="inline-flex items-center justify-center size-10 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white transition-colors shrink-0"
                aria-label="Send reply"
              >
                <Send className="size-4" strokeWidth={2} />
              </button>
            </div>
          )}
          {error && (
            <div className="mt-2 text-[12px] text-rose-700">{error}</div>
          )}
        </div>
      </div>
    </li>
  );
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initial = name.charAt(0).toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className="size-10 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold text-[14px] shrink-0">
      {initial}
    </div>
  );
}
