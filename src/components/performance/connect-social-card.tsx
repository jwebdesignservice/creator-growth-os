"use client";

import { useTransition } from "react";
import { Share2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import { disconnectPlatform } from "@/lib/social/actions";
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
              Connect your creator platforms to enable automatic performance
              tracking across followers, reach, views, engagement and content
              output.
            </p>
          </div>
        </div>
        <span className="chip chip-rose shrink-0">Analytics sync</span>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {connections.map((c) => (
          <PlatformRow key={c.platform} conn={c} />
        ))}
      </ul>

      <p className="text-[11.5px] text-ink-400 mt-5 leading-snug">
        Automatic syncing requires platform permissions. Manual tracking
        remains available.
      </p>
    </section>
  );
}

// ── Per-platform row ──────────────────────────────────────────────────

function PlatformRow({ conn }: { conn: SocialConnection }) {
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

  const Icon = iconFor(conn.platform);
  const statusText = statusLabel(conn);

  return (
    <li className="flex items-center gap-3 p-3 rounded-[12px] bg-cream-50 border border-ink-100">
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
        <button
          type="button"
          onClick={disconnect}
          disabled={pending}
          className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0 bg-white border border-ink-100 text-ink-700 hover:bg-cream-100 disabled:opacity-50"
        >
          {pending ? "…" : "Disconnect"}
        </button>
      ) : conn.connectionStatus === "not_connected" ? (
        <button
          type="button"
          onClick={connect}
          className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0 bg-rose-600 hover:bg-rose-700 text-white"
        >
          Connect
          <ExternalLink className="size-3 ml-1.5" strokeWidth={2} />
        </button>
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
