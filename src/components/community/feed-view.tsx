"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ListFilter } from "lucide-react";
import { cn } from "@/lib/cn";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import {
  DiscussionList,
  SORTS,
  type PostWithReplies,
  type SortKey,
} from "./discussion-list";

/**
 * Right-panel feed: the composer, then a "Discussions" header with the sort
 * filter, then the threads. Holds the sort state and threads it down to
 * <DiscussionList>. (The section tabs live in the left panel now.)
 */
export function FeedView({
  composer,
  posts,
  isAdmin,
}: {
  composer: ReactNode;
  posts: PostWithReplies[];
  isAdmin: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const currentLabel = SORTS.find((s) => s.value === sort)?.label ?? "Most recent";

  return (
    <div className="space-y-4">
      {/* Header row: heading (left) + sort filter (right). WorkspaceHeader
          keeps the line leveled with the left-panel title across pages. */}
      <WorkspaceHeader title="Discussions">
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
      </WorkspaceHeader>

      {composer}

      <DiscussionList posts={posts} isAdmin={isAdmin} sort={sort} />
    </div>
  );
}
