"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  CheckCircle2,
  Lock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { TutorialRow } from "@/lib/programs/tutorial-queries";

// Render-side chunk size. Filters/sort apply to the full list; only this many
// cards are mounted at once. Maps 1:1 to a future Supabase range() page size.
const BATCH_SIZE = 9;

type Filter =
  | "all"
  | "video"
  | "drill"
  | "template"
  | "checklist"
  | "assignment";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All Tutorials" },
  { key: "video", label: "Video Lessons" },
  { key: "drill", label: "Creator Drills" },
  { key: "template", label: "Templates" },
  { key: "checklist", label: "Checklists" },
  { key: "assignment", label: "Assignments" },
];

type SortKey = "newest" | "shortest" | "by_program";

type Props = {
  tutorials: TutorialRow[];
  userPlan: "free" | "basic" | "pro";
  /** Default category to surface in the dropdown selector */
  defaultCategoryLabel?: string;
};

export function TutorialLibrary({
  tutorials,
  userPlan,
  defaultCategoryLabel,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("by_program");
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState<string | "all">(
    defaultCategoryLabel ?? "all",
  );

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    tutorials.forEach((t) => set.add(t.categoryLabel));
    return ["all", ...Array.from(set)];
  }, [tutorials]);

  const visible = useMemo(() => {
    let rows = tutorials;
    if (filter !== "all") rows = rows.filter((t) => t.contentType === filter);
    if (categoryLabel !== "all")
      rows = rows.filter((t) => t.categoryLabel === categoryLabel);

    if (sort === "shortest") {
      rows = [...rows].sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else if (sort === "newest") {
      // No created_at in the row; reverse the natural order as a stand-in
      rows = [...rows].reverse();
    }
    return rows;
  }, [tutorials, filter, sort, categoryLabel]);

  // ── Incremental render (BATCH_SIZE at a time) ─────────────────────────────
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Ref guards against the observer re-firing while a batch is still loading.
  const loadingRef = useRef(false);

  // Snap back to the first batch whenever the user changes filter/sort/category.
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filter, sort, categoryLabel]);

  const shown = useMemo(
    () => visible.slice(0, visibleCount),
    [visible, visibleCount],
  );
  const hasMore = visible.length > visibleCount;

  // IntersectionObserver — bumps visibleCount when the sentinel scrolls in.
  // 750 ms keeps the dot loader visible long enough to read as a deliberate
  // loading state. `visibleCount` is in the dep list so the observer is torn
  // down and recreated after each batch — `observe()` re-reports the current
  // intersection state on the new instance, which is what lets continuous
  // scrolling keep loading without requiring an up-then-down scroll cycle to
  // force a fresh transition event.
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          setIsLoadingMore(true);
          window.setTimeout(() => {
            setVisibleCount((c) => c + BATCH_SIZE);
            setIsLoadingMore(false);
            loadingRef.current = false;
          }, 750);
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <section className="space-y-5">
      {/* Filter pills + category selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13px] font-medium border transition-colors cursor-pointer",
                  active
                    ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                    : "bg-white border-ink-100 text-ink-700 hover:bg-cream-100",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
          >
            {categoryLabel === "all" ? "All categories" : categoryLabel}
            <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[180px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategoryLabel(c);
                    setSortOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-1.5 text-[13px] hover:bg-cream-100 cursor-pointer",
                    categoryLabel === c ? "text-rose-700 font-semibold" : "text-ink-700",
                  )}
                >
                  {c === "all" ? "All categories" : c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Library header + sort */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display text-[20px] sm:text-[22px] text-ink-900">
          Tutorial Library
        </h2>
        <div className="text-[12.5px] text-ink-500">
          {visible.length} {visible.length === 1 ? "tutorial" : "tutorials"} ·{" "}
          <button
            type="button"
            onClick={() =>
              setSort((s) =>
                s === "by_program" ? "shortest" : s === "shortest" ? "newest" : "by_program",
              )
            }
            className="text-ink-700 hover:text-rose-600 underline-offset-4 hover:underline cursor-pointer"
          >
            Sort: {sort === "by_program" ? "By program" : sort === "shortest" ? "Shortest" : "Newest"}
          </button>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="card p-10 text-center text-ink-500 text-[14px]">
          No tutorials match that filter yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shown.map((t) => (
              <TutorialCard key={t.slug} tutorial={t} userPlan={userPlan} />
            ))}
          </div>

          {/* Loader row — visible only while the next batch is queued. */}
          {isLoadingMore && <LoadingDots />}

          {/* Sentinel — observer watches this to trigger the next batch. */}
          {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}

          {!hasMore && (
            <div className="pt-2 text-center text-[12.5px] text-ink-400">
              You&apos;ve reached the end.
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Four rose-tinted dots that bounce in sequence. The lightest dot lifts first,
 * then each subsequent dot follows after 120 ms — reads as a brand-colored
 * wave moving left-to-right.
 */
function LoadingDots() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading more tutorials"
      className="flex items-center justify-center gap-2 py-6"
    >
      <span
        className="size-2.5 rounded-full bg-rose-300 animate-bounce motion-reduce:animate-none"
        style={{ animationDelay: "0ms", animationDuration: "900ms" }}
      />
      <span
        className="size-2.5 rounded-full bg-rose-400 animate-bounce motion-reduce:animate-none"
        style={{ animationDelay: "120ms", animationDuration: "900ms" }}
      />
      <span
        className="size-2.5 rounded-full bg-rose-500 animate-bounce motion-reduce:animate-none"
        style={{ animationDelay: "240ms", animationDuration: "900ms" }}
      />
      <span
        className="size-2.5 rounded-full bg-rose-600 animate-bounce motion-reduce:animate-none"
        style={{ animationDelay: "360ms", animationDuration: "900ms" }}
      />
    </div>
  );
}

function TutorialCard({
  tutorial,
  userPlan,
}: {
  tutorial: TutorialRow;
  userPlan: "free" | "basic" | "pro";
}) {
  const proLocked = tutorial.planAccess === "pro" && userPlan !== "pro";
  const href = proLocked
    ? "/billing?upgrade=pro"
    : `/tutorials/${tutorial.slug}`;

  return (
    <Link
      href={href}
      className="card overflow-hidden hover:shadow-card transition-shadow group flex flex-col"
    >
      <div className="relative h-[140px] bg-gradient-to-br from-rose-100/60 via-cream-200 to-rose-100/30 overflow-hidden">
        {/* Top pills */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="chip chip-rose">
            {tutorial.categoryLabel.split(" ")[0]}
          </span>
          <span className="chip bg-white/80 text-ink-700">
            {prettyContentType(tutorial.contentType)}
          </span>
        </div>

        {/* Center play / lock */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "size-12 rounded-full inline-flex items-center justify-center backdrop-blur",
              proLocked
                ? "bg-white/80 text-rose-600"
                : "bg-white/80 text-rose-600 group-hover:scale-105 transition-transform",
            )}
          >
            {proLocked ? (
              <Lock className="size-5" strokeWidth={2} />
            ) : (
              <Play className="size-5 ml-0.5" fill="currentColor" />
            )}
          </span>
        </div>

        {/* Completed badge */}
        {tutorial.completed && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 chip chip-success">
            <CheckCircle2 className="size-3" strokeWidth={3} />
            Completed
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[13.5px] font-semibold text-ink-900 leading-snug mb-2 line-clamp-2">
          {tutorial.title}
        </div>
        <div className="flex items-center gap-3 text-[11.5px] text-ink-500 mb-3">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="size-3" strokeWidth={2} />
            {tutorial.duration}
          </span>
          {tutorial.moduleNumber && (
            <span>Lesson {tutorial.moduleNumber}</span>
          )}
        </div>
        {proLocked ? (
          <div className="h-9 inline-flex items-center justify-center rounded-[10px] bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-medium">
            <Lock className="size-3.5 mr-1.5" strokeWidth={2} />
            Upgrade to Pro
          </div>
        ) : (
          <div className="text-[12px] text-rose-600 font-medium mt-auto">
            {tutorial.completed ? "Watch again" : "Start lesson →"}
          </div>
        )}
      </div>
    </Link>
  );
}

function prettyContentType(t: string) {
  if (t === "video") return "Video";
  if (t === "drill") return "Drill";
  if (t === "template") return "Template";
  if (t === "checklist") return "Checklist";
  if (t === "assignment") return "Assignment";
  return t;
}
