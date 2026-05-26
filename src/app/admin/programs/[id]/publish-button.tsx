"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket, EyeOff, Loader2 } from "lucide-react";
import { toggleProgramPublished } from "../actions";

/* ─────────────────────────────────────────────────────────────────────────
   Publish / Unpublish toggle for the admin program setup page.
   Reuses the existing toggleProgramPublished server action.
   ───────────────────────────────────────────────────────────────────────── */

export function PublishButton({
  programId,
  published,
}: {
  programId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      await toggleProgramPublished(programId, !published);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold shadow-sm transition-colors cursor-pointer"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" strokeWidth={2} />
      ) : published ? (
        <EyeOff className="size-4" strokeWidth={2} />
      ) : (
        <Rocket className="size-4" strokeWidth={2} />
      )}
      {pending ? "Saving…" : published ? "Unpublish" : "Publish program"}
    </button>
  );
}
