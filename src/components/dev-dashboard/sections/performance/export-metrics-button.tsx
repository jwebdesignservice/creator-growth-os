"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportPerformanceMetricsCsv } from "@/lib/dev-dashboard/performance-actions";
import type { PerformanceFilters } from "@/lib/dev-dashboard/performance-filters";

type Props = {
  filters: PerformanceFilters;
};

/**
 * Calls the server action, builds a temporary Blob URL from the returned
 * CSV string, and clicks an anchor to trigger the browser download. No
 * file is written to the server.
 */
export function ExportMetricsButton({ filters }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await exportPerformanceMetricsCsv(filters);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const { csv, filename } = res.data!;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Defer revoke until after the click handler completes so Safari
      // doesn't drop the download.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label="Export performance metrics as CSV"
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
        ) : (
          <Download className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
        )}
        Export Metrics
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-[var(--dev-danger-text)]">
          {error}
        </span>
      )}
    </div>
  );
}
