"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Link2,
  Clock,
} from "lucide-react";
import { deleteEvent } from "./actions";
import { eventKindLabel } from "@/lib/community/event-kinds";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

export type EventRowData = {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  starts_at: string;
  duration_min: number;
  joined_count: number;
  url: string | null;
  kind: string | null;
};

/** Per-type pill styling — mirrors the Programs "Access" column colour coding. */
const KIND_STYLES: Record<string, string> = {
  live: "bg-rose-100 text-rose-700 border border-rose-200",
  qa: "bg-[#E3EDF8] text-[#355F90] border border-[#C3D7EB]",
  workshop: "bg-[#EFE7F7] text-[#6B49A0] border border-[#D7C4EB]",
  call: "bg-[#E7F3EC] text-[#2F7D4F] border border-[#C5E4D1]",
  other: "bg-cream-100 text-ink-700 border border-cream-300",
};

function hostInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EventAdminRow({ event: e }: { event: EventRowData }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(ev: MouseEvent) {
      if (!menuRef.current?.contains(ev.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const date = new Date(e.starts_at);
  const isPast = date.getTime() < Date.now();
  const kindCls = KIND_STYLES[e.kind ?? "other"] ?? KIND_STYLES.other;

  const copyLink = () => {
    setMenuOpen(false);
    if (!e.url) return;
    navigator.clipboard
      .writeText(e.url)
      .then(() => toast("Join link copied.", "success"))
      .catch(() => toast("Couldn't copy the link.", "error"));
  };

  const remove = () => {
    setMenuOpen(false);
    if (!confirm(`Delete "${e.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteEvent(e.id);
      router.refresh();
    });
  };

  return (
    <tr
      className={cn(
        "border-t border-ink-100 even:bg-cream-100/60 hover:bg-rose-50/60 transition-colors",
        pending && "opacity-60",
      )}
    >
      {/* Date tile */}
      <td className="py-4 pl-6 lg:pl-8 pr-3">
        <div className="w-[78px] h-[52px] rounded-[10px] bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 border border-rose-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-rose-600 leading-none">
            {date.toLocaleString(undefined, { month: "short" })}
          </span>
          <span className="text-[18px] font-bold text-rose-700 leading-tight">
            {date.getDate()}
          </span>
        </div>
      </td>

      {/* Event name + description */}
      <td className="py-4 pr-3 min-w-0 max-w-[280px]">
        <div className="text-[14px] font-semibold text-ink-900 truncate">
          {e.title}
        </div>
        {e.description && (
          <div className="text-[12px] text-ink-500 truncate mt-0.5">
            {e.description}
          </div>
        )}
      </td>

      {/* Host */}
      <td className="py-4 pr-3">
        {e.host_name ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-7 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[10.5px] font-bold shrink-0">
              {hostInitials(e.host_name)}
            </span>
            <span className="text-[13px] text-ink-700 truncate">
              {e.host_name}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-ink-400">—</span>
        )}
      </td>

      {/* When */}
      <td className="py-4 pr-3">
        <span className="text-[13px] text-ink-700 whitespace-nowrap">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <span className="text-ink-400">
            {" · "}
            {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        </span>
      </td>

      {/* Duration */}
      <td className="py-4 pr-3">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700 tabular-nums whitespace-nowrap">
          <Clock className="size-3.5 text-ink-400" strokeWidth={2} />
          {e.duration_min} min
        </span>
      </td>

      {/* Status */}
      <td className="py-4 pr-3">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold",
            isPast
              ? "bg-ink-100 text-ink-600 border border-ink-200"
              : "bg-success-bg text-success border border-success/20",
          )}
        >
          {isPast ? "Past" : "Upcoming"}
        </span>
      </td>

      {/* Type */}
      <td className="py-4 pr-3">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold",
            kindCls,
          )}
        >
          {eventKindLabel(e.kind)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 pr-6 lg:pr-8 text-right">
        <div ref={menuRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open actions menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            disabled={pending}
            className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <MoreHorizontal className="size-4" strokeWidth={2} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
            >
              {e.url ? (
                <>
                  <Link
                    role="menuitem"
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100"
                  >
                    <ExternalLink className="size-3.5" strokeWidth={2} /> Open
                    join link
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={copyLink}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100 cursor-pointer"
                  >
                    <Link2 className="size-3.5" strokeWidth={2} /> Copy join link
                  </button>
                  <div aria-hidden className="h-px my-1 bg-ink-100" />
                </>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={remove}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="size-3.5" strokeWidth={2} /> Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
