"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  Lock,
  Search,
  X,
  NotebookPen,
  Paperclip,
  LayoutGrid,
  Dumbbell,
  LayoutTemplate,
  ListChecks,
  ClipboardList,
  ArrowRight,
  Crown,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
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

const FILTERS: { key: Filter; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All Tutorials", icon: LayoutGrid },
  { key: "video", label: "Video Lessons", icon: Play },
  { key: "drill", label: "Creator Drills", icon: Dumbbell },
  { key: "template", label: "Templates", icon: LayoutTemplate },
  { key: "checklist", label: "Checklists", icon: ListChecks },
  { key: "assignment", label: "Assignments", icon: ClipboardList },
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
  const [query, setQuery] = useState("");
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

    // Free-text search across title, description, program and category.
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q) ||
          (t.programTitle ?? "").toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q),
      );
    }

    if (sort === "shortest") {
      rows = [...rows].sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else if (sort === "newest") {
      // No created_at in the row; reverse the natural order as a stand-in
      rows = [...rows].reverse();
    }
    return rows;
  }, [tutorials, filter, sort, categoryLabel, query]);

  // ── Incremental render (BATCH_SIZE at a time) ─────────────────────────────
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Ref guards against the observer re-firing while a batch is still loading.
  const loadingRef = useRef(false);

  // Snap back to the first batch whenever filter/sort/category/search changes.
  // Done by adjusting state during render (the React-recommended pattern)
  // rather than in an effect, so there's no extra commit / cascading render.
  const resetKey = `${filter}|${sort}|${categoryLabel}|${query.trim().toLowerCase()}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setVisibleCount(BATCH_SIZE);
  }

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
      {/* Header — title + count/sort (left) · type & category dropdowns +
          search (right), divided by a full-width line. */}
      <div className="flex items-center justify-between gap-3 flex-wrap min-h-[63px] border-b border-ink-100 lg:-mt-[var(--space-page-y)] lg:-mx-[var(--space-page-x)] lg:px-[var(--space-page-x)]">
        <div className="flex items-baseline gap-3 min-w-0 flex-wrap">
          <h2 className="text-h4 sm:text-[22px] text-ink-900">Tutorials</h2>
          <span className="text-[12.5px] text-ink-500 whitespace-nowrap">
            {visible.length} {visible.length === 1 ? "tutorial" : "tutorials"} ·{" "}
            <button
              type="button"
              onClick={() =>
                setSort((s) =>
                  s === "by_program"
                    ? "shortest"
                    : s === "shortest"
                      ? "newest"
                      : "by_program",
                )
              }
              className="text-ink-700 hover:text-rose-600 underline-offset-4 hover:underline cursor-pointer"
            >
              Sort:{" "}
              {sort === "by_program"
                ? "By program"
                : sort === "shortest"
                  ? "Shortest"
                  : "Newest"}
            </button>
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 flex-wrap">
          <FilterDropdown
            ariaLabel="Filter tutorials by type"
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            options={FILTERS.map((f) => ({
              value: f.key,
              label: f.label,
              icon: f.icon,
            }))}
          />
          <FilterDropdown
            ariaLabel="Filter tutorials by category"
            value={categoryLabel}
            onChange={(v) => setCategoryLabel(v)}
            options={categoryOptions.map((c) => ({
              value: c,
              label: c === "all" ? "All categories" : c,
            }))}
          />
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-ink-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tutorials…"
              aria-label="Search tutorials"
              className="w-[170px] sm:w-[230px] h-10 pl-9 pr-8 rounded-[12px] bg-white border border-ink-100 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 inline-flex items-center justify-center rounded-full text-ink-400 hover:text-ink-700 hover:bg-cream-200 transition-colors"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="card p-10 text-center text-[14px]">
          <p className="text-ink-500">
            {query.trim()
              ? `No tutorials match “${query.trim()}”.`
              : "No tutorials match that filter yet."}
          </p>
          {query.trim() && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-medium hover:bg-rose-100 transition-colors"
            >
              Clear search
            </button>
          )}
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

/* Per-type icon + the verb the footer CTA leads with. */
const TYPE_META: Record<string, { icon: LucideIcon; cta: string }> = {
  video:      { icon: Play,           cta: "Watch" },
  drill:      { icon: Dumbbell,       cta: "Start" },
  template:   { icon: LayoutTemplate, cta: "Open" },
  checklist:  { icon: ListChecks,     cta: "Open" },
  assignment: { icon: ClipboardList,  cta: "Start" },
};

/**
 * Tutorial card — same premium family as the Programs library card.
 *
 * Framed 16:9 thumbnail (inset ring, slow art zoom) with glassy overlay
 * pills: content type (top-left, with icon), Completed or gold Pro
 * (top-right), dark duration pill (bottom-right) and a full emerald strip
 * along the bottom edge once completed. The centre play/lock puck scales
 * up as the card lifts. Body: category eyebrow → two-line title →
 * description → cream stat chips (lesson № · resources · notes). A
 * hairline-divided footer pairs the source program with a pill CTA that
 * fills with its accent while the card is hovered.
 */
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

  const hasDuration = !!tutorial.duration && tutorial.duration !== "—";
  const type = TYPE_META[tutorial.contentType] ?? { icon: Play, cta: "Open" };
  const TypeIcon = type.icon;
  const ctaLabel = proLocked
    ? "Upgrade"
    : tutorial.completed
      ? tutorial.contentType === "video"
        ? "Rewatch"
        : "Review"
      : type.cta;

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-[20px] border border-ink-100 bg-gradient-to-b from-white to-cream-50 p-3",
        "shadow-[0_1px_2px_rgba(26,24,22,0.04),0_10px_28px_-18px_rgba(26,24,22,0.10)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-ink-200 hover:shadow-[0_2px_4px_rgba(26,24,22,0.05),0_26px_48px_-24px_rgba(26,24,22,0.38)]",
        "active:-translate-y-0 active:shadow-[0_1px_2px_rgba(26,24,22,0.05),0_12px_28px_-20px_rgba(26,24,22,0.25)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
      )}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div className="relative aspect-video overflow-hidden rounded-[13px] bg-gradient-to-br from-rose-100/60 via-cream-200 to-rose-100/30">
        {/* Cover image — gradient shows through when absent */}
        {tutorial.coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tutorial.coverUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
            {/* bottom scrim so the duration pill + strip read on photos */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/35 to-transparent"
            />
          </>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 75% at 78% 18%, rgba(255,255,255,0.5), transparent 62%)," +
                "radial-gradient(45% 60% at 12% 92%, rgba(225,118,132,0.12), transparent 60%)",
            }}
          />
        )}

        {/* inset hairline — seats the artwork in its frame */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[13px] ring-1 ring-inset ring-ink-900/[0.08]"
        />

        {/* Type pill (top-left) — glassy, reads on any artwork */}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-800 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.32)] ring-1 ring-ink-900/[0.06] backdrop-blur-sm">
          <TypeIcon className="size-3 text-rose-600" strokeWidth={2.5} />
          {prettyContentType(tutorial.contentType)}
        </span>

        {/* Completed / Pro pill (top-right) */}
        {proLocked ? (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.32)] ring-1 ring-amber-500/25 backdrop-blur-sm">
            <Crown className="size-3" strokeWidth={2.5} />
            Pro
          </span>
        ) : tutorial.completed ? (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-800 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.32)] ring-1 ring-ink-900/[0.06] backdrop-blur-sm">
            <CheckCircle2 className="size-3 text-success" strokeWidth={2.5} />
            Completed
          </span>
        ) : null}

        {/* Centre play / lock puck — lifts with the card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-[0_8px_24px_-6px_rgba(26,24,22,0.45)] ring-1 ring-ink-900/[0.06] backdrop-blur transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110">
            {proLocked ? (
              <Lock className="size-5" strokeWidth={2} />
            ) : (
              <Play className="ml-0.5 size-5" fill="currentColor" />
            )}
          </span>
        </div>

        {/* Duration pill (bottom-right, YouTube-style) */}
        {hasDuration && (
          <span
            className={cn(
              "absolute right-2.5 rounded-[7px] bg-ink-900/75 px-2 py-[3px] text-[11px] font-semibold tabular-nums tracking-[0.01em] text-white backdrop-blur-sm",
              tutorial.completed ? "bottom-3.5" : "bottom-2.5",
            )}
          >
            {tutorial.duration}
          </span>
        )}

        {/* Completed strip along the bottom edge (matches program cards) */}
        {tutorial.completed && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[3px] bg-success"
          />
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
        {/* Category eyebrow — which track this belongs to */}
        <span className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.13em] text-rose-600/85">
          {tutorial.categoryLabel}
        </span>

        <h3 className="text-[14.5px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink-900 line-clamp-2 transition-colors duration-200 group-hover:text-rose-700">
          {tutorial.title}
        </h3>

        {tutorial.description && (
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500 line-clamp-2">
            {clampSentences(tutorial.description, 2)}
          </p>
        )}

        {/* Stat chips — lesson № / resources / saved notes */}
        {(tutorial.moduleNumber ||
          tutorial.resourcesCount > 0 ||
          tutorial.notesCount > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {tutorial.moduleNumber && (
              <span className="inline-flex h-[26px] items-center gap-1 rounded-full bg-cream-100 px-2.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100/90">
                <Hash className="size-3 text-ink-400" strokeWidth={2} />
                Lesson {tutorial.moduleNumber}
              </span>
            )}
            {tutorial.resourcesCount > 0 && (
              <span
                className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-cream-100 px-2.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100/90"
                title={`${tutorial.resourcesCount} resource${tutorial.resourcesCount === 1 ? "" : "s"} attached`}
              >
                <Paperclip className="size-3 text-ink-400" strokeWidth={2} />
                {tutorial.resourcesCount}{" "}
                {tutorial.resourcesCount === 1 ? "resource" : "resources"}
              </span>
            )}
            {tutorial.notesCount > 0 && (
              <span
                className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-rose-50 px-2.5 text-[11.5px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200/70"
                title={`${tutorial.notesCount} note${tutorial.notesCount === 1 ? "" : "s"} saved`}
              >
                <NotebookPen className="size-3" strokeWidth={2} />
                {tutorial.notesCount} {tutorial.notesCount === 1 ? "note" : "notes"}
              </span>
            )}
          </div>
        )}

        {/* ── Footer — context · pill CTA ─────────────────────────── */}
        <div className="mt-auto pt-3.5">
          <div className="flex h-9 items-center gap-2.5 border-t border-ink-100/90 pt-3">
            {proLocked ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink-500">
                <Lock className="size-3.5 shrink-0 text-amber-600/80" strokeWidth={2} />
                <span className="truncate">Pro membership</span>
              </span>
            ) : tutorial.completed ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-success">
                <CheckCircle2 className="size-3.5" strokeWidth={2.2} />
                Completed
              </span>
            ) : (
              <span className="min-w-0 truncate text-[12px] font-medium text-ink-400">
                {tutorial.programTitle ?? prettyContentType(tutorial.contentType)}
              </span>
            )}
            <CtaPill
              tone={proLocked ? "rose" : tutorial.completed ? "emerald" : "rose"}
              className="ml-auto"
            >
              {ctaLabel}
            </CtaPill>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Footer CTA pill — tinted at rest, fills with its accent while the card is
   hovered, and nudges its arrow. Pure presentation; the card is the link. */
function CtaPill({
  tone,
  className,
  children,
}: {
  tone: "rose" | "emerald";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 ring-rose-200/80 group-hover:bg-rose-600 group-hover:text-white group-hover:ring-rose-600",
    emerald:
      "bg-emerald-50 text-emerald-700 ring-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold ring-1 ring-inset transition-colors duration-200",
        tones[tone],
        className,
      )}
    >
      {children}
      <ArrowRight
        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
    </span>
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

/**
 * Show at most `max` sentences of a description. If the text has more than
 * that, the kept sentences end with an ellipsis (so a long blurb reads as
 * "Sentence one. Sentence two. …").
 */
function clampSentences(text: string | null | undefined, max = 2): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:["'”’)\]]+)?/g);
  if (!sentences || sentences.length <= max) return trimmed;
  return sentences.slice(0, max).join(" ").replace(/\s+/g, " ").trim() + " …";
}
