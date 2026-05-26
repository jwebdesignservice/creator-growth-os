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
} from "lucide-react";
import { toggleProgramPublished, deleteProgram } from "./actions";
import { cn } from "@/lib/cn";

export type ProgramRowData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  plan_access: "free" | "basic" | "pro";
  cover_image_url: string | null;
  total_lessons: number;
  published: boolean;
  created_at: string;
  members: number;
};

/** Per-plan pill styling — matches the mockup's color-coded Access column. */
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
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProgramRow({
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
    <tr
      className={cn(
        "border-t border-ink-100 hover:bg-cream-50/60 transition-colors",
        pending && "opacity-60",
      )}
    >
      {/* Thumbnail — opens the admin Program Setup Guide */}
      <td className="py-4 pl-5 pr-3">
        <Link
          href={`/admin/programs/${program.id}`}
          aria-label={`Open ${program.title}`}
          className="block w-[78px] h-[52px] rounded-[10px] overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 shrink-0 hover:opacity-90 transition-opacity"
        >
          {program.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={program.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </Link>
      </td>

      {/* Program name + description — title opens the admin setup guide */}
      <td className="py-4 pr-3 min-w-0 max-w-[280px]">
        <Link
          href={`/admin/programs/${program.id}`}
          className="block text-[14px] font-semibold text-ink-900 truncate hover:text-rose-700 transition-colors"
        >
          {program.title}
        </Link>
        {program.description && (
          <div className="text-[12px] text-ink-500 truncate mt-0.5">
            {program.description}
          </div>
        )}
      </td>

      {/* Owner */}
      <td className="py-4 pr-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-7 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[10.5px] font-bold shrink-0">
            {ownerInitials(ownerName)}
          </span>
          <span className="text-[13px] text-ink-700 truncate">{ownerName}</span>
        </div>
      </td>

      {/* Created */}
      <td className="py-4 pr-3">
        <span className="text-[13px] text-ink-700 tabular-nums whitespace-nowrap">
          {formatCreated(program.created_at)}
        </span>
      </td>

      {/* Members */}
      <td className="py-4 pr-3">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700 tabular-nums">
          <Users className="size-3.5 text-ink-400" strokeWidth={2} />
          {program.members.toLocaleString()}
        </span>
      </td>

      {/* Status */}
      <td className="py-4 pr-3">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold",
            program.published
              ? "bg-success-bg text-success border border-success/20"
              : "bg-ink-100 text-ink-600 border border-ink-200",
          )}
        >
          {program.published ? "Published" : "Draft"}
        </span>
      </td>

      {/* Access */}
      <td className="py-4 pr-3">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold",
            access.cls,
          )}
        >
          {access.label}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 pr-5 text-right">
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
      </td>
    </tr>
  );
}
