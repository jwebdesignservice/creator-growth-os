"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createQaRun } from "@/lib/dev-dashboard/qa-actions";

/**
 * Triggers the createQaRun server action for the currently selected
 * release. On success the page revalidates and re-renders with the new run
 * surfaced as the current run.
 */
export function CreateQaRunButton({ release }: { release: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onClick() {
    start(async () => {
      const result = await createQaRun(release);
      if (!result.ok) {
        // Surface in console — there's no toast system on /dev yet.
        console.error("Create QA run failed:", result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12.5px] font-semibold transition-colors"
    >
      <Plus className="size-3.5" strokeWidth={2.2} />
      {pending ? "Creating…" : "Create QA Run"}
    </button>
  );
}
