"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { MessageSquare, NotebookPen, Bot, Globe } from "lucide-react";
import { cn } from "@/lib/cn";

/* Conversation filter shown above the thread.
 * Persists to a URL search param so a deep link to a ticket can also
 * select a filter — useful when sharing "look at the internal notes
 * only" links between dev/support team members. */

export type ConversationFilter = "all" | "messages" | "notes" | "system";

const OPTIONS: { value: ConversationFilter; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { value: "all",      label: "All",      icon: Globe        },
  { value: "messages", label: "Messages", icon: MessageSquare },
  { value: "notes",    label: "Internal", icon: NotebookPen  },
  { value: "system",   label: "System",   icon: Bot          },
];

export function ConversationFilterBar({ value }: { value: ConversationFilter }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, start] = useTransition();

  function pick(next: ConversationFilter) {
    const params = new URLSearchParams(sp.toString());
    if (next === "all") {
      params.delete("conv");
    } else {
      params.set("conv", next);
    }
    const qs = params.toString();
    start(() => {
      router.replace(qs ? `?${qs}` : `?`, { scroll: false });
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Conversation filter"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)]"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => pick(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] text-[11.5px] font-semibold transition-colors",
              active
                ? "bg-[var(--dev-accent)] text-white"
                : "text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)]",
            )}
          >
            <Icon className="size-3" strokeWidth={2} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function parseConversationFilter(
  raw: string | string[] | undefined,
): ConversationFilter {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "messages" || v === "notes" || v === "system") return v;
  return "all";
}
