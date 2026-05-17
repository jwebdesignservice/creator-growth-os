"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportTicketsCsv } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

export function ExportTicketsButton() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    start(async () => {
      const result = await exportTicketsCsv();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const blob = new Blob([result.data!.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data!.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors",
          pending && "opacity-70 cursor-not-allowed",
        )}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin text-[var(--dev-text-secondary)]" strokeWidth={2} />
        ) : (
          <Download className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
        )}
        Export
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 mt-1 text-[11px] text-[var(--dev-danger-text)] whitespace-nowrap"
        >
          {error}
        </p>
      )}
    </div>
  );
}
