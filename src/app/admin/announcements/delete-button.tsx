"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAnnouncement } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Delete this announcement?")) return;
    startTransition(async () => {
      await deleteAnnouncement(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="size-9 rounded-[10px] border border-ink-200 bg-white hover:bg-rose-50 hover:text-rose-700 inline-flex items-center justify-center text-ink-500 shrink-0 cursor-pointer"
      aria-label="Delete announcement"
    >
      <Trash2 className="size-4" strokeWidth={1.8} />
    </button>
  );
}
