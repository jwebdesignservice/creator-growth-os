"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Save,
  Sparkles,
  Check,
} from "lucide-react";
import { savePerformanceEntry } from "@/app/(app)/performance/actions";
import { cn } from "@/lib/cn";
import type { PerformanceEntry } from "@/lib/performance/queries";

type Props = {
  entry: PerformanceEntry;
  plan: "free" | "basic" | "pro";
  /** YYYY-MM-DD of the displayed week */
  weekStart: string;
  prevWeek: string;
  nextWeek: string;
  isCurrentWeek: boolean;
};

export function PerformanceEntryForm({
  entry,
  plan,
  weekStart,
  prevWeek,
  nextWeek,
  isCurrentWeek,
}: Props) {
  const router = useRouter();
  const initial: { ok: true } | { ok: false; error: string } = { ok: false, error: "" };
  const [state, formAction, pending] = useActionState<
    { ok: true } | { ok: false; error: string },
    FormData
  >(savePerformanceEntry, initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const isPro = plan === "pro";

  // When the action returns ok we show a success state
  if (state.ok && !savedAt) {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }
  const errMessage = state.ok ? null : state.error;

  return (
    <section id="performance-entry-form" className="card overflow-hidden scroll-mt-24">
      <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-ink-100 bg-cream-100/50">
        <div className="flex items-center gap-2">
          <Link
            href={`/performance?week=${prevWeek}`}
            className="size-9 rounded-full hover:bg-cream-200 inline-flex items-center justify-center text-ink-700 cursor-pointer"
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
          <div>
            <div className="text-[10.5px] tracking-[0.12em] uppercase text-rose-600 font-semibold">
              Weekly Entry
            </div>
            <div className="text-[16px] font-semibold text-ink-900 leading-tight">
              Week of {formatHumanDate(weekStart)}
              {isCurrentWeek && (
                <span className="ml-2 chip chip-rose text-[10.5px]">
                  This Week
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/performance?week=${nextWeek}`}
            className="size-9 rounded-full hover:bg-cream-200 inline-flex items-center justify-center text-ink-700 cursor-pointer"
            aria-label="Next week"
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/performance?week=${prevWeek}`)}
          className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-900 cursor-pointer"
        >
          Jump back to a previous week
        </button>
      </header>

      <form action={formAction} className="p-6 space-y-6">
        <input type="hidden" name="week_start" value={weekStart} />

        <FormSection title="Audience">
          <NumberField label="Followers" name="followers" defaultValue={entry.followers} placeholder="e.g. 12,400" />
          <NumberField label="Profile Visits" name="profile_visits" defaultValue={entry.profile_visits} placeholder="e.g. 1,200" />
          <NumberField label="Reach" name="reach" defaultValue={entry.reach} placeholder="e.g. 48,500" />
          <NumberField label="Views" name="views" defaultValue={entry.views} placeholder="e.g. 92,300" />
        </FormSection>

        <FormSection title="Output">
          <NumberField label="Posts Published" name="posts_published" defaultValue={entry.posts_published} placeholder="e.g. 6" />
          <NumberField label="Clicks / Leads" name="clicks" defaultValue={entry.clicks} placeholder="e.g. 280" />
        </FormSection>

        <FormSection title="Quality">
          <NumberField
            label="Engagement Rate (%)"
            name="engagement_rate"
            defaultValue={entry.engagement_rate}
            placeholder="e.g. 6.4"
            step="0.1"
          />
          <RevenueField defaultValue={entry.revenue} locked={!isPro} />
        </FormSection>

        <FormSection title="Reflection">
          <TextField
            label="Best Performing Post"
            name="best_post"
            defaultValue={entry.best_post ?? ""}
            placeholder="What worked best this week? Drop the link or topic."
            full
          />
          <Textarea
            label="Lesson Learned"
            name="lesson_learned"
            defaultValue={entry.lesson_learned ?? ""}
            placeholder="One insight to apply next week..."
          />
        </FormSection>

        {errMessage && (
          <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
            {errMessage}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100">
          <div className="text-[12px] text-ink-500">
            {state.ok && savedAt ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="size-3.5" strokeWidth={2.5} />
                Saved at {savedAt}
              </span>
            ) : (
              <span>Your weekly inputs feed your Creator Growth Score.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[15px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Save className="size-4" strokeWidth={2} />
            {pending ? "Saving…" : "Save Week"}
          </button>
        </div>
      </form>
    </section>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 font-semibold mb-3">
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  placeholder,
  step = "1",
}: {
  label: string;
  name: string;
  defaultValue: number | null;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        step={step}
        min={0}
        className="w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 placeholder:text-ink-400 text-[14px] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
      />
    </label>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  full,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 placeholder:text-ink-400 text-[14px] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-2.5 rounded-[12px] bg-white border border-ink-200 text-ink-900 placeholder:text-ink-400 text-[14px] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors resize-none"
      />
    </label>
  );
}

function RevenueField({
  defaultValue,
  locked,
}: {
  defaultValue: number | null;
  locked: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5 flex items-center gap-1.5">
        Revenue (NOK)
        {locked && (
          <span className="inline-flex items-center gap-1 text-[10.5px] text-rose-600 font-semibold bg-rose-100 px-1.5 py-0.5 rounded-md">
            <Lock className="size-2.5" strokeWidth={2} />
            PRO
          </span>
        )}
      </span>
      <div className="relative">
        <input
          type="number"
          name="revenue"
          defaultValue={defaultValue ?? ""}
          placeholder={locked ? "Pro feature" : "e.g. 8000"}
          disabled={locked}
          min={0}
          step="0.01"
          className={cn(
            "w-full h-11 px-4 rounded-[12px] border text-[14px] transition-colors",
            locked
              ? "bg-cream-100 border-ink-100 text-ink-400 cursor-not-allowed"
              : "bg-white border-ink-200 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
          )}
        />
        {locked && (
          <Link
            href="/billing?upgrade=pro"
            className="absolute inset-y-0 right-2 my-auto inline-flex items-center gap-1 px-2.5 h-8 rounded-[8px] bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-semibold cursor-pointer"
          >
            <Sparkles className="size-3" strokeWidth={2} />
            Upgrade
          </Link>
        )}
      </div>
    </label>
  );
}

function formatHumanDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
