"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bell,
  Mail,
  Inbox,
  CheckCircle2,
  ListTodo,
  GraduationCap,
  Users,
  CalendarClock,
  ShieldAlert,
  Megaphone,
  Newspaper,
  Sparkles,
  Loader2,
  Check,
  RotateCcw,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { saveNotificationPreferences } from "@/app/(app)/notifications/actions";
import type { NotificationPreferences } from "@/lib/notifications/types";

/* ─────────────────────────────────────────────────────────────────────────
   Account-wide notification preferences — organised by channel (email vs
   in-app). Mirrors the admin tutorial `controls-tab.tsx` design language:
   gradient section, header with icon + title + live status pill, quick-
   status row, numbered detail cards in a 2-col grid, and an action row
   with Apply / Discard / Reset.

   Server-backed via `notification_preferences` (upserted per user).
   Initial state hydrates from the `initial` prop; saves go through the
   `saveNotificationPreferences` server action — which accepts a partial
   update, so Apply batches every dirty toggle into a single round-trip.
   ───────────────────────────────────────────────────────────────────── */

type PrefKey = Exclude<keyof NotificationPreferences, "user_id" | "updated_at">;

/** Platform defaults — every channel on. Used by "Reset to defaults". */
const DEFAULTS: Record<PrefKey, boolean> = {
  inapp_tasks:           true,
  inapp_programs:        true,
  inapp_community:       true,
  inapp_events:          true,
  inapp_system:          true,
  email_digest:          true,
  email_alerts:          true,
  email_product_updates: true,
};

type Row = {
  key: PrefKey;
  icon: LucideIcon;
  title: string;
  description: string;
};

const EMAIL_ROWS: Row[] = [
  {
    key:         "email_digest",
    icon:        Newspaper,
    title:       "Weekly digest & updates",
    description: "A roundup of key activity and platform news.",
  },
  {
    key:         "email_alerts",
    icon:        ShieldAlert,
    title:       "Critical email alerts",
    description: "Account, billing, and security alerts you shouldn't miss.",
  },
  {
    key:         "email_product_updates",
    icon:        Megaphone,
    title:       "Product announcements",
    description: "New programs, features, and offers.",
  },
];

const INAPP_ROWS: Row[] = [
  {
    key:         "inapp_tasks",
    icon:        ListTodo,
    title:       "Task reminders",
    description: "Get reminded about your tasks and goals.",
  },
  {
    key:         "inapp_programs",
    icon:        GraduationCap,
    title:       "Program updates",
    description: "New lessons, modules, and progress milestones.",
  },
  {
    key:         "inapp_community",
    icon:        Users,
    title:       "Coach & community messages",
    description: "Replies from your coach and community pings.",
  },
  {
    key:         "inapp_events",
    icon:        CalendarClock,
    title:       "Posting plan alerts",
    description: "Heads-up for scheduled posts and plan changes.",
  },
  {
    key:         "inapp_system",
    icon:        Sparkles,
    title:       "System notices",
    description: "Maintenance, downtime, and platform changes.",
  },
];

export function NotificationsForm({
  initial,
}: {
  initial: NotificationPreferences;
}) {
  /* ── State ─────────────────────────────────────────────────────────── */

  const [values,        setValues]        = useState<Record<PrefKey, boolean>>(() => extract(initial));
  const [savedValues,   setSavedValues]   = useState<Record<PrefKey, boolean>>(() => extract(initial));
  const [lastSavedAt,   setLastSavedAt]   = useState<string>(initial.updated_at);
  const [saving,        startSaving]      = useTransition();
  const [resetting,     startReset]       = useTransition();
  const [error,         setError]         = useState<string | null>(null);
  const [savedFlash,    setSavedFlash]    = useState<Date | null>(null);
  const [recentlySaved, setRecentlySaved] = useState(false);

  // Flip the "Saved" pill off ~5s after a save without reading the clock
  // during render (which would be impure).
  useEffect(() => {
    if (!savedFlash) return;
    const id = window.setTimeout(() => setRecentlySaved(false), 5000);
    return () => window.clearTimeout(id);
  }, [savedFlash]);

  const dirty    = useMemo(() => !shallowEqual(values, savedValues), [values, savedValues]);
  const disabled = saving || resetting;

  const emailEnabled = EMAIL_ROWS.reduce((n, r) => n + (values[r.key] ? 1 : 0), 0);
  const inappEnabled = INAPP_ROWS.reduce((n, r) => n + (values[r.key] ? 1 : 0), 0);

  /* ── Handlers ─────────────────────────────────────────────────────── */

  function update(key: PrefKey, next: boolean) {
    setValues((p) => ({ ...p, [key]: next }));
    setError(null);
  }

  function onApply() {
    if (!dirty || disabled) return;
    setError(null);
    startSaving(async () => {
      const res = await saveNotificationPreferences(values);
      if (!res.ok) {
        setError(res.error ?? "Couldn't save your preferences.");
        return;
      }
      setSavedValues(values);
      setLastSavedAt(new Date().toISOString());
      setSavedFlash(new Date());
      setRecentlySaved(true);
    });
  }

  function onDiscard() {
    setValues(savedValues);
    setError(null);
  }

  function onResetDefaults() {
    if (disabled) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset every notification preference to the platform defaults?",
      );
      if (!ok) return;
    }
    setError(null);
    startReset(async () => {
      const res = await saveNotificationPreferences(DEFAULTS);
      if (!res.ok) {
        setError(res.error ?? "Couldn't reset your preferences.");
        return;
      }
      setValues(DEFAULTS);
      setSavedValues(DEFAULTS);
      setLastSavedAt(new Date().toISOString());
      setSavedFlash(new Date());
      setRecentlySaved(true);
    });
  }

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <section className="rounded-[16px] bg-gradient-to-br from-rose-50/50 via-cream-50/50 to-rose-50/30 border border-rose-100/60 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="inline-flex items-center gap-3 text-h3 text-ink-900">
            <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
              <Bell className="size-[18px]" strokeWidth={2} />
            </span>
            Notifications
          </h1>
          <p className="text-[13px] text-ink-500 mt-1.5 ml-[52px] max-w-2xl leading-snug">
            Choose which emails and in-app alerts you want to receive. Changes
            only apply once you press{" "}
            <span className="font-semibold text-ink-700">Apply changes</span>.
          </p>
        </div>

        <StatusPill
          dirty={dirty}
          savedFlash={savedFlash}
          recentlySaved={recentlySaved}
        />
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-[12px] bg-rose-50 border border-rose-200 text-[12.5px] text-rose-900">
          <AlertCircle className="size-4 text-rose-600 shrink-0 mt-px" strokeWidth={2} />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      {/* Quick-status row */}
      <div className="rounded-[12px] bg-white border border-ink-100 grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink-100 overflow-hidden">
        <QuickStatus
          icon={Mail}
          label="Email channels"
          value={`${emailEnabled} of ${EMAIL_ROWS.length} enabled`}
        />
        <QuickStatus
          icon={Inbox}
          label="In-app channels"
          value={`${inappEnabled} of ${INAPP_ROWS.length} enabled`}
        />
        <QuickStatus
          icon={CheckCircle2}
          label="Last updated"
          value={formatDate(lastSavedAt)}
        />
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* 1 · Email notifications */}
        <DetailCard n={1} title="Email notifications">
          {EMAIL_ROWS.map((r) => (
            <ToggleRow
              key={r.key}
              icon={r.icon}
              title={r.title}
              description={r.description}
              on={values[r.key]}
              onChange={(v) => update(r.key, v)}
              disabled={disabled}
            />
          ))}
        </DetailCard>

        {/* 2 · In-app notifications */}
        <DetailCard n={2} title="In-app notifications">
          {INAPP_ROWS.map((r) => (
            <ToggleRow
              key={r.key}
              icon={r.icon}
              title={r.title}
              description={r.description}
              on={values[r.key]}
              onChange={(v) => update(r.key, v)}
              disabled={disabled}
            />
          ))}
        </DetailCard>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <button
          type="button"
          onClick={onResetDefaults}
          disabled={disabled}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-700 text-[13px] font-semibold hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="size-4" strokeWidth={2} />
          {resetting ? "Resetting…" : "Reset to defaults"}
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {dirty && !saving && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={disabled}
              className="inline-flex items-center gap-2 h-11 px-3 rounded-[12px] bg-transparent text-ink-700 text-[13px] font-semibold hover:text-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Discard changes
            </button>
          )}
          <button
            type="button"
            onClick={onApply}
            disabled={!dirty || disabled}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                Saving…
              </>
            ) : (
              <>
                <Check className="size-4" strokeWidth={2.5} />
                Apply changes
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

function extract(p: NotificationPreferences): Record<PrefKey, boolean> {
  return {
    inapp_tasks:           !!p.inapp_tasks,
    inapp_programs:        !!p.inapp_programs,
    inapp_community:       !!p.inapp_community,
    inapp_events:          !!p.inapp_events,
    inapp_system:          !!p.inapp_system,
    email_digest:          !!p.email_digest,
    email_alerts:          !!p.email_alerts,
    email_product_updates: !!p.email_product_updates,
  };
}

function shallowEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): boolean {
  for (const k of Object.keys(a)) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day:   "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatJustNow(d: Date): string {
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (diff < 5)  return "just now";
  if (diff < 60) return `${Math.round(diff)}s ago`;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Reusable bits — mirror controls-tab structure ─────────────────── */

function StatusPill({
  dirty,
  savedFlash,
  recentlySaved,
}: {
  dirty: boolean;
  savedFlash: Date | null;
  recentlySaved: boolean;
}) {
  const base =
    "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full border text-[12px] font-medium";

  if (dirty) {
    return (
      <div className={cn(base, "bg-amber-50 border-amber-200 text-amber-900")}>
        <span className="size-2 rounded-full bg-amber-500" aria-hidden />
        Unsaved changes
      </div>
    );
  }
  if (recentlySaved && savedFlash) {
    return (
      <div className={cn(base, "bg-emerald-50 border-emerald-200 text-emerald-900")}>
        <Check className="size-3.5 text-success" strokeWidth={2.5} />
        Saved {formatJustNow(savedFlash)}
      </div>
    );
  }
  return (
    <div className={cn(base, "bg-white border-ink-100 text-ink-700")}>
      <Check className="size-3.5 text-success" strokeWidth={2.5} />
      All changes saved
    </div>
  );
}

function QuickStatus({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3 min-w-0">
      <span className="size-10 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[17px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[11.5px] text-ink-500 leading-tight">{label}</div>
        <div className="text-[14px] font-semibold text-ink-900 leading-tight mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <header className="flex items-center gap-2.5 mb-3.5">
        <span className="size-6 rounded-[7px] bg-rose-50 text-rose-600 inline-flex items-center justify-center text-[11.5px] font-bold tabular-nums">
          {n}
        </span>
        <h2 className="text-[14.5px] font-bold text-ink-900">{title}</h2>
      </header>
      <ul className="divide-y divide-ink-100/70">{children}</ul>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  on,
  onChange,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <li
      className={cn(
        "py-3 first:pt-1 last:pb-1 flex items-center gap-3",
        disabled && "opacity-60",
      )}
    >
      <span
        className={cn(
          "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0 transition-colors",
          on ? "bg-rose-50 text-rose-600" : "bg-cream-100 text-ink-500",
        )}
      >
        <Icon className="size-[15px]" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 leading-tight">
          {title}
        </div>
        <div className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
          {description}
        </div>
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </li>
  );
}

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 h-6 w-[44px] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
        on ? "bg-rose-600" : "bg-ink-200",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[23px]" : "translate-x-[3px]",
        )}
        aria-hidden
      />
    </button>
  );
}
