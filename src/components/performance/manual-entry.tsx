"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  PenLine,
  Users,
  Heart,
  Eye,
  Clapperboard,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { logPerformanceEntry } from "@/app/(app)/performance/actions";
import type { PerformanceEntry } from "@/lib/performance/queries";

/**
 * Manual performance log — lets the user hand-enter their four headline
 * metrics for today (the date is taken automatically). On save it upserts a
 * manual performance_entries row and the server action revalidates the page,
 * so the "This Week's Overview" chart + stats above update straight away.
 */

type FieldKey =
  | "followers"
  | "engagement_rate"
  | "profile_visits"
  | "posts_published";

const FIELDS: {
  key: FieldKey;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  step: string;
  suffix?: string;
}[] = [
  { key: "followers", label: "Followers", icon: Users, placeholder: "12,500", step: "1" },
  {
    key: "engagement_rate",
    label: "Engagement Rate",
    icon: Heart,
    placeholder: "5.8",
    step: "0.1",
    suffix: "%",
  },
  { key: "profile_visits", label: "Profile Visits", icon: Eye, placeholder: "9,240", step: "1" },
  {
    key: "posts_published",
    label: "Content Published",
    icon: Clapperboard,
    placeholder: "8",
    step: "1",
  },
];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseNum(s: string): number | null {
  const cleaned = s.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function PerformanceManualEntry({
  entries = [],
}: {
  entries?: PerformanceEntry[];
}) {
  // The log is always for "today" — captured once at mount, in the user's
  // local timezone. No date input: the system knows the date.
  const [today] = useState<string>(() => toISODate(new Date()));
  const [values, setValues] = useState<Record<FieldKey, string>>({
    followers: "",
    engagement_rate: "",
    profile_visits: "",
    posts_published: "",
  });
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = {
      followers: parseNum(values.followers),
      engagement_rate: parseNum(values.engagement_rate),
      profile_visits: parseNum(values.profile_visits),
      posts_published: parseNum(values.posts_published),
    };
    if (Object.values(parsed).every((v) => v == null)) {
      setStatus("error");
      setMessage("Enter at least one metric.");
      return;
    }
    startTransition(async () => {
      const res = await logPerformanceEntry({ date: today, ...parsed });
      if (res.ok) {
        setStatus("saved");
        setMessage("Saved — the chart above is updated.");
      } else {
        setStatus("error");
        setMessage(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <section className="card rounded-[20px] p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <PenLine className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold text-ink-900 leading-tight">
              Log your numbers
            </h3>
            <p className="text-[13px] text-ink-500 mt-0.5">
              Log today&apos;s key metrics — they feed the chart above.
            </p>
          </div>
        </div>

        {/* Today's date — captured automatically, shown for clarity. */}
        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-cream-100 border border-ink-100 text-[12.5px] font-medium text-ink-600 shrink-0">
          <CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} />
          {fmtDate(today)}
        </span>
      </header>

      <form onSubmit={onSubmit} className="mt-5">
        {/* Metric inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key}>
                <label
                  htmlFor={`m-${f.key}`}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-ink-600 mb-1.5"
                >
                  <Icon className="size-3.5 text-rose-500" strokeWidth={2} />
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    id={`m-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={f.step}
                    value={values[f.key]}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [f.key]: e.target.value }));
                      setStatus("idle");
                    }}
                    placeholder={f.placeholder}
                    className={cn(
                      "w-full h-10 px-3 rounded-[10px] bg-white border border-ink-100 text-[13.5px] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors",
                      f.suffix && "pr-8",
                    )}
                  />
                  {f.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-400 pointer-events-none">
                      {f.suffix}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit + status */}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <CheckCircle2 className="size-4" strokeWidth={2} />
            )}
            {pending ? "Saving…" : "Save entry"}
          </button>

          {status === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-success">
              <CheckCircle2 className="size-3.5" strokeWidth={2.2} />
              {message}
            </span>
          )}
          {status === "error" && (
            <span className="text-[12.5px] font-medium text-rose-600">
              {message}
            </span>
          )}
        </div>
      </form>

      {/* ── Section 2: logged history ─────────────────────────────────── */}
      <div className="mt-6 pt-5 border-t border-ink-100">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-[14px] font-semibold text-ink-900">
            Logged entries
          </h4>
          {entries.length > 0 && (
            <span className="text-[12px] text-ink-500">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-[13px] text-ink-400">
            Your saved entries will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[14px] border border-ink-100">
            <table className="w-full min-w-[580px] border-collapse">
              <thead>
                <tr className="bg-cream-50 text-[11px] uppercase tracking-wider text-ink-500">
                  <th className="text-left font-semibold py-3 px-4">Date</th>
                  {COLS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <th key={c.key} className="font-semibold py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={cn(
                              "size-5 rounded-[6px] inline-flex items-center justify-center",
                              c.tint,
                            )}
                          >
                            <Icon className="size-3" strokeWidth={2.2} />
                          </span>
                          {c.label}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {entries.map((e, i) => {
                  const prev = entries[i + 1] ?? null;
                  return (
                    <tr
                      key={e.week_start}
                      className="hover:bg-cream-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="size-8 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                            <CalendarDays className="size-4" strokeWidth={2} />
                          </span>
                          <span className="text-[13px] font-semibold text-ink-800 whitespace-nowrap">
                            {fmtDate(e.week_start)}
                          </span>
                        </span>
                      </td>
                      {COLS.map((c) => (
                        <td key={c.key} className="py-3 px-4 text-right">
                          <ValueCell
                            value={c.fmt(e[c.key])}
                            curr={e[c.key]}
                            prev={prev ? prev[c.key] : null}
                            isPct={c.isPct}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* Per-column config for the log table — distinct icon hue per metric. */
const COLS: {
  key: FieldKey;
  label: string;
  icon: LucideIcon;
  tint: string;
  isPct: boolean;
  fmt: (v: number | null) => string;
}[] = [
  {
    key: "followers",
    label: "Followers",
    icon: Users,
    tint: "bg-rose-100 text-rose-600",
    isPct: false,
    fmt: fmtNum,
  },
  {
    key: "engagement_rate",
    label: "Engagement",
    icon: Heart,
    tint: "bg-[#EFE7F7] text-[#7C5BAE]",
    isPct: true,
    fmt: fmtPct,
  },
  {
    key: "profile_visits",
    label: "Visits",
    icon: Eye,
    tint: "bg-[#E3EDF8] text-[#3E6CA8]",
    isPct: false,
    fmt: fmtNum,
  },
  {
    key: "posts_published",
    label: "Content",
    icon: Clapperboard,
    tint: "bg-[#E2F0E5] text-[#2F8A4E]",
    isPct: false,
    fmt: fmtInt,
  },
];

/** A value plus a green/red change chip vs the previous (older) entry. */
function ValueCell({
  value,
  curr,
  prev,
  isPct,
}: {
  value: string;
  curr: number | null;
  prev: number | null;
  isPct: boolean;
}) {
  let delta: { tone: "up" | "down" | "flat"; text: string } | null = null;
  if (curr != null && prev != null) {
    const d = curr - prev;
    const eps = isPct ? 0.05 : 0.5;
    if (Math.abs(d) < eps) {
      delta = { tone: "flat", text: isPct ? "+0.0" : "+0" };
    } else {
      delta = {
        tone: d > 0 ? "up" : "down",
        text: isPct
          ? Math.abs(d).toFixed(1)
          : Math.round(Math.abs(d)).toLocaleString(),
      };
    }
  }
  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <span className="text-[13.5px] font-semibold text-ink-900 tabular-nums">
        {value}
      </span>
      {delta && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
            delta.tone === "up"
              ? "text-success"
              : delta.tone === "down"
                ? "text-rose-600"
                : "text-ink-400",
          )}
        >
          {delta.tone === "up" && <ArrowUp className="size-3" strokeWidth={2.5} />}
          {delta.tone === "down" && (
            <ArrowDown className="size-3" strokeWidth={2.5} />
          )}
          {delta.text}
        </span>
      )}
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtNum(n: number | null): string {
  return n == null ? "—" : Math.round(n).toLocaleString();
}

function fmtInt(n: number | null): string {
  return n == null ? "—" : String(Math.round(n));
}

function fmtPct(n: number | null): string {
  return n == null ? "—" : `${n.toFixed(1)}%`;
}
