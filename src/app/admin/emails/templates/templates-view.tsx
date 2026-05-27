"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   /admin/emails/templates — interactive view.

   STUB: this file was missing when the production build was attempted
   during the platform-wide design-system pass, breaking the build. This
   minimal placeholder restores compilation and renders a clean empty/list
   state. Replace with the full templates UI when the design lands.
   ───────────────────────────────────────────────────────────────────────── */

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

export function TemplatesView({ templates }: { templates: TemplateRow[] }) {
  const active = templates.filter((t) => !t.archived);
  const archived = templates.filter((t) => t.archived);

  return (
    <div className="space-y-6 container-app">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-page-title text-ink-900">Email Templates</h1>
          <p className="text-ink-500 text-[14px] mt-1">
            Reusable email templates you can save into Compose and load on
            demand.
          </p>
        </div>
        <Link
          href="/admin/emails/compose"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
        >
          <Plus className="size-4" strokeWidth={2} />
          New template
        </Link>
      </header>

      {active.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3 mx-auto">
            <FileText className="size-5" strokeWidth={1.8} />
          </span>
          <h2 className="text-h4 text-ink-900 mb-1">No templates yet</h2>
          <p className="text-[13px] text-ink-500 max-w-md mx-auto">
            Save a template from the Compose page and it&apos;ll show up here
            ready to reuse.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((t) => (
            <li key={t.id} className="card p-5">
              <div className="text-h4 text-ink-900">{t.name}</div>
              <div className="text-[12.5px] text-ink-500 mt-1 truncate">
                {t.subject}
              </div>
            </li>
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <section>
          <h2 className="text-h4 text-ink-900 mb-3">Archived</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archived.map((t) => (
              <li key={t.id} className="card p-5 opacity-70">
                <div className="text-h4 text-ink-900">{t.name}</div>
                <div className="text-[12.5px] text-ink-500 mt-1 truncate">
                  {t.subject}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
