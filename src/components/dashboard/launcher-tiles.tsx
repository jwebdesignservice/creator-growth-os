import Link from "next/link";
import type { ReactNode, CSSProperties, ComponentType } from "react";
import {
  ArrowRight,
  Play,
  CalendarDays,
  ListChecks,
  TrendingUp,
  Users,
  Check,
  CalendarPlus,
  type LucideIcon,
} from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
  LinkedinIcon,
  SnapchatIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import { getT } from "@/lib/i18n/server";

// Symmetric ease-in-out so the hover *out* is as smooth as the hover in.
const EASE = "ease-[cubic-bezier(0.45,0,0.55,1)]";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

async function LauncherTile({
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
  const t = await getT();
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate flex min-h-[200px] overflow-hidden rounded-[18px] border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition duration-[380ms] hover:-translate-y-[3px] hover:shadow-[0_22px_44px_-26px_rgba(26,24,22,0.45)]",
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
          {t("Open")}
          <ArrowRight
            className={cn(
              "size-[15px] transition-transform duration-[380ms] group-hover:translate-x-1",
              EASE,
            )}
            strokeWidth={2}
          />
        </span>
      </div>
      <div className="relative h-[150px] w-[190px] shrink-0 self-center sm:w-[236px]">
        {children}
      </div>
    </Link>
  );
}

/* ───────────────────────────── Tutorials ───────────────────────────── */
export async function TutorialsCard({ total }: { total: number }) {
  const t = await getT();
  return (
    <LauncherTile
      href="/tutorials"
      icon={Play}
      title="Tutorials"
      desc={t("Short, focused how-to videos")}
      meta={`${total} tutorial${total === 1 ? "" : "s"}`}
    >
      {/* back peeks */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -ml-[58px] -mt-[60px] h-[80px] w-[132px] -rotate-[10deg] rounded-[12px] border-2 border-white bg-gradient-to-br from-[#A98494] to-[#735060] shadow-[0_6px_14px_-8px_rgba(26,24,22,0.5)] transition-transform duration-[520ms] group-hover:-translate-x-4 group-hover:-translate-y-2 group-hover:-rotate-[16deg]",
          EASE,
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -ml-[70px] -mt-[56px] h-[84px] w-[140px] -rotate-[5deg] rounded-[12px] border-2 border-white bg-gradient-to-br from-[#B5738A] to-[#8A4057] shadow-[0_8px_18px_-10px_rgba(26,24,22,0.5)] transition-transform duration-[520ms] group-hover:-translate-x-2 group-hover:-translate-y-1 group-hover:-rotate-[9deg]",
          EASE,
        )}
      />
      {/* front video card with a title */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -ml-[86px] -mt-[48px] flex h-[98px] w-[172px] flex-col justify-end overflow-hidden rounded-[12px] border-2 border-white bg-gradient-to-br from-[#C26174] to-[#8E3447] shadow-[0_12px_24px_-12px_rgba(26,24,22,0.55)] transition-transform duration-[520ms] group-hover:-translate-y-1",
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
        <div className="relative z-10 bg-gradient-to-t from-black/45 to-transparent px-3 pb-2.5 pt-6">
          <span className="block h-[5px] w-[88px] rounded-full bg-white/90" />
          <span className="mt-[5px] block h-[4px] w-[58px] rounded-full bg-white/45" />
        </div>
        <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          4:12
        </span>
      </div>
    </LauncherTile>
  );
}

/* ──────────────────────── Posting Plans / Content ───────────────────── */
type BrandIcon = ComponentType<{ className?: string; size?: number }>;
// Same brand colours + icons as the Connect-Accounts page.
const PLATFORM: Record<
  string,
  { tile: string; iconColor: string; Icon?: BrandIcon; label: string }
> = {
  instagram: {
    tile: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]",
    iconColor: "text-white",
    Icon: InstagramIcon,
    label: "IG",
  },
  tiktok: { tile: "bg-[#010101]", iconColor: "text-white", Icon: TiktokIcon, label: "TT" },
  youtube: { tile: "bg-[#FF0000]", iconColor: "text-white", Icon: YoutubeIcon, label: "YT" },
  linkedin: { tile: "bg-[#0A66C2]", iconColor: "text-white", Icon: LinkedinIcon, label: "in" },
  snapchat: { tile: "bg-[#FFFC00]", iconColor: "text-ink-900", Icon: SnapchatIcon, label: "SC" },
  facebook: { tile: "bg-[#1877F2]", iconColor: "text-white", label: "f" },
  x: { tile: "bg-ink-900", iconColor: "text-white", label: "X" },
  twitter: { tile: "bg-ink-900", iconColor: "text-white", label: "X" },
};
const brandOf = (p: string) =>
  PLATFORM[(p ?? "").toLowerCase()] ?? {
    tile: "bg-rose-500",
    iconColor: "text-white",
    Icon: undefined as BrandIcon | undefined,
    label: (p?.[0] ?? "•").toUpperCase(),
  };

export async function ContentCard({
  thisWeek,
  posts,
  days,
}: {
  thisWeek: number;
  posts: { platform: string; type: string; when: string }[];
  days: { letter: string; count: number; isToday: boolean }[];
}) {
  const t = await getT();
  const rows = posts.slice(0, 2);
  return (
    <LauncherTile
      href="/posting"
      icon={CalendarDays}
      title={t("Posting Plans")}
      desc={t("Plan & schedule your content")}
      meta={thisWeek > 0 ? `${thisWeek} ${t("scheduled this week")}` : t("Plan your week")}
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-2.5">
        {/* Week calendar — a dot marks days that have posts; today is bold. */}
        <div className="flex items-stretch">
          {days.map((d, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 py-0.5",
                i < days.length - 1 && "border-r border-ink-100",
              )}
            >
              <span
                className={cn(
                  "text-[9.5px] font-bold uppercase",
                  d.isToday ? "text-rose-600" : "text-ink-400",
                )}
              >
                {d.letter}
              </span>
              <span
                className={cn(
                  "rounded-full",
                  d.isToday
                    ? "size-2 bg-rose-600 ring-2 ring-rose-200"
                    : d.count > 0
                      ? "size-1.5 bg-rose-400"
                      : "size-1.5 bg-ink-200",
                )}
              />
            </div>
          ))}
        </div>
        <div className="h-px bg-ink-100" />

        {/* Upcoming scheduled posts (real platform icons). */}
        {rows.length > 0 ? (
          <div className="space-y-1.5">
            {rows.map((p, i) => {
              const b = brandOf(p.platform);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-[10px] border border-ink-100 bg-white px-2 py-1.5 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)] transition-transform duration-[460ms] group-hover:-translate-y-[2px]",
                    EASE,
                  )}
                  style={{ transitionDelay: `${i * 45}ms` }}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-[8px] text-[10px] font-bold",
                      b.tile,
                      b.iconColor,
                    )}
                  >
                    {b.Icon ? <b.Icon size={15} /> : b.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11.5px] font-semibold capitalize text-ink-900">
                      {p.type}
                    </div>
                    <div className="text-[10px] text-ink-400">{p.when}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-3 text-[11.5px] font-semibold text-rose-600">
            <CalendarPlus className="size-3.5" strokeWidth={2} /> {t("Plan your week")}
          </div>
        )}
      </div>
    </LauncherTile>
  );
}

/* ─────────────────────────────── Tasks ─────────────────────────────── */
export async function TasksCard({
  dueToday,
  completed,
  total,
  tasks,
}: {
  dueToday: number;
  completed: number;
  total: number;
  tasks: { title: string; done: boolean }[];
}) {
  const t = await getT();
  const meta =
    dueToday > 0
      ? `${dueToday} ${t("due today")}`
      : total > 0
        ? `${completed}/${total} ${t("done")}`
        : t("All caught up");
  const rows =
    tasks.length > 0
      ? tasks.slice(0, 3)
      : [
          { title: t("Plan this week's content"), done: true },
          { title: t("Film your next short"), done: false },
          { title: t("Reply to comments"), done: false },
        ];
  const firstUndone = rows.findIndex((r) => !r.done);
  return (
    <LauncherTile
      href="/missions"
      icon={ListChecks}
      title={t("Tasks")}
      desc={t("Your missions & daily to-dos")}
      meta={meta}
    >
      <div className="absolute left-1/2 top-1/2 -ml-[104px] -mt-[57px] w-[208px] space-y-2">
        {rows.map((t, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2.5 rounded-[11px] border border-ink-100 bg-white px-3 py-2.5 shadow-[0_3px_8px_-5px_rgba(26,24,22,0.3)] transition-transform duration-[460ms] group-hover:translate-x-[2px]",
              EASE,
            )}
            style={{ transitionDelay: `${i * 45}ms` }}
          >
            <span
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors duration-[360ms]",
                t.done
                  ? "border-rose-500 bg-rose-500"
                  : i === firstUndone
                    ? "border-rose-300 group-hover:border-rose-500 group-hover:bg-rose-500"
                    : "border-ink-200",
              )}
            >
              <Check
                className={cn(
                  "size-3 text-white transition-opacity duration-[360ms]",
                  t.done
                    ? "opacity-100"
                    : i === firstUndone
                      ? "opacity-0 group-hover:opacity-100"
                      : "opacity-0",
                )}
                strokeWidth={3}
              />
            </span>
            <span
              className={cn(
                "truncate text-[12px]",
                t.done ? "text-ink-400 line-through" : "text-ink-700",
              )}
            >
              {t.title}
            </span>
          </div>
        ))}
      </div>
    </LauncherTile>
  );
}

/* ──────────────────────────── Performance ──────────────────────────── */
function buildChart(series: number[], w = 230, h = 96) {
  const vals = series.length >= 2 ? series : [1, 1];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const n = vals.length;
  // Plot area leaves a left gutter for the Y axis labels and a bottom
  // gutter for the X axis labels.
  const plotL = 26;
  const plotR = w;
  const plotT = 6;
  const plotB = h - 18;
  const pts = vals.map((v, i) => ({
    x: plotL + (i / (n - 1)) * (plotR - plotL),
    y: plotT + (1 - (v - min) / range) * (plotB - plotT),
  }));
  // Catmull-Rom → cubic bézier for a smooth curve.
  let line = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  const area = `${line} L${plotR} ${plotB} L${plotL} ${plotB} Z`;
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return {
    pts,
    line,
    area,
    len: Math.ceil(len * 1.3),
    w,
    h,
    plotL,
    plotR,
    plotT,
    plotB,
    min,
    max,
    n,
  };
}

export async function PerformanceCard({
  followers,
  series,
  deltaPct,
}: {
  followers: number;
  series: number[];
  deltaPct: number;
}) {
  const t = await getT();
  const { pts, line, area, len, w, h, plotL, plotR, plotT, plotB, min, max, n } =
    buildChart(series);
  const end = pts[pts.length - 1];
  const hasData = series.length >= 2;
  return (
    <LauncherTile
      href="/performance"
      icon={TrendingUp}
      title={t("Performance")}
      desc={t("Track followers & engagement")}
      meta={followers > 0 ? `${fmtNum(followers)} ${t("followers")}` : t("Connect accounts")}
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-1">
        <div className="flex items-start justify-between gap-2 pl-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold leading-none tracking-[-0.02em] text-ink-900">
              {followers > 0 ? fmtNum(followers) : "—"}
            </span>
            {hasData && (
              <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-emerald-600">
                ▲ {Math.abs(deltaPct).toFixed(1)}%
              </span>
            )}
          </div>
          <span className="shrink-0 rounded-full border border-ink-200 bg-white px-2.5 py-[3px] text-[10px] font-semibold text-ink-500">
            {t("Followers")}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-[96px] w-full overflow-visible"
        >
          <defs>
            <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B9485C" stopOpacity="0.28" />
              <stop offset="1" stopColor="#B9485C" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="perfLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#C26174" />
              <stop offset="1" stopColor="#B9485C" />
            </linearGradient>
          </defs>
          {/* gridlines */}
          {[0.25, 0.5, 0.75].map((f, i) => {
            const gy = plotT + (plotB - plotT) * f;
            return (
              <line
                key={i}
                x1={plotL}
                y1={gy.toFixed(1)}
                x2={plotR}
                y2={gy.toFixed(1)}
                stroke="#ECE8E3"
                strokeWidth="1"
                strokeDasharray="2 5"
              />
            );
          })}
          {/* axes */}
          <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#DDD7D0" strokeWidth="1" />
          <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="#DDD7D0" strokeWidth="1" />
          {hasData && (
            <g fill="#9B928A" fontSize="8" fontWeight="600">
              <text x={plotL - 5} y={plotT + 3} textAnchor="end">{fmtNum(max)}</text>
              <text x={plotL - 5} y={plotB} textAnchor="end">{fmtNum(min)}</text>
              <text x={plotL} y={h - 5} textAnchor="start">{n - 1}w</text>
              <text x={plotR} y={h - 5} textAnchor="end">{t("now")}</text>
            </g>
          )}
          <path d={area} fill="url(#perfFill)" className="spark-fade" />
          <path
            d={line}
            fill="none"
            stroke="url(#perfLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-line"
            style={{ ["--spark-len"]: `${len}` } as CSSProperties}
          />
          {pts.slice(0, -1).map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2.4"
              fill="#fff"
              stroke="#B9485C"
              strokeWidth="1.5"
              className="spark-fade"
              style={{ animationDelay: `${0.75 + i * 0.07}s` }}
            />
          ))}
          <circle cx={end.x} cy={end.y} r="6" fill="#B9485C" className="spark-pulse" />
          <circle
            cx={end.x}
            cy={end.y}
            r="4"
            fill="#B9485C"
            stroke="#fff"
            strokeWidth="1.5"
            className="spark-fade"
            style={{ animationDelay: `${0.75 + (pts.length - 1) * 0.07}s` }}
          />
        </svg>
      </div>
    </LauncherTile>
  );
}

/* ──────────────────────────── Community ────────────────────────────── */
export async function CommunityCard({
  members,
  avatars,
}: {
  members: number;
  avatars: (string | null)[];
}) {
  const t = await getT();
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
      title={t("Community")}
      desc={t("Connect with other creators")}
      meta={members > 0 ? `${fmtNum(members)} ${t("members")}` : t("Join the community")}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center">
          {slots.map((a, i) => (
            <span
              key={i}
              className={cn(
                "-ml-3 flex size-[52px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br shadow-[0_6px_14px_-6px_rgba(26,24,22,0.5)] transition-transform duration-[480ms] first:ml-0 group-hover:[transform:translateX(var(--sp))]",
                grads[i % grads.length],
                EASE,
              )}
              style={
                {
                  zIndex: 10 - i,
                  "--sp": `${(i - 1.5) * 6}px`,
                } as CSSProperties
              }
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-emerald-600 shadow-[0_2px_8px_-3px_rgba(26,24,22,0.3)]">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          {t("Creators online now")}
        </span>
      </div>
    </LauncherTile>
  );
}
