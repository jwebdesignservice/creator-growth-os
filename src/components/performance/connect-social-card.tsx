"use client";

import { useState, useTransition } from "react";
import { Share2, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { disconnectPlatform, syncPlatform } from "@/lib/social/actions";
import type { SocialConnection } from "@/lib/social/queries";

/* ─────────────────────────────────────────────────────────────────────────────
   Connect Social Accounts — real OAuth flow.

   Each platform has three possible states:
   - connected      → tokens exist; show synced info + Sync / Disconnect.
   - not_connected  → env credentials set; Connect button hits /api/oauth/X/start.
   - setup_pending  → env credentials missing; button disabled with a hint.
   ───────────────────────────────────────────────────────────────────────────── */

type Props = { connections: SocialConnection[] };

/* Per-platform brand tile — the icon sits white (or dark, for Snapchat) on the
   platform's brand colour, like the real app chrome. */
const BRAND: Record<SocialConnection["platform"], { tile: string; icon: string }> = {
  instagram: {
    tile: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]",
    icon: "text-white",
  },
  tiktok: { tile: "bg-[#010101]", icon: "text-white" },
  youtube: { tile: "bg-[#FF0000]", icon: "text-white" },
  facebook: { tile: "bg-[#1877F2]", icon: "text-white" },
  linkedin: { tile: "bg-[#0A66C2]", icon: "text-white" },
  snapchat: { tile: "bg-[#FFFC00]", icon: "text-ink-900" },
};

export function ConnectSocialCard({ connections }: Props) {
  // Only one social platform may be connected at a time. If any is connected,
  // every OTHER row's Connect button is disabled with a hint to disconnect.
  const activeConnection = connections.find(
    (c) => c.connectionStatus === "connected",
  );
  const activeLabel = activeConnection?.label ?? null;

  return (
    <section id="connect-social" className="card w-full p-5 sm:p-6 scroll-mt-24">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Share2 className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-ink-900 leading-tight">
              Connect Social Accounts
            </h2>
            <p className="text-[13px] text-ink-500 mt-0.5">
              Sync your analytics automatically.
            </p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center h-6 px-2.5 rounded-full bg-cream-100 border border-ink-100 text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">
          Analytics sync
        </span>
      </header>

      <ul className="mt-5 border-t border-ink-100 divide-y divide-ink-100">
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

      <p className="text-[11.5px] text-ink-400 mt-4 leading-snug">
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  function connect() {
    window.location.href = `/api/oauth/${conn.platform}/start`;
  }

  function runDisconnect() {
    startTransition(async () => {
      await disconnectPlatform(conn.platform);
      setConfirmOpen(false);
    });
  }

  function sync() {
    startTransition(async () => {
      await syncPlatform(conn.platform);
    });
  }

  const Icon = PLATFORM_ICON[conn.platform];
  const brand = BRAND[conn.platform];

  // Build the subtitle line (under the platform name).
  let subtitle: string;
  let subtitleTone: "muted" | "error" = "muted";
  let secondaryHint: string | null = null;

  if (conn.connectionStatus === "connected") {
    if (conn.syncStatus === "error" && conn.syncError) {
      subtitle = conn.syncError;
      subtitleTone = "error";
    } else if (conn.followerCount != null) {
      const followers = `${formatFollowers(conn.followerCount)} followers`;
      const synced = conn.lastSyncedAt ? relativeTime(conn.lastSyncedAt) : null;
      subtitle = synced ? `Synced ${synced} · ${followers}` : followers;
      if (conn.insightsStatus && conn.insightsStatus !== "ok") {
        secondaryHint = conn.insightsStatus;
      }
    } else if (conn.lastSyncedAt) {
      subtitle = `Synced ${relativeTime(conn.lastSyncedAt)}`;
    } else {
      subtitle = "Connected";
    }
  } else if (conn.connectionStatus === "setup_pending") {
    subtitle = "Awaiting developer credentials.";
  } else if (lockedByOther) {
    subtitle = activeLabel
      ? `Disconnect ${activeLabel} first to switch to ${conn.label}.`
      : "Disconnect the current platform first to switch.";
  } else {
    subtitle = REQUIREMENT_HINT[conn.platform] ?? "Connect to sync your analytics.";
  }

  return (
    <li className="py-4">
      <div className="flex items-center gap-4">
        {/* Brand tile */}
        <span
          className={cn(
            "size-11 rounded-[12px] inline-flex items-center justify-center shrink-0",
            brand.tile,
          )}
        >
          <Icon className={brand.icon} size={20} />
        </span>

        {/* Name + status + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14.5px] font-semibold text-ink-900 leading-tight">
              {conn.label}
            </span>
            {conn.connectionStatus === "connected" && (
              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-success">
                <CheckCircle2 className="size-3.5" strokeWidth={2.2} />
                Connected
              </span>
            )}
            {conn.connectionStatus === "setup_pending" && (
              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-amber-600">
                <AlertCircle className="size-3.5" strokeWidth={2.2} />
                Setup pending
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-[12.5px] mt-0.5 truncate",
              subtitleTone === "error" ? "text-rose-600" : "text-ink-500",
            )}
          >
            {subtitle}
          </p>
          {secondaryHint && (
            <p className="text-[11px] text-ink-400 mt-0.5 truncate">
              {secondaryHint}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0 flex items-center gap-2.5">
          {conn.connectionStatus === "connected" ? (
            <>
              <button
                type="button"
                onClick={sync}
                disabled={pending}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <RefreshCw
                  className={cn("size-3.5", pending && "animate-spin")}
                  strokeWidth={2}
                />
                Sync
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={pending}
                className="text-[13px] font-medium text-ink-500 hover:text-rose-600 disabled:opacity-50 cursor-pointer px-1 transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : conn.connectionStatus === "not_connected" ? (
            lockedByOther ? (
              <button
                type="button"
                disabled
                aria-disabled
                title={`Disconnect ${activeLabel ?? "the current platform"} to connect ${conn.label}.`}
                className="inline-flex items-center justify-center h-9 px-4 rounded-[10px] bg-cream-100 text-ink-400 text-[13px] font-medium cursor-not-allowed"
              >
                Locked
              </button>
            ) : (
              <button
                type="button"
                onClick={connect}
                aria-label={`Connect ${conn.label}`}
                className="inline-flex items-center justify-center h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold cursor-pointer transition-colors"
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
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-cream-100 text-ink-400 text-[13px] font-medium cursor-not-allowed"
            >
              <Loader2 className="size-3.5" strokeWidth={2} />
              Setup pending
            </button>
          )}
        </div>
      </div>

      {/* Custom in-app confirmation — replaces the native confirm() dialog. */}
      <ConfirmDialog
        open={confirmOpen}
        title={`Disconnect ${conn.label}?`}
        message="Your past analytics stay in the dashboard, but new data won't sync until you reconnect."
        confirmLabel="Disconnect"
        onConfirm={runDisconnect}
        onCancel={() => setConfirmOpen(false)}
        pending={pending}
      />
    </li>
  );
}

// ── Relative-time formatter for "synced N ago" ───────────────────────

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

// ── Per-platform account-requirement hints ───────────────────────────

const REQUIREMENT_HINT: Partial<Record<SocialConnection["platform"], string>> = {
  instagram: "Requires a Business or Creator account linked to a Facebook Page.",
  facebook: "Requires a Page (personal profile data only without a managed Page).",
  tiktok: "Basic profile only — full analytics require partner approval.",
  linkedin: "Profile only — Page analytics require Marketing Partner access.",
  snapchat: "Limited data (display name & avatar only).",
  youtube: "Connect to sync subscribers & views.",
};

// ── Icon lookup ──────────────────────────────────────────────────────

/* Module-scope map so each row references a stable component identity
   instead of deriving one during render. */
const PLATFORM_ICON: Record<
  SocialConnection["platform"],
  React.ComponentType<{ className?: string; size?: number }>
> = {
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  snapchat: SnapchatIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
};

/* ── Inline brand icons (kept inside the card for self-containment) ─── */

function SnapchatIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.2 3c.6 0 2.6.2 3.6 2.3.3.7.2 1.9.2 2.9 0 .1 0 .2-.1.3.1 0 .2.1.4.1.2 0 .5-.1.9-.2a.7.7 0 0 1 .3-.1c.1 0 .2 0 .3.1.3.1.5.3.5.5 0 .3-.3.5-.8.7l-.2.1c-.3.1-.7.2-.9.5-.1.1 0 .3.1.6 0 0 .9 2 2.8 2.3.1 0 .2.1.2.3 0 0 0 .1-.1.1-.1.3-.7.6-1.8.8 0 0-.1.2-.1.4l-.1.3c0 .2-.2.2-.3.2-.1 0-.3 0-.5-.1-.3 0-.7-.1-1.1-.1-.3 0-.5 0-.8.1-.5.1-1 .4-1.5.8-.8.5-1.6 1.1-2.9 1.1h-.2c-1.3 0-2.1-.6-2.9-1.1-.5-.4-1-.7-1.5-.8a5 5 0 0 0-.8-.1c-.4 0-.8.1-1.1.1-.2.1-.4.1-.5.1-.2 0-.3 0-.3-.2l-.1-.3c0-.1-.1-.3-.1-.4-1.1-.2-1.7-.4-1.8-.8 0 0-.1-.1-.1-.1 0-.2.1-.3.2-.3 1.9-.3 2.8-2.3 2.8-2.3.1-.3.2-.5.1-.6-.1-.3-.5-.4-.9-.5l-.2-.1c-.7-.3-.8-.5-.8-.7 0-.2.3-.4.6-.4a.7.7 0 0 1 .3.1c.4.1.6.2.9.2.2 0 .3-.1.4-.1 0-.1 0-.2-.1-.3 0-1 0-2.2.2-2.9C9.6 3.2 11.6 3 12.2 3Z" />
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
