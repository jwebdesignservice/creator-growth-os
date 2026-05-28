"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  Plus,
  Link2,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  File as FileIcon,
  ExternalLink,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  X,
  AlertCircle,
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { createSignedMediaUpload, publicMediaUrl } from "../new/actions";
import {
  addLessonResource,
  renameLessonResource,
  deleteLessonResource,
  reorderLessonResources,
  type LessonResource,
  type ResourceExt,
} from "./resources-actions";

/* ─────────────────────────────────────────────────────────────────────────
   Resources tab — attach files + links to a tutorial. Fully backend-wired
   to the `lesson_resources` table (migration 0037): files upload to the
   lesson-media bucket via a signed URL, links are saved directly. Every
   row supports inline rename, delete, and drag-reorder.
   ───────────────────────────────────────────────────────────────────────── */

const EXT_STYLE: Record<ResourceExt, { bg: string; fg: string; icon: LucideIcon }> = {
  pdf:  { bg: "bg-rose-50",    fg: "text-rose-600",    icon: FileText },
  docx: { bg: "bg-blue-50",    fg: "text-blue-600",    icon: FileText },
  xlsx: { bg: "bg-emerald-50", fg: "text-emerald-600", icon: FileSpreadsheet },
  png:  { bg: "bg-violet-50",  fg: "text-violet-600",  icon: ImageIcon },
  jpg:  { bg: "bg-violet-50",  fg: "text-violet-600",  icon: ImageIcon },
  zip:  { bg: "bg-amber-50",   fg: "text-amber-700",   icon: FileArchive },
  link: { bg: "bg-cream-100",  fg: "text-ink-700",     icon: Link2 },
  file: { bg: "bg-cream-100",  fg: "text-ink-700",     icon: FileIcon },
};

function extFromName(name: string): ResourceExt {
  const e = (name.split(".").pop() ?? "").toLowerCase();
  if (e === "pdf" || e === "docx" || e === "xlsx" || e === "png" || e === "zip") return e;
  if (e === "jpg" || e === "jpeg") return "jpg";
  return "file";
}

function formatBytes(n: number | null): string {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourcesTab({
  lessonId,
  initialResources,
  tableMissing,
}: {
  lessonId: string;
  initialResources: LessonResource[];
  tableMissing: boolean;
}) {
  const router = useRouter();
  const [resources, setResources] = useState<LessonResource[]>(initialResources);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const signed = await createSignedMediaUpload(file.name, "image");
      if (!signed.ok) { setError(signed.error); return; }
      const supabase = createClient();
      const up = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (up.error) { setError(up.error.message); return; }
      const url = await publicMediaUrl(signed.path);
      const res = await addLessonResource({
        lessonId,
        kind: "file",
        title: file.name.replace(/\.[^.]+$/, ""),
        url,
        ext: extFromName(file.name),
        sizeBytes: file.size,
      });
      if (!res.ok) { setError(res.error); return; }
      if (res.resource) setResources((prev) => [...prev, res.resource!]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function addLink(title: string, url: string) {
    setError(null);
    startTransition(async () => {
      const res = await addLessonResource({
        lessonId,
        kind: "link",
        title,
        url,
        ext: "link",
      });
      if (!res.ok) { setError(res.error); return; }
      if (res.resource) setResources((prev) => [...prev, res.resource!]);
      setLinkOpen(false);
      router.refresh();
    });
  }

  function rename(id: string, title: string) {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, title } : r)));
    startTransition(async () => {
      const res = await renameLessonResource(id, lessonId, title);
      if (!res.ok) { setError(res.error); router.refresh(); }
    });
  }

  function remove(id: string) {
    setResources((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      const res = await deleteLessonResource(id, lessonId);
      if (!res.ok) { setError(res.error); router.refresh(); }
    });
  }

  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fi = resources.findIndex((r) => r.id === fromId);
    const ti = resources.findIndex((r) => r.id === toId);
    if (fi < 0 || ti < 0) return;
    const next = [...resources];
    const [m] = next.splice(fi, 1);
    next.splice(ti, 0, m);
    setResources(next);
    startTransition(async () => {
      await reorderLessonResources(lessonId, next.map((r) => r.id));
    });
  }

  if (tableMissing) {
    return (
      <div className="card p-8 text-center max-w-2xl mx-auto">
        <span className="size-12 rounded-[14px] bg-amber-100 text-amber-700 inline-flex items-center justify-center mb-3">
          <Database className="size-6" strokeWidth={1.8} />
        </span>
        <h2 className="text-h4 text-ink-900">Apply migration 0037 to attach resources</h2>
        <p className="mt-2 text-[13px] text-ink-500 max-w-md mx-auto leading-relaxed">
          The <code className="px-1 py-0.5 rounded bg-cream-100 text-rose-700 font-mono text-[11.5px]">lesson_resources</code> table
          isn&apos;t in the database yet. Run the consolidated SQL at
          {" "}<code className="px-1 py-0.5 rounded bg-cream-100 font-mono text-[11.5px]">supabase/APPLY_THIS_IN_SUPABASE_STUDIO.sql</code>{" "}
          and refresh — file uploads + links will then persist.
        </p>
      </div>
    );
  }

  return (
    <section className="card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-2.5 text-h4 text-ink-900">
            <span className="size-7 rounded-[8px] bg-rose-50 text-rose-600 inline-flex items-center justify-center">
              <Folder className="size-[15px]" strokeWidth={2} />
            </span>
            Resources
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-1.5 ml-[38px]">
            Attach templates, guides, or examples learners can download —
            files or external links.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || pending}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 disabled:bg-rose-300 shadow-sm transition-colors"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2} /> : <UploadCloud className="size-3.5" strokeWidth={2} />}
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen((v) => !v)}
            disabled={pending}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-semibold hover:bg-cream-100 disabled:opacity-50 transition-colors"
          >
            <Link2 className="size-3.5" strokeWidth={2} />
            Add link
          </button>
        </div>
      </header>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {linkOpen && <LinkForm onAdd={addLink} onCancel={() => setLinkOpen(false)} pending={pending} />}

      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-[10px] bg-rose-50 border border-rose-200 text-[12.5px] text-rose-700">
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" strokeWidth={2} />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss"><X className="size-3.5" strokeWidth={2} /></button>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-[12px] bg-cream-50/40 border border-dashed border-ink-200">
          <span className="size-11 rounded-full bg-cream-100 text-ink-500 inline-flex items-center justify-center mb-2">
            <Folder className="size-5" strokeWidth={1.8} />
          </span>
          <p className="text-[13px] font-semibold text-ink-900">No resources yet</p>
          <p className="text-[12px] text-ink-500 mt-0.5">
            Upload a file or add a link to help learners apply the lesson.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {resources.map((r) => (
            <ResourceRow
              key={r.id}
              resource={r}
              onRename={(t) => rename(r.id, t)}
              onDelete={() => remove(r.id)}
              onDragStart={() => setDragId(r.id)}
              onDrop={() => { if (dragId) reorder(dragId, r.id); setDragId(null); }}
              dimmed={dragId === r.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ResourceRow({
  resource,
  onRename,
  onDelete,
  onDragStart,
  onDrop,
  dimmed,
}: {
  resource: LessonResource;
  onRename: (title: string) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  dimmed: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resource.title);
  const style = EXT_STYLE[resource.ext] ?? EXT_STYLE.file;
  const Icon = style.icon;

  function commit() {
    const t = draft.trim();
    if (t && t !== resource.title) onRename(t);
    setEditing(false);
  }

  return (
    <li
      draggable={!editing}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-ink-100 bg-white hover:border-ink-200 transition-colors",
        dimmed && "opacity-50",
      )}
    >
      <GripVertical className="size-3.5 text-ink-300 shrink-0 cursor-grab" strokeWidth={2} aria-hidden />
      <span className={cn("size-9 rounded-[8px] inline-flex items-center justify-center shrink-0", style.bg, style.fg)}>
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            className="w-full h-7 px-2 rounded-[6px] border border-rose-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        ) : (
          <div className="text-[12.5px] font-semibold text-ink-900 truncate">{resource.title}</div>
        )}
        <div className="text-[11px] text-ink-500 tabular-nums">
          {resource.kind === "link" ? "Link" : resource.ext.toUpperCase()}
          {resource.sizeBytes != null && ` · ${formatBytes(resource.sizeBytes)}`}
        </div>
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        title="Open"
        className="opacity-0 group-hover:opacity-100 size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 transition-opacity"
      >
        <ExternalLink className="size-3.5" strokeWidth={2} />
      </a>
      <button type="button" onClick={() => { setDraft(resource.title); setEditing(true); }} title="Rename"
        className="opacity-0 group-hover:opacity-100 size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 transition-opacity">
        <Pencil className="size-3.5" strokeWidth={2} />
      </button>
      <button type="button" onClick={onDelete} title="Delete"
        className="opacity-0 group-hover:opacity-100 size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-opacity">
        <Trash2 className="size-3.5" strokeWidth={2} />
      </button>
    </li>
  );
}

function LinkForm({
  onAdd,
  onCancel,
  pending,
}: {
  onAdd: (title: string, url: string) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const valid = title.trim().length > 0 && /^https?:\/\//i.test(url.trim());

  return (
    <div className="mb-4 rounded-[12px] border border-ink-200 bg-cream-50/40 p-3.5 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource name (e.g. Hook templates)"
          className="h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13px] focus:outline-none focus:border-rose-400"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onAdd(title.trim(), url.trim()); }}
          className="h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13px] focus:outline-none focus:border-rose-400"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-9 px-3.5 rounded-[10px] border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onAdd(title.trim(), url.trim())}
          disabled={!valid || pending}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 disabled:bg-rose-300"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2} /> : <Plus className="size-3.5" strokeWidth={2.5} />}
          Add link
        </button>
      </div>
    </div>
  );
}
