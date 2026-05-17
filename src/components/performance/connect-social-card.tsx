import { Share2 } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   Connect Social Accounts — frontend-only placeholder card.

   UI-only. No OAuth, no API, no Supabase, no fetch, no state.
   When a real integration is wired up later, swap the static `Not connected`
   status + disabled button for real per-platform state read from a server
   action (see actions.ts for the existing performance pattern).
   ───────────────────────────────────────────────────────────────────────────── */

type Platform = {
  key: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
};

const PLATFORMS: Platform[] = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "tiktok",    label: "TikTok",    Icon: TiktokIcon    },
  { key: "youtube",   label: "YouTube",   Icon: YoutubeIcon   },
  { key: "snapchat",  label: "Snapchat",  Icon: SnapchatIcon  },
  { key: "facebook",  label: "Facebook",  Icon: FacebookIcon  },
  { key: "linkedin",  label: "LinkedIn",  Icon: LinkedinIcon  },
];

export function ConnectSocialCard() {
  return (
    <section className="card p-5 sm:p-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Share2 className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[18px] text-ink-900 leading-tight">
              Connect Social Accounts
            </h2>
            <p className="text-[13px] text-ink-500 mt-1 max-w-[58ch] leading-snug">
              Connect your creator platforms to prepare automatic performance
              tracking across followers, reach, views, engagement and content
              output.
            </p>
          </div>
        </div>
        <span className="chip chip-rose shrink-0">Analytics sync</span>
      </header>

      {/* Platform grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLATFORMS.map((p) => (
          <PlatformRow key={p.key} platform={p} />
        ))}
      </ul>

      {/* Footer note */}
      <p className="text-[11.5px] text-ink-400 mt-5 leading-snug">
        Automatic syncing requires platform permissions. Manual tracking
        remains available.
      </p>
    </section>
  );
}

function PlatformRow({ platform }: { platform: Platform }) {
  const { label, Icon } = platform;
  return (
    <li className="flex items-center gap-3 p-3 rounded-[12px] bg-cream-50 border border-ink-100">
      {/* Icon */}
      <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="text-rose-600" size={16} />
      </span>

      {/* Label + status */}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink-900 leading-tight truncate">
          {label}
        </div>
        <div className="text-[11.5px] text-ink-500 mt-0.5">Not connected</div>
      </div>

      {/* CTA — visually disabled to make the placeholder state honest. No
          onClick, no handler — silently inert until real OAuth is wired. */}
      <button
        type="button"
        disabled
        aria-disabled
        title="Coming soon"
        className={cn(
          "inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0",
          "bg-white border border-ink-100 text-ink-400 cursor-not-allowed",
        )}
      >
        Connect
      </button>
    </li>
  );
}

/* ── Inline icon glyphs ─────────────────────────────────────────────────────
   The Performance card prefers small, monochrome glyphs (currentColor) so the
   rose-tinted icon bubble stays cohesive with the rest of the page. Snapchat,
   Facebook, and LinkedIn glyphs are inlined here rather than added to the
   shared `brand-icons.tsx` — keeps the global icon set untouched and this
   card fully self-contained. All three accept the same `{ className, size }`
   shape as the existing `brand-icons` exports.                                */

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
