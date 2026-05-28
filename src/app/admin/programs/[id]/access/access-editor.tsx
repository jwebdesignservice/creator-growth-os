"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gift,
  Star,
  Zap,
  Gem,
  Shield,
  Lock,
  Eye,
  Info,
  Users,
  CalendarDays,
  Menu,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Loader2,
  ExternalLink,
  Check,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { saveProgramAccess } from "@/app/admin/programs/actions";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   /admin/programs/[id]/access — choose which membership tiers can access a
   program, set enrollment-behavior rules, and leave an internal note. The
   tier cards (section 1) and availability toggles (section 2) are two views
   of the same `allowed` set, kept in sync. Save persists through
   `saveProgramAccess`, which also keeps the legacy `plan_access` column in
   line so the rest of the app's gating stays consistent.
   ───────────────────────────────────────────────────────────────────────── */

type Plan = "free" | "basic" | "pro" | "diamond";

const PLAN_META: { key: Plan; name: string; icon: LucideIcon; blurb: string }[] = [
  { key: "free",    name: "Free",    icon: Gift, blurb: "For new members exploring Profluencer." },
  { key: "basic",   name: "Basic",   icon: Star, blurb: "Core tools and learning resources." },
  { key: "pro",     name: "Pro",     icon: Zap,  blurb: "Advanced learning and brand opportunities." },
  { key: "diamond", name: "Diamond", icon: Gem,  blurb: "Elite access and exclusive opportunities." },
];

const fmt = (n: number) => n.toLocaleString("en-US");
const nameOf = (p: Plan) => PLAN_META.find((m) => m.key === p)?.name ?? p;

function sameSet(a: Plan[], b: Plan[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export function AccessEditor({
  programId,
  programTitle,
  programSlug,
  initialAllowedPlans,
  initialInstant,
  initialWhileValid,
  initialRevokeFuture,
  initialAdminNote,
  memberCounts,
  tableMissing,
}: {
  programId: string;
  programTitle: string;
  programSlug: string;
  initialAllowedPlans: Plan[];
  initialInstant: boolean;
  initialWhileValid: boolean;
  initialRevokeFuture: boolean;
  initialAdminNote: string;
  memberCounts: Record<Plan, number>;
  tableMissing: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [allowed, setAllowed] = useState<Plan[]>(initialAllowedPlans);
  const [instant, setInstant] = useState(initialInstant);
  const [whileValid, setWhileValid] = useState(initialWhileValid);
  const [revokeFuture, setRevokeFuture] = useState(initialRevokeFuture);
  const [adminNote, setAdminNote] = useState(initialAdminNote);
  const [noteOpen, setNoteOpen] = useState(initialAdminNote.trim().length > 0);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Baseline = last-saved state. Drives the "Live access rules" panel and
  // dirty detection; updated locally on a successful save.
  const [baseline, setBaseline] = useState({
    allowed: initialAllowedPlans,
    instant: initialInstant,
    whileValid: initialWhileValid,
    revokeFuture: initialRevokeFuture,
    adminNote: initialAdminNote.trim(),
  });

  const dirty =
    !sameSet(allowed, baseline.allowed) ||
    instant !== baseline.instant ||
    whileValid !== baseline.whileValid ||
    revokeFuture !== baseline.revokeFuture ||
    adminNote.trim() !== baseline.adminNote;

  // Live (saved) plans — keep canonical tier order for display.
  const livePlans = useMemo(
    () => PLAN_META.map((m) => m.key).filter((k) => baseline.allowed.includes(k)),
    [baseline.allowed],
  );
  const totalLive = livePlans.reduce((sum, p) => sum + (memberCounts[p] ?? 0), 0);

  function togglePlan(p: Plan) {
    setAllowed((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p],
    );
  }

  async function onSave() {
    if (saving || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await saveProgramAccess(programId, {
        allowedPlans: allowed,
        instant,
        whileValid,
        revokeFuture,
        adminNote: adminNote.trim() || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
      setBaseline({
        allowed,
        instant,
        whileValid,
        revokeFuture,
        adminNote: adminNote.trim(),
      });
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-[1320px]">
      {/* Breadcrumb */}
      <nav className="text-[12.5px]" aria-label="Breadcrumb">
        <Link href="/admin/programs" className="text-rose-600 hover:text-rose-700 font-medium">
          Programs
        </Link>
        <span className="mx-2 text-ink-400">/</span>
        <Link
          href={`/admin/programs/${programId}`}
          className="text-ink-500 hover:text-ink-800 transition-colors"
        >
          {programTitle}
        </Link>
        <span className="mx-2 text-ink-400">/</span>
        <span className="text-ink-700">Access</span>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink-900 leading-tight">Access</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500 max-w-xl leading-relaxed">
            Manage who can access this program across membership tiers.
            Changes you save will apply to all current and future members.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`/programs/${programSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold shadow-sm disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : null}
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </header>

      {tableMissing && (
        <div className="rounded-[12px] bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-[12.5px] text-amber-900 leading-snug">
            <strong>Setup required.</strong> Apply migration{" "}
            <code className="font-mono">0035_program_access.sql</code> to enable
            saving. You can still preview the layout below.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-[12px] bg-rose-50 border border-rose-200 px-4 py-3 text-[12.5px] text-rose-700">
          {error}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-5 items-start">
        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">
          {/* Section 1 · Membership tiers */}
          <section className="card p-5 sm:p-6">
            <SectionTitle
              n={1}
              title="Membership tiers"
              subtitle="Select which membership plans can access this program."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {PLAN_META.map((plan) => {
                const Icon = plan.icon;
                const selected = allowed.includes(plan.key);
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => togglePlan(plan.key)}
                    aria-pressed={selected}
                    className={cn(
                      "relative text-left rounded-[14px] border p-4 transition-colors cursor-pointer",
                      selected
                        ? "border-rose-300 bg-rose-50/60 ring-1 ring-rose-200"
                        : "border-ink-100 bg-white hover:bg-cream-100/60",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-3 right-3 size-[18px] rounded-[6px] border inline-flex items-center justify-center transition-colors",
                        selected
                          ? "bg-rose-600 border-rose-600 text-white"
                          : "bg-white border-ink-300",
                      )}
                    >
                      {selected && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <div className="flex items-center gap-2.5 mb-2.5 pr-6">
                      <span
                        aria-hidden
                        className={cn(
                          "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
                          selected
                            ? "bg-rose-100 text-rose-600"
                            : "bg-cream-100 text-ink-500",
                        )}
                      >
                        <Icon className="size-[18px]" strokeWidth={2} />
                      </span>
                      <span className="text-[15px] font-bold text-ink-900">
                        {plan.name}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500 leading-snug min-h-[32px]">
                      {plan.blurb}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-500">
                      <Users className="size-3.5" strokeWidth={2} />
                      {fmt(memberCounts[plan.key] ?? 0)} members
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2 · Program availability */}
          <section className="card p-5 sm:p-6">
            <SectionTitle
              n={2}
              title="Program availability"
              subtitle="Choose which plans are allowed to access this program."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {PLAN_META.map((plan) => {
                const on = allowed.includes(plan.key);
                return (
                  <div
                    key={plan.key}
                    className="flex items-center gap-2.5 rounded-[12px] border border-ink-100 bg-white px-3 py-2.5 min-w-0"
                  >
                    <Toggle on={on} onClick={() => togglePlan(plan.key)} label={`Allow ${plan.name}`} />
                    <span className="text-[13px] font-medium text-ink-900 shrink-0">
                      {plan.name}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-ink-500 truncate">
                      <Users className="size-3 shrink-0" strokeWidth={2} />
                      {fmt(memberCounts[plan.key] ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-[10px] bg-cream-100/70 border border-ink-100 px-3.5 py-2.5 flex items-start gap-2.5">
              <Info className="size-4 text-ink-400 mt-0.5 shrink-0" strokeWidth={2} />
              <p className="text-[12px] text-ink-600 leading-snug">
                Members on selected plans can view and enroll in this program.
                Changes take effect immediately.
              </p>
            </div>
          </section>

          {/* Section 3 · Access rules */}
          <section className="card p-5 sm:p-6">
            <header className="mb-3">
              <h2 className="text-[18px] font-bold text-ink-900 leading-tight">
                Access rules &amp; enrollment behavior
              </h2>
              <p className="text-[12.5px] text-ink-500 mt-0.5">
                Define how access works and what happens when membership status
                changes.
              </p>
            </header>
            <div className="divide-y divide-ink-100">
              <RuleRow
                icon={Zap}
                title="New members get instant access"
                desc="Members on eligible plans can access this program right away."
                on={instant}
                onToggle={() => setInstant((v) => !v)}
              />
              <RuleRow
                icon={Shield}
                title="Access remains active while membership is valid"
                desc="Members retain access as long as their plan remains eligible."
                on={whileValid}
                onToggle={() => setWhileValid((v) => !v)}
              />
              <RuleRow
                icon={Lock}
                title="Removed access revokes future lesson visibility"
                desc="If a member's plan loses access, they can't view new lesson content."
                on={revokeFuture}
                onToggle={() => setRevokeFuture((v) => !v)}
              />

              {/* Admin note (expandable) */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => setNoteOpen((v) => !v)}
                  aria-expanded={noteOpen}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <span
                    aria-hidden
                    className="size-9 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0"
                  >
                    <ClipboardList className="size-[18px]" strokeWidth={2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink-900">
                      Admin note{" "}
                      <span className="font-normal text-ink-400">(optional)</span>
                    </div>
                    <div className="text-[12px] text-ink-500 truncate">
                      {adminNote.trim()
                        ? adminNote.trim()
                        : "Add an internal note about this program's access rules…"}
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 text-ink-400 shrink-0 transition-transform",
                      noteOpen && "rotate-90",
                    )}
                    strokeWidth={2}
                  />
                </button>
                {noteOpen && (
                  <div className="mt-3 pl-12">
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value.slice(0, 2000))}
                      rows={4}
                      maxLength={2000}
                      placeholder="e.g. Diamond launch tier only until Q3 — revisit after the cohort."
                      className="w-full p-3 rounded-[10px] border border-ink-200 bg-white text-[13px] text-ink-900 placeholder:text-ink-400 leading-relaxed focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors resize-y"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
                      <span>Visible to admins only.</span>
                      <span className="tabular-nums">{adminNote.length}/2000</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ── Right rail ──────────────────────────────────────────────── */}
        <aside className="space-y-5 min-w-0">
          {/* Access overview */}
          <section className="card p-5">
            <header className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-bold text-ink-900">Access overview</h3>
              <span className="inline-flex items-center gap-1.5 px-2 h-[22px] rounded-full bg-success-bg text-success border border-success/20 text-[11px] font-semibold">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Live
              </span>
            </header>
            <p className="text-[11.5px] text-ink-500 mb-4">Live access rules</p>

            <div className="space-y-4">
              <div>
                <div className="text-[11.5px] text-ink-500 mb-1.5">Active plans</div>
                {livePlans.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {livePlans.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center h-6 px-2.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[11.5px] font-semibold"
                      >
                        {nameOf(p)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[12.5px] text-ink-400">No plans — hidden from everyone</span>
                )}
              </div>

              <div className="pt-3 border-t border-ink-100">
                <div className="text-[11.5px] text-ink-500 mb-0.5">
                  Total members with access
                </div>
                <div className="text-[28px] font-bold text-ink-900 leading-none tabular-nums">
                  {fmt(totalLive)}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-400">
                  Estimated <Info className="size-3" strokeWidth={2} />
                </div>
              </div>

              <div className="pt-3 border-t border-ink-100">
                <div className="text-[11.5px] text-ink-500 mb-0.5">Pending changes</div>
                <div
                  className={cn(
                    "text-[14px] font-semibold",
                    dirty ? "text-amber-700" : "text-ink-900",
                  )}
                >
                  {dirty ? "Unsaved changes" : "None"}
                </div>
                <div className="text-[12px] text-ink-500">
                  {dirty
                    ? "Save to apply your changes."
                    : savedAt
                      ? "All changes saved."
                      : "You have no unsaved changes."}
                </div>
              </div>

              <div className="rounded-[10px] bg-rose-50/70 border border-rose-100 p-3 flex items-start gap-2.5">
                <CalendarDays className="size-4 text-rose-500 mt-0.5 shrink-0" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-[12px] text-ink-700 leading-snug">
                    Changes you save will apply immediately to all eligible
                    members.
                  </p>
                  <Link
                    href="/support"
                    className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Learn more about access
                    <ExternalLink className="size-3" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Member experience preview */}
          <section className="card p-5">
            <h3 className="text-[15px] font-bold text-ink-900">
              Member experience preview
            </h3>
            <p className="text-[12px] text-ink-500 mt-0.5 mb-3">
              This is what eligible members will see.
            </p>
            <div className="rounded-[14px] border border-ink-100 bg-cream-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-ink-400">
                  Profluencer
                </span>
                <Menu className="size-4 text-ink-300" strokeWidth={2} />
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.16em] font-bold text-ink-400">
                Program
              </div>
              <div className="text-[18px] font-bold text-rose-600 leading-tight truncate">
                {programTitle}
              </div>
              <ul className="mt-3 space-y-1.5">
                {[
                  "You have access to this program",
                  "Start learning at your own pace",
                  "Track your progress",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-2 text-[12.5px] text-ink-700"
                  >
                    <CheckCircle2 className="size-4 text-rose-500 shrink-0" strokeWidth={2} />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-4 w-full h-9 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold inline-flex items-center justify-center">
                Open program
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Small pieces
   ───────────────────────────────────────────────────────────────────────── */

function SectionTitle({
  n,
  title,
  subtitle,
}: {
  n: number;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-4">
      <h2 className="text-[18px] font-bold text-ink-900 leading-tight">
        {n}. {title}
      </h2>
      <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>
    </header>
  );
}

function RuleRow({
  icon: Icon,
  title,
  desc,
  on,
  onToggle,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span
        aria-hidden
        className="size-9 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0"
      >
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink-900">{title}</div>
        <div className="text-[12px] text-ink-500 leading-snug">{desc}</div>
      </div>
      <Toggle on={on} onClick={onToggle} label={title} />
    </div>
  );
}

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        "relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 cursor-pointer",
        on ? "bg-rose-500" : "bg-ink-200",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
