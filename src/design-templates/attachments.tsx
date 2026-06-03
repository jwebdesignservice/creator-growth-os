/* Attachments ─────────────────────────────────────────────────────────────
   Uploaded-file surfaces — a file list (type icon, size, upload progress,
   remove) and compact inline attachment chips. Distinct from the Forms
   dropzone (the drop area) and the video upload card.
   ───────────────────────────────────────────────────────────────────── */

import { FileText, FileImage, Film, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function AttachmentList() {
  const files = [
    { Icon: FileText, tone: "bg-sky-100 text-sky-600", name: "brand-brief.pdf", size: "240 KB", uploading: false, pct: 0 },
    { Icon: FileImage, tone: "bg-violet-100 text-violet-600", name: "thumbnail-v2.png", size: "1.4 MB", uploading: false, pct: 0 },
    { Icon: Film, tone: "bg-rose-100 text-rose-600", name: "hook-final.mp4", size: "128 MB", uploading: true, pct: 67 },
  ];
  return (
    <div className="w-[380px] max-w-full space-y-2">
      {files.map((f, i) => {
        const Icon = f.Icon;
        return (
          <div key={i} className="flex items-center gap-3 rounded-[12px] border border-ink-100 bg-white p-2.5">
            <span className={cn("size-10 rounded-[10px] inline-flex items-center justify-center shrink-0", f.tone)}>
              <Icon className="size-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ink-900 truncate">{f.name}</div>
              {f.uploading ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${f.pct}%` }} />
                  </div>
                  <span className="text-[11px] text-ink-400 tabular-nums">{f.pct}%</span>
                </div>
              ) : (
                <div className="text-[11.5px] text-ink-400">{f.size}</div>
              )}
            </div>
            <span className="size-7 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 shrink-0">
              <X className="size-3.5" strokeWidth={2} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AttachmentChips() {
  const chips = [
    { Icon: FileImage, name: "cover.png" },
    { Icon: FileText, name: "notes.pdf" },
  ];
  return (
    <div className="flex flex-wrap gap-2 max-w-[380px]">
      {chips.map((c, i) => {
        const Icon = c.Icon;
        return (
          <span key={i} className="inline-flex items-center gap-2 h-8 pl-2 pr-1.5 rounded-full bg-cream-100 border border-ink-100 text-[12.5px] text-ink-700">
            <Icon className="size-3.5 text-ink-400" strokeWidth={2} />
            {c.name}
            <span className="size-5 rounded-full hover:bg-ink-100 inline-flex items-center justify-center"><X className="size-3" strokeWidth={2.5} /></span>
          </span>
        );
      })}
    </div>
  );
}
