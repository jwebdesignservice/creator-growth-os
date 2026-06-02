/* Widgets ────────────────────────────────────────────────────────────────
   Right-rail / dashboard widgets — an upcoming-content list, a suggestion
   card, and a leaderboard. The small composable surfaces that fill the
   app's side rails (app-shell/right-rail, dashboard/*).
   ───────────────────────────────────────────────────────────────────── */

import { Clock, Lightbulb, Trophy, ArrowRight } from "lucide-react";

export function UpcomingWidget() {
  const items = [
    { title: "3 hooks that stop the scroll", when: "Today · 5:00 PM", dot: "bg-violet-500" },
    { title: "Behind the scenes batch day", when: "Tomorrow · 11:30 AM", dot: "bg-amber-500" },
    { title: "Weekly recap + CTA", when: "Thu · 8:00 AM", dot: "bg-rose-500" },
  ];
  return (
    <div className="card p-5 w-[300px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-ink-900 inline-flex items-center gap-2">
          <Clock className="size-4 text-rose-600" strokeWidth={2} />
          Upcoming
        </h3>
        <a href="#" className="text-[12px] font-medium text-rose-600 hover:text-rose-700">All</a>
      </div>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={"size-2 rounded-full mt-1.5 shrink-0 " + it.dot} />
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink-900 leading-snug line-clamp-1">{it.title}</div>
              <div className="text-[11.5px] text-ink-400">{it.when}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SuggestionWidget() {
  return (
    <div className="card p-5 w-[300px] max-w-full bg-rose-50/60 border-rose-100">
      <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Lightbulb className="size-[18px]" strokeWidth={1.9} />
      </span>
      <h3 className="text-[14px] font-bold text-ink-900">Post at 6 PM today</h3>
      <p className="text-[12.5px] text-ink-600 leading-snug mt-1">
        Your audience is most active in the evening. Schedule your reel now to ride the peak.
      </p>
      <a href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 mt-3">
        Schedule it
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </a>
    </div>
  );
}

export function LeaderboardWidget() {
  const rows = [
    { rank: 1, name: "Amelia Park", pts: "2,480", you: false },
    { rank: 2, name: "You", pts: "2,210", you: true },
    { rank: 3, name: "Marcus Lee", pts: "1,940", you: false },
    { rank: 4, name: "Priya Sharma", pts: "1,720", you: false },
  ];
  const medal = ["text-[#C9A227]", "text-ink-400", "text-[#B07B4F]"];
  return (
    <div className="card p-5 w-[300px] max-w-full">
      <h3 className="text-[14px] font-bold text-ink-900 inline-flex items-center gap-2 mb-3">
        <Trophy className="size-4 text-rose-600" strokeWidth={2} />
        Leaderboard
      </h3>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li
            key={r.rank}
            className={
              "flex items-center gap-3 h-10 px-2 rounded-[10px] " +
              (r.you ? "bg-rose-50" : "")
            }
          >
            <span
              className={
                "w-5 text-center text-[13px] font-bold tabular-nums shrink-0 " +
                (r.rank <= 3 ? medal[r.rank - 1] : "text-ink-400")
              }
            >
              {r.rank}
            </span>
            <span
              className={
                "size-7 rounded-full inline-flex items-center justify-center text-white text-[11px] font-semibold shrink-0 " +
                (r.you ? "bg-rose-600" : "bg-ink-400")
              }
            >
              {r.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </span>
            <span className={"flex-1 text-[13px] truncate " + (r.you ? "font-semibold text-ink-900" : "text-ink-700")}>
              {r.name}
            </span>
            <span className="text-[12px] font-semibold text-ink-900 tabular-nums">{r.pts}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
