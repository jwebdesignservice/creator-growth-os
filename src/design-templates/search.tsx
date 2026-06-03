/* Search ─────────────────────────────────────────────────────────────────
   Search-results surfaces — a grouped results dropdown with the matched
   term highlighted, a highlighted (keyboard-focused) row, a navigation
   hint footer, and a no-results empty state. The shape used by global
   search across the app.
   ───────────────────────────────────────────────────────────────────── */

import { Search, ArrowRight, FileText, GraduationCap, Users, SearchX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

function Hi({ children }: { children: React.ReactNode }) {
  return <mark className="bg-rose-100 text-rose-700 rounded-[3px] px-0.5">{children}</mark>;
}

function Group({
  title,
  icon: Icon,
  rows,
  activeFirst = false,
}: {
  title: string;
  icon: LucideIcon;
  rows: { t: React.ReactNode; s: string }[];
  activeFirst?: boolean;
}) {
  return (
    <div className="mb-1">
      <p className="px-4 py-1 text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">{title}</p>
      {rows.map((r, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            "flex w-[calc(100%-1rem)] items-center gap-3 mx-2 px-2.5 h-12 rounded-[10px] text-left cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200",
            activeFirst && i === 0 ? "bg-cream-100" : "hover:bg-cream-100",
          )}
        >
          <span className="size-8 rounded-[9px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
            <Icon className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-ink-900 truncate">{r.t}</div>
            <div className="text-[11.5px] text-ink-400 truncate">{r.s}</div>
          </div>
          <ArrowRight className={cn("size-3.5 shrink-0", activeFirst && i === 0 ? "text-rose-500" : "text-ink-300")} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}

export function SearchResults() {
  return (
    <div className="w-[480px] max-w-full rounded-[16px] border border-ink-100 bg-white shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-ink-100">
        <Search className="size-4 text-ink-400" strokeWidth={2} />
        <span className="flex-1 text-[14px] text-ink-900">hook</span>
        <span className="text-[11.5px] text-ink-400">8 results</span>
      </div>
      <div className="py-2">
        <Group
          title="Lessons"
          icon={GraduationCap}
          activeFirst
          rows={[
            { t: <>Writing <Hi>hook</Hi>s that stop the scroll</>, s: "Creator Launchpad · Module 2" },
            { t: <>The 3-second <Hi>hook</Hi> framework</>, s: "Creator Launchpad · Module 2" },
          ]}
        />
        <Group
          title="Tutorials"
          icon={FileText}
          rows={[{ t: <>10 <Hi>hook</Hi> templates for reels</>, s: "Tutorial · 6 min" }]}
        />
        <Group
          title="Members"
          icon={Users}
          rows={[{ t: <>@<Hi>hook</Hi>master</>, s: "Pro · joined Apr 2026" }]}
        />
      </div>
      {/* Keyboard hint footer */}
      <div className="flex items-center gap-3 px-4 h-10 border-t border-ink-100 bg-cream-50 text-[11px] text-ink-400">
        <span className="inline-flex items-center gap-1">
          <Kbd>↑</Kbd><Kbd>↓</Kbd> navigate
        </span>
        <span className="inline-flex items-center gap-1"><Kbd>↵</Kbd> open</span>
        <span className="inline-flex items-center gap-1 ml-auto"><Kbd>esc</Kbd> close</span>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[5px] border border-ink-200 bg-white text-[10.5px] font-semibold text-ink-500">
      {children}
    </kbd>
  );
}

export function EmptyResults() {
  return (
    <div className="w-[420px] max-w-full card p-10 flex flex-col items-center text-center">
      <span className="size-14 rounded-2xl bg-cream-200 text-ink-400 flex items-center justify-center mb-4">
        <SearchX className="size-7" strokeWidth={1.6} />
      </span>
      <h3 className="text-h5 text-ink-900">No results for “analytcs”</h3>
      <p className="text-[13px] text-ink-500 mt-1 leading-snug">
        Check your spelling or try a different term. Did you mean{" "}
        <a href="#" className="text-rose-600 font-medium hover:text-rose-700 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">analytics</a>?
      </p>
    </div>
  );
}
