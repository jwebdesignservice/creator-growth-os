"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { exportErrorsCsv } from "@/lib/dev-dashboard/errors-actions";

/**
 * Client trigger for the Export Logs server action.
 * Receives a CSV string back from the action and turns it into a download
 * via a temporary blob URL — no new page or route required.
 */
export function ExportLogsButton() {
  const [pending, start] = useTransition();

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
    start(async () => {
      const result = await exportErrorsCsv();
      if (!result.ok || !result.data) {
        // Surface failure in the console — there's no toast system on /dev yet.
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
      {pending ? "Exporting…" : "Export Logs"}
    </button>
  );
}
