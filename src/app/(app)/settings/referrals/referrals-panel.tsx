"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Check, Gift, Users, Sparkles, ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import type { ReferralStats } from "@/lib/referrals/queries";

export function ReferralsPanel({ stats }: { stats: ReferralStats }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!stats.shareUrl) return;
    try {
      await navigator.clipboard.writeText(stats.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — fall through silently.
    }
  }

  // Visual progress: 0 → 3 (first milestone), 3 → 9 (second milestone).
  const qualified = stats.qualifiedCount;
  const segments = [
    { label: "1 month free", target: 3 },
    { label: "3 months free", target: 9 },
  ];

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-700 transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} />
          Settings
        </Link>

        <div>
          <h1 className="text-h1 text-ink-900 leading-tight">
            Invite friends, earn free months
          </h1>
          <p className="mt-2 text-ink-500 text-[14px] leading-relaxed">
            Share your link. When a friend signs up and pays for their first
            month, they count toward your milestones.
          </p>
        </div>

        {/* Share link card */}
        <div className="card p-6">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-700 mb-3">
            <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
            Your invite link
          </div>
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={stats.shareUrl ?? ""}
              className="flex-1 h-11 px-3 rounded-[10px] border border-ink-200 bg-cream-50 text-[13px] text-ink-700 font-mono"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              disabled={!stats.shareUrl}
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
          {stats.referralCode && (
            <p className="mt-2 text-[12px] text-ink-500">
              Or share your code:{" "}
              <span className="font-mono font-semibold text-ink-700">
                {stats.referralCode}
              </span>
            </p>
          )}
        </div>

        {/* Progress card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink-700">
              <Users className="size-4 text-rose-500" strokeWidth={2} />
              Progress
            </div>
            <div className="text-[12px] text-ink-500">
              {qualified} qualified
              {stats.pendingCount > 0 && (
                <span className="text-ink-400">
                  {" "}
                  · {stats.pendingCount} pending
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {segments.map((seg) => {
              const pct = Math.min(100, (qualified / seg.target) * 100);
              const reached = qualified >= seg.target;
              return (
                <div key={seg.target}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                    <span className="text-ink-700 font-medium">
                      {seg.target} referrals — {seg.label}
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
            A referral becomes <strong>qualified</strong> after your friend
            successfully pays for their first month. Cancelled trials and
            failed payments don&apos;t count.
          </p>
        </div>

        {/* Rewards earned */}
        {stats.rewards.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink-700 mb-4">
              <Gift className="size-4 text-rose-500" strokeWidth={2} />
              Rewards earned
            </div>
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
                      — {r.milestone} referrals milestone
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
          </div>
        )}
      </div>
    </PageShell>
  );
}
