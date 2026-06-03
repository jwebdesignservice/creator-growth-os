/* Page Designs · community ────────────────────────────────────────────────────
   The community / membership side of a creator platform — the pages members
   live in: community hub, discussion board, a thread, member directory, events
   calendar, an event, groups / spaces, a challenge board, messages, and poll
   results. Same visual language as the rest of Page Designs (a 560×268 app-shell
   frame from skeleton bars, rose / ink / cream / emerald accents, flat inner
   cards), at page level. Self-contained & presentational — no shared deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Shell primitives (identical to the other Page Design files) ───────────── */

function Topbar() {
  return (
    <div className="h-7 shrink-0 bg-white border-b border-ink-100 flex items-center gap-1.5 px-3">
      <div className="size-2 rounded-full bg-rose-300" />
      <div className="size-2 rounded-full bg-amber-300" />
      <div className="size-2 rounded-full bg-emerald-300" />
      <div className="ml-2 h-3 w-44 rounded bg-cream-200" />
      <div className="ml-auto size-4 rounded-full bg-cream-200" />
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden flex flex-col shadow-sm">
      <Topbar />
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}

function Rail({ active = 1 }: { active?: number }) {
  return (
    <div className="w-[110px] shrink-0 bg-white border-r border-ink-100 p-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-1 pb-2">
        <div className="size-5 rounded-md bg-rose-400" />
        <div className="h-2 w-11 rounded bg-ink-200" />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1.5", i === active && "bg-rose-50")}>
          <div className={cn("size-3 rounded shrink-0", i === active ? "bg-rose-400" : "bg-ink-200")} />
          <div className={cn("h-1.5 rounded", i === active ? "w-11 bg-rose-300" : "w-9 bg-ink-100")} />
        </div>
      ))}
      <div className="mt-auto flex items-center gap-1.5 px-1 pt-2 border-t border-ink-100">
        <div className="size-5 rounded-full bg-cream-200" />
        <div className="h-1.5 w-9 rounded bg-ink-100" />
      </div>
    </div>
  );
}

function PlayGlyph() {
  return <div className="ml-0.5 size-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-ink-900" />;
}

const SPACE_TONES = ["bg-rose-100", "bg-emerald-100", "bg-amber-100", "bg-indigo-100"];

/* ── 1 · Community hub — composer + feed with reactions ────────────────────── */
export function CommunityHub() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="size-7 rounded-full bg-cream-200 shrink-0" />
          <div className="flex-1 h-8 rounded-full bg-cream-100 border border-ink-200" />
          <div className="size-8 rounded-md bg-rose-400 shrink-0" />
        </div>
        <div className="flex-1 min-h-0 p-2.5 space-y-2 overflow-hidden">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="size-6 rounded-full bg-cream-200 shrink-0" />
                <div className="space-y-1">
                  <div className="h-1.5 w-16 rounded bg-ink-200" />
                  <div className="h-1.5 w-10 rounded bg-ink-100" />
                </div>
                <div className="ml-auto h-1 w-3 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 w-full rounded bg-ink-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              {i === 0 && <div className="h-12 rounded-md bg-cream-200" />}
              <div className="flex items-center gap-3 pt-0.5">
                <div className="flex items-center gap-1">
                  <div className="size-2.5 rounded-full bg-rose-300" />
                  <div className="h-1.5 w-4 rounded bg-ink-100" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2.5 rounded-full bg-ink-200" />
                  <div className="h-1.5 w-4 rounded bg-ink-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 2 · Discussion board — topic categories ───────────────────────────────── */
export function DiscussionBoard() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-6 w-20 rounded-md bg-rose-400" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2 border-b border-ink-100 last:border-0">
              <div className={cn("size-8 rounded-md shrink-0", SPACE_TONES[i])} />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-24 rounded bg-ink-200" />
                <div className="h-1.5 w-16 rounded bg-ink-100" />
              </div>
              <div className="text-right space-y-1">
                <div className="h-2 w-6 rounded bg-ink-300 ml-auto" />
                <div className="h-1.5 w-10 rounded bg-ink-100" />
              </div>
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 3 · Thread — original post + replies + reply bar ──────────────────────── */
export function ThreadDetail() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          </div>
          <div className="h-2 w-2/3 rounded bg-ink-300" />
          <div className="h-1.5 w-full rounded bg-ink-100" />
          <div className="h-1.5 w-3/4 rounded bg-ink-100" />
        </div>
        <div className="h-1.5 w-16 rounded bg-ink-300 ml-1" />
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-2 ml-3">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="flex-1 rounded-lg bg-white border border-ink-100 p-2 space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-1.5 w-full rounded bg-ink-100" />
              <div className="h-1.5 w-1/2 rounded bg-ink-100" />
            </div>
          </div>
        ))}
        <div className="mt-auto flex items-center gap-2">
          <div className="flex-1 h-8 rounded-full bg-white border border-ink-200" />
          <div className="h-8 w-14 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 4 · Member directory — browse members ─────────────────────────────────── */
export function MemberDirectory() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="ml-auto flex-1 max-w-[150px] h-7 rounded-full bg-cream-100 border border-ink-200" />
        </div>
        <div className="flex-1 min-h-0 p-2.5 grid grid-cols-3 gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex flex-col items-center gap-1 text-center">
              <div className="size-9 rounded-full bg-cream-200" />
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              <div className="h-1.5 w-8 rounded bg-ink-100" />
              <div className={cn("h-5 w-full rounded-md mt-0.5", i === 0 ? "bg-rose-400" : "bg-cream-100 border border-ink-100")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 5 · Events calendar — upcoming events + RSVP ──────────────────────────── */
export function EventsCalendar() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="flex gap-1">
            <div className="h-6 w-12 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-12 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-h-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white border border-ink-100 p-2">
              <div className="size-11 rounded-md bg-rose-50 border border-rose-100 flex flex-col items-center justify-center gap-0.5 shrink-0">
                <div className="h-1.5 w-5 rounded bg-rose-300" />
                <div className="h-2.5 w-6 rounded bg-ink-300" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-24 rounded bg-ink-200" />
                <div className="h-1.5 w-16 rounded bg-ink-100" />
                <div className="flex -space-x-1 pt-0.5">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="size-3.5 rounded-full bg-cream-200 border border-white" />
                  ))}
                </div>
              </div>
              <div className="h-7 w-14 rounded-md bg-white border border-ink-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 6 · Event detail — live cover + details + register ────────────────────── */
export function EventDetail() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="relative h-24 bg-ink-900 flex items-center justify-center shrink-0">
          <div className="size-9 rounded-full bg-white/90 flex items-center justify-center">
            <PlayGlyph />
          </div>
          <div className="absolute top-2 left-2 flex items-center gap-1 h-4 px-1.5 rounded-full bg-rose-500">
            <div className="size-1.5 rounded-full bg-white" />
            <div className="h-1 w-5 rounded bg-white/80" />
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col gap-2">
          <div className="h-2.5 w-2/3 rounded bg-ink-300" />
          <div className="flex items-center gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-4 rounded bg-rose-100" />
                <div className="h-1.5 w-14 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="size-5 rounded-full bg-cream-200 border-2 border-white" />
              ))}
            </div>
            <div className="h-1.5 w-16 rounded bg-ink-100" />
          </div>
          <div className="mt-auto h-8 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 7 · Groups / spaces — joinable spaces ─────────────────────────────────── */
export function GroupsSpaces() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="h-6 w-20 rounded-md bg-rose-400" />
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden flex flex-col">
              <div className={cn("h-10", SPACE_TONES[i])} />
              <div className="p-2 space-y-1 flex-1">
                <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                <div className="flex items-center justify-between">
                  <div className="h-1.5 w-12 rounded bg-ink-100" />
                  <div className="h-5 w-12 rounded-md bg-cream-100 border border-ink-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 8 · Challenge board — goal + participant leaderboard ──────────────────── */
export function ChallengeBoard() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="rounded-lg bg-gradient-to-r from-rose-50 to-cream-50 border border-rose-100 p-2.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-rose-100 shrink-0" />
            <div className="space-y-1">
              <div className="h-2 w-28 rounded bg-ink-300" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
            </div>
            <div className="ml-auto h-2.5 w-12 rounded-full bg-emerald-100" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-cream-200 overflow-hidden">
            <div className="h-full w-3/5 rounded-full bg-rose-400" />
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-h-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-ink-100 px-2.5 py-1.5">
              <div className={cn("h-2 w-3 rounded shrink-0", i === 0 ? "bg-amber-400" : "bg-ink-200")} />
              <div className="size-6 rounded-full bg-cream-200 shrink-0" />
              <div className="h-1.5 w-20 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-100" />
              <div className="h-2.5 w-8 rounded-full bg-rose-100 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 9 · Messages — conversation list + thread ─────────────────────────────── */
export function Messages() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[132px] shrink-0 border-r border-ink-100 bg-cream-50 p-2 space-y-1.5 overflow-hidden">
          <div className="h-7 rounded-full bg-white border border-ink-200" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md p-1.5", i === 0 && "bg-white border border-ink-200")}>
              <div className="size-6 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="h-1.5 w-16 rounded bg-ink-100" />
              </div>
              {i === 0 && <div className="size-2 rounded-full bg-rose-400 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col bg-cream-50">
          <div className="px-3 py-2 border-b border-ink-100 bg-white flex items-center gap-1.5">
            <div className="size-6 rounded-full bg-cream-200" />
            <div className="h-1.5 w-16 rounded bg-ink-200" />
          </div>
          <div className="flex-1 p-3 flex flex-col gap-1.5 overflow-hidden">
            <div className="h-6 w-2/3 rounded-xl rounded-tl-sm bg-white border border-ink-100" />
            <div className="h-7 w-1/2 self-end rounded-xl rounded-tr-sm bg-rose-400" />
            <div className="h-6 w-1/2 rounded-xl rounded-tl-sm bg-white border border-ink-100" />
          </div>
          <div className="p-2 border-t border-ink-100 bg-white flex items-center gap-1.5">
            <div className="flex-1 h-7 rounded-full bg-cream-100 border border-ink-200" />
            <div className="size-7 rounded-full bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 10 · Poll results — vote bars with a leader ───────────────────────────── */
export function PollResults() {
  const options = [
    { w: "w-4/5", lead: true },
    { w: "w-1/2", lead: false },
    { w: "w-1/4", lead: false },
    { w: "w-1/6", lead: false },
  ];
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          </div>
          <div className="h-2 w-3/4 rounded bg-ink-300" />
          <div className="space-y-1.5 mt-0.5">
            {options.map((o, i) => (
              <div key={i} className="relative h-7 rounded-md bg-cream-100 overflow-hidden">
                <div className={cn("absolute inset-y-0 left-0 rounded-md", o.lead ? "bg-rose-200" : "bg-cream-200", o.w)} />
                <div className="relative h-full flex items-center px-2.5 gap-2">
                  <div className="h-1.5 w-20 rounded bg-ink-200" />
                  <div className="ml-auto h-1.5 w-6 rounded bg-ink-300" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-1.5 w-16 rounded bg-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* ── Category registration ─────────────────────────────────────────────────── */

type PageCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scale?: number;
  items: { label: string; code: string; node: ReactNode; scale?: number }[];
};

export const PAGE_DESIGNS_COMMUNITY: PageCategory[] = [
  {
    id: "page-designs-community",
    label: "Community",
    icon: Users,
    blurb: "The community / membership side — community hub, discussion board, thread, member directory, events, an event, groups / spaces, challenge board, messages & poll results.",
    items: [
      { label: "Community hub · feed", code: "CommunityHub", node: <CommunityHub /> },
      { label: "Discussion board · topics", code: "DiscussionBoard", node: <DiscussionBoard /> },
      { label: "Thread · post + replies", code: "ThreadDetail", node: <ThreadDetail /> },
      { label: "Member directory", code: "MemberDirectory", node: <MemberDirectory /> },
      { label: "Events · calendar + RSVP", code: "EventsCalendar", node: <EventsCalendar /> },
      { label: "Event detail · live", code: "EventDetail", node: <EventDetail /> },
      { label: "Groups / spaces", code: "GroupsSpaces", node: <GroupsSpaces /> },
      { label: "Challenge board", code: "ChallengeBoard", node: <ChallengeBoard /> },
      { label: "Messages · DM inbox", code: "Messages", node: <Messages /> },
      { label: "Poll results", code: "PollResults", node: <PollResults /> },
    ],
  },
];
