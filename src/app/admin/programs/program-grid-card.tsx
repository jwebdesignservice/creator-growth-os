"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Users,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  CalendarDays,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import {
  toggleProgramPublished,
  deleteProgram,
  archiveProgram,
} from "./actions";
import { cn } from "@/lib/cn";
import type { ProgramRowData } from "./program-row";

const ACCESS_STYLES: Record<
  ProgramRowData["plan_access"],
  { label: string; cls: string }
> = {
  free: {
    label: "Free",
    cls: "bg-cream-100 text-ink-700 border border-cream-300",
  },
  basic: {
    label: "Basic",
    cls: "bg-[#E3EDF8] text-[#355F90] border border-[#C3D7EB]",
  },
  pro: {
    label: "Pro",
    cls: "bg-[#EFE7F7] text-[#6B49A0] border border-[#D7C4EB]",
  },
};

function ownerInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCreated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Card-shaped variant of ProgramRow used when the admin picks "Grid" in
 * the toolbar View popover. Same actions (publish/delete) via the same
 * kebab menu pattern.
 */
export function ProgramGridCard({
  program,
  ownerName,
}: {
  program: ProgramRowData;
  ownerName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const togglePublish = () => {
    setMenuOpen(false);
    startTransition(async () => {
      await toggleProgramPublished(program.id, !program.published);
    });
  };

  const toggleArchive = () => {
    setMenuOpen(false);
    startTransition(async () => {
      await archiveProgram(program.id, !program.archived);
    });
  };

  const remove = () => {
    setMenuOpen(false);
    if (
      !confirm(
        `Delete program "${program.title}"? Existing lessons will lose their program link.`,
      )
    )
      return;
    startTransition(async () => {
      await deleteProgram(program.id);
    });
  };

  const access = ACCESS_STYLES[program.plan_access];

  return (
    <div
      className={cn(
        "card overflow-hidden flex flex-col hover:shadow-card transition-shadow",
        pending && "opacity-60",
      )}
    >
      {/* Thumbnail — opens the admin Program Setup Guide */}
      <Link
        href={`/admin/programs/${program.id}`}
        className="relative block aspect-[16/9] bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 overflow-hidden"
        aria-label={`Open ${program.title}`}
      >
        {program.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={program.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold shadow-sm",
            program.published
              ? "bg-success-bg text-success border border-success/20"
              : "bg-white text-ink-700 border border-ink-200",
          )}
        >
          {program.published ? "Published" : "Draft"}
        </span>
        <span
          className={cn(
            "absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold shadow-sm",
            access.cls,
          )}
        >
          {access.label}
        </span>
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/admin/programs/${program.id}`}
            className="text-[15px] font-bold text-ink-900 leading-snug hover:text-rose-700 transition-colors line-clamp-2"
          >
            {program.title}
          </Link>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open actions menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={pending}
              className="size-8 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
              >
                <Link
                  role="menuitem"
                  href={`/admin/programs/${program.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100"
                >
                  <Pencil className="size-3.5" strokeWidth={2} /> Edit
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={togglePublish}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100 cursor-pointer"
                >
                  {program.published ? (
                    <>
                      <EyeOff className="size-3.5" strokeWidth={2} /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" strokeWidth={2} /> Publish
                    </>
                  )}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={toggleArchive}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100 cursor-pointer"
                >
                  {program.archived ? (
                    <>
                      <ArchiveRestore className="size-3.5" strokeWidth={2} />{" "}
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="size-3.5" strokeWidth={2} /> Archive
                    </>
                  )}
                </button>
                <Link
                  role="menuitem"
                  href={`/programs/${program.slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100"
                >
                  <ExternalLink className="size-3.5" strokeWidth={2} /> View
                  public page
                </Link>
                <div aria-hidden className="h-px my-1 bg-ink-100" />
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
        </div>

        {/* Description */}
        {program.description && (
          <p className="text-[12.5px] text-ink-500 leading-snug line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Owner + stats footer */}
        <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-6 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[9.5px] font-bold shrink-0">
              {ownerInitials(ownerName)}
            </span>
            <span className="text-[12px] text-ink-700 truncate">
              {ownerName}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11.5px] text-ink-500 tabular-nums shrink-0">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3 text-ink-400" strokeWidth={2} />
              {program.members.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3 text-ink-400" strokeWidth={2} />
              {formatCreated(program.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
