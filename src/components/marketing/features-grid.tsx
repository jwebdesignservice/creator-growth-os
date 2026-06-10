import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import { Check, Users } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";

/**
 * Marketing "bento" features grid — the section below the hero.
 *
 * Tailored to what Profluencer / Creator Growth OS actually does: Posting
 * Plans, Performance, Missions and Community. Each card pairs a one-line
 * promise with a nested mockup that mirrors the real in-app surface (the same
 * week-calendar, follower sparkline, mission checklist and creator-avatar
 * patterns used on the dashboard launcher tiles).
 *
 * The testimonial card uses sample copy + a gradient stand-in for a real
 * creator photo — swap both for genuine social proof before launch.
 */
export function FeaturesGrid() {
  return (
    <section id="features" className="scroll-mt-24 bg-cream-100">
      <div className="mx-auto max-w-[1340px] px-6 py-16 lg:px-10 lg:py-20">
        {/* ── Row 1 ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card
            title="Plan your week, post on time"
            body="Map out content for Instagram, TikTok and YouTube and schedule every post from one calendar."
          >
            <PostingMockup />
          </Card>

          <TestimonialCard
            quote="I finally post consistently — and my reach has climbed every week since."
            name="Maya Rivers"
            role="Content creator"
            image="/stephanie-berbec-H1wkEdyqfvY-unsplash.jpg"
          />
        </div>

        {/* ── Row 2 ─────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card
            title="Know what's working"
            body="Track followers and engagement across every account, week over week."
          >
            <PerformanceMockup />
          </Card>
          <Card
            title="Daily missions, done"
            body="Turn “grow my channel” into clear daily missions you can actually finish."
          >
            <MissionsMockup />
          </Card>
          <Card
            title="Grow with other creators"
            body="Trade wins, feedback and ideas with creators on the same path."
          >
            <CommunityMockup />
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ── Shared card shell ─────────────────────────────────────────────── */

function Card({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-white px-7 pt-7 shadow-[0_1px_3px_rgba(26,24,22,0.04),0_14px_36px_rgba(26,24,22,0.06)]">
      <h3 className="text-[20px] font-bold tracking-tight text-ink-900">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-500">
        {body}
      </p>
      <div className="relative mt-6 min-h-[230px] flex-1 overflow-hidden rounded-t-[16px] border border-b-0 border-ink-100 bg-white">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white to-transparent" />
    </div>
  );
}

/* ── Row 1 left — Posting Plans (week calendar + scheduled posts) ───── */

const DAYS = [
  { l: "M", on: true },
  { l: "T", on: false },
  { l: "W", on: true, today: true },
  { l: "T", on: true },
  { l: "F", on: false },
  { l: "S", on: false },
  { l: "S", on: true },
];

const POSTS: {
  Icon: ComponentType<{ size?: number }>;
  tile: string;
  type: string;
  topic: string;
  when: string;
}[] = [
  {
    Icon: InstagramIcon,
    tile: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]",
    type: "Reel",
    topic: "Morning routine",
    when: "Tue · 6:00 PM",
  },
  {
    Icon: TiktokIcon,
    tile: "bg-[#010101]",
    type: "Short",
    topic: "3 quick tips",
    when: "Wed · 5:30 PM",
  },
  {
    Icon: YoutubeIcon,
    tile: "bg-[#FF0000]",
    type: "Video",
    topic: "Studio tour",
    when: "Fri · 12:00 PM",
  },
];

function PostingMockup() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold text-ink-900">
          This week&apos;s plan
        </div>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
          5 posts
        </span>
      </div>

      <div className="mt-4 flex items-stretch rounded-xl border border-ink-100 bg-cream-50 px-1 py-2">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 py-0.5",
              i < DAYS.length - 1 && "border-r border-ink-100",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase",
                d.today ? "text-rose-600" : "text-ink-400",
              )}
            >
              {d.l}
            </span>
            <span
              className={cn(
                "rounded-full",
                d.today
                  ? "size-2 bg-rose-600 ring-2 ring-rose-200"
                  : d.on
                    ? "size-1.5 bg-rose-400"
                    : "size-1.5 bg-ink-200",
              )}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {POSTS.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-[11px] border border-ink-100 bg-white px-2.5 py-2 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)]"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-[9px] text-white",
                p.tile,
              )}
            >
              <p.Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-semibold text-ink-900">
                {p.type} · {p.topic}
              </div>
              <div className="text-[11px] text-ink-400">{p.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Row 1 right — creator testimonial (sample) ────────────────────── */

function TestimonialCard({
  quote,
  name,
  role,
  image,
}: {
  quote: string;
  name: string;
  role: string;
  image: string;
}) {
  return (
    <div className="relative min-h-[440px] overflow-hidden rounded-[24px] shadow-[0_1px_3px_rgba(26,24,22,0.04),0_14px_36px_rgba(26,24,22,0.06)]">
      {/* Real creator photo */}
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      {/* Bottom scrim keeps the quote legible over the photo */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7">
        <p className="text-[21px] font-bold leading-snug text-white">
          &ldquo;{quote}&rdquo;
        </p>
        <p className="mt-1.5 text-[14px] text-white/75">
          <span className="font-semibold text-white">{name}</span> / {role}
        </p>
      </div>
    </div>
  );
}

/* ── Row 2.1 — Performance (follower sparkline) ─────────────────────── */

function PerformanceMockup() {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-[-0.02em] text-ink-900">
            12.4k
          </span>
          <span className="text-[12px] font-semibold text-emerald-600">
            ▲ 8.2%
          </span>
        </div>
        <span className="rounded-full border border-ink-200 bg-white px-2.5 py-[3px] text-[10px] font-semibold text-ink-500">
          Followers
        </span>
      </div>

      <svg viewBox="0 0 240 90" className="mt-2 h-[88px] w-full overflow-visible">
        <defs>
          <linearGradient id="mkPerfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B9485C" stopOpacity="0.25" />
            <stop offset="1" stopColor="#B9485C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 70 C30 60 52 40 80 44 C110 48 132 20 165 24 C196 27 216 12 240 8 L240 90 L0 90 Z"
          fill="url(#mkPerfFill)"
        />
        <path
          d="M0 70 C30 60 52 40 80 44 C110 48 132 20 165 24 C196 27 216 12 240 8"
          fill="none"
          stroke="#B9485C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="240" cy="8" r="4" fill="#B9485C" stroke="#fff" strokeWidth="1.5" />
      </svg>

      <div className="mt-1.5 flex gap-3.5 text-[11px] text-ink-500">
        <Legend color="#D62976" label="Instagram" />
        <Legend color="#111111" label="TikTok" />
        <Legend color="#FF0000" label="YouTube" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/* ── Row 2.2 — Missions checklist ──────────────────────────────────── */

const MISSIONS = [
  { t: "Plan this week's content", done: true },
  { t: "Film your next short", done: false },
  { t: "Reply to 10 comments", done: false },
];

function MissionsMockup() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold text-ink-900">
          Today&apos;s missions
        </div>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
          1/3 done
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {MISSIONS.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-[11px] border border-ink-100 bg-white px-3 py-2.5 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)]"
          >
            <span
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-2",
                m.done ? "border-rose-500 bg-rose-500" : "border-ink-200",
              )}
            >
              {m.done && <Check className="size-3 text-white" strokeWidth={3} />}
            </span>
            <span
              className={cn(
                "text-[12.5px]",
                m.done ? "text-ink-400 line-through" : "text-ink-700",
              )}
            >
              {m.t}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Row 2.3 — Community avatars ───────────────────────────────────── */

const AV_GRADS = [
  "from-[#C26174] to-[#8E3447]",
  "from-[#B5738A] to-[#8A4057]",
  "from-[#A98494] to-[#735060]",
  "from-[#CDA0AB] to-[#A86A78]",
];

function CommunityMockup() {
  return (
    <div className="flex flex-col items-center justify-center p-5 pt-8">
      <div className="flex items-center">
        {AV_GRADS.map((g, i) => (
          <span
            key={i}
            className={cn(
              "-ml-3 flex size-12 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br shadow-[0_6px_14px_-6px_rgba(26,24,22,0.5)] first:ml-0",
              g,
            )}
            style={{ zIndex: 10 - i }}
          >
            <Users className="size-5 text-white/85" strokeWidth={2} />
          </span>
        ))}
        <span className="-ml-3 flex size-12 items-center justify-center rounded-full border-[3px] border-white bg-rose-50 text-[12px] font-bold text-rose-700 shadow-[0_6px_14px_-6px_rgba(26,24,22,0.5)]">
          +2.4k
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-emerald-600 shadow-[0_2px_8px_-3px_rgba(26,24,22,0.3)] ring-1 ring-ink-100">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Creators online now
      </span>
    </div>
  );
}
