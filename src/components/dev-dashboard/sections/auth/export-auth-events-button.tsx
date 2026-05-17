"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { exportAuthEventsCsv } from "@/lib/dev-dashboard/auth-actions";
import { parseAuthFilters } from "@/lib/dev-dashboard/auth-filters";

/**
 * Triggers the exportAuthEventsCsv server action and turns the returned
 * CSV string into a file download via a temporary blob URL — no new
 * page or route required. Honors the current URL filter state so the
 * export matches what the dev is currently viewing.
 */
export function ExportAuthEventsButton() {
  const [pending, start] = useTransition();
  const sp = useSearchParams();

  function triggerDownload(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onClick() {
    const filters = parseAuthFilters(Object.fromEntries(sp.entries()));
    start(async () => {
      const result = await exportAuthEventsCsv(filters);
      if (!result.ok || !result.data) {
        console.error("Export failed:", result.ok ? "no data" : result.error);
        return;
      }
      triggerDownload(result.data.csv, result.data.filename);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] disabled:opacity-50 text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
    >
      <Download className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
      {pending ? "Exporting…" : "Export Events"}
    </button>
  );
}
