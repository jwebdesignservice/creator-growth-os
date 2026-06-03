/* Checklist ───────────────────────────────────────────────────────────────
   Setup / getting-started surfaces — a guided step list (icon rows that link
   to setup tasks) and a progress checklist with done/remaining + a bar.
   The rhythm behind the learner home's first-run guidance.
   ───────────────────────────────────────────────────────────────────── */

import { UserRound, MessageSquare, PenLine, ChevronRight, ArrowRight, Star, Check, type LucideIcon } from "lucide-react";

export function SetupChecklist() {
  const steps: { Icon: LucideIcon; title: string; desc: string }[] = [
    { Icon: UserRound, title: "Complete your profile", desc: "Add bio, niche & links" },
    { Icon: MessageSquare, title: "Connect your socials", desc: "Link Instagram, TikTok & more" },
    { Icon: PenLine, title: "Create your first post", desc: "Share and start building momentum" },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full flex flex-col">
      <header className="flex items-center gap-2.5 mb-4">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Star className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900 leading-tight">Getting Started</h3>
          <p className="text-[12.5px] text-ink-500 leading-snug">Set up your foundation</p>
        </div>
      </header>
      <ul className="space-y-1 flex-1">
        {steps.map((s) => {
          const Icon = s.Icon;
          return (
            <li key={s.title}>
              <button
                type="button"
                className="flex w-full items-center gap-3 group rounded-[12px] px-2 py-1.5 text-left cursor-pointer transition-colors hover:bg-cream-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                <span className="size-9 rounded-[11px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                  <Icon className="size-[18px]" strokeWidth={1.9} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-ink-900 group-hover:text-rose-700 transition-colors">{s.title}</span>
                  <span className="block text-[11.5px] text-ink-500 leading-snug">{s.desc}</span>
                </span>
                <ChevronRight className="size-4 text-ink-300 shrink-0 group-hover:text-rose-500 transition-colors" strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="mt-4 self-start inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700 rounded-[6px] px-0.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
      >
        View onboarding guide <ArrowRight className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function ChecklistProgress() {
  const items = [
    { label: "Define your niche", done: true },
    { label: "Connect a platform", done: true },
    { label: "Publish your media kit", done: false },
    { label: "Track your first deal", done: false },
  ];
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[14px] font-bold text-ink-900">Brand setup</h3>
        <span className="text-[12px] text-ink-500 tabular-nums">{done}/{items.length}</span>
      </div>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-1.5 rounded-full bg-cream-200 overflow-hidden mb-4">
        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2.5">
            <span className={"size-5 rounded-full inline-flex items-center justify-center shrink-0 " + (it.done ? "bg-rose-600 text-white" : "border-2 border-ink-200")}>
              {it.done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={"text-[13px] " + (it.done ? "text-ink-400 line-through" : "text-ink-900")}>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
