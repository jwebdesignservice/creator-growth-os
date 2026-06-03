"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutGrid,
  ListTree,
  FolderClosed,
  NotebookPen,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/cn";

const TAB_KEYS = [
  "overview",
  "curriculum",
  "resources",
  "notes",
  "tasks",
] as const;
type Tab = (typeof TAB_KEYS)[number];

const SET_TAB_EVENT = "program-detail:set-tab";

/**
 * Imperatively switch the program detail tabs from elsewhere on the page
 * (e.g. the server-rendered hero's "View Resources" button). Mirrors the
 * command-palette's window-event pattern so we don't have to thread tab
 * state up into the server component.
 */
export function openProgramDetailTab(tab: Tab) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SET_TAB_EVENT, { detail: tab }));
}

type Props = {
  tasksCount?: number;
  overview: ReactNode;
  curriculum: ReactNode;
  resources: ReactNode;
  notes: ReactNode;
  tasks: ReactNode;
};

export function DetailTabs({
  tasksCount,
  overview,
  curriculum,
  resources,
  notes,
  tasks,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const rootRef = useRef<HTMLDivElement>(null);

  // Listen for external tab-switch requests (the hero "View Resources" CTA).
  // setState lives in an event callback, not the effect body, so this stays
  // within the React 19 set-state-in-effect rule.
  useEffect(() => {
    function onSetTab(e: Event) {
      const next = (e as CustomEvent).detail as Tab;
      if ((TAB_KEYS as readonly string[]).includes(next)) {
        setTab(next);
        rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener(SET_TAB_EVENT, onSetTab);
    return () => window.removeEventListener(SET_TAB_EVENT, onSetTab);
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "curriculum", label: "Curriculum", icon: ListTree },
    { key: "resources", label: "Resources", icon: FolderClosed },
    { key: "notes", label: "Notes", icon: NotebookPen },
    { key: "tasks", label: "Tasks", icon: CheckSquare, badge: tasksCount },
  ];

  return (
    <div ref={rootRef}>
      <div className="flex items-center gap-1 border-b border-ink-100 mb-6 flex-wrap">
        {tabs.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "h-11 px-4 inline-flex items-center gap-2 text-[13.5px] font-medium border-b-2 -mb-px cursor-pointer transition-colors",
                active
                  ? "text-rose-700 border-rose-500"
                  : "text-ink-500 hover:text-ink-900 border-transparent",
              )}
            >
              <Icon className="size-4" strokeWidth={1.8} />
              {t.label}
              {typeof t.badge === "number" && t.badge > 0 && (
                <span className="text-ink-500 font-normal">({t.badge})</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "overview" && overview}
      {tab === "curriculum" && curriculum}
      {tab === "resources" && resources}
      {tab === "notes" && notes}
      {tab === "tasks" && tasks}
    </div>
  );
}
