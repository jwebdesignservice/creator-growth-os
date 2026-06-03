/* Empty states ────────────────────────────────────────────────────────────────
   Context-specific empty states — the "nothing here yet" surfaces across the
   product (no programs, no scheduled posts, no search results). Distinct from
   the single generic `feedback` empty state: these carry context + the right
   CTA per surface. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { GraduationCap, CalendarPlus, SearchX, Plus, type LucideIcon } from "lucide-react";

function EmptyShell({
  icon: Icon,
  tone,
  title,
  body,
  cta,
  ctaIcon: CtaIcon,
  ghost,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  body: string;
  cta?: string;
  ctaIcon?: LucideIcon;
  ghost?: boolean;
}) {
  return (
    <div className="w-[380px] max-w-full rounded-[18px] border border-dashed border-ink-200 bg-cream-50/50 px-8 py-10 text-center">
      <span className={`mx-auto size-14 rounded-[16px] inline-flex items-center justify-center mb-4 ${tone}`}>
        <Icon className="size-7" strokeWidth={1.7} />
      </span>
      <h3 className="text-[15px] font-bold text-ink-900">{title}</h3>
      <p className="text-[13px] text-ink-500 mt-1.5 max-w-[34ch] mx-auto leading-relaxed">{body}</p>
      {cta && (
        <button
          type="button"
          className={
            "mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-[10px] text-[13px] font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
            (ghost
              ? "bg-white border border-ink-200 text-ink-700 hover:bg-cream-100 active:bg-cream-200 focus-visible:ring-rose-200"
              : "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-300")
          }
        >
          {CtaIcon && <CtaIcon className="size-4" strokeWidth={2.2} />}
          {cta}
        </button>
      )}
    </div>
  );
}

/* 1 · No programs yet — the first-run create prompt. */
export function NoProgramsEmpty() {
  return (
    <EmptyShell
      icon={GraduationCap}
      tone="bg-rose-100 text-rose-600"
      title="No programs yet"
      body="Build your first program to start teaching and earning from your audience."
      cta="Create a program"
      ctaIcon={Plus}
    />
  );
}

/* 2 · No scheduled posts — planning prompt. */
export function NoPostsEmpty() {
  return (
    <EmptyShell
      icon={CalendarPlus}
      tone="bg-indigo-100 text-indigo-600"
      title="Nothing scheduled"
      body="Your content calendar is clear. Plan your week so you never miss a posting day."
      cta="Plan a post"
      ctaIcon={Plus}
    />
  );
}

/* 3 · No search results — recovery prompt. */
export function NoResultsEmpty() {
  return (
    <EmptyShell
      icon={SearchX}
      tone="bg-cream-200 text-ink-500"
      title="No matches for “growth”"
      body="Try a different keyword, or clear your filters to see everything."
      cta="Clear filters"
      ghost
    />
  );
}
