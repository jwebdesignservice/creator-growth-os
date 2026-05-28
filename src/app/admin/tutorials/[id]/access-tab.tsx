"use client";

import {
  Lock,
  Globe,
  Link2,
  EyeOff,
  Check,
  Users,
  Crown,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Access tab — a focused "who can see and access this tutorial" surface.

   It edits two fields that already exist and already persist through the
   editor's single Save button:
     • plan_access (free | basic | pro) — the subscription tier required
     • visibility  (public | unlisted | private) — discoverability

   Both are lifted into the parent editor's form state, so changing them
   here marks the editor dirty and the header "Save changes" writes them
   via `updateLesson` exactly like the Metadata tab. Nothing here is
   frontend-only.
   ───────────────────────────────────────────────────────────────────────── */

type PlanAccess = "free" | "basic" | "pro";
type Visibility = "public" | "unlisted" | "private";

const PLAN_OPTIONS: {
  value: PlanAccess;
  label: string;
  help: string;
  icon: typeof Users;
}[] = [
  {
    value: "free",
    label: "All Access",
    help: "Included in every plan and package — visible to all members.",
    icon: Users,
  },
  {
    value: "basic",
    label: "Basic & Pro",
    help: "Available to Basic and Pro subscribers.",
    icon: Sparkles,
  },
  {
    value: "pro",
    label: "Pro only",
    help: "Premium content — restricted to Pro-tier subscribers.",
    icon: Crown,
  },
];

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  help: string;
  icon: typeof Globe;
}[] = [
  {
    value: "public",
    label: "Public",
    help: "Listed and discoverable to everyone who meets the access tier.",
    icon: Globe,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    help: "Reachable only via a direct link — hidden from listings and search.",
    icon: Link2,
  },
  {
    value: "private",
    label: "Private",
    help: "Only members of the assigned program can view this tutorial.",
    icon: EyeOff,
  },
];

export function AccessTab({
  planAccess,
  setPlanAccess,
  visibility,
  setVisibility,
  published,
}: {
  planAccess: PlanAccess;
  setPlanAccess: (v: PlanAccess) => void;
  visibility: Visibility;
  setVisibility: (v: Visibility) => void;
  published: boolean;
}) {
  const planLabel =
    PLAN_OPTIONS.find((p) => p.value === planAccess)?.label ?? "Basic & Pro";
  const visLabel =
    VISIBILITY_OPTIONS.find((v) => v.value === visibility)?.label ?? "Public";

  /* Plain-language summary of the effective access, computed live. */
  const summary = (() => {
    if (!published) {
      return "This tutorial is a draft — it isn't visible to any learners yet. Publish it from the header to apply the access rules below.";
    }
    const who =
      planAccess === "free"
        ? "all members"
        : planAccess === "basic"
          ? "Basic and Pro subscribers"
          : "Pro subscribers";
    if (visibility === "private") {
      return `Only members of the assigned program can view this tutorial${
        planAccess === "free" ? "" : ` (${planLabel.toLowerCase()})`
      }.`;
    }
    if (visibility === "unlisted") {
      return `Hidden from listings — ${who} can open it via a direct link only.`;
    }
    return `Listed and discoverable to ${who}.`;
  })();

  return (
    <div className="space-y-5">
      {/* Live summary banner */}
      <section className="card p-4 flex items-start gap-3 bg-rose-50/40 border-rose-100">
        <span
          className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0"
          aria-hidden
        >
          <Lock className="size-[18px]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-900">
            Who can access this tutorial
          </div>
          <p className="text-[12.5px] text-ink-600 mt-0.5 leading-snug">
            {summary}
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 h-[26px] rounded-full bg-white border border-ink-200 text-[11.5px] font-semibold text-ink-700">
              <Users className="size-3.5 text-ink-400" strokeWidth={2} />
              {planLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 h-[26px] rounded-full bg-white border border-ink-200 text-[11.5px] font-semibold text-ink-700">
              <Globe className="size-3.5 text-ink-400" strokeWidth={2} />
              {visLabel}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 h-[26px] rounded-full text-[11.5px] font-semibold border",
                published
                  ? "bg-success-bg text-success border-success/20"
                  : "bg-amber-100 text-amber-700 border-amber-200",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  published ? "bg-success" : "bg-amber-500",
                )}
                aria-hidden
              />
              {published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </section>

      {/* Access tier */}
      <section className="card p-5 sm:p-6">
        <CardHeader
          icon={Crown}
          title="Access tier"
          subtitle="The subscription level a learner needs to open this tutorial."
        />
        <div className="space-y-2.5">
          {PLAN_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              help={opt.help}
              selected={planAccess === opt.value}
              onSelect={() => setPlanAccess(opt.value)}
            />
          ))}
        </div>
      </section>

      {/* Visibility */}
      <section className="card p-5 sm:p-6">
        <CardHeader
          icon={Globe}
          title="Visibility"
          subtitle="How learners discover this tutorial once it's published."
        />
        <div className="space-y-2.5">
          {VISIBILITY_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              help={opt.help}
              selected={visibility === opt.value}
              onSelect={() => setVisibility(opt.value)}
            />
          ))}
        </div>
        <footer className="mt-4 pt-3 border-t border-ink-100 flex items-start gap-2 text-[11.5px] text-ink-500">
          <Info className="size-3.5 text-ink-400 shrink-0 mt-px" strokeWidth={2} aria-hidden />
          Access changes take effect as soon as you press “Save changes” in the
          header.
        </footer>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Primitives
   ───────────────────────────────────────────────────────────────────────── */

function CardHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Lock;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex items-start gap-3 mb-4">
      <span
        aria-hidden
        className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0"
      >
        <Icon className="size-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-[20px] sm:text-[22px] text-ink-900 leading-tight">
          {title}
        </h2>
        <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
          {subtitle}
        </p>
      </div>
    </header>
  );
}

function OptionRow({
  icon: Icon,
  label,
  help,
  selected,
  onSelect,
}: {
  icon: typeof Lock;
  label: string;
  help: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full text-left flex items-center gap-3.5 rounded-[12px] border px-4 py-3.5 transition-colors",
        selected
          ? "border-rose-300 bg-rose-50/60 ring-2 ring-rose-100"
          : "border-ink-200 bg-white hover:bg-cream-100",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
          selected ? "bg-rose-100 text-rose-600" : "bg-cream-200 text-ink-500",
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-ink-900">
          {label}
        </span>
        <span className="block text-[12px] text-ink-500 leading-snug mt-0.5">
          {help}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "size-5 rounded-full inline-flex items-center justify-center shrink-0 border-2 transition-colors",
          selected
            ? "bg-rose-600 border-rose-600 text-white"
            : "bg-white border-ink-300 text-transparent",
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    </button>
  );
}
