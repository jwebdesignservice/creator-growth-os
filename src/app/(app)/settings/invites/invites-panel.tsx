"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Gift,
  Mail,
  RotateCcw,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { cn } from "@/lib/cn";
import type {
  ReferralActivityItem,
  ReferralStats,
} from "@/lib/referrals/queries";

/** Referral milestones — mirrors the thresholds enforced in the backend. */
const MILESTONES = [
  { target: 3, label: "1 month free" },
  { target: 9, label: "3 months free" },
] as const;

/* Stable refs for `useSyncExternalStore` — feature-detect the Web Share
   API without a hydration mismatch (server snapshot is `false`, the client
   upgrades on mount) and without calling setState inside an effect. */
const subscribeNoop = () => () => {};
const getShareSnapshot = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getShareServerSnapshot = () => false;

export function InvitesPanel({
  stats,
  activity,
}: {
  stats: ReferralStats;
  activity: ReferralActivityItem[];
}) {
  const [copied, setCopied] = useState(false);

  // Web Share API availability — server renders `false`, the client
  // upgrades on mount without a hydration mismatch.
  const canShare = useSyncExternalStore(
    subscribeNoop,
    getShareSnapshot,
    getShareServerSnapshot,
  );

  const shareUrl = stats.shareUrl ?? "";
  const qualified = stats.qualifiedCount;
  const totalInvites = stats.qualifiedCount + stats.pendingCount;
  const monthsEarned = useMemo(
    () => stats.rewards.reduce((sum, r) => sum + r.monthsFree, 0),
    [stats.rewards],
  );

  const nextTarget = stats.nextMilestone?.threshold ?? null;
  const toNext = nextTarget != null ? Math.max(0, nextTarget - qualified) : 0;

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — fall through silently.
    }
  }

  async function nativeShare() {
    if (!shareUrl) return;
    try {
      await navigator.share({
        title: "Join me on Creator Growth OS",
        text: "I am growing my audience with Creator Growth OS — join with my invite link:",
        url: shareUrl,
      });
    } catch {
      // Cancelled or unsupported — ignore.
    }
  }

  // Opens the user's own mail client with a pre-filled draft. The user
  // sends it themselves; nothing is dispatched on their behalf.
  const mailtoHref = shareUrl
    ? `mailto:?subject=${encodeURIComponent(
        "Join me on Creator Growth OS",
      )}&body=${encodeURIComponent(
        `I am growing my audience with Creator Growth OS and thought you would like it too.\n\nSign up with my invite link and we both benefit:\n${shareUrl}`,
      )}`
    : undefined;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Heading */}
        <header>
          <h1 className="text-h1 text-ink-900 leading-tight">Invites</h1>
          <p className="mt-2 text-ink-500 text-[14px] leading-relaxed">
            Share your link, track who joins, and earn free months as your
            invites qualify.
          </p>
        </header>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Total invites" value={totalInvites} />
          <StatTile label="Qualified" value={qualified} accent="emerald" />
          <StatTile label="Pending" value={stats.pendingCount} />
          <StatTile label="Free months" value={monthsEarned} accent="rose" />
        </div>

        {/* Share / affiliate link */}
        <section className="card p-6">
          <CardHead icon={Sparkles} title="Your invite link" />
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={shareUrl}
              placeholder="Generating your link…"
              className="flex-1 h-11 px-3 rounded-[10px] border border-ink-200 bg-cream-50 text-[13px] text-ink-700 font-mono"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              disabled={!shareUrl}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" strokeWidth={2.5} /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" strokeWidth={2} /> Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {canShare && (
              <button
                type="button"
                onClick={nativeShare}
                disabled={!shareUrl}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-50 disabled:opacity-50 text-[12.5px] font-medium text-ink-700 transition-colors"
              >
                <Share2 className="size-3.5" strokeWidth={2} /> Share
              </button>
            )}
            {mailtoHref && (
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-50 text-[12.5px] font-medium text-ink-700 transition-colors"
              >
                <Mail className="size-3.5" strokeWidth={2} /> Email invite
              </a>
            )}
            {stats.referralCode && (
              <span className="ml-auto text-[12px] text-ink-500">
                Code:{" "}
                <span className="font-mono font-semibold text-ink-700">
                  {stats.referralCode}
                </span>
              </span>
            )}
          </div>
        </section>

        {/* Milestone progress */}
        <section className="card p-6">
          <CardHead
            icon={TrendingUp}
            title="Milestone progress"
            right={
              <span className="text-[12px] text-ink-500">
                {qualified} qualified
                {stats.pendingCount > 0 && (
                  <span className="text-ink-400">
                    {" "}
                    · {stats.pendingCount} pending
                  </span>
                )}
              </span>
            }
          />

          {nextTarget != null ? (
            <p className="mb-4 text-[13px] text-ink-600">
              <span className="font-semibold text-ink-900">{toNext}</span> more
              qualified {toNext === 1 ? "invite" : "invites"} until your next
              reward.
            </p>
          ) : (
            <p className="mb-4 text-[13px] text-emerald-700 font-medium">
              You have unlocked every invite milestone — thank you!
            </p>
          )}

          <div className="space-y-4">
            {MILESTONES.map((seg) => {
              const pct = Math.min(100, (qualified / seg.target) * 100);
              const reached = qualified >= seg.target;
              return (
                <div key={seg.target}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                    <span className="text-ink-700 font-medium">
                      {seg.target} invites — {seg.label}
                    </span>
                    <span
                      className={
                        reached
                          ? "text-emerald-600 font-semibold"
                          : "text-ink-500"
                      }
                    >
                      {reached
                        ? "Earned"
                        : `${Math.min(qualified, seg.target)}/${seg.target}`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={
                        reached
                          ? "h-full bg-emerald-500 transition-all"
                          : "h-full bg-rose-500 transition-all"
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[12px] text-ink-500 leading-relaxed">
            An invite becomes <strong>qualified</strong> once your friend pays
            for their first month. Cancelled trials and failed payments do not
            count.
          </p>
        </section>

        {/* Invite activity */}
        <section className="card p-6">
          <CardHead
            icon={Users}
            title="Invite activity"
            right={
              activity.length > 0 ? (
                <span className="text-[12px] text-ink-500">
                  {activity.length} total
                </span>
              ) : undefined
            }
          />

          {activity.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-ink-200 bg-cream-50/60 px-4 py-8 text-center">
              <p className="text-[13px] text-ink-600 font-medium">
                No invites yet
              </p>
              <p className="mt-1 text-[12px] text-ink-500">
                Share your link above — invites show up here the moment someone
                signs up with it.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ul>
          )}

          <p className="mt-4 text-[12px] text-ink-400 leading-relaxed">
            For privacy, invited creators are shown by status only — never by
            name or email.
          </p>
        </section>

        {/* Rewards earned */}
        <section className="card p-6">
          <CardHead icon={Gift} title="Rewards earned" />
          {stats.rewards.length === 0 ? (
            <div className="flex items-center gap-3 rounded-[12px] bg-cream-50/60 border border-ink-100 px-4 py-3.5">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 shrink-0">
                <Award className="size-5" strokeWidth={2} />
              </span>
              <p className="text-[12.5px] text-ink-600">
                No rewards yet. Your first free month unlocks at{" "}
                <strong className="text-ink-800">3 qualified invites</strong>.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {stats.rewards.map((r) => (
                <li
                  key={r.milestone}
                  className="flex items-center justify-between text-[13px] rounded-[10px] bg-emerald-50 border border-emerald-100 px-3.5 py-2.5"
                >
                  <span className="text-ink-800">
                    <strong>{r.monthsFree}</strong> month
                    {r.monthsFree > 1 ? "s" : ""} free
                    <span className="text-ink-500">
                      {" "}
                      — {r.milestone} invites milestone
                    </span>
                  </span>
                  <span
                    className={
                      r.appliedToSubscription
                        ? "text-emerald-700 text-[11.5px] font-semibold"
                        : "text-amber-700 text-[11.5px] font-semibold"
                    }
                  >
                    {r.appliedToSubscription ? "Applied" : "Queued"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  accent = "ink",
}: {
  label: string;
  value: number;
  accent?: "ink" | "emerald" | "rose";
}) {
  const valueColor =
    accent === "emerald"
      ? "text-emerald-600"
      : accent === "rose"
        ? "text-rose-600"
        : "text-ink-900";
  return (
    <div className="card-flat p-4">
      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-[26px] leading-none font-bold tabular-nums",
          valueColor,
        )}
      >
        {value.toLocaleString("en-US")}
      </div>
    </div>
  );
}

function CardHead({
  icon: Icon,
  title,
  right,
}: {
  icon: LucideIcon;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-700">
        <Icon className="size-4 text-rose-500" strokeWidth={2} />
        {title}
      </div>
      {right}
    </div>
  );
}

const STATUS_META: Record<
  ReferralActivityItem["status"],
  { label: string; icon: LucideIcon; dot: string; pill: string }
> = {
  qualified: {
    label: "Qualified",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    dot: "bg-amber-500",
    pill: "bg-amber-50 border-amber-100 text-amber-700",
  },
  reverted: {
    label: "Reverted",
    icon: RotateCcw,
    dot: "bg-ink-300",
    pill: "bg-cream-100 border-ink-100 text-ink-500",
  },
};

function ActivityRow({ item }: { item: ReferralActivityItem }) {
  const meta = STATUS_META[item.status];
  const Icon = meta.icon;
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-cream-100 text-ink-500 shrink-0">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-ink-800">
          Referred creator
        </div>
        <div className="text-[12px] text-ink-500">
          Joined {fmtDate(item.createdAt)}
          {item.qualifiedAt ? <> · Qualified {fmtDate(item.qualifiedAt)}</> : null}
        </div>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[11px] font-semibold",
          meta.pill,
        )}
      >
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {meta.label}
      </span>
    </li>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
