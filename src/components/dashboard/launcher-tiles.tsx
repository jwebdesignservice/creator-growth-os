import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Play,
  CalendarDays,
  ListChecks,
  TrendingUp,
  Users,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

// Symmetric ease-in-out so the hover *out* is as smooth as the hover in
// (an ease-out curve starts fast, which makes the mouse-out feel abrupt).
const EASE = "ease-[cubic-bezier(0.45,0,0.55,1)]";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

/**
 * Shared launcher-tile shell: a consistent left column (icon · title · desc ·
 * count · Open) and a right "preview" column that each section fills with a
 * graphic representing what the page holds. The whole tile is the link.
 */
function LauncherTile({
  href,
  icon: Icon,
  title,
  desc,
  meta,
  children,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[200px] overflow-hidden rounded-[18px] border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition-[transform,box-shadow] duration-[380ms] hover:-translate-y-[3px] hover:shadow-[0_22px_44px_-26px_rgba(26,24,22,0.45)]",
        EASE,
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-4">
        <span
          className={cn(
            "flex size-[42px] items-center justify-center rounded-[13px] bg-rose-50 text-rose-600 transition-transform duration-[380ms] group-hover:-rotate-[4deg] group-hover:scale-105",
            EASE,
          )}
        >
          <Icon className="size-[22px]" strokeWidth={2} />
        </span>
        <h3 className="mt-3.5 text-[20px] font-bold tracking-[-0.01em] text-ink-900">
          {title}
        </h3>
        <p className="mt-1 max-w-[240px] text-[13px] leading-snug text-ink-500">
          {desc}
        </p>
        <span className="mt-3 self-start whitespace-nowrap rounded-full bg-rose-50 px-[11px] py-[5px] text-[11.5px] font-semibold text-rose-700">
          {meta}
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3.5 text-[13px] font-semibold text-rose-700">
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
      <div className="relative h-[150px] w-[190px] shrink-0 self-center sm:w-[230px]">
        {children}
      </div>
    </Link>
  );
}

/* ───────────────────────────── Tutorials ───────────────────────────── */
export function TutorialsCard({ total }: { total: number }) {
  return (
    <LauncherTile
      href="/tutorials"
      icon={Play}
      title="Tutorials"
      desc="Short, focused how-to videos"
      meta={`${total} tutorial${total === 1 ? "" : "s"}`}
    >
      {/* back peek */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -ml-[70px] -mt-[58px] h-[84px] w-[140px] -rotate-[7deg] rounded-[12px] border-2 border-white bg-gradient-to-br from-[#B5738A] to-[#8A4057] shadow-[0_8px_18px_-10px_rgba(26,24,22,0.5)] transition-transform duration-[520ms] group-hover:-translate-x-3 group-hover:-translate-y-1 group-hover:-rotate-[12deg]",
          EASE,
        )}
      />
      {/* front video frame */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -ml-[84px] -mt-[48px] h-[96px] w-[168px] overflow-hidden rounded-[12px] border-2 border-white bg-gradient-to-br from-[#C26174] to-[#8E3447] shadow-[0_12px_24px_-12px_rgba(26,24,22,0.55)] transition-transform duration-[520ms] group-hover:-translate-y-1",
          EASE,
        )}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-full bg-white/95 shadow-[0_4px_12px_-3px_rgba(0,0,0,0.3)] transition-transform duration-[420ms] group-hover:scale-110",
              EASE,
            )}
          >
            <Play className="size-[18px] translate-x-[1px] text-rose-600" fill="currentColor" strokeWidth={0} />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          4:12
        </span>
        <span className="absolute inset-x-2 bottom-[7px] h-[3px] rounded-full bg-white/30">
          <span className="block h-full w-1/3 rounded-full bg-white" />
        </span>
      </div>
    </LauncherTile>
  );
}

/* ──────────────────────── Posting Plans / Content ───────────────────── */
export function ContentCard({
  thisWeek,
  days,
}: {
  thisWeek: number;
  days: { letter: string; count: number; isToday: boolean }[];
}) {
  return (
    <LauncherTile
      href="/posting"
      icon={CalendarDays}
      title="Posting Plans"
      desc="Plan & schedule your content"
      meta={thisWeek > 0 ? `${thisWeek} scheduled this week` : "Plan your week"}
    >
      <div className="absolute inset-0 flex items-center justify-center gap-[6px]">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase text-ink-400">
              {d.letter}
            </span>
            <div
              className={cn(
                "flex h-[72px] w-[18px] flex-col justify-end overflow-hidden rounded-full bg-cream-200 p-[3px] transition-transform duration-[460ms] group-hover:-translate-y-[3px]",
                d.isToday && "ring-2 ring-rose-300 ring-offset-1",
                EASE,
              )}
            >
              {d.count > 0 && (
                <span
                  className="rounded-full bg-rose-500"
                  style={{ height: `${Math.min(100, 26 + d.count * 22)}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </LauncherTile>
  );
}

/* ─────────────────────────────── Tasks ─────────────────────────────── */
export function TasksCard({
  dueToday,
  completed,
  total,
}: {
  dueToday: number;
  completed: number;
  total: number;
}) {
  const meta =
    dueToday > 0
      ? `${dueToday} due today`
      : total > 0
        ? `${completed}/${total} done`
        : "All caught up";
  // first row reflects a real completed task; row 1 "ticks" on hover.
  const rows = [
    { done: true, w: "w-[86px]" },
    { done: false, hoverTick: true, w: "w-[104px]" },
    { done: false, w: "w-[72px]" },
  ];
  return (
    <LauncherTile
      href="/missions"
      icon={ListChecks}
      title="Tasks"
      desc="Your missions & daily to-dos"
      meta={meta}
    >
      <div className="absolute left-1/2 top-1/2 -ml-[92px] -mt-[54px] w-[184px] space-y-2.5">
        {rows.map((r, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] border border-ink-100 bg-white px-3 py-2.5 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.25)] transition-transform duration-[460ms] group-hover:translate-x-[2px]",
              EASE,
            )}
          >
            <span
              className={cn(
                "flex size-[18px] items-center justify-center rounded-[6px] border-2 transition-colors duration-[360ms]",
                r.done
                  ? "border-rose-500 bg-rose-500"
                  : r.hoverTick
                    ? "border-rose-300 group-hover:border-rose-500 group-hover:bg-rose-500"
                    : "border-ink-200",
              )}
            >
              <Check
                className={cn(
                  "size-3 text-white transition-opacity duration-[360ms]",
                  r.done
                    ? "opacity-100"
                    : r.hoverTick
                      ? "opacity-0 group-hover:opacity-100"
                      : "opacity-0",
                )}
                strokeWidth={3}
              />
            </span>
            <span
              className={cn(
                "h-2 rounded-full",
                r.w,
                r.done ? "bg-ink-200" : "bg-cream-200",
              )}
            />
          </div>
        ))}
      </div>
    </LauncherTile>
  );
}

/* ──────────────────────────── Performance ──────────────────────────── */
function sparkPaths(series: number[], w = 230, h = 64, pad = 5) {
  const pts = series.length >= 2 ? series : [0, 1];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const n = pts.length;
  const X = (i: number) => (i / (n - 1)) * w;
  const Y = (v: number) => pad + (1 - (v - min) / range) * (h - 2 * pad);
  const line = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return { line, area, endX: X(n - 1), endY: Y(pts[n - 1]) };
}

export function PerformanceCard({
  followers,
  series,
  deltaPct,
}: {
  followers: number;
  series: number[];
  deltaPct: number;
}) {
  const { line, area, endX, endY } = sparkPaths(series);
  const up = deltaPct >= 0;
  return (
    <LauncherTile
      href="/performance"
      icon={TrendingUp}
      title="Performance"
      desc="Track followers & engagement"
      meta={followers > 0 ? `${fmtNum(followers)} followers` : "Connect accounts"}
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        <div className="flex items-baseline gap-2 pl-1">
          <span className="text-[26px] font-bold tracking-[-0.02em] text-ink-900">
            {followers > 0 ? fmtNum(followers) : "—"}
          </span>
          {series.length >= 2 && (
            <span
              className={cn(
                "text-[12px] font-semibold",
                up ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {up ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}%
            </span>
          )}
        </div>
        <svg viewBox="0 0 230 64" className="mt-1 h-[64px] w-full overflow-visible">
          <defs>
            <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B9485C" stopOpacity="0.22" />
              <stop offset="1" stopColor="#B9485C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#perfFill)" />
          <path
            d={line}
            fill="none"
            stroke="#B9485C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={endX} cy={endY} r="4" fill="#B9485C" />
        </svg>
      </div>
    </LauncherTile>
  );
}

/* ──────────────────────────── Community ────────────────────────────── */
export function CommunityCard({
  members,
  avatars,
}: {
  members: number;
  avatars: (string | null)[];
}) {
  const slots = (avatars.length ? avatars : [null, null, null, null]).slice(0, 4);
  const grads = [
    "from-[#C26174] to-[#8E3447]",
    "from-[#B5738A] to-[#8A4057]",
    "from-[#A98494] to-[#735060]",
    "from-[#CDA0AB] to-[#A86A78]",
  ];
  const extra = Math.max(0, members - slots.length);
  return (
    <LauncherTile
      href="/community"
      icon={Users}
      title="Community"
      desc="Connect with other creators"
      meta={members > 0 ? `${fmtNum(members)} members` : "Join the community"}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center">
          {slots.map((a, i) => (
            <span
              key={i}
              className={cn(
                "-ml-3 flex size-[52px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br shadow-[0_6px_14px_-6px_rgba(26,24,22,0.5)] transition-transform duration-[480ms] first:ml-0",
                grads[i % grads.length],
                EASE,
              )}
              style={{
                zIndex: 10 - i,
              }}
            >
              {a ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a} alt="" className="size-full object-cover" />
              ) : (
                <Users className="size-5 text-white/85" strokeWidth={2} />
              )}
            </span>
          ))}
          {extra > 0 && (
            <span className="-ml-3 flex size-[52px] items-center justify-center rounded-full border-[3px] border-white bg-rose-50 text-[12px] font-bold text-rose-700 shadow-[0_6px_14px_-6px_rgba(26,24,22,0.5)]">
              +{fmtNum(extra)}
            </span>
          )}
        </div>
      </div>
      <span className="absolute right-4 top-7 flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-emerald-600 shadow-[0_2px_8px_-3px_rgba(26,24,22,0.3)]">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Active now
      </span>
    </LauncherTile>
  );
}
