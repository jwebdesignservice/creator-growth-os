import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Heart, Play } from "lucide-react";
import { LinkedinIcon, YoutubeIcon } from "@/components/brand-icons";
import { GHOST, TIKTOK_NOTE } from "@/components/posting/platform-glyphs";
import { cn } from "@/lib/cn";
import type { PostingItem, PlatformKey } from "@/lib/posting/queries";

/* Snapchat's white ghost — the same official-geometry path the planned-posts
   table uses, so the card matches the rest of the surface exactly. */
function SnapGhost({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={GHOST} fill="#fff" stroke="#fff" strokeWidth=".4" />
    </svg>
  );
}

/* TikTok's note with the signature cyan/magenta glitch offsets. */
function TiktokNote({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="translate(2.9 2.9) scale(0.76)">
        <path transform="translate(-1.1 0)" fill="#25F4EE" d={TIKTOK_NOTE} />
        <path transform="translate(1.1 0)" fill="#FE2C55" d={TIKTOK_NOTE} />
        <path fill="#fff" d={TIKTOK_NOTE} />
      </g>
    </svg>
  );
}

// Same symmetric ease as the program overview cards so hover-out is as
// smooth as hover-in.
const EASE = "ease-[cubic-bezier(0.45,0,0.55,1)]";

/**
 * Posting Plans — one premium nav card per platform (Snapchat, TikTok,
 * LinkedIn, YouTube). Mirrors the program overview's section cards exactly:
 * icon tile · bold title · one-line message · rose meta pill · "Open →"
 * footer, with an animated mini-graphic on the right (rises in on mount,
 * comes alive on hover; reduced-motion safe). The meta pill shows the REAL
 * number of posts scheduled for that platform in the active plan.
 */
export function PostingPlatformCards({ items }: { items: PostingItem[] }) {
  const count = (p: PlatformKey) =>
    items.filter((i) => i.platform === p).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SnapchatCard count={count("snapchat")} />
      <TiktokCard count={count("tiktok")} />
      <LinkedinCard count={count("linkedin")} />
      <YoutubeCard count={count("youtube")} />
    </div>
  );
}

/* ── Shared tile shell (program overview-card anatomy) ────────────────── */

function PlatformTile({
  href,
  icon,
  iconTile,
  title,
  desc,
  count,
  children,
}: {
  href: string;
  icon: ReactNode;
  /** Brand-tinted tile classes behind the platform glyph. */
  iconTile: string;
  title: string;
  desc: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate flex min-h-[188px] overflow-hidden rounded-[18px] border border-ink-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition duration-[380ms] hover:-translate-y-[3px] hover:border-ink-200 hover:shadow-[0_22px_44px_-26px_rgba(26,24,22,0.45)]",
        EASE,
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-4">
        <span
          className={cn(
            "flex size-[42px] items-center justify-center rounded-[13px] transition-transform duration-[380ms] group-hover:-rotate-[4deg] group-hover:scale-105",
            iconTile,
            EASE,
          )}
        >
          {icon}
        </span>
        <h3 className="mt-3 text-[19px] font-bold tracking-[-0.01em] text-ink-900">
          {title}
        </h3>
        <p className="mt-1 max-w-[230px] text-[12.5px] leading-snug text-ink-500">
          {desc}
        </p>
        <span className="mt-2.5 self-start whitespace-nowrap rounded-full bg-rose-50 px-[11px] py-[5px] text-[11px] font-semibold text-rose-700">
          {count > 0
            ? `${count} post${count === 1 ? "" : "s"} this week`
            : "No posts scheduled"}
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-semibold text-rose-700">
          Open
          <ArrowRight
            className={cn(
              "size-[15px] transition-transform duration-[380ms] group-hover:translate-x-1",
              EASE,
            )}
            strokeWidth={2}
          />
        </span>
      </div>
      <div className="relative h-[140px] w-[150px] sm:w-[200px] shrink-0 self-center">
        {children}
      </div>
    </Link>
  );
}

/* ── Snapchat — story frames that fan out on hover ────────────────────── */

const STORY_FRAMES = [
  { x: "-ml-[72px]", rot: "-rotate-[10deg]", hover: "group-hover:-translate-y-2.5 group-hover:-rotate-[14deg]", delay: 0.1 },
  { x: "ml-[24px]", rot: "rotate-[9deg]", hover: "group-hover:-translate-y-2.5 group-hover:rotate-[13deg]", delay: 0.22 },
];

function SnapchatCard({ count }: { count: number }) {
  return (
    <PlatformTile
      href="/posting?view=calendar"
      icon={<SnapGhost className="size-[26px]" />}
      iconTile="bg-[#FFFC00] ring-1 ring-inset ring-ink-900/10"
      title="Snapchat"
      desc="Plan Stories and Spotlight clips that keep your streaks alive."
      count={count}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* side story frames — tucked behind, fan out on hover */}
        {STORY_FRAMES.map((f, i) => (
          <div
            key={i}
            className={cn(
              "ob-rise absolute left-1/2 top-1/2 -translate-y-1/2 flex h-[92px] w-[56px] flex-col rounded-[10px] border border-ink-100 bg-white p-1.5 shadow-[0_4px_10px_-6px_rgba(26,24,22,0.4)] transition-transform duration-[460ms]",
              f.x,
              f.rot,
              f.hover,
              EASE,
            )}
            style={{ animationDelay: `${f.delay}s`, transitionDelay: `${i * 40}ms` }}
          >
            <span className="block h-[34px] w-full rounded-[6px] bg-cream-200" />
            <span className="mt-1.5 block h-[4px] w-4/5 rounded-full bg-cream-300" />
            <span className="mt-1 block h-[4px] w-3/5 rounded-full bg-cream-200" />
          </div>
        ))}
        {/* center story — the brand frame */}
        <div
          className={cn(
            "ob-rise relative z-10 flex h-[104px] w-[62px] -ml-[24px] flex-col items-center justify-center rounded-[11px] bg-[#FFFC00] shadow-[0_10px_22px_-12px_rgba(26,24,22,0.45)] ring-1 ring-ink-900/10 transition-transform duration-[460ms] group-hover:-translate-y-1.5 group-hover:scale-[1.04]",
            EASE,
          )}
          style={{ animationDelay: "0.16s" }}
        >
          <SnapGhost className="size-[32px] drop-shadow-[0_2px_3px_rgba(26,24,22,0.18)]" />
          <span className="mt-2 block h-[4px] w-3/5 rounded-full bg-ink-900/15" />
        </div>
      </div>
    </PlatformTile>
  );
}

/* ── TikTok — phone frame with music notes floating up on hover ───────── */

const NOTES = [
  { left: "72%", top: "22%", size: "text-[15px]", delay: "0s" },
  { left: "84%", top: "48%", size: "text-[11px]", delay: "1.1s" },
  { left: "66%", top: "62%", size: "text-[12px]", delay: "2.1s" },
];

/* Like-hearts drifting up the phone's left side — TikTok's signature
   double-tap rain, in brand pink with size/delay variety. */
const HEARTS = [
  { left: "12%", top: "26%", size: "size-[15px]", delay: "0.5s", fill: "#FE2C55" },
  { left: "22%", top: "50%", size: "size-[11px]", delay: "1.6s", fill: "#FE2C55" },
  { left: "8%", top: "66%", size: "size-[13px]", delay: "2.6s", fill: "#F47983" },
];

function TiktokCard({ count }: { count: number }) {
  return (
    <PlatformTile
      href="/posting?view=calendar"
      icon={<TiktokNote className="size-[24px]" />}
      iconTile="bg-ink-900"
      title="TikTok"
      desc="Line up short-form hooks and trends before they cool off."
      count={count}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* phone */}
        <div
          className={cn(
            "ob-rise relative h-[112px] w-[64px] -rotate-3 rounded-[13px] bg-ink-900 p-1 shadow-[0_12px_24px_-12px_rgba(26,24,22,0.6)] transition-transform duration-[460ms] group-hover:rotate-0 group-hover:-translate-y-1.5",
            EASE,
          )}
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[10px] bg-gradient-to-br from-ink-800 to-ink-900">
            <TiktokNote className="size-[26px]" />
            <span className="mt-2 block h-[3.5px] w-8 rounded-full bg-white/25" />
            <span className="mt-1 block h-[3.5px] w-6 rounded-full bg-white/15" />
          </div>
          {/* screen shine */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-1 top-1 h-1/3 rounded-t-[10px] bg-white/[0.06]"
          />
        </div>
        {/* like-hearts — drift on the left, lift + swell on hover */}
        {HEARTS.map((h, i) => (
          <span
            key={i}
            className={cn(
              "ob-float absolute transition-transform duration-[420ms] group-hover:-translate-y-2 group-hover:scale-125",
              EASE,
            )}
            style={{ left: h.left, top: h.top, animationDelay: h.delay, transitionDelay: `${i * 40}ms` }}
            aria-hidden
          >
            <Heart
              className={cn(h.size, "drop-shadow-[0_3px_6px_rgba(254,44,85,0.35)]")}
              fill={h.fill}
              stroke="none"
            />
          </span>
        ))}
        {/* floating notes — gentle loop on the right, lift further on hover */}
        {NOTES.map((n, i) => (
          <span
            key={i}
            className={cn(
              "ob-float absolute select-none font-bold text-ink-900/70 transition-transform duration-[420ms] group-hover:-translate-y-1.5 group-hover:scale-110",
              n.size,
              EASE,
            )}
            style={{ left: n.left, top: n.top, animationDelay: n.delay }}
            aria-hidden
          >
            ♪
          </span>
        ))}
      </div>
    </PlatformTile>
  );
}

/* ── LinkedIn — a post card whose lines write themselves in ───────────── */

const POST_LINES = ["w-full", "w-5/6", "w-3/5"];

function LinkedinCard({ count }: { count: number }) {
  return (
    <PlatformTile
      href="/posting?view=calendar"
      icon={<LinkedinIcon size={20} className="text-white" />}
      iconTile="bg-[#0A66C2]"
      title="LinkedIn"
      desc="Schedule thought-leadership posts that build your network."
      count={count}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="ob-rise relative h-[112px] w-[156px] -rotate-2 rounded-[12px] border border-ink-100 bg-white p-3 shadow-[0_10px_22px_-14px_rgba(26,24,22,0.5)]">
          {/* author row */}
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#0A66C2] text-white shadow-[0_4px_10px_-5px_rgba(10,102,194,0.7)]">
              <LinkedinIcon size={13} className="text-white" />
            </span>
            <span className="space-y-1">
              <span className="block h-[5px] w-16 rounded-full bg-cream-300" />
              <span className="block h-[4px] w-10 rounded-full bg-cream-200" />
            </span>
          </div>
          {/* body lines — write themselves in */}
          <div className="mt-2.5 space-y-[7px]">
            {POST_LINES.map((w, i) => (
              <span
                key={i}
                className={cn(
                  "pcard-grow-x block h-[5px] rounded-full",
                  w,
                  i === 0 ? "bg-[#0A66C2]/25" : "bg-cream-300",
                )}
                style={{ animationDelay: `${0.25 + i * 0.14}s` }}
              />
            ))}
          </div>
          {/* reaction chip — floats gently, pops on hover */}
          <span
            className={cn(
              "ob-float absolute -right-3 bottom-3.5 flex h-7 items-center gap-1 rounded-full bg-[#0A66C2] px-2.5 text-[10px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(10,102,194,0.8)] transition-transform duration-[380ms] group-hover:scale-110 group-hover:-rotate-3",
              EASE,
            )}
          >
            👍 +1
          </span>
        </div>
      </div>
    </PlatformTile>
  );
}

/* ── YouTube — mini player whose progress bar fills, play pops on hover ── */

function YoutubeCard({ count }: { count: number }) {
  return (
    <PlatformTile
      href="/posting?view=calendar"
      icon={<YoutubeIcon size={22} className="text-white" />}
      iconTile="bg-[#FF0000]"
      title="YouTube"
      desc="Map long-form uploads and Shorts around your best hours."
      count={count}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="ob-rise relative h-[104px] w-[164px] rotate-2 overflow-hidden rounded-[12px] bg-ink-900 shadow-[0_12px_24px_-12px_rgba(26,24,22,0.6)]">
          {/* screen glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-black"
          />
          {/* play button — pops on hover like a real player */}
          <span
            className={cn(
              "absolute left-1/2 top-1/2 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FF0000] text-white shadow-[0_8px_18px_-6px_rgba(255,0,0,0.6)] transition-transform duration-[380ms] group-hover:scale-115",
              EASE,
            )}
          >
            <Play className="size-4 translate-x-[1px]" fill="currentColor" strokeWidth={0} />
          </span>
          {/* duration chip */}
          <span className="absolute right-2 top-2 rounded-[5px] bg-black/60 px-1.5 py-0.5 text-[8px] font-semibold tabular-nums text-white">
            12:04
          </span>
          {/* progress bar — sweeps in on mount, creeps forward on hover */}
          <span className="absolute inset-x-0 bottom-0 h-[5px] bg-white/15">
            <span
              className={cn(
                "pcard-grow-x block h-full w-1/3 origin-left bg-[#FF0000] transition-transform duration-[600ms] group-hover:scale-x-[1.6]",
                EASE,
              )}
              style={{ animationDelay: "0.3s" }}
            />
          </span>
        </div>
      </div>
    </PlatformTile>
  );
}
