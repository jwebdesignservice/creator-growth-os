"use client";

import { useTransition } from "react";
import { exportLogsJson } from "@/lib/dev-dashboard/logs-actions";
import type { LogsFilters } from "@/lib/dev-dashboard/logs-filters";

/**
 * Client wrapper that calls the `exportLogsJson` server action with the
 * current page filters and triggers a browser download of the resulting
 * JSON. Kept tiny so it can sit inside the page header next to the
 * Save View button.
 */
export function ExportLogsButton({
  filters,
  children,
}: {
  filters: LogsFilters;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await exportLogsJson({ filters });
      if (!res.ok) {
        console.error("[logs] export failed:", res.error);
        return;
      }
      const blob = new Blob([res.data!.json], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = res.data!.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors disabled:opacity-60"
    >
      {children}
    </button>
  );
}
