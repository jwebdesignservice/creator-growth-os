"use client";

import { useTransition } from "react";
import { Share2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import { disconnectPlatform, syncPlatform } from "@/lib/social/actions";
import type { SocialConnection } from "@/lib/social/queries";

/* ─────────────────────────────────────────────────────────────────────────────
   Connect Social Accounts — real OAuth flow.

   Each platform has three possible states:
   - connected      → tokens exist; show handle + Disconnect button.
   - not_connected  → env credentials set; Connect button hits /api/oauth/X/start.
   - setup_pending  → env credentials missing; button is disabled with a hint
                      (admin needs to register a developer app + set env vars).

   Per-platform metric sync (followers, views, etc.) is a separate concern
   and lives in src/lib/social/<provider>.ts.
   ───────────────────────────────────────────────────────────────────────────── */

type Props = { connections: SocialConnection[] };

export function ConnectSocialCard({ connections }: Props) {
  // Only one social platform may be connected at a time. If any is
  // connected, every OTHER row's Connect button is disabled with a
  // hint to disconnect first.
  const activeConnection = connections.find(
    (c) => c.connectionStatus === "connected",
  );
  const activeLabel = activeConnection?.label ?? null;

  return (
    <section className="card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Share2 className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h2 className="text-h4 text-ink-900 leading-tight">
              Connect Social Accounts
            </h2>
            <p className="text-[13px] text-ink-500 mt-1 max-w-[58ch] leading-snug">
              Connect one of your creator platforms to enable automatic
              performance tracking. Pick the one you focus on most — you can
              switch by disconnecting and connecting another.
            </p>
          </div>
        </div>
        <span className="chip chip-rose shrink-0">Analytics sync</span>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {connections.map((c) => (
          <PlatformRow
            key={c.platform}
            conn={c}
            lockedByOther={
              activeConnection != null &&
              activeConnection.platform !== c.platform
            }
            activeLabel={activeLabel}
          />
        ))}
      </ul>

      <p className="text-[11.5px] text-ink-400 mt-5 leading-snug">
        Only one platform can be connected at a time. Disconnect the current
        one to switch to another.
      </p>
    </section>
  );
}

// ── Per-platform row ──────────────────────────────────────────────────

function PlatformRow({
  conn,
  lockedByOther,
  activeLabel,
}: {
  conn: SocialConnection;
  lockedByOther: boolean;
  activeLabel: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function connect() {
    // Hard navigation — let the browser do the OAuth dance.
    window.location.href = `/api/oauth/${conn.platform}/start`;
  }

  function disconnect() {
    if (!confirm(`Disconnect ${conn.label}?`)) return;
    startTransition(async () => {
      await disconnectPlatform(conn.platform);
    });
  }

  function sync() {
    startTransition(async () => {
      await syncPlatform(conn.platform);
    });
  }

  const Icon = iconFor(conn.platform);
  const statusText = statusLabel(conn);

  // Hint shown below the status line. For not-connected/setup-pending
  // platforms we surface the account-type requirement so users know
  // what they need before clicking Connect. For connected platforms we
  // show sync state — either a "last synced N min ago" timestamp, the
  // most recent sync error, or "followers: X" once a count is available.
  let hintBelow: string | null = null;
  let hintTone: "muted" | "error" = "muted";
  // Optional second-line diagnostic — e.g. "Insights API returned 0…"
  // shown when the primary line is fine but a sub-metric came up empty.
  let secondaryHint: string | null = null;
  if (conn.connectionStatus === "connected") {
    if (conn.syncStatus === "error" && conn.syncError) {
      hintBelow = conn.syncError;
      hintTone = "error";
    } else if (conn.followerCount != null) {
      const followers = conn.followerCount.toLocaleString();
      const synced = conn.lastSyncedAt ? relativeTime(conn.lastSyncedAt) : null;
      hintBelow = synced
        ? `${followers} followers · synced ${synced}`
        : `${followers} followers`;
      // The sync writes "ok" as the sentinel for the happy path. Show
      // any other diagnostic as a small italic line below — it'll be
      // user-friendly copy, not raw API errors.
      if (conn.insightsStatus && conn.insightsStatus !== "ok") {
        secondaryHint = conn.insightsStatus;
      }
    } else if (conn.lastSyncedAt) {
      hintBelow = `Synced ${relativeTime(conn.lastSyncedAt)}`;
    }
  } else if (lockedByOther) {
    // Override the requirement hint with the disconnect-first message
    // so users understand why the Connect button is greyed out.
    hintBelow = activeLabel
      ? `Disconnect ${activeLabel} first to switch to ${conn.label}.`
      : "Disconnect the current platform first to switch.";
  } else {
    hintBelow = REQUIREMENT_HINT[conn.platform] ?? null;
  }

  return (
    <li className="rounded-[12px] bg-cream-50 border border-ink-100 overflow-hidden">
      {/* Main row: icon · label/status · CTA */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Icon className="text-rose-600" size={16} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900 leading-tight truncate flex items-center gap-1.5">
            {conn.label}
            {conn.connectionStatus === "connected" && (
              <CheckCircle2
                className="size-3.5 text-emerald-500 shrink-0"
                strokeWidth={2.2}
              />
            )}
            {conn.connectionStatus === "setup_pending" && (
              <AlertCircle
                className="size-3.5 text-amber-500 shrink-0"
                strokeWidth={2.2}
                aria-label="Setup pending"
              />
            )}
          </div>
          <div
            className={cn(
              "text-[11.5px] mt-0.5 truncate",
              conn.connectionStatus === "connected"
                ? "text-emerald-700"
                : conn.connectionStatus === "setup_pending"
                  ? "text-amber-700"
                  : "text-ink-500",
            )}
          >
            {statusText}
          </div>
        </div>

        {/* CTA */}
        {conn.connectionStatus === "connected" ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={sync}
              disabled={pending}
              aria-label={`Sync ${conn.label} now`}
              title="Sync now"
              className="inline-flex items-center justify-center size-8 rounded-[10px] text-ink-500 hover:text-ink-900 hover:bg-cream-100 disabled:opacity-50"
            >
              <RefreshCw
                className={cn("size-3.5", pending && "animate-spin")}
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              onClick={disconnect}
              disabled={pending}
              className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium bg-white border border-ink-100 text-ink-700 hover:bg-cream-100 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        ) : conn.connectionStatus === "not_connected" ? (
          lockedByOther ? (
            <button
              type="button"
              disabled
              aria-disabled
              title={`Disconnect ${activeLabel ?? "the current platform"} to connect ${conn.label}.`}
              className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0 bg-white border border-ink-100 text-ink-400 cursor-not-allowed"
            >
              Locked
            </button>
          ) : (
            <button
              type="button"
              onClick={connect}
              aria-label={`Connect ${conn.label}`}
              className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0 bg-rose-600 hover:bg-rose-700 text-white"
            >
              Connect
            </button>
          )
        ) : (
          <button
            type="button"
            disabled
            aria-disabled
            title={`Admin: configure ${conn.label} OAuth credentials to enable.`}
            className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0 bg-white border border-ink-100 text-ink-400 cursor-not-allowed"
          >
            Setup pending
          </button>
        )}
      </div>

      {/* Hint row: full-width below the main row so the text wraps cleanly.
          - Not connected / setup pending → account-type requirement.
          - Connected with metric         → "X followers · synced Yago".
          - Connected with sync error     → red error message. */}
      {hintBelow && (
        <div
          className={cn(
            "px-3 -mt-0.5 text-[10.5px] leading-snug",
            secondaryHint ? "pb-0.5" : "pb-2.5",
            hintTone === "error" ? "text-rose-600" : "text-ink-400",
          )}
        >
          {hintBelow}
        </div>
      )}
      {secondaryHint && (
        <div className="px-3 pb-2.5 text-[10.5px] text-ink-400 leading-snug">
          {secondaryHint}
        </div>
      )}
    </li>
  );
}

// ── Status copy ──────────────────────────────────────────────────────

function statusLabel(c: SocialConnection): string {
  if (c.connectionStatus === "connected") {
    return c.handle
      ? `Connected as @${c.handle.replace(/^@/, "")}`
      : c.displayName
        ? `Connected as ${c.displayName}`
        : "Connected";
  }
  if (c.connectionStatus === "setup_pending") {
    return "Setup pending (no credentials)";
  }
  return "Not connected";
}

// ── Relative-time formatter for "synced N minutes ago" ───────────────

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Per-platform account-requirement hints ───────────────────────────
// Shown as small grey text below the status line so users know what kind
// of account they need *before* attempting to connect. Skip if the
// platform has no special requirement (don't add noise).

const REQUIREMENT_HINT: Partial<Record<SocialConnection["platform"], string>> = {
  instagram:
    "Requires a Business or Creator account linked to a Facebook Page.",
  facebook:
    "Requires a Page (personal profile data only without a managed Page).",
  tiktok:
    "Basic profile only — full analytics require partner approval.",
  linkedin:
    "Profile only — Page analytics require LinkedIn Marketing Partner access.",
  snapchat: "Limited data (display name & avatar only).",
  // YouTube has no special account-type requirement to show.
};

// ── Icon lookup ──────────────────────────────────────────────────────

function iconFor(key: SocialConnection["platform"]) {
  switch (key) {
    case "instagram":
      return InstagramIcon;
    case "tiktok":
      return TiktokIcon;
    case "youtube":
      return YoutubeIcon;
    case "snapchat":
      return SnapchatIcon;
    case "facebook":
      return FacebookIcon;
    case "linkedin":
      return LinkedinIcon;
  }
}

/* ── Inline brand icons (kept inside the card for self-containment) ─── */

function SnapchatIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.5c-3 0-5 2.2-5 5 0 1 .1 2 .2 2.8-.6.2-1.3.5-1.5 1-.2.7.7 1.2 1.4 1.5.4.2.9.3 1 .7-.5 1.5-2.2 2.4-3.6 2.7-.4.1-.5.5-.2.7 1 .9 2.6 1.1 3.4 1.3.1.5.3 1.1.8 1.3.6.3 1.4 0 2.3-.1.7 0 1.6.1 2.2.7.6.6 1.7.6 2.3 0 .6-.6 1.5-.7 2.2-.7.9.1 1.7.4 2.3.1.5-.2.7-.8.8-1.3.8-.2 2.4-.4 3.4-1.3.3-.2.2-.6-.2-.7-1.4-.3-3.1-1.2-3.6-2.7.1-.4.6-.5 1-.7.7-.3 1.6-.8 1.4-1.5-.2-.5-.9-.8-1.5-1 .1-.8.2-1.8.2-2.8 0-2.8-2-5-5-5Z" />
    </svg>
  );
}

function FacebookIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}

function LinkedinIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M4.6 8.5h3v11h-3v-11Zm1.5-4.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM10 8.5h2.9v1.5h.1c.4-.7 1.4-1.7 2.9-1.7 3.1 0 3.7 2 3.7 4.7v6h-3v-5.3c0-1.3 0-2.9-1.8-2.9-1.8 0-2 1.4-2 2.8v5.4h-3v-11Z" />
    </svg>
  );
}
