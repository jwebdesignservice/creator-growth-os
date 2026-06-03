/* Tree view ───────────────────────────────────────────────────────────────────
   Hierarchical lists — an expandable curriculum/module tree and a nested
   category tree with counts. For program structure and resource folders.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { ChevronDown, ChevronRight, BookOpen, PlayCircle, Folder, FolderOpen, FileText } from "lucide-react";

/* 1 · Curriculum tree — modules expanding to lessons, with states. */
export function CurriculumTree() {
  return (
    <div className="w-[380px] max-w-full rounded-[14px] border border-ink-100 bg-white p-2 shadow-card">
      {/* Module 1 (open) */}
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] bg-cream-50">
        <ChevronDown className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
        <BookOpen className="size-4 text-rose-500 shrink-0" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-ink-900 flex-1">Module 1 · Foundations</span>
        <span className="text-[11px] text-ink-400">2 lessons</span>
      </div>
      <div className="ml-7 mt-0.5 space-y-0.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-rose-50">
          <PlayCircle className="size-3.5 text-rose-600 shrink-0" strokeWidth={2} fill="currentColor" />
          <span className="text-[12.5px] font-medium text-rose-700 flex-1">1.1 The 3-second hook</span>
          <span className="text-[11px] text-ink-400">4:12</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] hover:bg-cream-50">
          <PlayCircle className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
          <span className="text-[12.5px] text-ink-700 flex-1">1.2 Writing your first hook</span>
          <span className="text-[11px] text-ink-400">6:45</span>
        </div>
      </div>
      {/* Module 2 (collapsed) */}
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] hover:bg-cream-50 mt-0.5">
        <ChevronRight className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
        <BookOpen className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-ink-700 flex-1">Module 2 · Going viral</span>
        <span className="text-[11px] text-ink-400">5 lessons</span>
      </div>
    </div>
  );
}

/* 2 · Folder tree — nested resources with expand state. */
export function FolderTree() {
  return (
    <div className="w-[320px] max-w-full rounded-[14px] border border-ink-100 bg-white p-2.5 text-[13px] shadow-card">
      <Row icon={<FolderOpen className="size-4 text-amber-500" strokeWidth={2} />} label="Resources" chevron="down" bold />
      <div className="ml-5">
        <Row icon={<FolderOpen className="size-4 text-amber-500" strokeWidth={2} />} label="Templates" chevron="down" />
        <div className="ml-5">
          <Row icon={<FileText className="size-4 text-ink-400" strokeWidth={2} />} label="hook-vault.pdf" />
          <Row icon={<FileText className="size-4 text-ink-400" strokeWidth={2} />} label="content-calendar.xlsx" />
        </div>
        <Row icon={<Folder className="size-4 text-amber-500" strokeWidth={2} />} label="Swipe files" chevron="right" />
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  chevron,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  chevron?: "down" | "right";
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-[8px] hover:bg-cream-50">
      {chevron === "down" ? (
        <ChevronDown className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
      ) : chevron === "right" ? (
        <ChevronRight className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
      ) : (
        <span className="size-3.5 shrink-0" />
      )}
      {icon}
      <span className={bold ? "font-semibold text-ink-900" : "text-ink-700"}>{label}</span>
    </div>
  );
}
