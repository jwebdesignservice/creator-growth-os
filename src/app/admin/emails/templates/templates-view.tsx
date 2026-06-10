"use client";

import { useCallback, useMemo, useRef, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  MoreHorizontal,
  Send,
  X,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  previewContext,
  substituteVariables,
} from "@/lib/email/variables";
import {
  createEmailTemplate,
  updateEmailTemplate,
  duplicateEmailTemplate,
  deleteEmailTemplate,
  archiveEmailTemplate,
  type SimpleResult,
} from "../actions";

export type TemplateRow = {
  id: string;
  name: string;
  subject: string;
  body: string;
  useBrandedTemplate: boolean;
  trackOpens: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

type Editing =
  | { mode: "create" }
  | { mode: "edit"; template: TemplateRow }
  | null;

export function TemplatesView({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [preview, setPreview] = useState<TemplateRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const q = query.trim().toLowerCase();
  const match = useCallback(
    (t: TemplateRow) =>
      !q || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q),
    [q],
  );

  const active = useMemo(() => templates.filter((t) => !t.archived && match(t)), [templates, match]);
  const archived = useMemo(() => templates.filter((t) => t.archived && match(t)), [templates, match]);

  function afterChange(msg: string) {
    setToast(msg);
    router.refresh();
  }

  return (
    <div className="space-y-6 container-app">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-page-title text-ink-900">Email Templates</h1>
          <p className="text-ink-500 text-[14px] mt-1">
            Reusable email templates you can preview, duplicate, and load into
            Compose on demand.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
        >
          <Plus className="size-4" strokeWidth={2} />
          New template
        </button>
      </header>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates by name or subject..."
          className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
        />
      </div>

      {/* Active */}
      {active.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3 mx-auto">
            <FileText className="size-5" strokeWidth={1.8} />
          </span>
          <h2 className="text-h4 text-ink-900 mb-1">
            {templates.length === 0 ? "No templates yet" : "No matches"}
          </h2>
          <p className="text-[13px] text-ink-500 max-w-md mx-auto">
            {templates.length === 0
              ? "Create your first reusable template — it'll be available to load on the Compose page."
              : "No templates match your search. Try a different term."}
          </p>
          {templates.length === 0 && (
            <button
              type="button"
              onClick={() => setEditing({ mode: "create" })}
              className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors"
            >
              <Plus className="size-4" strokeWidth={2} />
              New template
            </button>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setEditing({ mode: "edit", template: t })}
              onPreview={() => setPreview(t)}
              onChanged={afterChange}
            />
          ))}
        </ul>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <section>
          <h2 className="text-h4 text-ink-900 mb-3">Archived</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {archived.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onEdit={() => setEditing({ mode: "edit", template: t })}
                onPreview={() => setPreview(t)}
                onChanged={afterChange}
              />
            ))}
          </ul>
        </section>
      )}

      {editing && (
        <TemplateModal
          editing={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); afterChange(msg); }}
        />
      )}
      {preview && <PreviewModal template={preview} onClose={() => setPreview(null)} />}

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink-900 text-white text-[12.5px] shadow-card">
          <Check className="size-3.5 text-emerald-300" strokeWidth={2.5} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function TemplateCard({
  template: t,
  onEdit,
  onPreview,
  onChanged,
}: {
  template: TemplateRow;
  onEdit: () => void;
  onPreview: () => void;
  onChanged: (msg: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  function run(fn: () => Promise<SimpleResult>, successMsg: string) {
    setMenuOpen(false);
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onChanged(successMsg);
    });
  }

  return (
    <li className={cn("card p-5 flex flex-col gap-3", t.archived && "opacity-75")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-h4 text-ink-900 truncate">{t.name}</div>
          <div className="text-[12.5px] text-ink-500 mt-1 truncate">{t.subject}</div>
        </div>
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${t.name}`}
            disabled={pending}
            className="size-8 rounded-[8px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <MoreHorizontal className="size-4" strokeWidth={2} />}
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-[calc(100%+4px)] z-20 w-44 rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              <MenuItem icon={<Pencil className="size-3.5" strokeWidth={2} />} label="Edit" onClick={() => { setMenuOpen(false); onEdit(); }} />
              <MenuItem icon={<Copy className="size-3.5" strokeWidth={2} />} label="Duplicate" onClick={() => run(() => duplicateEmailTemplate(t.id), "Template duplicated")} />
              {t.archived ? (
                <MenuItem icon={<ArchiveRestore className="size-3.5" strokeWidth={2} />} label="Unarchive" onClick={() => run(() => archiveEmailTemplate(t.id, false), "Template restored")} />
              ) : (
                <MenuItem icon={<Archive className="size-3.5" strokeWidth={2} />} label="Archive" onClick={() => run(() => archiveEmailTemplate(t.id, true), "Template archived")} />
              )}
              <div aria-hidden className="h-px my-1 bg-ink-100" />
              <MenuItem
                icon={<Trash2 className="size-3.5" strokeWidth={2} />}
                label="Delete"
                danger
                onClick={() => {
                  if (!confirm(`Delete template "${t.name}"? This can't be undone.`)) { setMenuOpen(false); return; }
                  run(() => deleteEmailTemplate(t.id), "Template deleted");
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {t.useBrandedTemplate && (
          <span className="inline-flex items-center gap-1 px-2 h-[20px] rounded-md text-[10.5px] font-semibold bg-rose-100 text-rose-700">
            <Sparkles className="size-3" strokeWidth={2} /> Branded
          </span>
        )}
        {t.trackOpens && (
          <span className="inline-flex items-center gap-1 px-2 h-[20px] rounded-md text-[10.5px] font-semibold bg-cream-200 text-ink-600">
            <Eye className="size-3" strokeWidth={2} /> Tracks opens
          </span>
        )}
        <span className="text-[11px] text-ink-400 ml-auto">Updated {formatDate(t.updatedAt)}</span>
      </div>

      {error && <div className="text-[11.5px] text-rose-600">{error}</div>}

      <div className="flex items-center gap-2 pt-1 mt-auto border-t border-ink-100 -mx-5 px-5 pt-3">
        <Link
          href={`/admin/emails?template=${encodeURIComponent(t.id)}`}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
        >
          <Send className="size-3.5" strokeWidth={2} />
          Use in Compose
        </Link>
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[12.5px] font-medium hover:bg-cream-100 transition-colors"
        >
          <Eye className="size-3.5" strokeWidth={2} />
          Preview
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[12.5px] font-medium hover:bg-cream-100 transition-colors"
        >
          <Pencil className="size-3.5" strokeWidth={2} />
          Edit
        </button>
      </div>
    </li>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function TemplateModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: { mode: "create" } | { mode: "edit"; template: TemplateRow };
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = editing.mode === "edit";
  const seed = isEdit ? editing.template : null;
  const [name, setName] = useState(seed?.name ?? "");
  const [subject, setSubject] = useState(seed?.subject ?? "");
  const [body, setBody] = useState(seed?.body ?? "");
  const [useBranded, setUseBranded] = useState(seed?.useBrandedTemplate ?? false);
  const [trackOpens, setTrackOpens] = useState(seed?.trackOpens ?? true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const valid = name.trim() && subject.trim() && body.trim();

  function submit() {
    if (!valid) { setError("Name, subject, and body are all required."); return; }
    setError(null);
    startTransition(async () => {
      const payload = { name, subject, body, useBrandedTemplate: useBranded, trackOpens };
      const res = isEdit
        ? await updateEmailTemplate(editing.template.id, payload)
        : await createEmailTemplate(payload);
      if (!res.ok) { setError(res.error); return; }
      onSaved(isEdit ? "Template updated" : "Template created");
    });
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={isEdit ? "Edit template" : "Create template"} className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[600px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden my-6" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <h2 className="text-[15px] font-bold text-ink-900">{isEdit ? "Edit template" : "New template"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900">
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="p-5 sm:p-6 space-y-4">
          <Field label="Template name">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Weekly recap" className="w-full h-11 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors" />
          </Field>
          <Field label="Subject">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} placeholder="Subject line — variables like {{ first_name }} work" className="w-full h-11 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors" />
          </Field>
          <Field label="Body">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write your email. Supports **bold**, *italic*, [links](https://…) and {{ variables }}." className="w-full px-3.5 py-3 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors resize-y leading-relaxed" />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <ToggleField label="Use branded layout" checked={useBranded} onChange={setUseBranded} />
            <ToggleField label="Track opens" checked={trackOpens} onChange={setTrackOpens} />
          </div>
          {error && <p role="alert" className="text-[12px] text-rose-600 bg-rose-50 border border-rose-200 rounded-[8px] px-3 py-2">{error}</p>}
        </div>
        <footer className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-ink-100">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[13px] font-medium hover:bg-cream-100 transition-colors">Cancel</button>
          <button type="button" onClick={submit} disabled={pending || !valid} className={cn("inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold transition-colors", valid && !pending ? "bg-rose-600 hover:bg-rose-700" : "bg-rose-300 cursor-not-allowed")}>
            {pending && <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />}
            {isEdit ? "Save changes" : "Create template"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function PreviewModal({ template, onClose }: { template: TemplateRow; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const ctx = previewContext();
  const subject = substituteVariables(template.subject, ctx);
  const body = substituteVariables(template.body, ctx);

  return (
    <div role="dialog" aria-modal="true" aria-label="Template preview" className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[600px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden my-6" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="size-4 text-rose-600 shrink-0" strokeWidth={2} />
            <h2 className="text-[15px] font-bold text-ink-900 truncate">Preview · {template.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900">
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-[11.5px] text-ink-400">Variables are filled with example values for this preview.</p>
          <div>
            <div className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 mb-1">Subject</div>
            <div className="text-[15px] font-semibold text-ink-900">{subject || "(no subject)"}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 mb-1">Message</div>
            <div className="rounded-[12px] border border-ink-100 bg-cream-50/40 p-4 text-[13.5px] text-ink-800 leading-relaxed whitespace-pre-wrap">{body || "(empty message)"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11.5px] uppercase tracking-wider font-bold text-ink-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-[13px] text-ink-700">
      <span className={cn("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors", checked ? "bg-rose-500" : "bg-ink-200")}>
        <span className={cn("inline-block size-4 rounded-full bg-white transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
      {label}
    </button>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={cn("w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer", danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-700 hover:bg-cream-100")}>
      {icon}
      {label}
    </button>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
