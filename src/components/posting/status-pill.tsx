"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  CheckCircle2,
  Lightbulb,
  PenLine,
  Scissors,
  Send,
  Check,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { ContentStatus } from "@/lib/posting/queries";
import { updateItemStatus } from "@/app/(app)/posting/actions";
import { cn } from "@/lib/cn";

/* A clickable status pill — click to open a dropdown and move the post
   through the pipeline (idea → … → reviewed). Mirrors the table's colored
   pill styling and writes via the same updateItemStatus action. */

const FLOW: ContentStatus[] = [
  "idea",
  "planned",
  "scripted",
  "filmed",
  "edited",
  "posted",
  "reviewed",
];

const META: Record<ContentStatus, { label: string; cls: string; icon: LucideIcon }> = {
  idea: { label: "Idea", cls: "bg-cream-100 text-ink-600 border-ink-200", icon: Lightbulb },
  planned: { label: "Planned", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  scripted: { label: "Scripted", cls: "bg-sky-50 text-sky-700 border-sky-200", icon: PenLine },
  filmed: { label: "Filmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  edited: { label: "Edited", cls: "bg-violet-50 text-violet-700 border-violet-200", icon: Scissors },
  posted: { label: "Posted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Send },
  reviewed: { label: "Reviewed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

const MENU_W = 180;
const MENU_H = 300;

export function StatusPill({
  itemId,
  status,
  readOnly = false,
}: {
  itemId: string;
  status: ContentStatus;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Place the menu in viewport coords (it renders in a body portal, so it's
  // never clipped by the table's overflow). Flips above the pill when there's
  // not enough room below.
  const place = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const up = spaceBelow < MENU_H && r.top > spaceBelow;
    let left = r.left;
    if (left + MENU_W > window.innerWidth - 8) left = window.innerWidth - 8 - MENU_W;
    if (left < 8) left = 8;
    setPos({ top: up ? r.top - 4 : r.bottom + 4, left, up });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    // Keep the menu glued to the pill as the page / table scrolls or resizes.
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  const m = META[status] ?? META.planned;
  const Icon = m.icon;

  // Read-only (e.g. demo rows with no real DB id) — render the pill, no dropdown.
  if (readOnly) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full border text-[11px] font-semibold whitespace-nowrap",
          m.cls,
        )}
      >
        <Icon className="size-3" strokeWidth={2.4} />
        {m.label}
      </span>
    );
  }

  const choose = (next: ContentStatus) =>
    startTransition(async () => {
      await updateItemStatus(itemId, next);
      setOpen(false);
    });

  return (
    <div ref={rootRef} className="relative inline-block" draggable={false}>
      <button
        type="button"
        draggable={false}
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Change status"
        className={cn(
          "inline-flex items-center gap-1 h-[22px] pl-2 pr-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-60",
          m.cls,
        )}
      >
        <Icon className="size-3" strokeWidth={2.4} />
        {m.label}
        <ChevronDown className="size-3 opacity-70" strokeWidth={2.4} />
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: MENU_W,
              transform: pos.up ? "translateY(-100%)" : undefined,
            }}
            className="z-[60] max-h-[320px] overflow-y-auto rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5"
          >
            <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-ink-400 font-semibold">
              Set status
            </div>
            {FLOW.map((s) => {
              const sm = META[s];
              const SIcon = sm.icon;
              const current = s === status;
              return (
                <button
                  key={s}
                  type="button"
                  draggable={false}
                  onClick={() => {
                    if (!current) choose(s);
                  }}
                  disabled={pending}
                  role="menuitem"
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-[12.5px] hover:bg-cream-100 transition-colors",
                    current ? "text-rose-600 font-semibold" : "text-ink-700",
                  )}
                >
                  <SIcon className="size-3.5 shrink-0" strokeWidth={2} />
                  {sm.label}
                  {current && <Check className="size-3.5 ml-auto" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
