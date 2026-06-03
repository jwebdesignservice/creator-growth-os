/* Page-Design Explorations ───────────────────────────────────────────────
   Versioned explorations (V1 / V2 / V3 / V4) of the schematic page-design
   wireframes. SAME skeleton language as page-designs.tsx — 560×268 frame,
   cream/ink/rose placeholder blocks, white cards with ink-100 borders — just
   more detailed, more refined, and more structured so there are real options
   to choose between per pattern.

   One gallery category per pattern (labelled "Pages · <Pattern>"), each with
   its versions side by side. Exported as PAGE_EXPLORATION_CATEGORIES so the
   gallery only spreads it in.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import {
  LayoutPanelLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ════════════════════════════════════════════════════════════════════════
   Shared wireframe primitives — faithful to page-designs.tsx, with a little
   more structure so the explorations read as refined, real page chrome.
   ════════════════════════════════════════════════════════════════════════ */

/* Bar / block helpers keep the markup readable without changing the look. */
function Bar({ w, className }: { w?: string; className?: string }) {
  return <div className={cn("h-1.5 rounded bg-ink-100", className)} style={w ? { width: w } : undefined} />;
}

function Topbar({ search = true }: { search?: boolean }) {
  return (
    <div className="h-7 shrink-0 border-b border-ink-100 bg-white flex items-center gap-2 px-3">
      <div className="size-3 rounded-[4px] bg-rose-500" />
      <div className="h-1.5 w-10 rounded-full bg-ink-200" />
      {search && (
        <div className="ml-2 flex h-4 w-[150px] items-center gap-1.5 rounded-full bg-cream-100 border border-ink-100 px-2">
          <div className="size-1.5 rounded-full bg-ink-300" />
          <div className="h-1 w-14 rounded bg-ink-200" />
        </div>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative">
          <div className="size-3.5 rounded-full bg-ink-100" />
          <div className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
        </div>
        <div className="size-3.5 rounded-full bg-ink-100" />
        <div className="size-4 rounded-full bg-cream-300 ring-1 ring-ink-200" />
      </div>
    </div>
  );
}

/* Narrow icon-only nav (the primary app rail). */
function IconRail() {
  return (
    <div className="w-10 shrink-0 border-r border-ink-100 bg-white flex flex-col items-center py-2.5 gap-2">
      <div className="size-4 rounded-[5px] bg-rose-400 mb-1" />
      <div className="size-4 rounded-[5px] bg-rose-200" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="mt-auto size-4 rounded-full bg-cream-300" />
    </div>
  );
}

/* Wider labelled nav rail — refined: brand, two sections w/ labels, active
   item with accent bar + count, footer profile. */
function NavRail({ w = 120 }: { w?: number }) {
  return (
    <div className="shrink-0 border-r border-ink-100 bg-white p-2.5 flex flex-col" style={{ width: w }}>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="size-3.5 rounded-[5px] bg-rose-500" />
        <div className="h-2 w-14 rounded bg-ink-300" />
      </div>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <div className="h-1 w-8 rounded bg-ink-100 ml-1.5 mb-1" />
          {[true, false, false].map((active, i) => (
            <div key={i} className={cn("relative flex items-center gap-1.5 rounded-md px-1.5 py-1", active && "bg-rose-50")}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-0.5 rounded-r bg-rose-500" />}
              <div className={cn("size-2.5 rounded-sm shrink-0", active ? "bg-rose-400" : "bg-ink-200")} />
              <div className={cn("h-1.5 rounded", active ? "w-10 bg-rose-300" : "w-9 bg-ink-100")} />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="h-1 w-8 rounded bg-ink-100 ml-1.5 mb-1" />
          {[false, false].map((_, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-md px-1.5 py-1">
              <div className="size-2.5 rounded-sm bg-ink-200 shrink-0" />
              <div className="h-1.5 w-9 rounded bg-ink-100" />
              {i === 0 && <div className="ml-auto h-2 w-3 rounded-full bg-rose-100" />}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-2.5 border-t border-ink-100 flex items-center gap-1.5">
        <div className="relative shrink-0">
          <div className="size-4 rounded-full bg-cream-200" />
          <div className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-1 ring-white" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-9 rounded bg-ink-200" />
          <div className="h-1 w-6 rounded bg-ink-100" />
        </div>
      </div>
    </div>
  );
}

/* Contextual right rail — refined: a widget, a list, a CTA. */
function RightRail({ w = 92 }: { w?: number }) {
  return (
    <div className="shrink-0 border-l border-ink-100 bg-white p-2.5 space-y-2" style={{ width: w }}>
      <div className="rounded-md bg-cream-100 border border-ink-100 p-1.5 space-y-1">
        <div className="h-1.5 w-2/3 rounded bg-ink-200" />
        <div className="h-1.5 w-1/2 rounded bg-rose-200" />
      </div>
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-cream-200 shrink-0" />
            <div className="h-1.5 flex-1 rounded bg-ink-100" />
          </div>
        ))}
      </div>
      <div className="h-6 rounded-md bg-rose-100" />
    </div>
  );
}

/* The 560×268 device frame with topbar. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden flex flex-col shadow-sm">
      <Topbar />
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}

/* Frame with no app shell (page-only content). */
function ContentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

/* A refined page header: breadcrumb, title + subtitle, secondary + primary
   actions. Used across explorations so the chrome stays consistent. */
function PageHead({ breadcrumb = true, actions = true }: { breadcrumb?: boolean; actions?: boolean }) {
  return (
    <div className="px-3.5 pt-3 pb-2.5">
      {breadcrumb && (
        <div className="mb-2 flex items-center gap-1.5">
          <Bar w="22px" />
          <div className="size-1 rounded-full bg-ink-200" />
          <Bar w="34px" className="bg-ink-200" />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-ink-300" />
          <Bar w="160px" />
        </div>
        {actions && (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-12 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        )}
      </div>
    </div>
  );
}

/* A small stat tile (icon dot + label + value + delta chip). */
function StatTile({ delta = true }: { delta?: boolean }) {
  return (
    <div className="h-full rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between gap-1.5">
      <div className="flex items-center gap-1">
        <div className="size-2 rounded-sm bg-rose-200 shrink-0" />
        <Bar w="60%" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-2.5 w-9 rounded bg-ink-300" />
        {delta && (
          <div className="inline-flex items-center gap-0.5">
            <div className="size-0 border-x-[2px] border-x-transparent border-b-[3px] border-b-emerald-400" />
            <div className="h-1.5 w-4 rounded-full bg-emerald-200" />
          </div>
        )}
      </div>
    </div>
  );
}

/* A bar-chart card. */
function ChartCard({ bars = [50, 72, 45, 85, 60, 78, 55], h = 52 }: { bars?: number[]; h?: number }) {
  return (
    <div className="rounded-lg bg-white border border-ink-100 p-2.5">
      <div className="flex items-center justify-between mb-2">
        <Bar w="64px" className="bg-ink-200 h-2" />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-rose-300 shrink-0" /><Bar w="14px" /></div>
          <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-ink-200 shrink-0" /><Bar w="12px" /></div>
        </div>
      </div>
      <div className="flex items-end gap-1.5 border-b border-ink-100" style={{ height: h }}>
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${b}%` }} />
        ))}
      </div>
    </div>
  );
}

/* A small list card (avatar rows). */
function ListCard({ rows = 3, meta = false }: { rows?: number; meta?: boolean }) {
  return (
    <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="size-4 rounded-full bg-cream-200 shrink-0" />
          <div className="flex-1 space-y-1">
            <Bar />
            <Bar w="66%" />
          </div>
          {meta && <div className="h-2 w-4 rounded-full bg-rose-100" />}
        </div>
      ))}
    </div>
  );
}

/* Version chip shown under each exploration in the gallery label is handled
   by the gallery; here we keep components pure. A small caption ribbon marks
   the version inside the frame's top-left for at-a-glance scanning. */
function VersionTag({ children }: { children: ReactNode }) {
  return (
    <span className="absolute left-2 top-2 z-10 inline-flex items-center h-4 px-1.5 rounded-full bg-ink-900/80 text-white text-[8px] font-bold tracking-wide">
      {children}
    </span>
  );
}

/* Frame that hosts a version tag (relative positioning). */
function TaggedFrame({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <div className="relative">
      <VersionTag>{tag}</VersionTag>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 1 — App shell
   V1 single sidebar · V2 double (icon+nav) · V3 sidebar+right rail · V4 collapsed
   ════════════════════════════════════════════════════════════════════════ */

function ShellBody({ tabs = false }: { tabs?: boolean }) {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      {tabs ? (
        <div className="border-b border-ink-100">
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
            <div className="space-y-1">
              <div className="h-2.5 w-24 rounded bg-ink-300" />
              <Bar w="128px" />
            </div>
            <div className="h-6 w-14 rounded-md bg-rose-400" />
          </div>
          <div className="flex items-center gap-3 px-3.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="pt-0.5 pb-1.5">
                <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
                {i === 0 && <div className="mt-1 h-0.5 w-10 rounded-full bg-rose-400" />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PageHead />
      )}
      <div className="px-3.5 pb-3.5 pt-2.5 space-y-2.5">
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[44px]">
              <StatTile />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
          <ChartCard />
          <ListCard meta />
        </div>
      </div>
    </div>
  );
}

function ShellV1() {
  return (
    <Frame>
      <NavRail />
      <ShellBody />
    </Frame>
  );
}

function ShellV2() {
  return (
    <Frame>
      <IconRail />
      <NavRail w={104} />
      <ShellBody tabs />
    </Frame>
  );
}

function ShellV3() {
  return (
    <Frame>
      <NavRail />
      <ShellBody />
      <RightRail />
    </Frame>
  );
}

function ShellV4() {
  return (
    <Frame>
      <IconRail />
      <ShellBody />
    </Frame>
  );
}

/* A donut/ring placeholder. */
function Ring({ size = 48 }: { size?: number }) {
  return <div className="rounded-full border-[5px] border-rose-300" style={{ width: size, height: size }} />;
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 2 — Dashboard
   V1 refined standard · V2 hero-KPI led · V3 bento grid · V4 dense analytics
   ════════════════════════════════════════════════════════════════════════ */

function DashV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <PageHead />
        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5">
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[44px]">
                <StatTile />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1.6fr_1fr] gap-2.5">
            <ChartCard bars={[48, 70, 52, 84, 60, 76, 64, 88]} h={58} />
            <ListCard rows={4} meta />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DashV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5 overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
          {/* Hero KPI */}
          <div className="h-[102px] rounded-lg bg-gradient-to-br from-rose-300 to-rose-200 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-16 rounded bg-white/60" />
              <div className="h-1.5 w-8 rounded-full bg-white/50" />
            </div>
            <div className="h-7 w-28 rounded bg-white/70" />
            <div className="flex items-end gap-1 h-6">
              {[40, 60, 50, 75, 65, 85, 70, 92].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-white/50" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2.5">
            <StatTile />
            <StatTile />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11">
              <StatTile delta={i !== 2} />
            </div>
          ))}
        </div>
        <ChartCard bars={[55, 72, 48, 84, 62, 78, 58, 70, 80]} h={40} />
      </div>
    </Frame>
  );
}

function DashV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 gap-2.5 h-full">
          {/* Big chart — spans 2×2 */}
          <div className="col-span-2 row-span-2 rounded-lg bg-white border border-ink-100 p-2.5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <div className="h-2 w-20 rounded bg-ink-300" />
                <Bar w="56px" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-rose-300 shrink-0" /><Bar w="16px" /></div>
                <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-ink-200 shrink-0" /><Bar w="14px" /></div>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-1.5">
              {[40, 62, 50, 78, 58, 84, 66, 90, 72, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {/* Donut */}
          <div className="rounded-lg bg-white border border-ink-100 flex items-center justify-center">
            <Ring size={44} />
          </div>
          {/* Stat */}
          <div className="h-full">
            <StatTile />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DashV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-ink-100">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-14 rounded-md bg-white border border-ink-100" />
          <div className="h-5 w-16 rounded-md bg-white border border-ink-100" />
        </div>
        <div className="p-2.5 space-y-2 min-h-0 flex-1">
          <div className="grid grid-cols-6 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1">
                <Bar w="80%" className="h-1" />
                <div className="h-2 w-2/3 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-end gap-1 h-[58px]">
              {[40, 70, 50, 85, 60, 75, 55, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-end gap-1 h-[58px]">
              {[60, 45, 72, 50, 80, 58, 68].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-ink-200" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 border-b border-ink-100 last:border-0 flex items-center gap-2 px-2">
                <div className="size-2.5 rounded-full bg-ink-100" />
                <Bar className="flex-1" />
                <Bar w="28px" className="bg-ink-200" />
                <div className="h-2 w-8 rounded-full bg-emerald-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Table helpers. */
function Tbox() {
  return <div className="size-2.5 rounded-[3px] border border-ink-300 shrink-0" />;
}
function Chip({ tone }: { tone: "emerald" | "amber" | "rose" | "ink" }) {
  const bg = { emerald: "bg-emerald-100", amber: "bg-amber-100", rose: "bg-rose-100", ink: "bg-ink-100" };
  const dot = { emerald: "bg-emerald-400", amber: "bg-amber-400", rose: "bg-rose-400", ink: "bg-ink-300" };
  return (
    <div className={cn("h-3 w-10 rounded-full inline-flex items-center gap-1 px-1", bg[tone])}>
      <div className={cn("size-1 rounded-full shrink-0", dot[tone])} />
      <div className={cn("h-1 flex-1 rounded-full opacity-60", dot[tone])} />
    </div>
  );
}
const TONES = ["emerald", "amber", "rose", "ink", "emerald"] as const;

/* A search/toolbar row reused by table explorations. */
function TableToolbar({ count = false }: { count?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-28 rounded-md bg-white border border-ink-100 flex items-center gap-1.5 px-2">
        <div className="size-1.5 rounded-full bg-ink-300" />
        <Bar w="48px" />
      </div>
      <div className="h-6 w-12 rounded-md bg-white border border-ink-100 flex items-center justify-center gap-1">
        <div className="size-1.5 rounded-sm bg-ink-200" />
        <Bar w="18px" className="bg-ink-200" />
      </div>
      {count && <Bar w="40px" className="ml-1" />}
      <div className="ml-auto h-6 w-16 rounded-md bg-rose-400" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 3 — Data table  (flagship: 4 distinct directions)
   V1 classic table · V2 card rows · V3 dense compact · V4 minimal clean
   ════════════════════════════════════════════════════════════════════════ */

function TableV1() {
  const cols = "grid grid-cols-[14px_1.7fr_1fr_56px_48px_14px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2 overflow-hidden">
        <TableToolbar />
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}>
            <Tbox />
            <Bar w="48px" className="bg-ink-200" />
            <Bar w="36px" className="bg-ink-200" />
            <Bar w="32px" className="bg-ink-200" />
            <Bar w="28px" className="bg-ink-200" />
            <span />
          </div>
          {TONES.map((tone, i) => (
            <div key={i} className={cn(cols, "h-8 border-b border-ink-100 last:border-0")}>
              <Tbox />
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                <div className="space-y-1 min-w-0">
                  <Bar w="52px" className="bg-ink-200" />
                  <Bar w="32px" />
                </div>
              </div>
              <Bar w="72%" />
              <Chip tone={tone} />
              <Bar w="28px" className="bg-ink-200" />
              <div className="flex flex-col gap-0.5 items-center">
                <div className="size-0.5 rounded-full bg-ink-300" />
                <div className="size-0.5 rounded-full bg-ink-300" />
                <div className="size-0.5 rounded-full bg-ink-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function TableV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2 overflow-hidden">
        <TableToolbar />
        <div className="space-y-1.5">
          {TONES.slice(0, 4).map((tone, i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2.5 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
              <div className="size-7 rounded-full bg-cream-200 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="h-2 w-20 rounded bg-ink-300" />
                <Bar w="64px" />
              </div>
              <div className="space-y-1 items-end hidden sm:flex sm:flex-col">
                <Bar w="40px" className="bg-ink-200" />
                <Bar w="28px" />
              </div>
              <Chip tone={tone} />
              <div className="h-6 w-12 rounded-md bg-white border border-ink-100 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function TableV3() {
  const cols = "grid grid-cols-[12px_28px_1.4fr_1fr_1fr_48px_44px] items-center gap-1.5 px-2";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="px-2.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="h-5 w-24 rounded bg-white border border-ink-100" />
          <Bar w="36px" className="ml-1" />
          <div className="ml-auto h-5 w-12 rounded bg-rose-400" />
        </div>
        <div className="flex-1 bg-white overflow-hidden">
          <div className={cn(cols, "h-6 bg-cream-100 border-b border-ink-100")}>
            <Tbox />
            <Bar w="16px" className="bg-ink-200" />
            <Bar w="40px" className="bg-ink-200" />
            <Bar w="30px" className="bg-ink-200" />
            <Bar w="30px" className="bg-ink-200" />
            <Bar w="28px" className="bg-ink-200" />
            <Bar w="22px" className="bg-ink-200" />
          </div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={cn(cols, "h-[22px] border-b border-ink-100/70 last:border-0", i % 2 === 1 && "bg-cream-50/40")}>
              <Tbox />
              <Bar w="14px" className="bg-ink-200" />
              <Bar w="80%" />
              <Bar w="70%" />
              <Bar w="60%" />
              <Chip tone={TONES[i % 5]} />
              <Bar w="20px" className="bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="px-2.5 py-1.5 border-t border-ink-100 flex items-center gap-1.5">
          <Bar w="48px" />
          <div className="ml-auto flex items-center gap-1">
            <div className="size-4 rounded bg-white border border-ink-100" />
            <div className="size-4 rounded bg-rose-400" />
            <div className="size-4 rounded bg-white border border-ink-100" />
            <div className="size-4 rounded bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function TableV4() {
  const cols = "grid grid-cols-[1.8fr_1fr_60px_44px] items-center gap-3 px-1";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 px-4 py-3.5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            <Bar w="56px" />
          </div>
          <div className="h-7 w-16 rounded-lg bg-rose-400" />
        </div>
        <div className={cn(cols, "pb-2 mb-1")}>
          <Bar w="40px" className="bg-ink-200" />
          <Bar w="32px" className="bg-ink-200" />
          <Bar w="28px" className="bg-ink-200" />
          <span />
        </div>
        <div>
          {TONES.slice(0, 4).map((tone, i) => (
            <div key={i} className={cn(cols, "h-[34px] border-t border-ink-100")}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-5 rounded-full bg-cream-200 shrink-0" />
                <div className="h-2 w-24 rounded bg-ink-300" />
              </div>
              <Bar w="80%" />
              <Chip tone={tone} />
              <div className="h-2 w-10 rounded bg-ink-200 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 4 — List + detail
   V1 master-detail · V2 inbox 3-pane · V3 split preview
   ════════════════════════════════════════════════════════════════════════ */

function ListDetailV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[152px] shrink-0 border-r border-ink-100 bg-white">
          <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2">
            <Bar w="40px" className="bg-ink-300 h-2" />
            <div className="ml-auto size-3.5 rounded bg-cream-200" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("border-b border-ink-100 p-2 space-y-1", i === 1 && "bg-rose-50")}>
              <div className="flex items-center gap-1.5">
                <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                <Bar w="56px" className={i === 1 ? "bg-ink-300" : "bg-ink-200"} />
                <Bar w="14px" className="ml-auto" />
              </div>
              <Bar w="78%" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 space-y-2 min-w-0">
          <div className="h-2.5 w-2/3 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-cream-200" />
            <div className="space-y-1">
              <Bar w="56px" className="bg-ink-200" />
              <Bar w="36px" />
            </div>
            <div className="ml-auto h-6 w-14 rounded-md bg-rose-400" />
          </div>
          <div className="rounded-lg bg-white border border-ink-100 mt-1 p-2 flex gap-2">
            <div className="size-12 rounded-md bg-gradient-to-br from-rose-100 to-cream-200 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <Bar w="60%" className="bg-ink-200" />
              <div className="flex gap-1">
                <div className="h-3 px-1.5 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="16px" className="bg-emerald-400 h-1" /></div>
                <div className="h-3 px-1.5 rounded-full bg-amber-100 inline-flex items-center"><Bar w="14px" className="bg-amber-400 h-1" /></div>
              </div>
              <Bar w="84%" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Bar /><Bar w="92%" /><Bar w="70%" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ListDetailV2() {
  return (
    <Frame>
      <NavRail w={104} />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[60px] shrink-0 border-r border-ink-100 bg-white p-1.5 space-y-1.5">
          {[true, false, false, false].map((a, i) => (
            <div key={i} className={cn("h-6 rounded-md flex items-center gap-1 px-1", a && "bg-rose-50")}>
              <div className={cn("size-2.5 rounded-sm", a ? "bg-rose-400" : "bg-ink-200")} />
              <Bar w="18px" className={a ? "bg-rose-300" : "bg-ink-100"} />
            </div>
          ))}
        </div>
        <div className="w-[140px] shrink-0 border-r border-ink-100 bg-white">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("border-b border-ink-100 p-2 space-y-1", i === 0 && "bg-rose-50")}>
              <div className="flex items-center gap-1.5">
                <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                <Bar w="48px" className="bg-ink-200" />
                <Bar w="12px" className="ml-auto" />
              </div>
              <Bar w="80%" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 space-y-2 min-w-0">
          <div className="h-2.5 w-3/4 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-cream-200" />
            <Bar w="60px" className="bg-ink-200" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Bar /><Bar /><Bar w="80%" />
          </div>
          <div className="mt-auto rounded-lg bg-white border border-ink-100 p-1.5 flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-cream-200 shrink-0" />
            <div className="flex-1 h-5 rounded-full bg-cream-100 border border-ink-100" />
            <div className="size-5 rounded-full bg-rose-400 shrink-0" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ListDetailV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[132px] shrink-0 border-r border-ink-100 p-2 space-y-1.5 bg-white/40">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("rounded-md border p-1.5 flex items-center gap-1.5", i === 2 ? "border-rose-200 bg-rose-50" : "border-ink-100 bg-white")}>
              <div className="size-5 rounded-md bg-cream-200 shrink-0" />
              <div className="space-y-1 min-w-0">
                <Bar w="48px" className="bg-ink-200" />
                <Bar w="32px" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 flex flex-col min-w-0">
          <div className="rounded-lg bg-white border border-ink-100 flex-1 p-2.5 space-y-2">
            <div className="h-24 rounded-md bg-gradient-to-br from-rose-100 to-cream-200" />
            <div className="h-2.5 w-1/2 rounded bg-ink-300" />
            <Bar w="80%" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ListDetailV4() {
  return (
    <Frame>
      <NavRail w={88} />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[124px] shrink-0 border-r border-ink-100 bg-white flex flex-col">
          <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2"><div className="flex-1 h-4 rounded-full bg-cream-100 border border-ink-100" /></div>
          <div className="flex-1 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("border-b border-ink-100 p-1.5 flex items-center gap-1.5", i === 1 && "bg-rose-50")}>
                <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1"><Bar w="60%" className={i === 1 ? "bg-ink-300" : "bg-ink-200"} /><Bar w="80%" /></div>
                {i === 0 && <div className="size-1.5 rounded-full bg-rose-400 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2">
            <Bar w="60px" className="bg-ink-300 h-2" /><div className="flex-1" />
            <div className="size-4 rounded bg-cream-200" /><div className="size-4 rounded bg-cream-200" /><div className="h-5 w-12 rounded-md bg-rose-400" />
          </div>
          <div className="flex-1 overflow-hidden p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5"><div className="size-5 rounded-full bg-cream-200" /><Bar w="50px" className="bg-ink-200" /><Bar w="24px" className="ml-auto h-1" /></div>
            <Bar /><Bar w="92%" />
            <div className="h-10 rounded-md bg-cream-100 border border-ink-100" />
            <div className="border-t border-ink-100 pt-1.5 flex items-center gap-1.5"><div className="size-4 rounded-full bg-cream-200" /><div className="flex-1 h-5 rounded-full bg-white border border-ink-100" /></div>
          </div>
        </div>
        <div className="w-[92px] shrink-0 border-l border-ink-100 bg-cream-50 p-2 space-y-2">
          <div className="flex items-center justify-between"><Bar w="34px" className="bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="16px" className="bg-emerald-400 h-1" /></div></div>
          {[0, 1, 2].map((i) => (<div key={i} className="flex justify-between"><Bar w="40px" /><Bar w="24px" className="bg-ink-200" /></div>))}
          <div className="border-t border-ink-100 pt-1.5 flex items-center gap-1.5"><div className="size-4 rounded-full bg-cream-200" /><Bar w="50%" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 5 — Settings
   V1 subnav + sections · V2 two-column + aside · V3 centered cards + sticky save · V4 search console
   ════════════════════════════════════════════════════════════════════════ */

function SettingsV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[104px] shrink-0 border-r border-ink-100 bg-white p-2.5 space-y-1">
          <div className="h-2 w-14 rounded bg-ink-300 mb-1.5" />
          {[true, false, false, false, false].map((a, i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", a && "bg-rose-50")}>
              <div className={cn("size-2 rounded-sm", a ? "bg-rose-400" : "bg-ink-200")} />
              <Bar w={a ? "44px" : "38px"} className={a ? "bg-rose-300" : "bg-ink-100"} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-3.5 space-y-3 overflow-hidden">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          {[0, 1].map((s) => (
            <div key={s} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
              <Bar w="64px" className="bg-ink-200 h-2" />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Bar w="40px" /><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="62%" className="bg-ink-200" /></div></div>
                <div className="space-y-1"><Bar w="40px" /><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="62%" className="bg-ink-200" /></div></div>
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SettingsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <Bar w="56px" className="bg-rose-300 h-2" />
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <Bar w="48px" className="bg-ink-200" />
                <div className="h-7 rounded-md bg-white border border-ink-100" />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-md bg-white border border-ink-100 px-2 py-2">
              <div className="space-y-1"><Bar w="56px" className="bg-ink-200" /><Bar w="40px" /></div>
              <div className="h-3.5 w-7 rounded-full bg-rose-400" />
            </div>
          </div>
          <div className="w-[120px] shrink-0 space-y-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="size-9 rounded-full bg-rose-100 mx-auto" />
              <Bar w="70%" className="bg-ink-200 mx-auto" />
              <Bar w="50%" className="mx-auto" />
            </div>
            <div className="rounded-lg bg-cream-100 border border-ink-100 p-2 space-y-1.5">
              <Bar w="64%" className="bg-ink-200" /><Bar /><Bar w="76%" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SettingsV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="flex-1 overflow-hidden px-3.5 py-3">
          <div className="mx-auto max-w-[78%] space-y-2.5">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <Bar w="64px" className="bg-ink-200 h-2" />
                  <Bar w="28px" />
                </div>
                <div className="h-7 rounded-md bg-cream-50 border border-ink-100" />
                <div className="flex items-center justify-between">
                  <Bar w="80px" />
                  <div className="h-3.5 w-7 rounded-full bg-rose-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-end gap-2 bg-white/60">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

function SettingsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-40 rounded-full bg-white border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-3 rounded-full bg-ink-200" /><Bar w="50%" /></div>
        </div>
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="w-[104px] shrink-0 border-r border-ink-100 p-2 space-y-2 bg-white/40">
            <div className="space-y-1">
              <Bar w="30px" className="bg-ink-300 ml-1 mb-0.5 h-1" />
              {[true, false, false].map((a, i) => (
                <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", a && "bg-rose-50")}>
                  <div className={cn("size-2.5 rounded-sm shrink-0", a ? "bg-rose-400" : "bg-ink-200")} /><Bar w={a ? "44px" : "38px"} className={a ? "bg-rose-300" : "bg-ink-100"} />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Bar w="34px" className="bg-ink-300 ml-1 mb-0.5 h-1" />
              {[0, 1].map((i) => (<div key={i} className="flex items-center gap-1.5 rounded-md px-1.5 py-1"><div className="size-2.5 rounded-sm bg-ink-200 shrink-0" /><Bar w="40px" className="bg-ink-100" /></div>))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-3 space-y-2">
            <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
              <Bar w="56px" className="bg-rose-300 h-2" />
              <div className="space-y-1"><Bar w="36px" /><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="56%" className="bg-ink-200" /></div></div>
              <div className="flex items-center justify-between"><div className="space-y-1"><Bar w="50px" className="bg-ink-200" /><Bar w="72px" /></div><Switch on /></div>
              <div className="flex items-center justify-between"><div className="space-y-1"><Bar w="44px" className="bg-ink-200" /><Bar w="64px" /></div><div className="h-6 w-16 rounded-md bg-white border border-ink-100 flex items-center justify-between px-1.5"><Bar w="40%" /><div className="size-2 rounded bg-ink-200" /></div></div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 6 — Profile / detail
   V1 cover + stats · V2 detail + sticky aside · V3 cover + tabs · V4 creator overview
   ════════════════════════════════════════════════════════════════════════ */

function ProfileV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="h-12 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200 relative">
          <div className="absolute -bottom-4 left-3 size-11 rounded-full bg-cream-200 border-2 border-white shadow-sm" />
        </div>
        <div className="px-3 pt-5 pb-2 flex items-start justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            <Bar w="120px" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-12 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-14 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="px-3 flex items-center gap-4 pb-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-8 rounded bg-ink-300" />
              <Bar w="28px" />
            </div>
          ))}
        </div>
        <div className="px-3 grid grid-cols-[1fr_120px] gap-2.5">
          <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <Bar w="48px" className="bg-ink-200 h-2" />
            <Bar /><Bar w="80%" />
          </div>
          <div className="space-y-2">
            <div className="h-8 rounded-lg bg-white border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-4 rounded bg-rose-100 shrink-0" /><Bar w="46%" /><div className="size-2 rounded bg-ink-200 ml-auto" /></div>
            <div className="h-8 rounded-lg bg-white border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-4 rounded bg-cream-200 shrink-0" /><Bar w="38%" /><div className="size-2 rounded bg-ink-200 ml-auto" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ProfileV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-2.5 w-28 rounded bg-ink-300" />
              <Bar w="80px" />
            </div>
          </div>
          <div className="h-16 rounded-lg bg-white border border-ink-100" />
          <div className="space-y-1.5">
            <Bar /><Bar w="88%" /><Bar w="66%" />
          </div>
        </div>
        <div className="w-[118px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-200 shadow-sm p-2.5 space-y-2">
            <Bar w="48px" className="bg-ink-300 h-2" />
            <div className="h-2.5 w-16 rounded bg-rose-300" />
            <div className="h-7 rounded-md bg-rose-400" />
            <div className="h-7 rounded-md bg-white border border-ink-200" />
            <div className="border-t border-ink-100 pt-1.5 space-y-1">
              <Bar /><Bar w="66%" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ProfileV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="h-11 bg-gradient-to-r from-rose-200 to-cream-200 relative">
          <div className="absolute -bottom-3 left-3 size-9 rounded-full bg-cream-200 border-2 border-white shadow-sm" />
        </div>
        <div className="pl-16 pr-3 pt-1.5 pb-1 flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="flex items-center gap-3 px-3 border-b border-ink-100">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pt-1 pb-1.5">
              <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1 h-0.5 w-10 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="p-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[44px] rounded-lg bg-white border border-ink-100" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ProfileV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center gap-2.5">
          <div className="size-11 rounded-full bg-cream-200 border border-ink-100 shrink-0" />
          <div className="flex-1 space-y-1"><div className="h-2.5 w-28 rounded bg-ink-300" /><div className="flex items-center gap-1.5"><Bar w="60px" /><div className="h-3 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="20px" className="bg-rose-400 h-1" /></div></div></div>
          <div className="flex items-center gap-1.5"><div className="h-6 w-12 rounded-md bg-white border border-ink-200" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
        </div>
        <div className="px-3.5 pb-2 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1"><Bar w="50%" /><div className="flex items-end justify-between"><div className="h-2.5 w-8 rounded bg-ink-300" />{i % 2 === 0 && <div className="h-1.5 w-4 rounded-full bg-emerald-200" />}</div></div>)}</div>
        <div className="flex-1 flex gap-3 px-3.5 pb-3 min-h-0 overflow-hidden">
          <div className="flex-1 rounded-lg bg-white border border-ink-100 p-2 space-y-1.5"><Bar w="44px" className="bg-rose-300 h-2" /><div className="grid grid-cols-3 gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] rounded-md bg-gradient-to-br from-cream-200 to-cream-100" />)}</div></div>
          <div className="w-[110px] shrink-0 rounded-lg bg-white border border-ink-100 p-2 space-y-1.5"><Bar w="40px" className="bg-ink-300 h-2" />{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-1.5"><div className="size-4 rounded-full bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="70%" /><Bar w="44%" className="h-1" /></div></div>)}</div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 7 — Kanban / board
   V1 classic columns · V2 swimlanes · V3 compact WIP · V4 grouped + WIP limits
   ════════════════════════════════════════════════════════════════════════ */

function KCard({ chip }: { chip?: string }) {
  return (
    <div className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
      {chip && <div className={cn("h-1.5 w-8 rounded-full", chip)} />}
      <Bar w="90%" />
      <Bar w="60%" />
      <div className="flex items-center gap-1 pt-0.5">
        <div className="size-3 rounded-full bg-cream-200" />
        <Bar w="16px" className="ml-auto" />
      </div>
    </div>
  );
}

function KanbanV1() {
  const heads = ["bg-ink-300", "bg-rose-300", "bg-emerald-300", "bg-amber-300"];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5 overflow-hidden">
        {heads.map((h, c) => (
          <div key={c} className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              <div className={cn("size-2 rounded-full", h)} />
              <Bar w="32px" className="bg-ink-200" />
              <div className="ml-auto h-2 w-3 rounded-full bg-cream-200" />
            </div>
            <div className="space-y-1.5">
              <KCard chip={c === 0 ? "bg-rose-200" : c === 1 ? "bg-amber-200" : undefined} />
              <KCard chip={c === 2 ? "bg-emerald-200" : undefined} />
              {c % 2 === 0 && <KCard />}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function KanbanV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-2.5 overflow-hidden flex flex-col gap-2">
        <div className="flex items-center gap-2.5 pl-[58px]">
          {["Todo", "Doing", "Done"].map((_, i) => (
            <div key={i} className="flex-1 flex items-center gap-1">
              <div className={cn("size-1.5 rounded-full", i === 0 ? "bg-ink-300" : i === 1 ? "bg-rose-300" : "bg-emerald-300")} />
              <Bar w="28px" className="bg-ink-200" />
            </div>
          ))}
        </div>
        {[0, 1].map((lane) => (
          <div key={lane} className="flex items-stretch gap-2.5 flex-1 min-h-0">
            <div className="w-[50px] shrink-0 flex items-center">
              <div className="rounded-md bg-white border border-ink-100 px-1 py-3 [writing-mode:vertical-rl] rotate-180">
                <Bar w="36px" className="bg-ink-200 h-1.5" />
              </div>
            </div>
            {[0, 1, 2].map((col) => (
              <div key={col} className="flex-1 rounded-md bg-white/50 border border-dashed border-ink-100 p-1 space-y-1">
                <KCard chip={col === 1 && lane === 0 ? "bg-rose-200" : undefined} />
                {col === lane && <KCard />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

function KanbanV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-2.5 flex gap-1.5 overflow-hidden">
        {[0, 1, 2, 3, 4].map((c) => (
          <div key={c} className="flex-1 flex flex-col min-w-0 rounded-md bg-white/40 border border-ink-100 p-1">
            <div className="flex items-center gap-1 px-0.5 pb-1 mb-1 border-b border-ink-100">
              <Bar w="20px" className="bg-ink-200 h-1" />
              <div className="ml-auto h-1.5 w-2 rounded-full bg-rose-100" />
            </div>
            <div className="space-y-1">
              <div className="rounded bg-white border border-ink-100 p-1 space-y-0.5">
                <Bar w="90%" className="h-1" />
                <Bar w="60%" className="h-1" />
              </div>
              {c % 2 === 0 && (
                <div className="rounded bg-white border border-ink-100 p-1 space-y-0.5">
                  <Bar w="80%" className="h-1" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function KanbanV4() {
  const cols = [
    { dot: "bg-ink-300", near: false }, { dot: "bg-rose-300", near: true },
    { dot: "bg-emerald-300", near: false }, { dot: "bg-amber-300", near: false },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5 overflow-hidden">
        {cols.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={cn("size-2 rounded-full", c.dot)} />
              <Bar w="28px" className="bg-ink-200" />
              <div className={cn("ml-auto h-3 px-1.5 rounded-full inline-flex items-center", c.near ? "bg-amber-100" : "bg-cream-200")}><Bar w="14px" className={c.near ? "bg-amber-400 h-1" : "bg-ink-300 h-1"} /></div>
            </div>
            <div className="h-0.5 rounded-full bg-cream-200 overflow-hidden mb-2"><div className={cn("h-full rounded-full", c.near ? "bg-amber-300 w-4/5" : "bg-rose-300 w-1/2")} /></div>
            <div className="space-y-1.5">
              <KCard chip={i === 1 ? "bg-amber-200" : i === 0 ? "bg-rose-200" : undefined} />
              <KCard chip={i === 2 ? "bg-emerald-200" : undefined} />
              {i % 2 === 1 && <KCard />}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 8 — Feed / timeline
   V1 centered feed · V2 feed + right rail · V3 masonry cards · V4 single-column digest
   ════════════════════════════════════════════════════════════════════════ */

function PostCard({ media = true }: { media?: boolean }) {
  return (
    <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="size-5 rounded-full bg-cream-200" />
        <div className="space-y-1">
          <Bar w="56px" className="bg-ink-200" />
          <Bar w="34px" />
        </div>
        <div className="ml-auto size-3 rounded-full bg-cream-100" />
      </div>
      <Bar /><Bar w="80%" />
      {media && <div className="h-12 rounded-md bg-cream-100 border border-ink-100" />}
      <div className="flex items-center gap-3 pt-0.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="size-2.5 rounded-full bg-ink-100" />
            <Bar w="14px" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="mx-auto max-w-[64%] py-3 space-y-2.5">
          <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2">
            <div className="size-5 rounded-full bg-cream-200" />
            <div className="h-6 flex-1 rounded-md bg-cream-50 border border-ink-100" />
            <div className="h-6 w-10 rounded-md bg-rose-400" />
          </div>
          <PostCard />
          <PostCard media={false} />
        </div>
      </div>
    </Frame>
  );
}

function FeedV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-2.5 p-3 overflow-hidden">
        <div className="flex-1 space-y-2.5 min-w-0">
          <PostCard />
          <PostCard media={false} />
        </div>
        <div className="w-[120px] shrink-0 space-y-2.5">
          <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <Bar w="48px" className="bg-ink-200 h-2" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Bar w="10px" className="bg-rose-300" />
                <Bar w="70%" />
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-cream-100 border border-ink-100 p-2 space-y-1.5">
            <Bar w="60%" className="bg-ink-200" />
            <div className="h-6 rounded-md bg-rose-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function FeedV3() {
  const hs = [64, 88, 72, 56];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 overflow-hidden">
        <div className="columns-2 gap-2.5 [&>div]:mb-2.5 [&>div]:break-inside-avoid">
          {hs.map((h, i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className="bg-cream-100" style={{ height: h }} />
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="size-3.5 rounded-full bg-cream-200" />
                  <Bar w="50%" />
                </div>
                <Bar w="80%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function FeedV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">{[0, 1].map((i) => <div key={i} className={cn("h-4 w-8 rounded", i === 0 ? "bg-white" : "")} />)}</div></div>
        <div className="flex-1 overflow-hidden px-3.5 py-2">
          <div className="mx-auto max-w-[82%] space-y-2">
            {["Today", "Yesterday"].map((_, g) => (
              <div key={g} className="space-y-1.5">
                <Bar w="34px" className="bg-ink-200 ml-0.5" />
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex gap-2">
                    <div className="size-6 rounded-full bg-cream-200 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5"><Bar w="44px" className="bg-ink-300" /><Bar w="24px" className="h-1" /><div className="ml-auto h-3 px-1.5 rounded-full bg-rose-50 inline-flex items-center"><Bar w="14px" className="bg-rose-300 h-1" /></div></div>
                      <Bar w="92%" /><Bar w="64%" />
                    </div>
                    {(g + i) % 2 === 0 && <div className="size-10 rounded-md bg-gradient-to-br from-cream-200 to-cream-100 shrink-0" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 9 — Calendar
   V1 month grid · V2 week columns · V3 agenda list · V4 schedule rail
   ════════════════════════════════════════════════════════════════════════ */

function CalHead() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-2.5 w-16 rounded bg-ink-300" />
      <div className="flex items-center gap-1 ml-1">
        <div className="size-4 rounded bg-white border border-ink-100 inline-flex items-center justify-center"><div className="size-0 border-y-[2.5px] border-y-transparent border-r-[3.5px] border-r-ink-400" /></div>
        <div className="size-4 rounded bg-white border border-ink-100 inline-flex items-center justify-center"><div className="size-0 border-y-[2.5px] border-y-transparent border-l-[3.5px] border-l-ink-400" /></div>
      </div>
      <div className="ml-auto inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">
        <div className="h-4 w-7 rounded bg-white shadow-sm" />
        <div className="h-4 w-7 rounded" />
        <div className="h-4 w-7 rounded" />
      </div>
    </div>
  );
}

function CalendarMonthV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col overflow-hidden">
        <CalHead />
        <div className="grid grid-cols-7 gap-1 mb-1">
          {[...Array(7).keys()].map((i) => (
            <Bar key={i} w="60%" className="mx-auto" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1">
          {[...Array(35).keys()].map((i) => (
            <div
              key={i}
              className={cn("rounded bg-white border border-ink-100 p-0.5 flex flex-col gap-0.5", (i === 10 || i === 17 || i === 23) && "border-rose-200", i === 18 && "ring-1 ring-rose-300 border-rose-300 bg-rose-50/40")}
            >
              {i === 18 ? <div className="size-2 rounded-full bg-rose-400 self-end" /> : <Bar w="8px" className="h-1 self-end" />}
              {i === 10 && <div className="h-1 rounded-full bg-rose-300 mt-auto" />}
              {i === 17 && <div className="h-1 rounded-full bg-emerald-300 mt-auto" />}
              {i === 23 && <div className="h-1 rounded-full bg-amber-300 mt-auto" />}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function CalendarWeekV2() {
  const events = [
    [{ t: 14, h: 22, tone: "bg-rose-200" }],
    [{ t: 30, h: 30, tone: "bg-emerald-200" }],
    [{ t: 8, h: 18, tone: "bg-amber-200" }, { t: 56, h: 20, tone: "bg-rose-200" }],
    [{ t: 40, h: 26, tone: "bg-rose-200" }],
    [{ t: 20, h: 16, tone: "bg-ink-200" }],
    [],
    [{ t: 34, h: 24, tone: "bg-emerald-200" }],
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col overflow-hidden">
        <CalHead />
        <div className="flex gap-1 flex-1">
          <div className="w-4 shrink-0 flex flex-col justify-between py-1">
            {[0, 1, 2, 3].map((i) => <Bar key={i} w="10px" className="h-1" />)}
          </div>
          {events.map((col, i) => (
            <div key={i} className="flex-1 rounded bg-white border border-ink-100 flex flex-col min-w-0 overflow-hidden">
              <div className="h-3.5 shrink-0 border-b border-ink-100 flex items-center justify-center">
                <Bar w="12px" className="h-1" />
              </div>
              <div className="relative flex-1">
                {col.map((e, j) => (
                  <div key={j} className={cn("absolute inset-x-0.5 rounded-sm", e.tone)} style={{ top: e.t, height: e.h }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function CalendarAgendaV3() {
  const days = [
    { label: "56px", events: [{ tone: "bg-rose-300" }, { tone: "bg-emerald-300" }] },
    { label: "44px", events: [{ tone: "bg-amber-300" }] },
    { label: "50px", events: [{ tone: "bg-rose-300" }, { tone: "bg-ink-300" }] },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 overflow-hidden">
        <CalHead />
        <div className="space-y-2.5">
          {days.map((d, i) => (
            <div key={i}>
              <Bar w={d.label} className="bg-ink-300 h-2 mb-1.5" />
              <div className="space-y-1.5">
                {d.events.map((e, j) => (
                  <div key={j} className="flex items-center gap-2 rounded-md bg-white border border-ink-100 p-1.5">
                    <Bar w="22px" className="shrink-0" />
                    <div className={cn("w-0.5 h-5 rounded-full shrink-0", e.tone)} />
                    <div className="space-y-1 flex-1">
                      <Bar w="60%" className="bg-ink-200" />
                      <Bar w="40%" />
                    </div>
                    <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function CalendarScheduleV4() {
  const ev = [
    { top: 2, h: 22, tone: "bg-rose-200 border-rose-300" },
    { top: 30, h: 30, tone: "bg-emerald-100 border-emerald-300" },
    { top: 66, h: 18, tone: "bg-sky-100 border-sky-300" },
    { top: 90, h: 26, tone: "bg-amber-100 border-amber-300" },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="flex items-center gap-1"><div className="size-4 rounded bg-cream-200" /><div className="size-4 rounded bg-cream-200" /></div>
          <div className="h-2.5 w-24 rounded bg-ink-300" /><div className="flex-1" />
          <div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">{["D", "W", "M"].map((t, i) => <div key={t} className={cn("h-4 w-6 rounded", i === 0 ? "bg-white" : "")} />)}</div>
        </div>
        <div className="flex-1 flex gap-2 p-2.5 min-h-0 overflow-hidden">
          <div className="w-6 shrink-0 flex flex-col justify-between py-0.5">{[0, 1, 2, 3, 4].map((i) => <Bar key={i} w="16px" className="bg-ink-100 h-1" />)}</div>
          <div className="flex-1 relative rounded-lg bg-white border border-ink-100 overflow-hidden">
            {[0, 1, 2, 3].map((i) => <div key={i} className="absolute inset-x-0 h-px bg-ink-100" style={{ top: `${(i + 1) * 20}%` }} />)}
            {ev.map((e, i) => <div key={i} className={cn("absolute left-1.5 right-1.5 rounded-md border px-1.5 py-1 space-y-1", e.tone)} style={{ top: e.top, height: e.h }}><Bar w="60%" className="bg-ink-300 h-1" /></div>)}
            <div className="absolute inset-x-0 top-[44px] h-px bg-rose-400"><div className="size-1.5 rounded-full bg-rose-400 -mt-[3px]" /></div>
          </div>
          <div className="w-[96px] shrink-0"><MiniCal active={12} /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Field helper. */
function Field({ labelW = "44px", h = "h-7" }: { labelW?: string; h?: string }) {
  return (
    <div className="space-y-1">
      <Bar w={labelW} className="bg-ink-200" />
      <div className={cn("rounded-md bg-white border border-ink-100 flex items-center px-1.5", h)}>
        <Bar w="46%" className="bg-ink-100" />
      </div>
    </div>
  );
}
function FooterBar({ between = false }: { between?: boolean }) {
  return (
    <div className={cn("border-t border-ink-100 px-3.5 py-2 flex items-center gap-2 bg-white/60", between ? "justify-between" : "justify-end")}>
      <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
      <div className="h-6 w-16 rounded-md bg-rose-400" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 10 — Forms
   V1 single column · V2 two-column + aside · V3 stepper · V4 review summary
   ════════════════════════════════════════════════════════════════════════ */

function FormV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
        </div>
        <div className="flex-1 overflow-hidden px-3.5 py-3">
          <div className="mx-auto max-w-[80%] space-y-2.5">
            <Bar w="56px" className="bg-rose-300 h-2" />
            <Field labelW="40px" />
            <Field labelW="52px" />
            <Field labelW="36px" h="h-10" />
          </div>
        </div>
        <FooterBar />
      </div>
    </Frame>
  );
}

function FormV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            <Bar w="120px" />
          </div>
          <div className="h-2 w-12 rounded-full bg-cream-200" />
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <Bar w="48px" className="bg-rose-300 h-2" />
            <div className="grid grid-cols-2 gap-2.5">
              <Field labelW="36px" h="h-6" /><Field labelW="36px" h="h-6" />
              <Field labelW="42px" h="h-6" /><Field labelW="30px" h="h-6" />
            </div>
            <Field labelW="52px" h="h-9" />
          </div>
          <div className="w-[112px] shrink-0 space-y-2.5">
            <div className="rounded-lg bg-cream-100 border border-ink-100 p-2 space-y-1.5">
              <Bar w="64%" className="bg-ink-200" /><Bar /><Bar w="76%" />
            </div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="size-7 rounded-full bg-rose-100 mx-auto" />
              <Bar w="70%" className="mx-auto" />
            </div>
          </div>
        </div>
        <FooterBar />
      </div>
    </Frame>
  );
}

function FormV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[92px] shrink-0 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("size-4 rounded-full shrink-0 inline-flex items-center justify-center", i < 1 ? "bg-rose-300" : i === 1 ? "bg-rose-400 ring-2 ring-rose-100" : "bg-cream-200 border border-ink-200")} />
                <div className="space-y-1">
                  <Bar w="44px" className={i <= 1 ? "bg-ink-300" : "bg-ink-200"} />
                  <Bar w="28px" className="h-1" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2.5 border-l border-ink-100 pl-3">
            <div className="h-2.5 w-20 rounded bg-ink-300" />
            <div className="grid grid-cols-2 gap-2.5">
              <Field labelW="36px" h="h-7" /><Field labelW="30px" h="h-7" />
            </div>
            <Field labelW="48px" h="h-10" />
          </div>
        </div>
        <FooterBar between />
      </div>
    </Frame>
  );
}

function FormV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2.5">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <Field labelW="44px" />
          <Field labelW="36px" />
          <div className="grid grid-cols-2 gap-2.5">
            <Field labelW="30px" /><Field labelW="30px" />
          </div>
        </div>
        <div className="w-[126px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <Bar w="56px" className="bg-ink-300 h-2" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Bar w="56px" /><Bar w="22px" className="bg-ink-200" />
              </div>
            ))}
            <div className="border-t border-ink-100 pt-1.5 flex justify-between">
              <div className="h-2 w-10 rounded bg-ink-300" />
              <div className="h-2 w-10 rounded bg-rose-300" />
            </div>
            <div className="h-7 rounded-md bg-rose-400 mt-1" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 11 — Auth
   V1 split · V2 centered card · V3 minimal
   ════════════════════════════════════════════════════════════════════════ */

function AuthV1() {
  return (
    <Frame>
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 bg-cream-50 p-4">
        <div className="size-7 rounded-[8px] bg-rose-400 mb-1" />
        <div className="h-2.5 w-24 rounded bg-ink-300" />
        <Bar w="120px" />
        <div className="w-[74%] space-y-2 mt-1">
          <div className="h-8 rounded-lg bg-white border border-ink-100" />
          <div className="h-8 rounded-lg bg-white border border-ink-100" />
          <div className="h-8 rounded-lg bg-rose-400" />
          <div className="flex items-center gap-1.5">
            <div className="h-px flex-1 bg-ink-100" />
            <Bar w="24px" />
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-7 rounded-lg bg-white border border-ink-200" />
            <div className="h-7 rounded-lg bg-white border border-ink-200" />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gradient-to-br from-rose-300 via-rose-200 to-cream-200 relative overflow-hidden">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2">
          <div className="h-3 w-28 rounded bg-white/60" />
          <div className="h-2 w-20 rounded bg-white/50" />
        </div>
      </div>
    </Frame>
  );
}

function AuthV2() {
  return (
    <Frame>
      <div className="flex-1 bg-gradient-to-br from-rose-100 via-cream-100 to-cream-200 flex items-center justify-center p-4">
        <div className="w-[64%] rounded-xl bg-white border border-ink-100 shadow-sm p-4 flex flex-col items-center gap-2">
          <div className="size-8 rounded-[9px] bg-rose-400" />
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <Bar w="120px" />
          <div className="w-full space-y-2 mt-1">
            <div className="h-8 rounded-lg bg-cream-50 border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-3 rounded bg-ink-200 shrink-0" /><Bar w="52%" /></div>
            <div className="h-8 rounded-lg bg-cream-50 border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-3 rounded bg-ink-200 shrink-0" /><Bar w="52%" /></div>
            <div className="h-8 rounded-lg bg-rose-400" />
          </div>
          <Bar w="80px" className="mt-1" />
        </div>
      </div>
    </Frame>
  );
}

function AuthV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center">
        <div className="w-[56%] flex flex-col items-center gap-3">
          <div className="size-9 rounded-[10px] bg-rose-400" />
          <div className="h-3 w-28 rounded bg-ink-300" />
          <div className="w-full space-y-2.5 mt-1">
            <div className="h-9 rounded-lg bg-white border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-3 rounded bg-ink-200 shrink-0" /><Bar w="50%" /></div>
            <div className="h-9 rounded-lg bg-white border border-ink-100 flex items-center gap-1.5 px-2"><div className="size-3 rounded bg-ink-200 shrink-0" /><Bar w="50%" /></div>
            <div className="h-9 rounded-lg bg-rose-400" />
          </div>
          <Bar w="100px" className="mt-1" />
        </div>
      </div>
    </Frame>
  );
}

function AuthV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center">
        <div className="w-[60%] flex flex-col items-center gap-2 text-center">
          <div className="size-9 rounded-full bg-rose-100 inline-flex items-center justify-center"><div className="size-4 rounded bg-rose-300" /></div>
          <div className="h-2.5 w-28 rounded bg-ink-300 mt-0.5" />
          <Bar w="150px" /><Bar w="100px" />
          <div className="flex items-center gap-1.5 mt-1.5">
            {[0, 1, 2, 3].map((i) => (<div key={i} className={cn("size-8 rounded-lg border flex items-center justify-center", i === 1 ? "border-rose-300 bg-rose-50" : "border-ink-200 bg-white")}>{i < 2 && <div className="h-2.5 w-1.5 rounded-sm bg-ink-300" />}</div>))}
          </div>
          <div className="h-8 w-[70%] rounded-lg bg-rose-400 mt-1.5" />
          <Bar w="80px" className="mt-0.5" />
        </div>
      </div>
    </Frame>
  );
}

/* Price-tier card. */
function PriceCard({ hot = false, rows = 4 }: { hot?: boolean; rows?: number }) {
  return (
    <div className={cn("flex-1 rounded-xl border p-2.5 flex flex-col gap-2", hot ? "border-rose-300 bg-white shadow-sm ring-1 ring-rose-100" : "border-ink-100 bg-white")}>
      {hot && <div className="self-start h-3.5 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="22px" className="bg-rose-400 h-1" /></div>}
      <Bar w="40px" className="bg-ink-300 h-2" />
      <div className="flex items-end gap-1">
        <div className="h-5 w-10 rounded bg-ink-300" />
        <Bar w="16px" className="mb-0.5" />
      </div>
      <div className="space-y-1.5 mt-0.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={cn("size-2.5 rounded-full shrink-0", hot ? "bg-rose-300" : "bg-emerald-200")} />
            <Bar w={i % 2 ? "62%" : "74%"} />
          </div>
        ))}
      </div>
      <div className={cn("h-7 rounded-md mt-auto", hot ? "bg-rose-400" : "bg-cream-200 border border-ink-200")} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 12 — Pricing
   V1 three-tier · V2 highlighted + toggle · V3 comparison matrix
   ════════════════════════════════════════════════════════════════════════ */

function PricingV1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center px-3.5 py-3">
        <div className="h-2.5 w-28 rounded bg-ink-300" />
        <Bar w="140px" className="mt-1.5" />
        <div className="flex gap-2.5 w-full mt-3 items-stretch">
          <PriceCard rows={3} />
          <PriceCard hot rows={4} />
          <PriceCard rows={3} />
        </div>
      </div>
    </Frame>
  );
}

function PricingV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center px-3.5 py-3">
        <div className="h-2.5 w-24 rounded bg-ink-300" />
        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-cream-200 mt-2">
          <div className="h-5 w-12 rounded-full bg-white shadow-sm" />
          <div className="h-5 w-12 rounded-full" />
        </div>
        <div className="mt-2 h-3.5 px-2 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="34px" className="bg-emerald-400 h-1" /></div>
        <div className="flex gap-2.5 w-full mt-2.5 items-stretch">
          <PriceCard rows={4} />
          <PriceCard hot rows={5} />
        </div>
      </div>
    </Frame>
  );
}

function PricingV3() {
  const cols = ["Free", "Pro", "Max"];
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col px-3.5 py-3">
        <div className="h-2.5 w-24 rounded bg-ink-300 mb-2.5" />
        <div className="rounded-xl border border-ink-100 bg-white overflow-hidden">
          <div className="grid grid-cols-4 bg-cream-100 border-b border-ink-100">
            <div className="px-2.5 py-2"><Bar w="40px" className="bg-ink-200" /></div>
            {cols.map((c, i) => (
              <div key={c} className={cn("px-2.5 py-2 text-center", i === 1 && "bg-rose-50/50")}>
                <Bar w="28px" className={cn("mx-auto", i === 1 ? "bg-rose-400" : "bg-ink-300")} />
              </div>
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((r) => (
            <div key={r} className="grid grid-cols-4 border-b border-ink-100 last:border-0 items-center">
              <div className="px-2.5 py-1.5"><Bar w={r % 2 ? "70%" : "84%"} /></div>
              {[0, 1, 2].map((c) => (
                <div key={c} className={cn("px-2.5 py-1.5 flex justify-center", c === 1 && "bg-rose-50/40")}>
                  {r <= c + 1 ? <div className={cn("size-2.5 rounded-full", c === 1 ? "bg-rose-300" : "bg-emerald-300")} /> : <div className="h-0.5 w-2.5 rounded bg-ink-200" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function PricingV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center px-3.5 gap-3">
        <div className="w-[180px] shrink-0 rounded-xl border border-rose-300 bg-white ring-1 ring-rose-100 shadow-sm p-3 flex flex-col gap-2">
          <div className="self-start h-3.5 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="28px" className="bg-rose-400 h-1" /></div>
          <Bar w="40px" className="bg-ink-300 h-2" />
          <div className="flex items-end gap-1"><div className="h-6 w-14 rounded bg-ink-300" /><Bar w="18px" className="mb-1" /></div>
          <div className="space-y-1.5 mt-0.5">{[0, 1, 2, 3].map((i) => <div key={i} className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-rose-300 shrink-0" /><Bar w={i % 2 ? "60%" : "76%"} /></div>)}</div>
          <div className="h-8 rounded-md bg-rose-400 mt-auto" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-300 h-2" />{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-1.5"><div className="size-3 rounded-full bg-emerald-200 shrink-0" /><Bar w={i % 2 ? "70%" : "84%"} /></div>)}</div>
          <div className="rounded-xl bg-cream-100 border border-ink-100 p-2.5 flex items-center gap-2"><div className="size-7 rounded-full bg-emerald-100 inline-flex items-center justify-center shrink-0"><div className="size-3 rounded bg-emerald-300" /></div><div className="flex-1 space-y-1"><Bar w="50%" className="bg-ink-300" /><Bar w="70%" /></div></div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 13 — Empty / Onboarding
   V1 empty state · V2 fullscreen steps · V3 checklist · V4 sample data / templates
   ════════════════════════════════════════════════════════════════════════ */

function EmptyV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
          <div className="size-12 rounded-2xl bg-cream-200 border border-ink-100 inline-flex items-center justify-center">
            <div className="size-5 rounded-md bg-rose-200" />
          </div>
          <div className="h-2.5 w-28 rounded bg-ink-300 mt-1" />
          <Bar w="160px" />
          <Bar w="120px" />
          <div className="h-7 w-24 rounded-md bg-rose-400 mt-1.5" />
        </div>
      </div>
    </Frame>
  );
}

function OnboardingV2() {
  return (
    <Frame>
      <div className="flex-1 bg-gradient-to-b from-cream-100 to-cream-50 flex flex-col items-center justify-center px-4">
        <div className="flex items-center gap-1.5 mb-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all", i === 1 ? "w-6 bg-rose-400" : "w-1.5 bg-cream-200")} />
          ))}
        </div>
        <div className="size-14 rounded-2xl bg-white border border-ink-100 shadow-sm inline-flex items-center justify-center">
          <div className="size-6 rounded-lg bg-rose-200" />
        </div>
        <div className="h-3 w-32 rounded bg-ink-300 mt-3" />
        <Bar w="180px" className="mt-1.5" />
        <Bar w="140px" className="mt-1" />
        <div className="flex items-center gap-2 mt-3">
          <div className="h-7 w-16 rounded-md bg-white border border-ink-200" />
          <div className="h-7 w-20 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

function OnboardingChecklistV3() {
  const steps = [true, true, false, false];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="w-[150px] shrink-0 space-y-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="h-1.5 w-full rounded-full bg-cream-200 overflow-hidden"><div className="h-full w-1/2 bg-rose-300" /></div>
          <div className="space-y-1.5 mt-1">
            {steps.map((done, i) => (
              <div key={i} className={cn("flex items-center gap-2 rounded-lg border p-1.5", i === 2 ? "border-rose-200 bg-rose-50/50" : "border-ink-100 bg-white")}>
                <div className={cn("size-3.5 rounded-full shrink-0 inline-flex items-center justify-center", done ? "bg-emerald-300" : i === 2 ? "bg-rose-300" : "bg-cream-200 border border-ink-200")}>
                  {done && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <Bar w={i % 2 ? "60%" : "72%"} className={done ? "bg-ink-200" : "bg-ink-300"} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-3 flex flex-col gap-2">
          <Bar w="56px" className="bg-rose-300 h-2" />
          <div className="h-2.5 w-28 rounded bg-ink-300" />
          <ContentBlocksLite />
          <div className="h-7 w-24 rounded-md bg-rose-400 mt-auto" />
        </div>
      </div>
    </Frame>
  );
}

function ContentBlocksLite() {
  return (
    <div className="space-y-1.5">
      <Bar /><Bar w="92%" /><Bar w="80%" />
      <div className="h-12 rounded-lg bg-cream-100 border border-ink-100 mt-1" />
    </div>
  );
}

function EmptyTemplatesV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="h-2.5 w-32 rounded bg-ink-300" /><Bar w="140px" className="mt-1.5 mb-2.5" />
          <div className="grid grid-cols-3 gap-2.5 w-[78%]">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("rounded-lg border bg-white overflow-hidden", i === 0 ? "border-rose-200 ring-1 ring-rose-100" : "border-ink-100")}>
                <div className={cn("h-12 bg-gradient-to-br", i === 0 ? "from-rose-200 to-cream-200" : "from-cream-200 to-cream-100")} />
                <div className="p-1.5 space-y-1"><Bar w="70%" className="bg-ink-300" /><Bar w="50%" /></div>
              </div>
            ))}
          </div>
          <Bar w="90px" className="mt-2.5" />
        </div>
      </div>
    </Frame>
  );
}

/* Grid + media + chat helpers. */
function GridCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
      <div className={cn("bg-gradient-to-br from-cream-200 to-cream-100", tall ? "h-16" : "h-12")} />
      <div className="p-1.5 space-y-1">
        <Bar w="70%" className="bg-ink-300" />
        <div className="flex items-center justify-between">
          <Bar w="40%" /><div className="size-3 rounded-full bg-rose-100" />
        </div>
      </div>
    </div>
  );
}
function FileRow({ folder = false, hot = false }: { folder?: boolean; hot?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[1fr_44px_44px] items-center gap-2 px-2.5 py-1.5 rounded-md", hot ? "bg-rose-50/60" : "hover:bg-cream-100")}>
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn("size-4 rounded shrink-0", folder ? "bg-rose-200" : "bg-cream-200 border border-ink-200")} />
        <Bar w="60%" className="bg-ink-300" />
      </div>
      <Bar w="28px" /><Bar w="32px" />
    </div>
  );
}
function Bubble({ me = false, w = "70%" }: { me?: boolean; w?: string }) {
  return (
    <div className={cn("flex", me ? "justify-end" : "justify-start")}>
      <div className={cn("rounded-2xl px-2 py-1.5 space-y-1", me ? "bg-rose-300 rounded-br-sm" : "bg-white border border-ink-100 rounded-bl-sm")} style={{ width: w }}>
        <Bar className={me ? "bg-white/60" : "bg-ink-200"} />
        <Bar w="64%" className={me ? "bg-white/50" : "bg-ink-100"} />
      </div>
    </div>
  );
}
function Composer() {
  return (
    <div className="border-t border-ink-100 px-2.5 py-2 flex items-center gap-2 bg-white/60">
      <div className="flex-1 h-7 rounded-full bg-white border border-ink-100 flex items-center px-2.5">
        <Bar w="42%" className="bg-ink-100" />
      </div>
      <div className="size-7 rounded-full bg-rose-400 shrink-0 inline-flex items-center justify-center">
        <div className="size-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
      </div>
    </div>
  );
}
function ConvoRow({ hot = false, unread = false }: { hot?: boolean; unread?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg", hot ? "bg-rose-50/70 border border-rose-100" : "hover:bg-cream-100")}>
      <div className="size-7 rounded-full bg-cream-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between"><Bar w="46px" className="bg-ink-300" /><Bar w="14px" className="h-1" /></div>
        <Bar w="80%" />
      </div>
      {unread && <div className="size-2 rounded-full bg-rose-400 shrink-0" />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 14 — Card grid / gallery / file browser
   V1 card grid · V2 masonry media · V3 file browser
   ════════════════════════════════════════════════════════════════════════ */

function GridV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="px-3.5 py-2 flex items-center gap-2 border-b border-ink-100">
          <div className="h-6 w-40 rounded-md bg-white border border-ink-100" />
          <div className="flex-1" />
          <div className="h-6 w-12 rounded-md bg-cream-200" />
          <div className="h-6 w-6 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => <GridCard key={i} />)}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function MasonryV2() {
  const heights = ["h-20", "h-14", "h-16", "h-12", "h-16", "h-20", "h-12", "h-14", "h-16"];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="columns-4 gap-2.5 [&>*]:mb-2.5">
            {heights.map((h, i) => (
              <div key={i} className={cn("rounded-lg border border-ink-100 break-inside-avoid bg-gradient-to-br", h, i % 3 === 0 ? "from-rose-100 to-cream-100" : "from-cream-200 to-cream-100")} />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function FileBrowserV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[110px] shrink-0 border-r border-ink-100 p-2 space-y-1.5 bg-cream-100/40">
          <Bar w="40px" className="bg-ink-300" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 px-1.5 py-1 rounded-md", i === 1 ? "bg-rose-50 border border-rose-100" : "")}>
              <div className="size-3 rounded bg-rose-200 shrink-0" /><Bar w={i % 2 ? "50%" : "64%"} />
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-1.5">
            <Bar w="28px" className="bg-ink-200" /><div className="size-1 rounded-full bg-ink-200" /><Bar w="36px" className="bg-ink-300" />
          </div>
          <div className="grid grid-cols-[1fr_44px_44px] gap-2 px-2.5 py-1.5 border-b border-ink-100">
            <Bar w="30px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" />
          </div>
          <div className="flex-1 overflow-hidden p-1.5">
            <FileRow folder /><FileRow folder /><FileRow hot /><FileRow /><FileRow /><FileRow />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function GridQuickLookV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2"><div className="h-6 w-32 rounded-md bg-white border border-ink-100" /><div className="flex-1" /><div className="h-6 w-6 rounded-md bg-rose-400" /></div>
          <div className="flex-1 overflow-hidden p-3"><div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className={cn("rounded-lg bg-white border overflow-hidden", i === 1 ? "border-rose-300 ring-1 ring-rose-100" : "border-ink-100")}><div className="h-10 bg-gradient-to-br from-cream-200 to-cream-100" /><div className="p-1.5 space-y-1"><Bar w="70%" className="bg-ink-300" /><Bar w="44%" /></div></div>))}</div></div>
        </div>
        <div className="w-[124px] shrink-0 border-l border-ink-100 bg-white p-2.5 flex flex-col gap-2">
          <div className="h-16 rounded-lg bg-gradient-to-br from-rose-200 to-cream-200 border border-ink-100" />
          <div className="space-y-1"><Bar w="70%" className="bg-ink-300" /><Bar w="50%" /></div>
          <div className="space-y-1 border-t border-ink-100 pt-1.5">{[0, 1, 2].map((i) => <div key={i} className="flex justify-between"><Bar w="40%" /><Bar w="30%" className="bg-ink-200" /></div>)}</div>
          <div className="mt-auto flex gap-1.5"><div className="h-7 flex-1 rounded-md bg-rose-400" /><div className="h-7 w-8 rounded-md bg-cream-200 border border-ink-200" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 15 — Chat / messaging
   V1 two-pane · V2 three-pane inbox · V3 thread-focused · V4 assistant + suggestions
   ════════════════════════════════════════════════════════════════════════ */

function ChatV1() {
  return (
    <Frame>
      <div className="w-[150px] shrink-0 border-r border-ink-100 bg-cream-100/40 flex flex-col">
        <div className="px-2.5 py-2 border-b border-ink-100"><div className="h-6 rounded-md bg-white border border-ink-100" /></div>
        <div className="flex-1 overflow-hidden p-1.5 space-y-1">
          <ConvoRow hot unread /><ConvoRow unread /><ConvoRow /><ConvoRow /><ConvoRow />
        </div>
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="size-7 rounded-full bg-cream-200" />
          <div className="space-y-1"><Bar w="50px" className="bg-ink-300" /><Bar w="32px" className="bg-emerald-300 h-1" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-2.5 space-y-2">
          <Bubble w="60%" /><Bubble me w="50%" /><Bubble w="70%" /><Bubble me w="44%" />
        </div>
        <Composer />
      </div>
    </Frame>
  );
}

function ChatV2() {
  return (
    <Frame>
      <IconRail />
      <div className="w-[130px] shrink-0 border-r border-ink-100 bg-cream-100/40 flex flex-col">
        <div className="px-2.5 py-2 border-b border-ink-100 flex items-center justify-between">
          <Bar w="40px" className="bg-ink-300" /><div className="size-5 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 overflow-hidden p-1.5 space-y-1">
          <ConvoRow hot unread /><ConvoRow unread /><ConvoRow /><ConvoRow /><ConvoRow />
        </div>
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="size-7 rounded-full bg-cream-200" /><Bar w="50px" className="bg-ink-300" />
        </div>
        <div className="flex-1 overflow-hidden p-2.5 space-y-2">
          <Bubble w="64%" /><Bubble me w="48%" /><Bubble w="56%" />
        </div>
        <Composer />
      </div>
      <div className="w-[96px] shrink-0 border-l border-ink-100 bg-cream-50 p-2 flex flex-col items-center gap-1.5">
        <div className="size-10 rounded-full bg-cream-200 mt-1" />
        <Bar w="50px" className="bg-ink-300" /><Bar w="36px" />
        <div className="w-full h-px bg-ink-100 my-1" />
        <div className="w-full space-y-1"><Bar /><Bar w="80%" /></div>
      </div>
    </Frame>
  );
}

function ChatV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center">
        <div className="px-3 py-2 border-b border-ink-100 w-full flex items-center justify-center gap-2">
          <div className="size-6 rounded-full bg-cream-200" /><Bar w="60px" className="bg-ink-300" />
        </div>
        <div className="flex-1 overflow-hidden p-3 space-y-2 w-[78%]">
          <div className="flex justify-center"><div className="h-3 px-2 rounded-full bg-cream-200 inline-flex items-center"><Bar w="30px" className="h-1" /></div></div>
          <Bubble w="72%" /><Bubble me w="58%" /><Bubble w="64%" /><Bubble me w="46%" />
        </div>
        <div className="w-[78%] pb-2.5"><Composer /></div>
      </div>
    </Frame>
  );
}

function ChatAssistantV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center">
        <div className="px-3 py-2 border-b border-ink-100 w-full flex items-center justify-center gap-2"><div className="size-5 rounded-lg bg-rose-200" /><Bar w="56px" className="bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3 space-y-2 w-[80%]">
          <Bubble me w="52%" />
          <div className="flex gap-1.5"><div className="size-6 rounded-lg bg-rose-200 shrink-0" /><div className="flex-1 rounded-2xl rounded-bl-sm bg-white border border-ink-100 px-2 py-1.5 space-y-1"><Bar /><Bar w="88%" /><Bar w="60%" /><div className="flex items-center gap-1 pt-0.5"><div className="size-2.5 rounded bg-cream-200" /><Bar w="40px" className="h-1" /></div></div></div>
          <div className="flex flex-wrap gap-1.5 pl-7">{[0, 1, 2].map((i) => <div key={i} className="h-4 px-2 rounded-full bg-rose-50 border border-rose-100 inline-flex items-center"><Bar w="28px" className="bg-rose-300 h-1" /></div>)}</div>
        </div>
        <div className="w-[80%] pb-2.5"><div className="border-t border-ink-100 pt-2 flex items-center gap-2"><div className="flex-1 h-7 rounded-full bg-white border border-ink-100" /><div className="size-7 rounded-full bg-rose-400 shrink-0" /></div></div>
      </div>
    </Frame>
  );
}

/* Document + activity helpers. */
function DocLineRow({ hot = false }: { hot?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[1fr_30px_30px_40px] gap-2 items-center px-2 py-1.5 border-b border-ink-100 last:border-0", hot && "bg-cream-50")}>
      <Bar w="70%" className="bg-ink-300" /><Bar w="18px" /><Bar w="22px" /><Bar w="30px" className="ml-auto bg-ink-300" />
    </div>
  );
}
function TimelineRow({ tone = "rose", last = false }: { tone?: string; last?: boolean }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center">
        <div className={cn("size-3 rounded-full ring-2 ring-cream-50 shrink-0", tone === "rose" ? "bg-rose-300" : tone === "emerald" ? "bg-emerald-300" : "bg-ink-200")} />
        {!last && <div className="w-px flex-1 bg-ink-100 my-0.5" />}
      </div>
      <div className="flex-1 min-w-0 pb-2.5">
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1">
          <div className="flex items-center justify-between"><Bar w="50px" className="bg-ink-300" /><Bar w="16px" className="h-1" /></div>
          <Bar w="84%" /><Bar w="60%" />
        </div>
      </div>
    </div>
  );
}
function NotifRow({ tone = "rose", unread = false }: { tone?: string; unread?: boolean }) {
  return (
    <div className={cn("flex items-start gap-2.5 px-2.5 py-2 rounded-lg", unread ? "bg-rose-50/50" : "hover:bg-cream-100")}>
      <div className={cn("size-7 rounded-full shrink-0", tone === "rose" ? "bg-rose-100" : tone === "emerald" ? "bg-emerald-100" : "bg-cream-200")} />
      <div className="flex-1 min-w-0 space-y-1">
        <Bar w="86%" className="bg-ink-200" /><Bar w="30px" className="h-1" />
      </div>
      {unread && <div className="size-2 rounded-full bg-rose-400 shrink-0 mt-1" />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 16 — Document / detail
   V1 invoice document · V2 article / reading · V3 record detail + sticky aside
   ════════════════════════════════════════════════════════════════════════ */

function DocInvoiceV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-100/50 flex flex-col">
        <div className="px-3.5 py-2 flex items-center justify-between border-b border-ink-100">
          <Bar w="60px" className="bg-ink-300" />
          <div className="flex gap-1.5"><div className="h-6 w-14 rounded-md bg-white border border-ink-200" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="mx-auto max-w-[86%] rounded-lg bg-white border border-ink-100 shadow-sm p-3 space-y-2.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5"><div className="size-7 rounded-md bg-rose-400" /><Bar w="80px" /></div>
              <div className="text-right space-y-1"><div className="h-2.5 w-16 rounded bg-ink-300 ml-auto" /><Bar w="50px" className="ml-auto" /><Bar w="40px" className="ml-auto" /></div>
            </div>
            <div className="rounded-md border border-ink-100 overflow-hidden">
              <div className="grid grid-cols-[1fr_30px_30px_40px] gap-2 px-2 py-1.5 bg-cream-100 border-b border-ink-100">
                <Bar w="30px" className="bg-ink-200" /><Bar w="16px" className="bg-ink-200" /><Bar w="16px" className="bg-ink-200" /><Bar w="24px" className="ml-auto bg-ink-200" />
              </div>
              <DocLineRow /><DocLineRow hot /><DocLineRow />
            </div>
            <div className="flex justify-end"><div className="w-28 space-y-1"><div className="flex justify-between"><Bar w="30px" /><Bar w="24px" /></div><div className="flex justify-between border-t border-ink-100 pt-1"><div className="h-2 w-12 rounded bg-ink-300" /><div className="h-2 w-12 rounded bg-rose-300" /></div></div></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DocArticleV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center overflow-hidden">
        <div className="h-1 w-full bg-rose-300" />
        <div className="w-[72%] py-3.5 space-y-2.5">
          <Bar w="44px" className="bg-rose-300 h-2" />
          <div className="h-3.5 w-[90%] rounded bg-ink-300" />
          <div className="h-3.5 w-[70%] rounded bg-ink-300" />
          <div className="flex items-center gap-2 pt-1">
            <div className="size-6 rounded-full bg-cream-200" /><Bar w="50px" /><div className="size-1 rounded-full bg-ink-200" /><Bar w="34px" className="h-1" />
          </div>
          <div className="h-24 rounded-lg bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100 mt-1" />
          <div className="space-y-1.5 pt-1"><Bar /><Bar w="96%" /><Bar w="92%" /><Bar w="80%" /></div>
          <div className="h-2.5 w-32 rounded bg-ink-300 mt-1.5" />
          <div className="space-y-1.5"><Bar w="94%" /><Bar w="88%" /></div>
        </div>
      </div>
    </Frame>
  );
}

function DocRecordV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
              <Bar w="50px" className="bg-rose-300 h-2" /><Bar /><Bar w="92%" /><Bar w="78%" />
            </div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
              <Bar w="40px" className="bg-ink-300 h-2" /><div className="grid grid-cols-2 gap-2"><div className="h-10 rounded-md bg-cream-100" /><div className="h-10 rounded-md bg-cream-100" /></div>
            </div>
          </div>
          <div className="w-[118px] shrink-0">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2 sticky top-0">
              <div className="flex items-center justify-between"><Bar w="40px" className="bg-ink-300" /><div className="h-3.5 px-1.5 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="18px" className="bg-emerald-400 h-1" /></div></div>
              {[0, 1, 2].map((i) => (<div key={i} className="flex justify-between"><Bar w="40px" /><Bar w="30px" className="bg-ink-200" /></div>))}
              <div className="h-7 rounded-md bg-rose-400 mt-1" />
              <div className="h-7 rounded-md bg-cream-200 border border-ink-200" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DocCommentsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 overflow-hidden px-3 py-3">
          <div className="space-y-2">
            <Bar w="30px" className="bg-rose-300 h-1.5" />
            <div className="h-3 w-44 rounded bg-ink-300" />
            <div className="space-y-1.5 pt-0.5"><Bar /><Bar w="94%" />
              <div className="flex flex-wrap gap-x-1 gap-y-1"><Bar w="40%" className="bg-rose-200" /><div className="w-full h-0 border-b border-rose-300 border-dashed" /></div>
              <Bar w="88%" /><Bar w="72%" />
            </div>
            <div className="h-12 rounded-lg bg-cream-100 border border-ink-100 mt-1" />
            <div className="space-y-1.5"><Bar w="90%" /><Bar w="66%" /></div>
          </div>
        </div>
        <div className="w-[112px] shrink-0 border-l border-ink-100 bg-cream-50 p-2 space-y-2">
          <div className="rounded-lg bg-white border border-rose-200 ring-1 ring-rose-100 p-1.5 space-y-1"><div className="flex items-center gap-1.5"><div className="size-4 rounded-full bg-cream-200" /><Bar w="40px" className="bg-ink-300" /></div><Bar /><Bar w="70%" /><div className="flex gap-1 pt-0.5"><Bar w="20px" className="bg-rose-300 h-1" /><Bar w="16px" className="h-1" /></div></div>
          <div className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1"><div className="flex items-center gap-1.5"><div className="size-4 rounded-full bg-cream-200" /><Bar w="34px" className="bg-ink-200" /></div><Bar w="84%" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 17 — Notifications & activity
   V1 notification center · V2 activity timeline · V3 list + preview
   ════════════════════════════════════════════════════════════════════════ */

function NotifCenterV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="44px" className="bg-rose-300" />
        </div>
        <div className="flex-1 overflow-hidden p-2.5">
          <div className="mx-auto max-w-[88%] space-y-1">
            <Bar w="32px" className="bg-ink-200 ml-1 mb-0.5" />
            <NotifRow tone="rose" unread /><NotifRow tone="emerald" unread />
            <Bar w="36px" className="bg-ink-200 ml-1 mt-1.5 mb-0.5" />
            <NotifRow tone="ink" /><NotifRow tone="rose" /><NotifRow tone="ink" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ActivityTimelineV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="mx-auto max-w-[78%]">
            <TimelineRow tone="rose" /><TimelineRow tone="emerald" /><TimelineRow tone="ink" /><TimelineRow tone="rose" last />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function NotifSplitV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[140px] shrink-0 border-r border-ink-100 flex flex-col">
          <div className="px-2.5 py-2 border-b border-ink-100"><Bar w="40px" className="bg-ink-300" /></div>
          <div className="flex-1 overflow-hidden p-1.5 space-y-1">
            <div className="rounded-lg bg-rose-50/70 border border-rose-100 p-1.5 space-y-1"><Bar w="80%" className="bg-ink-300" /><Bar w="40px" className="h-1" /></div>
            <NotifRow tone="emerald" unread /><NotifRow tone="ink" /><NotifRow tone="rose" />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col p-3 gap-2">
          <div className="flex items-center gap-2"><div className="size-9 rounded-full bg-rose-100" /><div className="space-y-1"><Bar w="60px" className="bg-ink-300" /><Bar w="40px" className="h-1" /></div></div>
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5 flex-1"><Bar /><Bar w="92%" /><Bar w="84%" /><div className="h-12 rounded-md bg-cream-100 mt-1" /></div>
          <div className="flex gap-1.5"><div className="h-7 w-20 rounded-md bg-rose-400" /><div className="h-7 w-16 rounded-md bg-cream-200 border border-ink-200" /></div>
        </div>
      </div>
    </Frame>
  );
}

function NotifActivityV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-2 pb-0 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><Bar w="44px" className="bg-rose-300" /></div>
        <div className="flex items-end gap-3 px-3.5 border-b border-ink-100">
          {["All", "Mentions", "System"].map((t, i) => (<div key={t} className="py-2 relative"><Bar w="34px" className={i === 0 ? "bg-ink-300" : "bg-ink-200"} />{i === 0 && <div className="absolute -bottom-px inset-x-0 h-0.5 rounded-full bg-rose-400" />}</div>))}
        </div>
        <div className="flex-1 overflow-hidden p-2.5"><div className="mx-auto max-w-[88%] space-y-1"><NotifRow tone="rose" unread /><NotifRow tone="emerald" unread /><NotifRow tone="ink" /><NotifRow tone="rose" /><NotifRow tone="ink" /></div></div>
      </div>
    </Frame>
  );
}

/* Marketing chrome helpers. */
function MktNav() {
  return (
    <div className="flex items-center gap-2 px-3.5 h-8 border-b border-ink-100 bg-white/70">
      <div className="size-4 rounded-md bg-rose-400" /><Bar w="40px" className="bg-ink-300" />
      <div className="flex-1" />
      <div className="hidden sm:flex items-center gap-2.5">
        {[0, 1, 2].map((i) => <Bar key={i} w="26px" className="bg-ink-200" />)}
      </div>
      <div className="h-6 w-16 rounded-md bg-rose-400" />
    </div>
  );
}
function FeatureMini() {
  return (
    <div className="flex-1 rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
      <div className="size-6 rounded-md bg-rose-100" />
      <Bar w="64%" className="bg-ink-300" /><Bar /><Bar w="80%" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 18 — Error / status
   V1 404 not found · V2 maintenance · V3 access denied
   ════════════════════════════════════════════════════════════════════════ */

function Error404V1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2.5 px-4">
        <div className="relative">
          <div className="text-[44px] leading-none font-bold text-ink-200 select-none">404</div>
          <div className="absolute -right-2 -top-1 size-5 rounded-full bg-rose-200" />
        </div>
        <div className="h-2.5 w-32 rounded bg-ink-300" />
        <Bar w="160px" /><Bar w="120px" />
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-7 w-20 rounded-md bg-rose-400" />
          <div className="h-7 w-16 rounded-md bg-white border border-ink-200" />
        </div>
      </div>
    </Frame>
  );
}

function MaintenanceV2() {
  return (
    <Frame>
      <div className="flex-1 bg-gradient-to-b from-cream-100 to-cream-50 flex flex-col items-center justify-center gap-2 px-4">
        <div className="size-14 rounded-2xl bg-white border border-ink-100 shadow-sm inline-flex items-center justify-center">
          <div className="size-6 rounded-full bg-amber-200" />
        </div>
        <div className="h-2.5 w-36 rounded bg-ink-300 mt-1" />
        <Bar w="170px" /><Bar w="130px" />
        <div className="mt-2 h-3.5 px-2 rounded-full bg-amber-100 inline-flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-amber-400" /><Bar w="40px" className="bg-amber-400 h-1" />
        </div>
      </div>
    </Frame>
  );
}

function AccessDeniedV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2 px-4">
        <div className="size-14 rounded-full bg-rose-100 inline-flex items-center justify-center">
          <div className="size-6 rounded-md bg-rose-300" />
        </div>
        <div className="h-2.5 w-28 rounded bg-ink-300 mt-1" />
        <Bar w="150px" /><Bar w="110px" />
        <div className="h-7 w-24 rounded-md bg-rose-400 mt-1.5" />
        <Bar w="70px" className="mt-1" />
      </div>
    </Frame>
  );
}

function ErrorOfflineV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2 px-4">
        <div className="size-12 rounded-2xl bg-cream-200 border border-ink-100 inline-flex items-center justify-center"><div className="size-5 rounded-md bg-ink-300" /></div>
        <div className="h-2.5 w-32 rounded bg-ink-300 mt-1" />
        <Bar w="160px" /><Bar w="120px" />
        <div className="flex items-center gap-2 mt-1.5"><div className="h-7 w-20 rounded-md bg-rose-400" /><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /></div>
        <div className="mt-1 h-3.5 px-2 rounded-full bg-cream-200 inline-flex items-center gap-1"><div className="size-1.5 rounded-full bg-ink-300" /><Bar w="44px" className="bg-ink-300 h-1" /></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 19 — Marketing landing
   V1 hero + features grid · V2 hero split + logos · V3 hero centered + CTA band
   ════════════════════════════════════════════════════════════════════════ */

function LandingV1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <MktNav />
        <div className="flex flex-col items-center px-4 pt-3 pb-2.5">
          <div className="h-3 px-2 rounded-full bg-rose-100 inline-flex items-center mb-1.5"><Bar w="40px" className="bg-rose-400 h-1" /></div>
          <div className="h-3 w-44 rounded bg-ink-300" />
          <div className="h-3 w-32 rounded bg-ink-300 mt-1" />
          <Bar w="150px" className="mt-1.5" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-7 w-20 rounded-md bg-rose-400" /><div className="h-7 w-16 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
        <div className="px-3.5 pb-3 flex gap-2.5"><FeatureMini /><FeatureMini /><FeatureMini /></div>
      </div>
    </Frame>
  );
}

function LandingV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <MktNav />
        <div className="flex-1 flex items-center gap-3 px-3.5 py-3">
          <div className="flex-1 space-y-2">
            <div className="h-3 px-2 rounded-full bg-rose-100 inline-flex items-center"><Bar w="36px" className="bg-rose-400 h-1" /></div>
            <div className="h-3 w-[88%] rounded bg-ink-300" /><div className="h-3 w-[64%] rounded bg-ink-300" />
            <Bar w="90%" /><Bar w="74%" />
            <div className="flex gap-2 pt-1"><div className="h-7 w-20 rounded-md bg-rose-400" /><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /></div>
          </div>
          <div className="flex-1 h-[140px] rounded-xl bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 border border-ink-100" />
        </div>
        <div className="px-3.5 pb-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-2">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-3 flex-1 rounded bg-cream-200" />)}
        </div>
      </div>
    </Frame>
  );
}

function LandingV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <MktNav />
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-1.5">
          <div className="h-3.5 w-48 rounded bg-ink-300" />
          <div className="h-3.5 w-36 rounded bg-ink-300" />
          <Bar w="180px" className="mt-1" /><Bar w="140px" />
          <div className="h-8 w-28 rounded-md bg-rose-400 mt-2" />
        </div>
        <div className="m-3 rounded-xl bg-gradient-to-r from-rose-300 to-rose-200 px-3 py-2.5 flex items-center justify-between">
          <div className="space-y-1.5"><div className="h-2.5 w-28 rounded bg-white/70" /><div className="h-1.5 w-20 rounded bg-white/50" /></div>
          <div className="h-7 w-20 rounded-md bg-white" />
        </div>
      </div>
    </Frame>
  );
}

function LandingSectionsV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <MktNav />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <div className="flex-1 space-y-1.5"><Bar w="44px" className="bg-rose-300 h-1.5" /><div className="h-2.5 w-[80%] rounded bg-ink-300" /><Bar w="90%" /><Bar w="64%" /></div>
            <div className="w-[150px] h-[60px] rounded-lg bg-gradient-to-br from-rose-200 to-cream-200 border border-ink-100 shrink-0" />
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-cream-100/50 border-y border-ink-100">
            <div className="w-[150px] h-[60px] rounded-lg bg-gradient-to-br from-cream-200 to-sky-100 border border-ink-100 shrink-0" />
            <div className="flex-1 space-y-1.5"><Bar w="40px" className="bg-emerald-300 h-1.5" /><div className="h-2.5 w-[70%] rounded bg-ink-300" /><Bar w="86%" /><Bar w="60%" /></div>
          </div>
          <div className="px-3.5 py-2.5 flex items-center justify-between"><div className="space-y-1"><div className="h-2.5 w-28 rounded bg-ink-300" /><Bar w="80px" /></div><div className="h-7 w-24 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Search + workspace helpers. */
function SearchBar({ wide = false }: { wide?: boolean }) {
  return (
    <div className={cn("h-7 rounded-full bg-white border border-ink-100 flex items-center gap-2 px-2.5", wide ? "w-full" : "w-48")}>
      <div className="size-3 rounded-full bg-ink-200 shrink-0" /><Bar w="60%" />
    </div>
  );
}
function ResultRow() {
  return (
    <div className="space-y-1 py-1.5 border-b border-ink-100 last:border-0">
      <Bar w="20px" className="bg-emerald-300 h-1" />
      <Bar w="58%" className="bg-rose-300 h-2" />
      <Bar w="92%" /><Bar w="80%" />
    </div>
  );
}
function FacetGroup({ rows = 3, open = true }: { rows?: number; open?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between"><Bar w="44px" className="bg-ink-300" /><div className="size-2.5 rounded bg-ink-200" /></div>
      {open && Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={cn("size-2.5 rounded-sm border border-ink-200", i === 0 ? "bg-rose-300 border-rose-300" : "bg-white")} />
          <Bar w={i % 2 ? "50%" : "66%"} />
        </div>
      ))}
    </div>
  );
}
function ResultCard() {
  return (
    <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
      <div className="h-14 bg-gradient-to-br from-cream-200 to-cream-100" />
      <div className="p-1.5 space-y-1">
        <Bar w="78%" className="bg-ink-300" /><div className="flex justify-between"><Bar w="30%" className="bg-rose-300" /><Bar w="24%" /></div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 20 — Search results
   V1 list results · V2 results + filters · V3 grid results
   ════════════════════════════════════════════════════════════════════════ */

function SearchListV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center gap-2"><SearchBar wide /><div className="h-7 w-7 rounded-full bg-rose-400 shrink-0" /></div>
        <div className="px-3.5 py-1.5 flex items-center gap-2 border-b border-ink-100"><Bar w="60px" className="bg-ink-200" /><div className="flex-1" /><Bar w="40px" /></div>
        <div className="flex-1 overflow-hidden px-3.5 py-1">
          <div className="max-w-[78%]"><ResultRow /><ResultRow /><ResultRow /><ResultRow /></div>
        </div>
      </div>
    </Frame>
  );
}

function SearchFiltersV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100"><SearchBar wide /></div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[104px] shrink-0 space-y-3"><FacetGroup rows={3} /><div className="h-px bg-ink-100" /><FacetGroup rows={2} /><div className="h-px bg-ink-100" /><FacetGroup rows={3} /></div>
          <div className="flex-1 border-l border-ink-100 pl-3"><ResultRow /><ResultRow /><ResultRow /></div>
        </div>
      </div>
    </Frame>
  );
}

function SearchGridV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center gap-2"><SearchBar wide /><div className="h-7 w-12 rounded-md bg-cream-200 shrink-0" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => <ResultCard key={i} />)}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SearchTabsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100"><SearchBar wide /></div>
        <div className="flex items-end gap-3 px-3.5 border-b border-ink-100">
          {[["All", true], ["People", false], ["Files", false], ["Pages", false]].map(([t, on], i) => (
            <div key={i} className="py-2 relative flex items-center gap-1"><Bar w="28px" className={on ? "bg-ink-300" : "bg-ink-200"} /><div className={cn("h-3 px-1 rounded-full inline-flex items-center", on ? "bg-rose-100" : "bg-cream-200")}><Bar w="8px" className={on ? "bg-rose-400 h-1" : "bg-ink-300 h-1"} /></div>{on && <div className="absolute -bottom-px left-0 right-6 h-0.5 rounded-full bg-rose-400" />}</div>
          ))}
        </div>
        <div className="flex-1 overflow-hidden p-2.5 space-y-1.5">
          {[0, 1, 2].map((i) => (<div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2"><div className={cn("size-7 rounded-lg shrink-0", i % 2 ? "bg-cream-200" : "bg-rose-100")} /><div className="flex-1 space-y-1"><Bar w="46%" className="bg-ink-300" /><Bar w="72%" /></div><Bar w="20px" className="h-1" /></div>))}
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 21 — Split workspace
   V1 map + list · V2 multi-pane workspace · V3 editor + live preview
   ════════════════════════════════════════════════════════════════════════ */

function MapListV1() {
  return (
    <Frame>
      <div className="w-[170px] shrink-0 border-r border-ink-100 bg-cream-50 flex flex-col">
        <div className="px-2.5 py-2 border-b border-ink-100"><SearchBar wide /></div>
        <div className="flex-1 overflow-hidden p-2 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex gap-2 rounded-lg border p-1.5", i === 1 ? "border-rose-200 bg-rose-50/50" : "border-ink-100 bg-white")}>
              <div className="size-10 rounded-md bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1"><Bar w="70%" className="bg-ink-300" /><Bar w="50%" /><Bar w="30%" className="bg-rose-300" /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 relative bg-gradient-to-br from-emerald-50 via-cream-100 to-sky-50 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#0001 1px,transparent 1px),linear-gradient(90deg,#0001 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="absolute left-[30%] top-[40%] size-4 rounded-full bg-rose-400 ring-2 ring-white shadow" />
        <div className="absolute left-[58%] top-[30%] size-3 rounded-full bg-rose-300 ring-2 ring-white" />
        <div className="absolute left-[48%] top-[64%] size-3 rounded-full bg-rose-300 ring-2 ring-white" />
        <div className="absolute right-2 bottom-2 rounded-md bg-white border border-ink-200 overflow-hidden flex flex-col shadow-sm">
          <div className="size-5 inline-flex items-center justify-center"><div className="relative size-2"><div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded bg-ink-400" /><div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded bg-ink-400" /></div></div>
          <div className="h-px bg-ink-100" />
          <div className="size-5 inline-flex items-center justify-center"><div className="h-0.5 w-2 rounded bg-ink-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function WorkspaceV2() {
  return (
    <Frame>
      <IconRail />
      <div className="w-[100px] shrink-0 border-r border-ink-100 bg-cream-100/40 p-2 space-y-1.5">
        <Bar w="44px" className="bg-ink-300" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("flex items-center gap-1.5 px-1 py-1 rounded", i === 1 && "bg-white")}>
            <div className="size-2.5 rounded-sm bg-ink-200" /><Bar w={i % 2 ? "50%" : "70%"} />
          </div>
        ))}
      </div>
      <div className="flex-1 min-w-0 bg-cream-100/30 flex items-center justify-center p-3">
        <div className="w-full h-full rounded-lg bg-white border border-ink-100 shadow-sm flex items-center justify-center">
          <div className="w-[60%] space-y-2"><div className="h-10 rounded-md bg-cream-100" /><Bar /><Bar w="80%" /><div className="h-6 w-20 rounded-md bg-rose-300 mt-1" /></div>
        </div>
      </div>
      <div className="w-[96px] shrink-0 border-l border-ink-100 bg-cream-50 p-2 space-y-2">
        <Bar w="50px" className="bg-ink-300" />
        <div className="space-y-1.5"><Field labelW="30px" h="h-5" /><Field labelW="36px" h="h-5" /></div>
        <div className="h-px bg-ink-100" />
        <div className="grid grid-cols-4 gap-1">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded bg-cream-200" />)}</div>
      </div>
    </Frame>
  );
}

function EditorPreviewV3() {
  return (
    <Frame>
      <NavRail w={92} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2"><Bar w="60px" className="bg-ink-300" /><div className="flex-1" /><div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5"><div className="h-4 w-7 rounded bg-white" /><div className="h-4 w-7 rounded" /></div></div>
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 border-r border-ink-100 p-2.5 space-y-2">
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1"><Bar w="40px" className="bg-ink-200" /><div className="h-6 rounded bg-cream-100" /></div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1"><Bar w="50px" className="bg-ink-200" /><div className="h-10 rounded bg-cream-100" /></div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1"><Bar w="36px" className="bg-ink-200" /><div className="h-6 rounded bg-cream-100" /></div>
          </div>
          <div className="flex-1 bg-cream-100/40 p-2.5 flex items-center justify-center">
            <div className="w-full rounded-lg bg-white border border-ink-100 shadow-sm p-2.5 space-y-1.5">
              <div className="h-12 rounded-md bg-gradient-to-br from-rose-200 to-cream-200" />
              <Bar w="70%" className="bg-ink-300" /><Bar /><Bar w="84%" /><div className="h-6 w-20 rounded-md bg-rose-400 mt-1" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function WorkspaceTracksV4() {
  return (
    <Frame>
      <IconRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-1.5 border-b border-ink-100 flex items-center gap-2"><Bar w="50px" className="bg-ink-300" /><div className="flex-1" /><div className="size-5 rounded-md bg-rose-400" /><div className="size-5 rounded-md bg-cream-200" /></div>
        <div className="flex-1 bg-ink-100/40 flex items-center justify-center p-3 min-h-0"><div className="w-[70%] h-full rounded-lg bg-gradient-to-br from-cream-200 via-rose-100 to-cream-100 border border-ink-100" /></div>
        <div className="h-[74px] border-t border-ink-100 bg-white p-2 space-y-1.5 relative">
          {[["rose", "20%", "36%"], ["sky", "8%", "50%"], ["emerald", "30%", "28%"]].map(([tone, off, w], i) => (
            <div key={i} className="grid grid-cols-[40px_1fr] items-center gap-2"><Bar w="70%" className="bg-ink-200" /><div className="relative h-4 rounded bg-cream-100"><div className={cn("absolute h-4 rounded", tone === "rose" ? "bg-rose-300" : tone === "sky" ? "bg-sky-300" : "bg-emerald-300")} style={{ left: off, width: w }} /></div></div>
          ))}
          <div className="absolute top-1 bottom-1 left-[44%] w-px bg-rose-500"><div className="size-1.5 rounded-full bg-rose-500 -ml-[2.5px]" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Analytics + checkout helpers. */
function FunnelBar({ w, tone = "rose" }: { w: string; tone?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-6 rounded-md", tone === "rose" ? "bg-rose-300" : "bg-rose-200")} style={{ width: w }} />
      <Bar w="22px" className="bg-ink-200" />
    </div>
  );
}
function CartRow() {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-ink-100 last:border-0">
      <div className="size-9 rounded-md bg-cream-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-1"><Bar w="60%" className="bg-ink-300" /><Bar w="36%" /></div>
      <div className="inline-flex items-center gap-1">
        <div className="size-4 rounded bg-cream-200 border border-ink-200 inline-flex items-center justify-center"><div className="h-0.5 w-1.5 rounded-full bg-ink-400" /></div>
        <Bar w="12px" className="bg-ink-300" />
        <div className="size-4 rounded bg-cream-200 border border-ink-200 inline-flex items-center justify-center"><div className="relative size-1.5"><div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-ink-400" /><div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded-full bg-ink-400" /></div></div>
      </div>
      <Bar w="24px" className="bg-ink-300 ml-1" />
    </div>
  );
}
function SummaryCard({ cta = true }: { cta?: boolean }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
      <Bar w="50px" className="bg-ink-300 h-2" />
      {[0, 1, 2].map((i) => (<div key={i} className="flex justify-between"><Bar w="48px" /><Bar w="24px" className="bg-ink-200" /></div>))}
      <div className="border-t border-ink-100 pt-1.5 flex justify-between"><div className="h-2 w-12 rounded bg-ink-300" /><div className="h-2 w-12 rounded bg-rose-300" /></div>
      {cta && <div className="h-7 rounded-md bg-rose-400 mt-1" />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 22 — Analytics report
   V1 KPI band + charts · V2 funnel + cohort · V3 single-metric deep-dive
   ════════════════════════════════════════════════════════════════════════ */

function ReportKpiV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-4 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta /><StatTile delta /></div>
          <div className="grid grid-cols-2 gap-2.5">
            <ChartCard bars={[8, 14, 10, 18, 13, 20, 16]} h={48} />
            <ChartCard bars={[16, 12, 18, 9, 15, 11, 19]} h={48} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ReportFunnelV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
            <Bar w="40px" className="bg-ink-300 h-2" />
            <FunnelBar w="92%" /><FunnelBar w="70%" /><FunnelBar w="52%" tone="rose2" /><FunnelBar w="34%" tone="rose2" />
          </div>
          <div className="w-[128px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
            <Bar w="44px" className="bg-ink-300 h-2" />
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const lvl = (i * 7 + 3) % 4;
                return <div key={i} className={cn("aspect-square rounded-sm", lvl === 0 ? "bg-cream-200" : lvl === 1 ? "bg-rose-100" : lvl === 2 ? "bg-rose-200" : "bg-rose-400")} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ReportDeepDiveV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="space-y-1"><Bar w="60px" className="bg-ink-300" /><div className="h-4 w-20 rounded bg-rose-300" /></div>
          <div className="flex-1" />
          <div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">{["7d", "30d", "90d"].map((t, i) => <div key={t} className={cn("h-4 w-7 rounded", i === 1 ? "bg-white" : "")} />)}</div>
        </div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <ChartCard bars={[6, 10, 8, 14, 11, 16, 13, 19, 15, 21]} h={62} />
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_44px_44px] gap-2 px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="40px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><Bar w="20px" className="bg-ink-200" /></div>
            {[0, 1, 2].map((i) => (<div key={i} className="grid grid-cols-[1fr_44px_44px] gap-2 px-2.5 py-1.5 border-b border-ink-100 last:border-0 items-center"><Bar w="60%" className="bg-ink-300" /><Bar w="28px" /><Bar w="20px" className="bg-emerald-300" /></div>))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ReportScorecardV4() {
  const spark = [
    [6, 10, 8, 13, 11, 16], [14, 11, 13, 9, 12, 8], [7, 9, 12, 14, 17, 20], [12, 10, 9, 11, 10, 9],
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-2 gap-2.5 h-full">
          {spark.map((s, i) => (
            <div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between"><div className="flex items-center gap-1"><div className="size-2 rounded-sm bg-rose-200" /><Bar w="50px" /></div><div className={cn("h-3 px-1.5 rounded-full inline-flex items-center", i === 3 ? "bg-red-50" : "bg-emerald-50")}><Bar w="14px" className={i === 3 ? "bg-red-400 h-1" : "bg-emerald-400 h-1"} /></div></div>
              <div className="flex items-end justify-between"><div className="h-4 w-12 rounded bg-ink-300" /><div className="flex items-end gap-0.5 h-6">{s.map((b, j) => <div key={j} className="w-1 rounded-t bg-rose-200" style={{ height: `${b * 2.5}px` }} />)}</div></div>
            </div>
          ))}
        </div></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 23 — Checkout / cart
   V1 cart + summary · V2 multi-step checkout · V3 single-page checkout
   ════════════════════════════════════════════════════════════════════════ */

function CartV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 rounded-xl bg-white border border-ink-100 px-2.5"><CartRow /><CartRow /><CartRow /></div>
          <div className="w-[124px] shrink-0"><SummaryCard /></div>
        </div>
      </div>
    </Frame>
  );
}

function CheckoutStepsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center gap-2">
          {["Cart", "Ship", "Pay"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn("size-4 rounded-full inline-flex items-center justify-center shrink-0", i < 1 ? "bg-emerald-300" : i === 1 ? "bg-rose-400 ring-2 ring-rose-100" : "bg-cream-200 border border-ink-200")}>{i < 1 && <span className="block w-[2.5px] h-[5px] border-b-[1.5px] border-r-[1.5px] border-white rotate-45 -mt-px" />}</div>
              <Bar w="26px" className={i <= 1 ? "bg-ink-300" : "bg-ink-200"} />
              {i < 2 && <div className="w-5 h-px bg-ink-200" />}
            </div>
          ))}
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <Bar w="44px" className="bg-rose-300 h-2" />
            <div className="grid grid-cols-2 gap-2.5"><Field labelW="36px" h="h-6" /><Field labelW="30px" h="h-6" /></div>
            <Field labelW="48px" h="h-6" />
            <Field labelW="40px" h="h-6" />
          </div>
          <div className="w-[120px] shrink-0"><SummaryCard /></div>
        </div>
      </div>
    </Frame>
  );
}

function CheckoutSingleV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2"><div className="size-5 rounded-md bg-rose-400" /><Bar w="40px" className="bg-ink-300" /></div>
          <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
            <div className="space-y-1.5"><Bar w="40px" className="bg-ink-300 h-2" /><Field labelW="36px" h="h-6" /></div>
            <div className="space-y-1.5"><Bar w="48px" className="bg-ink-300 h-2" /><div className="grid grid-cols-2 gap-2"><Field labelW="30px" h="h-6" /><Field labelW="30px" h="h-6" /></div></div>
            <div className="space-y-1.5"><Bar w="36px" className="bg-ink-300 h-2" /><Field labelW="40px" h="h-6" /></div>
          </div>
        </div>
        <div className="w-[150px] shrink-0 border-l border-ink-100 bg-cream-100/40 p-3 space-y-2.5">
          <div className="space-y-1.5"><CartRow /><CartRow /></div>
          <SummaryCard />
        </div>
      </div>
    </Frame>
  );
}

function CheckoutDrawerV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 relative bg-cream-50 overflow-hidden flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 opacity-60"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 p-3.5 grid grid-cols-3 gap-2.5 opacity-60 content-start">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden"><div className="h-10 bg-cream-100" /><div className="p-1.5 space-y-1"><Bar w="70%" /><Bar w="40%" /></div></div>)}</div>
        <div className="absolute inset-0 bg-ink-500/20" />
        <div className="absolute right-0 top-0 bottom-0 w-[150px] bg-white border-l border-ink-100 shadow-lg flex flex-col">
          <div className="px-2.5 py-2 border-b border-ink-100 flex items-center justify-between"><Bar w="36px" className="bg-ink-300" /><div className="size-4 rounded bg-cream-200" /></div>
          <div className="flex-1 overflow-hidden px-2.5"><CartRow /><CartRow /></div>
          <div className="border-t border-ink-100 p-2.5 space-y-1.5"><div className="flex justify-between"><Bar w="40px" /><Bar w="24px" className="bg-ink-200" /></div><div className="flex justify-between"><div className="h-2 w-10 rounded bg-ink-300" /><div className="h-2 w-10 rounded bg-rose-300" /></div><div className="h-7 rounded-md bg-rose-400 mt-0.5" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Docs + billing helpers. */
function DocNavItem({ active = false, child = false }: { active?: boolean; child?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1.5 py-1 rounded-md", child ? "pl-3.5" : "pl-1.5", active && "bg-rose-50 border border-rose-100")}>
      {active && <div className="w-0.5 h-3 rounded bg-rose-400" />}
      <Bar w={child ? "50%" : "66%"} className={active ? "bg-rose-400" : child ? "bg-ink-200" : "bg-ink-300"} />
    </div>
  );
}
function CategoryCard() {
  return (
    <div className="flex-1 rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
      <div className="size-7 rounded-lg bg-rose-100" />
      <Bar w="64%" className="bg-ink-300" /><Bar w="90%" /><Bar w="40%" className="bg-ink-200" />
    </div>
  );
}
function FaqRow({ open = false }: { open?: boolean }) {
  return (
    <div className={cn("rounded-lg border px-2.5 py-2", open ? "border-rose-200 bg-white" : "border-ink-100 bg-white")}>
      <div className="flex items-center justify-between"><Bar w="60%" className="bg-ink-300" /><div className={cn("size-3 rounded shrink-0", open ? "bg-rose-300" : "bg-cream-200")} /></div>
      {open && <div className="space-y-1 mt-1.5"><Bar /><Bar w="88%" /><Bar w="70%" /></div>}
    </div>
  );
}
function UsageMeter({ pct = "60%", tone = "rose" }: { pct?: string; tone?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between"><Bar w="44px" className="bg-ink-200" /><Bar w="28px" /></div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden"><div className={cn("h-full rounded-full", tone === "rose" ? "bg-rose-300" : tone === "amber" ? "bg-amber-300" : "bg-emerald-300")} style={{ width: pct }} /></div>
    </div>
  );
}
function InvoiceRow() {
  return (
    <div className="grid grid-cols-[1fr_44px_30px] gap-2 items-center px-2.5 py-1.5 border-b border-ink-100 last:border-0">
      <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-300" /><Bar w="50%" className="bg-ink-300" /></div>
      <Bar w="28px" /><Bar w="20px" className="bg-rose-300" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 24 — Help / docs
   V1 docs sidebar + article · V2 help center landing · V3 FAQ accordion
   ════════════════════════════════════════════════════════════════════════ */

function DocsV1() {
  return (
    <Frame>
      <div className="w-[112px] shrink-0 border-r border-ink-100 bg-cream-100/40 p-2 space-y-2 overflow-hidden">
        <div className="h-6 rounded-md bg-white border border-ink-100" />
        <div className="space-y-0.5"><Bar w="40px" className="bg-ink-300 mb-1" /><DocNavItem /><DocNavItem active child /><DocNavItem child /></div>
        <div className="space-y-0.5"><Bar w="36px" className="bg-ink-300 mb-1" /><DocNavItem /><DocNavItem child /></div>
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden p-3.5">
        <div className="space-y-2"><Bar w="30px" className="bg-rose-300 h-1.5" /><div className="h-3 w-40 rounded bg-ink-300" /><Bar /><Bar w="92%" /><div className="h-14 rounded-lg bg-cream-100 border border-ink-100 mt-1" /><Bar w="88%" /><Bar w="76%" /></div>
      </div>
      <div className="w-[80px] shrink-0 border-l border-ink-100 bg-cream-50 p-2 space-y-1.5">
        <Bar w="50px" className="bg-ink-200" /><div className="space-y-1"><Bar w="80%" className="bg-rose-300" /><Bar w="64%" /><Bar w="70%" /></div>
      </div>
    </Frame>
  );
}

function HelpCenterV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-b from-rose-100 to-cream-50 px-4 py-3 flex flex-col items-center gap-1.5">
          <div className="h-2.5 w-32 rounded bg-ink-300" />
          <div className="w-[70%] h-8 rounded-full bg-white border border-ink-100 flex items-center gap-2 px-3 mt-1"><div className="size-3.5 rounded-full bg-ink-200" /><Bar w="50%" /></div>
        </div>
        <div className="px-3.5 py-3 flex gap-2.5"><CategoryCard /><CategoryCard /><CategoryCard /></div>
        <div className="px-3.5 pb-3 space-y-1"><Bar w="50px" className="bg-ink-300 mb-1" /><div className="flex items-center gap-2"><div className="size-2 rounded-full bg-rose-300" /><Bar w="60%" /></div><div className="flex items-center gap-2"><div className="size-2 rounded-full bg-rose-300" /><Bar w="48%" /></div></div>
      </div>
    </Frame>
  );
}

function FaqV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center overflow-hidden py-3.5">
        <div className="h-2.5 w-28 rounded bg-ink-300" />
        <Bar w="150px" className="mt-1.5 mb-2.5" />
        <div className="w-[78%] space-y-1.5"><FaqRow open /><FaqRow /><FaqRow /><FaqRow /></div>
      </div>
    </Frame>
  );
}

function DocsGuideV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[92px] shrink-0 border-r border-ink-100 p-2 space-y-2 bg-white/40">
          <Bar w="40px" className="bg-ink-300" />
          {[0, 1, 2, 3].map((i) => (<div key={i} className="flex items-center gap-1.5"><div className={cn("size-4 rounded-full inline-flex items-center justify-center text-[8px] font-bold shrink-0", i < 1 ? "bg-emerald-300 text-white" : i === 1 ? "bg-rose-400 text-white" : "bg-cream-200 text-ink-400 border border-ink-200")}>{i < 1 ? <span className="block w-[3px] h-[5px] border-b-[1.5px] border-r-[1.5px] border-white rotate-45 -mt-px" /> : <span>{i + 1}</span>}</div><Bar w={i === 1 ? "44px" : "36px"} className={i <= 1 ? "bg-ink-300" : "bg-ink-200"} /></div>))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col p-3">
          <div className="space-y-1.5"><Bar w="30px" className="bg-rose-300 h-1.5" /><div className="h-2.5 w-36 rounded bg-ink-300" /><Bar /><Bar w="88%" /></div>
          <div className="h-20 rounded-lg bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100 my-2" />
          <div className="flex items-center justify-between mt-auto"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 25 — Billing / subscription
   V1 plan + usage + invoices · V2 payment methods + history · V3 usage-focused
   ════════════════════════════════════════════════════════════════════════ */

function BillingPlanV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl border border-rose-200 bg-white ring-1 ring-rose-100 p-2.5 flex items-center justify-between">
            <div className="space-y-1.5"><Bar w="40px" className="bg-rose-300 h-2" /><div className="flex items-end gap-1"><div className="h-4 w-12 rounded bg-ink-300" /><Bar w="16px" className="mb-0.5" /></div></div>
            <div className="flex gap-1.5"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
          </div>
          <div className="grid grid-cols-3 gap-2.5"><div className="rounded-xl bg-white border border-ink-100 p-2.5"><UsageMeter pct="72%" /></div><div className="rounded-xl bg-white border border-ink-100 p-2.5"><UsageMeter pct="40%" tone="emerald" /></div><div className="rounded-xl bg-white border border-ink-100 p-2.5"><UsageMeter pct="88%" tone="amber" /></div></div>
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden"><InvoiceRow /><InvoiceRow /><InvoiceRow /></div>
        </div>
      </div>
    </Frame>
  );
}

function BillingMethodsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2">
            <Bar w="50px" className="bg-ink-300 h-2" />
            {[0, 1].map((i) => (
              <div key={i} className={cn("rounded-lg border p-2 flex items-center gap-2", i === 0 ? "border-rose-200 bg-rose-50/40" : "border-ink-100 bg-white")}>
                <div className="h-6 w-9 rounded bg-gradient-to-br from-ink-200 to-cream-200 shrink-0" />
                <div className="flex-1 space-y-1"><Bar w="50%" className="bg-ink-300" /><Bar w="30%" /></div>
                {i === 0 && <div className="h-3.5 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="22px" className="bg-rose-400 h-1" /></div>}
              </div>
            ))}
            <div className="h-7 w-28 rounded-md bg-cream-200 border border-ink-200" />
          </div>
          <div className="w-[130px] shrink-0 rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="44px" className="bg-ink-200" /></div>
            <InvoiceRow /><InvoiceRow /><InvoiceRow /><InvoiceRow />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function BillingUsageV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col items-center gap-1.5">
                <Ring size={40} /><Bar w="50px" className="bg-ink-300" /><Bar w="30px" />
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
            <Bar w="40px" className="bg-ink-300 h-2" /><UsageMeter pct="64%" /><UsageMeter pct="46%" tone="emerald" /><UsageMeter pct="82%" tone="amber" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function BillingInvoicesV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" /><div className="flex-1" />
          <div className="h-6 w-20 rounded-md bg-white border border-ink-100 flex items-center gap-1 px-2"><Bar w="40%" /><div className="size-2 rounded bg-ink-200 ml-auto" /></div>
          <div className="h-6 w-12 rounded-md bg-cream-200" />
        </div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_50px_30px] gap-2 px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="40px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="30px" className="bg-ink-200" /><div /></div>
            {[0, 1, 2, 3, 4].map((r) => (
              <div key={r} className="grid grid-cols-[1fr_60px_50px_30px] gap-2 items-center px-2.5 py-1.5 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-2"><div className="size-4 rounded bg-cream-200 shrink-0" /><Bar w="56%" className="bg-ink-300" /></div>
                <Bar w="34px" className="bg-ink-300" />
                <div className={cn("h-3 px-1.5 rounded-full inline-flex items-center w-fit", r === 3 ? "bg-amber-100" : "bg-emerald-100")}><Bar w="16px" className={r === 3 ? "bg-amber-400 h-1" : "bg-emerald-400 h-1"} /></div>
                <div className="size-4 rounded bg-rose-100 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Members + modal helpers. */
function MemberRow({ role = "ink", hot = false }: { role?: string; hot?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[1fr_60px_50px_24px] gap-2 items-center px-2.5 py-2 border-b border-ink-100 last:border-0", hot && "bg-cream-50")}>
      <div className="flex items-center gap-2 min-w-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1"><Bar w="56px" className="bg-ink-300" /><Bar w="40px" /></div></div>
      <div className={cn("h-3.5 px-1.5 rounded-full inline-flex items-center w-fit", role === "rose" ? "bg-rose-100" : "bg-cream-200")}><Bar w="22px" className={role === "rose" ? "bg-rose-400 h-1" : "bg-ink-300 h-1"} /></div>
      <div className="h-3 px-1.5 rounded-full bg-emerald-100 inline-flex items-center w-fit"><Bar w="18px" className="bg-emerald-400 h-1" /></div>
      <div className="size-4 rounded bg-cream-200 ml-auto" />
    </div>
  );
}
function MemberCard() {
  return (
    <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col items-center gap-1.5">
      <div className="size-10 rounded-full bg-cream-200" />
      <Bar w="50px" className="bg-ink-300" /><Bar w="36px" />
      <div className="h-3.5 px-2 rounded-full bg-rose-100 inline-flex items-center mt-0.5"><Bar w="24px" className="bg-rose-400 h-1" /></div>
      <div className="w-full flex justify-around border-t border-ink-100 pt-1.5 mt-1"><div className="space-y-0.5 text-center"><div className="h-2 w-5 rounded bg-ink-300 mx-auto" /><Bar w="16px" /></div><div className="space-y-0.5 text-center"><div className="h-2 w-5 rounded bg-ink-300 mx-auto" /><Bar w="16px" /></div></div>
    </div>
  );
}
function ModalShell({ w = "60%", children }: { w?: string; children: ReactNode }) {
  return (
    <Frame>
      <div className="flex-1 relative bg-cream-50 overflow-hidden">
        <div className="absolute inset-0 flex opacity-[0.35]">
          <NavRail />
          <div className="flex-1 p-3 space-y-2"><div className="h-5 w-32 rounded bg-ink-200" /><div className="grid grid-cols-3 gap-2"><div className="h-12 rounded-lg bg-white border border-ink-100" /><div className="h-12 rounded-lg bg-white border border-ink-100" /><div className="h-12 rounded-lg bg-white border border-ink-100" /></div><div className="h-20 rounded-lg bg-white border border-ink-100" /></div>
        </div>
        <div className="absolute inset-0 bg-ink-500/25 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="rounded-xl bg-white border border-ink-100 shadow-lg p-3" style={{ width: w }}>{children}</div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 26 — Team / members
   V1 table + roles · V2 member cards · V3 invite + pending
   ════════════════════════════════════════════════════════════════════════ */

function MembersTableV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between">
          <div className="h-2.5 w-20 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" />
        </div>
        <div className="px-3.5 py-1.5 border-b border-ink-100 grid grid-cols-[1fr_60px_50px_24px] gap-2"><Bar w="40px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="30px" className="bg-ink-200" /><div /></div>
        <div className="flex-1 overflow-hidden px-1.5"><MemberRow role="rose" hot /><MemberRow /><MemberRow role="rose" /><MemberRow /><MemberRow /></div>
      </div>
    </Frame>
  );
}

function MembersCardsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-4 gap-2.5"><MemberCard /><MemberCard /><MemberCard /><MemberCard /></div></div>
      </div>
    </Frame>
  );
}

function MembersInviteV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
          <Bar w="44px" className="bg-rose-300 h-2" />
          <Field labelW="36px" h="h-7" />
          <div className="space-y-1"><Bar w="30px" className="bg-ink-200" /><div className="h-7 rounded-md bg-white border border-ink-100 flex items-center justify-between px-2"><Bar w="40px" /><div className="size-2.5 rounded bg-ink-200" /></div></div>
          <div className="h-7 rounded-md bg-rose-400 mt-0.5" />
        </div>
        <div className="w-[150px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between"><Bar w="44px" className="bg-ink-300 h-2" /><div className="h-3 px-1.5 rounded-full bg-amber-100 inline-flex items-center"><Bar w="14px" className="bg-amber-400 h-1" /></div></div>
          {[0, 1, 2].map((i) => (<div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><div className="size-5 rounded-full bg-cream-200 shrink-0" /><Bar w="60%" /><Bar w="20px" className="ml-auto bg-ink-200" /></div>))}
        </div>
      </div>
    </Frame>
  );
}

function MembersRolesV4() {
  const roles = ["Adm", "Edt", "Vwr"];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_44px_44px_44px] bg-cream-100 border-b border-ink-100">
              <div className="px-2.5 py-2"><Bar w="50px" className="bg-ink-200" /></div>
              {roles.map((r, i) => <div key={r} className={cn("px-2 py-2 flex justify-center", i === 0 && "bg-rose-50/50")}><Bar w="18px" className={i === 0 ? "bg-rose-400" : "bg-ink-300"} /></div>)}
            </div>
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="grid grid-cols-[1fr_44px_44px_44px] border-b border-ink-100 last:border-0 items-center">
                <div className="px-2.5 py-1.5"><Bar w={row % 2 ? "62%" : "78%"} /></div>
                {[0, 1, 2].map((c) => (
                  <div key={c} className={cn("px-2 py-1.5 flex justify-center", c === 0 && "bg-rose-50/40")}>
                    {row <= (2 - c) + 1 ? <div className={cn("size-2.5 rounded-full", c === 0 ? "bg-rose-300" : "bg-emerald-300")} /> : <div className="h-0.5 w-2.5 rounded bg-ink-200" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 27 — Modals & dialogs
   V1 confirm dialog · V2 form modal · V3 upgrade / paywall
   ════════════════════════════════════════════════════════════════════════ */

function ConfirmDialogV1() {
  return (
    <ModalShell w="52%">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="size-9 rounded-full bg-rose-100 inline-flex items-center justify-center"><div className="size-4 rounded bg-rose-300" /></div>
        <div className="h-2.5 w-28 rounded bg-ink-300 mt-0.5" />
        <Bar w="80%" /><Bar w="64%" />
        <div className="flex items-center gap-2 mt-1.5 w-full justify-center"><div className="h-7 w-20 rounded-md bg-white border border-ink-200" /><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
      </div>
    </ModalShell>
  );
}

function FormModalV2() {
  return (
    <ModalShell w="64%">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="size-4 rounded bg-cream-200" /></div>
        <div className="h-px bg-ink-100" />
        <Field labelW="36px" h="h-6" />
        <div className="grid grid-cols-2 gap-2"><Field labelW="30px" h="h-6" /><Field labelW="30px" h="h-6" /></div>
        <Field labelW="44px" h="h-9" />
        <div className="h-px bg-ink-100" />
        <div className="flex justify-end gap-2"><div className="h-6 w-16 rounded-md bg-white border border-ink-200" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
      </div>
    </ModalShell>
  );
}

function UpgradeModalV3() {
  return (
    <ModalShell w="58%">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="h-3 px-2 rounded-full bg-rose-100 inline-flex items-center"><Bar w="34px" className="bg-rose-400 h-1" /></div>
        <div className="h-2.5 w-32 rounded bg-ink-300 mt-0.5" />
        <div className="flex items-end gap-1"><div className="h-5 w-12 rounded bg-rose-300" /><Bar w="16px" className="mb-0.5" /></div>
        <div className="w-full space-y-1 mt-1">
          {[0, 1, 2].map((i) => (<div key={i} className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-300 shrink-0" /><Bar w={i % 2 ? "60%" : "74%"} /></div>))}
        </div>
        <div className="h-7 w-full rounded-md bg-rose-400 mt-1.5" />
        <Bar w="60px" />
      </div>
    </ModalShell>
  );
}

function SideSheetV4() {
  return (
    <Frame>
      <div className="flex-1 relative bg-cream-50 overflow-hidden">
        <div className="absolute inset-0 flex opacity-[0.35]"><NavRail /><div className="flex-1 p-3 space-y-2"><div className="h-5 w-32 rounded bg-ink-200" /><div className="h-20 rounded-lg bg-white border border-ink-100" /></div></div>
        <div className="absolute inset-0 bg-ink-500/25" />
        <div className="absolute right-0 top-0 bottom-0 w-[210px] bg-white border-l border-ink-100 shadow-lg flex flex-col">
          <div className="px-3 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="size-4 rounded bg-cream-200" /></div>
          <div className="flex-1 overflow-hidden p-3 space-y-2">
            <div className="flex items-center gap-2"><div className="size-9 rounded-full bg-cream-200" /><div className="space-y-1"><Bar w="56px" className="bg-ink-300" /><Bar w="40px" /></div></div>
            <Field labelW="36px" h="h-6" />
            <div className="grid grid-cols-2 gap-2"><Field labelW="30px" h="h-6" /><Field labelW="30px" h="h-6" /></div>
            <Field labelW="44px" h="h-9" />
          </div>
          <div className="border-t border-ink-100 px-3 py-2 flex justify-end gap-2"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Tabs + media helpers. */
function TabBar({ count = 4, active = 1 }: { count?: number; active?: number }) {
  return (
    <div className="flex items-end gap-3 px-3.5 border-b border-ink-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-2 relative"><Bar w="36px" className={i === active ? "bg-ink-300" : "bg-ink-200"} />{i === active && <div className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-rose-400" />}</div>
      ))}
    </div>
  );
}
function DetailCard({ h = "h-16" }: { h?: string }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
      <Bar w="44px" className="bg-ink-300 h-2" /><Bar /><Bar w="88%" /><div className={cn("rounded-lg bg-cream-100 border border-ink-100 mt-1", h)} />
    </div>
  );
}
function ThumbStrip({ active = 1 }: { active?: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn("h-7 w-9 rounded-md bg-gradient-to-br from-cream-200 to-cream-100", i === active ? "ring-2 ring-rose-300" : "border border-ink-100")} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 28 — Tabbed detail page
   V1 top tabs · V2 side tabs · V3 segmented pills
   ════════════════════════════════════════════════════════════════════════ */

function TabsTopV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-2.5 pb-0 flex items-center gap-2"><div className="size-8 rounded-lg bg-rose-100 shrink-0" /><div className="space-y-1"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="50px" /></div></div>
        <TabBar count={4} active={1} />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5"><DetailCard /><div className="grid grid-cols-2 gap-2.5"><DetailCard h="h-8" /><DetailCard h="h-8" /></div></div>
      </div>
    </Frame>
  );
}

function TabsSideV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[92px] shrink-0 space-y-1">
            {[0, 1, 2, 3, 4].map((i) => (<div key={i} className={cn("flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg", i === 1 ? "bg-rose-50 border border-rose-100" : "")}>{i === 1 && <div className="w-0.5 h-3 rounded bg-rose-400" />}<Bar w={i % 2 ? "50%" : "66%"} className={i === 1 ? "bg-rose-400" : "bg-ink-200"} /></div>))}
          </div>
          <div className="flex-1 border-l border-ink-100 pl-3 space-y-2.5"><DetailCard /><DetailCard h="h-8" /></div>
        </div>
      </div>
    </Frame>
  );
}

function TabsSegmentedV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="inline-flex items-center p-0.5 rounded-lg bg-cream-200 gap-0.5">{[0, 1, 2].map((i) => <div key={i} className={cn("h-5 w-12 rounded-md", i === 0 ? "bg-white shadow-sm" : "")} />)}</div>
        </div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-2 gap-2.5"><DetailCard h="h-10" /><DetailCard h="h-10" /><DetailCard h="h-10" /><DetailCard h="h-10" /></div></div>
      </div>
    </Frame>
  );
}

function TabsHeroV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-14 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200 relative shrink-0">
          <div className="absolute left-3 bottom-2 flex items-center gap-2">
            <div className="size-9 rounded-xl bg-white border border-ink-100 shadow-sm" />
            <div className="space-y-1"><div className="h-2.5 w-24 rounded bg-white/70" /><div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-8 rounded bg-white/50" />)}</div></div>
          </div>
        </div>
        <div className="flex items-end gap-3 px-3.5 border-b border-ink-100 bg-white/60">
          {["Overview", "Posts", "About", "Activity"].map((t, i) => (<div key={t} className="py-2 relative"><Bar w="34px" className={i === 0 ? "bg-ink-300" : "bg-ink-200"} />{i === 0 && <div className="absolute -bottom-px inset-x-0 h-0.5 rounded-full bg-rose-400" />}</div>))}
        </div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5"><DetailCard h="h-8" /><div className="grid grid-cols-2 gap-2.5"><DetailCard h="h-8" /><DetailCard h="h-8" /></div></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 29 — Media / gallery detail
   V1 lightbox · V2 split media + info · V3 album header + grid
   ════════════════════════════════════════════════════════════════════════ */

function LightboxV1() {
  return (
    <Frame>
      <div className="flex-1 relative bg-ink-500/90 flex flex-col items-center justify-center gap-2.5 p-3">
        <div className="absolute top-2 right-2 size-5 rounded-full bg-white/20" />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 size-6 rounded-full bg-white/20" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded-full bg-white/20" />
        <div className="w-[62%] h-[150px] rounded-lg bg-gradient-to-br from-cream-200 via-cream-100 to-rose-100" />
        <div className="bg-white/10 rounded-lg px-2 py-1.5"><ThumbStrip active={2} /></div>
      </div>
    </Frame>
  );
}

function MediaSplitV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex">
        <div className="flex-1 bg-ink-100/60 flex items-center justify-center p-3"><div className="w-full h-full rounded-lg bg-gradient-to-br from-cream-200 via-rose-100 to-cream-100" /></div>
        <div className="w-[160px] shrink-0 border-l border-ink-100 bg-white p-3 flex flex-col gap-2">
          <div className="h-2.5 w-28 rounded bg-ink-300" /><Bar w="80px" />
          <div className="flex items-center gap-2 mt-0.5"><div className="size-6 rounded-full bg-cream-200" /><Bar w="50px" /></div>
          <div className="h-px bg-ink-100 my-0.5" />
          <div className="space-y-1.5"><Bar /><Bar w="88%" /><Bar w="70%" /></div>
          <div className="flex gap-1.5 mt-auto"><div className="h-7 flex-1 rounded-md bg-rose-400" /><div className="h-7 w-9 rounded-md bg-cream-200 border border-ink-200" /></div>
        </div>
      </div>
    </Frame>
  );
}

function AlbumV3() {
  const heights = ["h-16", "h-12", "h-14", "h-12", "h-16", "h-12"];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-16 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200 relative shrink-0">
          <div className="absolute left-3 -bottom-4 flex items-end gap-2"><div className="size-12 rounded-xl bg-white border border-ink-100 shadow-sm" /><div className="space-y-1 pb-1"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="50px" /></div></div>
        </div>
        <div className="flex-1 overflow-hidden px-3.5 pt-6 pb-3"><div className="grid grid-cols-3 gap-2">{heights.map((h, i) => <div key={i} className={cn("rounded-lg bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100", h)} />)}</div></div>
      </div>
    </Frame>
  );
}

function MediaReelV4() {
  return (
    <Frame>
      <div className="flex-1 bg-ink-500/90 flex items-center justify-center relative p-2">
        <div className="relative h-full w-[112px] rounded-lg bg-gradient-to-b from-rose-200 via-cream-200 to-sky-100 overflow-hidden">
          <div className="absolute inset-x-1.5 top-1.5 flex gap-1">{[0, 1, 2].map((i) => <div key={i} className="flex-1 h-0.5 rounded-full bg-white/50 overflow-hidden">{i === 0 && <div className="h-full w-2/3 bg-white" />}</div>)}</div>
          <div className="absolute left-1.5 bottom-1.5 right-6 space-y-1"><div className="flex items-center gap-1"><div className="size-4 rounded-full bg-white/70" /><Bar w="36px" className="bg-white/70" /></div><Bar w="80%" className="bg-white/50" /></div>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5">
          {[0, 1, 2, 3].map((i) => (<div key={i} className="flex flex-col items-center gap-0.5"><div className={cn("size-7 rounded-full inline-flex items-center justify-center", i === 0 ? "bg-rose-400" : "bg-white/20")}><div className="size-3 rounded bg-white/70" /></div><Bar w="12px" className="h-1 bg-white/50" /></div>))}
        </div>
      </div>
    </Frame>
  );
}

/* Bento + community helpers. */
function BentoTile({ span = "", tone = "white", children }: { span?: string; tone?: string; children?: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-ink-100 p-2 overflow-hidden", span, tone === "rose" ? "bg-rose-50" : tone === "cream" ? "bg-cream-100" : "bg-white")}>{children}</div>
  );
}
function LeaderRow({ rank = 1, w = "70%", hot = false }: { rank?: number; w?: string; hot?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg", hot ? "bg-rose-50/70 border border-rose-100" : "")}>
      <div className={cn("size-4 rounded-full shrink-0 inline-flex items-center justify-center text-[8px] font-bold", rank <= 3 ? "bg-rose-300 text-white" : "bg-cream-200 text-ink-500")}>{rank}</div>
      <div className="size-6 rounded-full bg-cream-200 shrink-0" />
      <Bar w="44px" className="bg-ink-300" />
      <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden ml-1"><div className="h-full rounded-full bg-rose-300" style={{ width: w }} /></div>
      <Bar w="20px" className="bg-emerald-300 shrink-0" />
    </div>
  );
}
function ChallengeCard() {
  return (
    <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between"><div className="size-7 rounded-lg bg-rose-100" /><div className="h-3.5 px-1.5 rounded-full bg-amber-100 inline-flex items-center"><Bar w="20px" className="bg-amber-400 h-1" /></div></div>
      <Bar w="70%" className="bg-ink-300" /><Bar w="50%" />
      <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden mt-0.5"><div className="h-full w-2/3 rounded-full bg-rose-300" /></div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 30 — Bento / customizable home
   V1 mixed-size bento · V2 widget board + add · V3 greeting + focus
   ════════════════════════════════════════════════════════════════════════ */

function BentoV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="grid grid-cols-4 grid-rows-2 gap-2.5 h-full">
            <BentoTile span="col-span-2 row-span-2" tone="rose"><div className="space-y-1.5"><Bar w="40px" className="bg-rose-300 h-2" /><div className="h-4 w-16 rounded bg-ink-300" /><div className="flex items-end gap-1 h-16 mt-1">{[10, 16, 12, 20, 14, 18].map((h, i) => <div key={i} className="flex-1 rounded-t bg-rose-300/70" style={{ height: `${h * 3}px` }} />)}</div></div></BentoTile>
            <BentoTile><div className="space-y-1"><Bar w="50%" /><div className="h-3 w-10 rounded bg-ink-300" /></div></BentoTile>
            <BentoTile tone="cream"><div className="space-y-1"><Bar w="50%" /><div className="h-3 w-10 rounded bg-ink-300" /></div></BentoTile>
            <BentoTile span="col-span-2"><div className="flex items-center gap-2"><Ring size={28} /><div className="flex-1 space-y-1"><Bar w="60%" /><Bar w="40%" /></div></div></BentoTile>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function WidgetBoardV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <BentoTile><div className="space-y-1.5"><Bar w="50%" className="bg-ink-200" /><Ring size={30} /></div></BentoTile>
            <BentoTile><div className="space-y-1.5"><Bar w="50%" className="bg-ink-200" /><ChartCard bars={[8, 14, 10, 16]} h={32} /></div></BentoTile>
            <BentoTile><div className="space-y-1"><Bar w="50%" className="bg-ink-200" />{[0, 1, 2].map((i) => <div key={i} className="flex justify-between"><Bar w="50%" /><Bar w="20%" /></div>)}</div></BentoTile>
            <BentoTile><div className="space-y-1.5"><Bar w="50%" className="bg-ink-200" /><div className="h-8 rounded bg-cream-100" /></div></BentoTile>
            <div className="rounded-xl border-2 border-dashed border-ink-200 flex items-center justify-center"><div className="size-6 rounded-full bg-cream-200 inline-flex items-center justify-center"><div className="size-2.5 rounded bg-ink-300" /></div></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function GreetingHomeV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="bg-gradient-to-r from-rose-100 to-cream-100 px-3.5 py-3 border-b border-ink-100">
          <div className="h-3 w-40 rounded bg-ink-300" /><Bar w="100px" className="mt-1.5" />
        </div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-rose-200 ring-1 ring-rose-100 p-2.5 flex items-center gap-2.5"><div className="size-9 rounded-lg bg-rose-100 shrink-0" /><div className="flex-1 space-y-1"><Bar w="40px" className="bg-rose-300 h-2" /><Bar w="70%" /></div><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta /></div>
        </div>
      </div>
    </Frame>
  );
}

function BentoGoalsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-3 grid-rows-2 gap-2.5 h-full">
          <div className="row-span-2 rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col items-center justify-center gap-2"><Ring size={44} /><Bar w="60%" className="bg-ink-300" /><Bar w="40%" /><div className="w-full border-t border-ink-100 pt-1.5 flex justify-around"><Ring size={20} /><Ring size={20} /></div></div>
          <div className="col-span-2 rounded-xl bg-rose-50 border border-rose-100 p-2.5 flex items-center gap-2.5"><div className="size-8 rounded-lg bg-rose-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="40px" className="bg-rose-300 h-2" /><Bar w="70%" /></div><div className="h-7 w-14 rounded-md bg-rose-400" /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2 space-y-1"><Bar w="50%" className="bg-ink-200" /><div className="grid grid-cols-7 gap-0.5">{Array.from({ length: 14 }).map((_, i) => <div key={i} className={cn("aspect-square rounded-[1px]", heatTone((i * 3) % 5))} />)}</div></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2 space-y-1.5"><Bar w="50%" className="bg-ink-200" />{[0, 1].map((i) => <div key={i} className="space-y-0.5"><Bar w="60%" /><div className="h-1.5 rounded-full bg-cream-200 overflow-hidden"><div className={cn("h-full rounded-full", i ? "bg-emerald-300 w-1/3" : "bg-rose-300 w-3/4")} /></div></div>)}</div>
        </div></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 31 — Community / leaderboard
   V1 leaderboard table · V2 feed + leaderboard rail · V3 challenges
   ════════════════════════════════════════════════════════════════════════ */

function LeaderboardV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">{["Wk", "Mo", "All"].map((t, i) => <div key={t} className={cn("h-4 w-7 rounded", i === 0 ? "bg-white" : "")} />)}</div></div>
        <div className="flex-1 overflow-hidden p-2.5"><div className="mx-auto max-w-[88%] space-y-0.5"><LeaderRow rank={1} w="92%" hot /><LeaderRow rank={2} w="80%" /><LeaderRow rank={3} w="72%" /><LeaderRow rank={4} w="58%" /><LeaderRow rank={5} w="46%" /></div></div>
      </div>
    </Frame>
  );
}

function CommunityFeedV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 flex flex-col p-3 gap-2 overflow-hidden">
          <div className="rounded-xl bg-white border border-ink-100 p-2 flex items-center gap-2"><div className="size-7 rounded-full bg-cream-200" /><div className="flex-1 h-6 rounded-full bg-cream-100" /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200" /><div className="space-y-1"><Bar w="46px" className="bg-ink-300" /><Bar w="30px" className="h-1" /></div></div><Bar /><Bar w="84%" /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200" /><Bar w="46px" className="bg-ink-300" /></div><div className="h-12 rounded-lg bg-cream-100" /></div>
        </div>
        <div className="w-[120px] shrink-0 border-l border-ink-100 bg-cream-50 p-2.5 space-y-1.5">
          <Bar w="50px" className="bg-ink-300 h-2" />
          <div className="flex items-end justify-center gap-1 pb-1"><div className="flex flex-col items-center gap-0.5"><div className="size-5 rounded-full bg-cream-200" /><div className="w-5 h-6 rounded-t bg-cream-200" /></div><div className="flex flex-col items-center gap-0.5"><div className="size-6 rounded-full bg-rose-200" /><div className="w-6 h-9 rounded-t bg-rose-300" /></div><div className="flex flex-col items-center gap-0.5"><div className="size-5 rounded-full bg-cream-200" /><div className="w-5 h-5 rounded-t bg-cream-200" /></div></div>
          <div className="space-y-0.5">{[4, 5, 6].map((r) => <div key={r} className="flex items-center gap-1.5"><Bar w="10px" className="h-1" /><div className="size-4 rounded-full bg-cream-200" /><Bar w="50%" /></div>)}</div>
        </div>
      </div>
    </Frame>
  );
}

function ChallengesV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-3 gap-2.5"><ChallengeCard /><ChallengeCard /><ChallengeCard /><ChallengeCard /><ChallengeCard /><ChallengeCard /></div></div>
      </div>
    </Frame>
  );
}

function CommunitySpacesV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-ink-100 overflow-hidden">
              <div className={cn("h-9 bg-gradient-to-r", i % 2 ? "from-sky-100 to-cream-200" : "from-rose-200 to-cream-200")} />
              <div className="p-2 flex items-center gap-2 -mt-4"><div className="size-7 rounded-lg bg-white border border-ink-100 shadow-sm shrink-0" /><div className="flex-1 space-y-1 mt-3"><Bar w="50%" className="bg-ink-300" /><Bar w="36%" /></div><div className={cn("h-6 w-12 rounded-md mt-3", i === 0 ? "bg-cream-200 border border-ink-200" : "bg-rose-400")} /></div>
            </div>
          ))}
        </div></div>
      </div>
    </Frame>
  );
}

/* Inbox + tracker helpers. */
function InboxRow({ unread = false, hot = false }: { unread?: boolean; hot?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-2.5 py-2 border-b border-ink-100 last:border-0", hot ? "bg-rose-50/60" : unread && "bg-white")}>
      <div className="size-3 rounded-sm border border-ink-200 shrink-0" />
      <div className={cn("size-1.5 rounded-full shrink-0", unread ? "bg-rose-400" : "bg-transparent")} />
      <div className="w-[52px] shrink-0"><Bar w="80%" className={unread ? "bg-ink-300" : "bg-ink-200"} /></div>
      <div className="flex-1 min-w-0 space-y-1"><Bar w="40%" className={unread ? "bg-ink-300" : "bg-ink-200"} /><Bar w="70%" /></div>
      <Bar w="16px" className="h-1 shrink-0" />
    </div>
  );
}
function TrackStep({ state = "done", last = false }: { state?: string; last?: boolean }) {
  return (
    <div className="flex-1 flex items-center">
      <div className="flex flex-col items-center gap-1">
        <div className={cn("size-5 rounded-full inline-flex items-center justify-center shrink-0", state === "done" ? "bg-emerald-300" : state === "active" ? "bg-rose-400 ring-2 ring-rose-100" : "bg-cream-200 border border-ink-200")}>{state === "done" && <div className="size-2 rounded-full bg-white" />}</div>
        <Bar w="28px" className={state === "pending" ? "bg-ink-200" : "bg-ink-300"} />
      </div>
      {!last && <div className={cn("flex-1 h-0.5 rounded-full mx-1 -mt-[5px]", state === "done" ? "bg-emerald-300" : "bg-cream-200")} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 32 — Inbox / triage
   V1 list + reading pane · V2 bulk toolbar · V3 priority split
   ════════════════════════════════════════════════════════════════════════ */

function InboxReadV1() {
  return (
    <Frame>
      <IconRail />
      <div className="w-[176px] shrink-0 border-r border-ink-100 flex flex-col">
        <div className="px-2.5 py-2 border-b border-ink-100 flex items-center justify-between"><Bar w="40px" className="bg-ink-300" /><Bar w="20px" className="bg-rose-300" /></div>
        <div className="flex-1 overflow-hidden"><InboxRow unread hot /><InboxRow unread /><InboxRow /><InboxRow /><InboxRow /></div>
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2 border-b border-ink-100 space-y-1.5"><div className="h-2.5 w-32 rounded bg-ink-300" /><div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200" /><Bar w="50px" /><div className="flex-1" /><Bar w="24px" className="h-1" /></div></div>
        <div className="flex-1 overflow-hidden p-3 space-y-1.5"><Bar /><Bar w="94%" /><Bar w="88%" /><Bar w="70%" /><div className="h-12 rounded-lg bg-white border border-ink-100 mt-1" /></div>
        <div className="border-t border-ink-100 px-3 py-2 flex gap-2"><div className="h-7 w-16 rounded-md bg-rose-400" /><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /></div>
      </div>
    </Frame>
  );
}

function InboxBulkV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="size-3.5 rounded-sm bg-rose-300" /><Bar w="40px" className="bg-ink-300" /><div className="flex-1" />
          {[0, 1, 2].map((i) => <div key={i} className="size-5 rounded-md bg-cream-200" />)}
        </div>
        <div className="flex-1 overflow-hidden"><InboxRow hot unread /><InboxRow unread /><InboxRow unread /><InboxRow /><InboxRow /><InboxRow /></div>
      </div>
    </Frame>
  );
}

function InboxPriorityV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-2.5 space-y-2">
          <div><div className="flex items-center gap-1.5 mb-1 px-1"><div className="size-2 rounded-full bg-rose-400" /><Bar w="40px" className="bg-ink-300" /></div><div className="rounded-xl bg-white border border-ink-100 overflow-hidden"><InboxRow unread hot /><InboxRow unread /></div></div>
          <div><div className="flex items-center gap-1.5 mb-1 px-1"><div className="size-2 rounded-full bg-ink-200" /><Bar w="36px" className="bg-ink-200" /></div><div className="rounded-xl bg-white border border-ink-100 overflow-hidden"><InboxRow /><InboxRow /><InboxRow /></div></div>
        </div>
      </div>
    </Frame>
  );
}

function InboxFoldersV4() {
  return (
    <Frame>
      <IconRail />
      <div className="w-[82px] shrink-0 border-r border-ink-100 bg-cream-100/40 p-1.5 space-y-1">
        <Bar w="36px" className="bg-ink-300 ml-1 mb-0.5" />
        {[["Inbox", true, "12"], ["Sent", false, ""], ["Drafts", false, "3"], ["Archive", false, ""]].map(([l, on, n], i) => (
          <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", on && "bg-rose-50")}><div className={cn("size-2.5 rounded-sm shrink-0", on ? "bg-rose-400" : "bg-ink-200")} /><Bar w="60%" className={on ? "bg-rose-300" : "bg-ink-200"} />{n && <div className="ml-auto h-2 w-3 rounded-full bg-rose-100" />}</div>
        ))}
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-2.5 py-1.5 border-b border-ink-100 flex items-center gap-1.5"><div className="size-3 rounded-sm bg-cream-200" /><Bar w="40px" className="bg-ink-300" /><div className="flex-1" /><div className="size-4 rounded bg-cream-200" /></div>
        <div className="flex-1 overflow-hidden"><InboxRow unread hot /><InboxRow unread /><InboxRow unread /><InboxRow /><InboxRow /><InboxRow /></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 33 — Order / progress tracker
   V1 horizontal tracker · V2 vertical timeline · V3 status card + history
   ════════════════════════════════════════════════════════════════════════ */

function TrackerHorizontalV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-3">
          <div className="rounded-xl bg-white border border-ink-100 p-3"><div className="flex items-start"><TrackStep state="done" /><TrackStep state="done" /><TrackStep state="active" /><TrackStep state="pending" last /></div></div>
          <div className="grid grid-cols-2 gap-2.5"><DetailCard h="h-8" /><DetailCard h="h-8" /></div>
        </div>
      </div>
    </Frame>
  );
}

function TrackerVerticalV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="max-w-[80%]"><TimelineRow tone="emerald" /><TimelineRow tone="emerald" /><TimelineRow tone="rose" /><TimelineRow tone="ink" last /></div></div>
      </div>
    </Frame>
  );
}

function TrackerStatusV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-3 flex flex-col items-center justify-center gap-2">
          <Ring size={52} /><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="80px" />
          <div className="h-3.5 px-2 rounded-full bg-emerald-100 inline-flex items-center mt-0.5"><Bar w="30px" className="bg-emerald-400 h-1" /></div>
        </div>
        <div className="w-[150px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
          <Bar w="44px" className="bg-ink-300 h-2" />
          {[0, 1, 2, 3].map((i) => (<div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><div className={cn("size-2 rounded-full shrink-0", i === 0 ? "bg-rose-400" : "bg-ink-200")} /><div className="flex-1 space-y-1"><Bar w="70%" /><Bar w="40%" className="h-1" /></div></div>))}
        </div>
      </div>
    </Frame>
  );
}

function TrackerMapV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 relative bg-gradient-to-br from-emerald-50 via-cream-100 to-sky-50 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#0001 1px,transparent 1px),linear-gradient(90deg,#0001 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute left-[24%] top-[30%] size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          <div className="absolute left-[50%] top-[52%] size-3.5 rounded-full bg-rose-400 ring-2 ring-white shadow" />
          <div className="absolute left-[72%] top-[70%] size-3 rounded-full bg-cream-300 ring-2 ring-white" />
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M24 30 L50 52 L72 70" stroke="#fb718599" strokeWidth="1.2" fill="none" strokeDasharray="3 2" /></svg>
        </div>
        <div className="w-[122px] shrink-0 border-l border-ink-100 bg-cream-50 p-2.5 space-y-2">
          <Bar w="44px" className="bg-ink-300 h-2" />
          {[{ s: "done" }, { s: "active" }, { s: "pending" }].map((r, i) => (
            <div key={i} className="flex gap-2"><div className="flex flex-col items-center"><div className={cn("size-3 rounded-full shrink-0", r.s === "done" ? "bg-emerald-300" : r.s === "active" ? "bg-rose-400 ring-2 ring-rose-100" : "bg-cream-200 border border-ink-200")} />{i < 2 && <div className="w-px flex-1 bg-ink-100 my-0.5" />}</div><div className="flex-1 space-y-1 pb-1"><Bar w="70%" className={r.s === "pending" ? "bg-ink-200" : "bg-ink-300"} /><Bar w="44%" className="h-1" /></div></div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Reviews + booking helpers. */
function Stars({ n = 5, filled = 5, size = "size-2.5" }: { n?: number; filled?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: n }).map((_, i) => (<div key={i} className={cn(size, "rounded-[2px] rotate-45", i < filled ? "bg-amber-300" : "bg-cream-200")} />))}
    </div>
  );
}
function ReviewCard() {
  return (
    <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
      <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200" /><div className="space-y-1"><Bar w="44px" className="bg-ink-300" /><Stars filled={4} /></div></div>
      <Bar /><Bar w="88%" /><Bar w="64%" />
    </div>
  );
}
function DistRow({ w = "70%" }: { w?: string }) {
  return (
    <div className="flex items-center gap-1.5"><Bar w="8px" className="h-1.5" /><div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden"><div className="h-full rounded-full bg-amber-300" style={{ width: w }} /></div></div>
  );
}
function MiniCal({ active = 14 }: { active?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-0.5"><Bar w="40px" className="bg-ink-300" /><div className="flex gap-1"><div className="size-3 rounded bg-cream-200 inline-flex items-center justify-center"><div className="size-0 border-y-[2px] border-y-transparent border-r-[3px] border-r-ink-400" /></div><div className="size-3 rounded bg-cream-200 inline-flex items-center justify-center"><div className="size-0 border-y-[2px] border-y-transparent border-l-[3px] border-l-ink-400" /></div></div></div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 28 }).map((_, i) => (<div key={i} className={cn("aspect-square rounded-[3px] inline-flex items-center justify-center", i + 1 === active ? "bg-rose-400" : (i * 5 + 2) % 4 === 0 ? "bg-cream-100" : "bg-white border border-ink-100")} />))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 34 — Reviews & ratings
   V1 summary + distribution + list · V2 review cards · V3 breakdown + filters
   ════════════════════════════════════════════════════════════════════════ */

function ReviewsSummaryV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[120px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col items-center gap-1.5">
            <div className="h-6 w-12 rounded bg-ink-300" /><Stars filled={4} size="size-3" /><Bar w="50px" />
            <div className="w-full space-y-1 mt-1"><DistRow w="86%" /><DistRow w="60%" /><DistRow w="40%" /><DistRow w="22%" /><DistRow w="12%" /></div>
          </div>
          <div className="flex-1 space-y-2"><ReviewCard /><ReviewCard /></div>
        </div>
      </div>
    </Frame>
  );
}

function ReviewsCardsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-3 gap-2.5"><ReviewCard /><ReviewCard /><ReviewCard /><ReviewCard /><ReviewCard /><ReviewCard /></div></div>
      </div>
    </Frame>
  );
}

function ReviewsBreakdownV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-1.5">
          {[5, 4, 3, 2, 1].map((s, i) => (<div key={s} className={cn("h-5 px-2 rounded-full inline-flex items-center gap-1", i === 0 ? "bg-rose-100" : "bg-cream-200")}><Bar w="8px" className="h-1" /><div className={cn("size-1.5 rounded-[1px] rotate-45", i === 0 ? "bg-rose-400" : "bg-amber-300")} /></div>))}
          <div className="flex-1" /><Bar w="36px" />
        </div>
        <div className="flex-1 overflow-hidden p-2.5 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (<div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 flex gap-2.5"><div className="space-y-1 shrink-0"><div className="size-7 rounded-full bg-cream-200" /><Stars filled={5 - (i % 2)} /></div><div className="flex-1 space-y-1"><div className="flex items-center justify-between"><Bar w="40px" className="bg-ink-300" /><Bar w="20px" className="h-1" /></div><Bar /><Bar w="80%" /></div></div>))}
        </div>
      </div>
    </Frame>
  );
}

function ReviewsTrendV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-[110px_1fr] gap-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col items-center justify-center gap-1"><div className="h-5 w-10 rounded bg-ink-300" /><Stars filled={4} size="size-2.5" /><Bar w="50px" /></div>
            <ChartCard bars={[12, 14, 11, 16, 15, 18, 17]} h={42} />
          </div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="44px" className="bg-ink-300 h-2" />{[0, 1].map((i) => <div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><div className="flex items-center gap-1.5"><Bar w="40px" className="bg-ink-300" /><Stars filled={5 - i} /></div><Bar w="80%" /></div></div>)}</div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 35 — Booking / scheduling
   V1 slot picker · V2 service list + calendar · V3 confirmation summary
   ════════════════════════════════════════════════════════════════════════ */

function BookingSlotV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5"><MiniCal active={16} /></div>
        <div className="w-[120px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
          <Bar w="50px" className="bg-ink-300 h-2" />
          {[0, 1, 2, 3, 4].map((i) => (<div key={i} className={cn("h-7 rounded-md flex items-center px-2 border", i === 1 ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}><Bar w="40px" className={i === 1 ? "bg-rose-400" : "bg-ink-200"} /></div>))}
        </div>
      </div>
    </Frame>
  );
}

function BookingServiceV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="w-[150px] shrink-0 space-y-1.5">
          <Bar w="44px" className="bg-ink-300 h-2" />
          {[0, 1, 2].map((i) => (<div key={i} className={cn("rounded-lg border p-2 flex items-center gap-2", i === 0 ? "border-rose-200 bg-rose-50/50" : "border-ink-100 bg-white")}><div className="size-7 rounded-lg bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="60%" className="bg-ink-300" /><Bar w="40%" /></div><Bar w="20px" /></div>))}
        </div>
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5"><MiniCal active={9} /></div>
      </div>
    </Frame>
  );
}

function BookingConfirmV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center px-4">
        <div className="w-[68%] rounded-xl bg-white border border-ink-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-rose-200 to-cream-200 px-3 py-2.5 flex items-center gap-2"><div className="size-8 rounded-full bg-white/70 inline-flex items-center justify-center"><div className="size-3.5 rounded-full bg-rose-300" /></div><div className="space-y-1"><div className="h-2.5 w-24 rounded bg-white/70" /><div className="h-1.5 w-16 rounded bg-white/50" /></div></div>
          <div className="p-3 space-y-1.5">
            {[0, 1, 2].map((i) => (<div key={i} className="flex items-center justify-between py-1 border-b border-ink-100 last:border-0"><Bar w="36px" className="bg-ink-200" /><Bar w="50px" className="bg-ink-300" /></div>))}
            <div className="flex gap-2 pt-1.5"><div className="h-7 flex-1 rounded-md bg-rose-400" /><div className="h-7 w-16 rounded-md bg-cream-200 border border-ink-200" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function BookingWeekV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2"><div className="flex items-center gap-1"><div className="size-4 rounded bg-cream-200" /><div className="size-4 rounded bg-cream-200" /></div><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-2.5 flex gap-1.5">
          <div className="w-6 shrink-0 flex flex-col gap-1 pt-5">{[0, 1, 2, 3].map((i) => <Bar key={i} w="16px" className="bg-ink-100 h-1 flex-1" />)}</div>
          {[0, 1, 2, 3, 4].map((d) => (
            <div key={d} className="flex-1 flex flex-col gap-1">
              <Bar w="60%" className="bg-ink-200 mx-auto" />
              {[0, 1, 2, 3].map((s) => {
                const v = (d * 3 + s) % 4;
                return <div key={s} className={cn("flex-1 rounded-md border", v === 0 ? "border-rose-200 bg-rose-50" : v === 1 ? "border-ink-100 bg-cream-100" : "border-ink-100 bg-white")} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Creator-page + survey helpers. */
function LinkButton() {
  return <div className="h-8 rounded-lg bg-white border border-ink-100 shadow-sm flex items-center gap-2 px-2.5"><div className="size-4 rounded bg-rose-100 shrink-0" /><Bar w="50%" /><div className="size-2.5 rounded bg-ink-200 ml-auto" /></div>;
}
function StatPill() {
  return <div className="flex-1 flex flex-col items-center gap-0.5"><div className="h-3 w-8 rounded bg-ink-300" /><Bar w="60%" /></div>;
}
function OptionRow({ selected = false }: { selected?: boolean }) {
  return (
    <div className={cn("h-8 rounded-lg border flex items-center gap-2 px-2.5", selected ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}>
      <div className={cn("size-3 rounded-full border shrink-0", selected ? "border-rose-400 bg-rose-400" : "border-ink-300")} />
      <Bar w="60%" className={selected ? "bg-rose-400" : "bg-ink-200"} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 36 — Public creator page
   V1 link-in-bio · V2 media kit · V3 portfolio grid
   ════════════════════════════════════════════════════════════════════════ */

function LinkInBioV1() {
  return (
    <Frame>
      <div className="flex-1 bg-gradient-to-b from-rose-100 via-cream-100 to-cream-50 flex flex-col items-center overflow-hidden py-3.5">
        <div className="size-14 rounded-full bg-white border border-ink-100 shadow-sm" />
        <div className="h-2.5 w-24 rounded bg-ink-300 mt-1.5" /><Bar w="120px" className="mt-1" />
        <div className="flex gap-1.5 mt-1.5">{[0, 1, 2, 3].map((i) => <div key={i} className="size-6 rounded-full bg-white border border-ink-100" />)}</div>
        <div className="w-[64%] space-y-1.5 mt-2.5"><LinkButton /><LinkButton /><LinkButton /><LinkButton /></div>
      </div>
    </Frame>
  );
}

function MediaKitV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <div className="h-14 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200 relative shrink-0"><div className="absolute left-3 -bottom-5 size-12 rounded-full bg-white border-2 border-cream-50 shadow-sm" /></div>
        <div className="pt-6 px-3.5 space-y-2">
          <div className="space-y-1"><div className="h-2.5 w-28 rounded bg-ink-300" /><Bar w="90px" /></div>
          <div className="flex gap-2 rounded-xl bg-white border border-ink-100 p-2.5"><StatPill /><div className="w-px bg-ink-100" /><StatPill /><div className="w-px bg-ink-100" /><StatPill /></div>
          <div className="grid grid-cols-[1fr_110px] gap-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5"><ChartCard bars={[10, 16, 12, 18, 14, 20]} h={40} /></div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-200" /><div className="grid grid-cols-3 gap-1.5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 rounded bg-cream-200" />)}</div></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function PortfolioGridV3() {
  const heights = ["h-16", "h-12", "h-14", "h-14", "h-16", "h-12"];
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <div className="flex flex-col items-center pt-3 pb-1.5"><div className="size-12 rounded-full bg-cream-200 border border-ink-100" /><div className="h-2.5 w-24 rounded bg-ink-300 mt-1.5" /><Bar w="80px" className="mt-1" /></div>
        <div className="flex items-center justify-center gap-3 border-b border-ink-100 px-3.5"><div className="py-1.5 relative"><Bar w="30px" className="bg-ink-300" /><div className="absolute -bottom-px inset-x-0 h-0.5 bg-rose-400 rounded-full" /></div><div className="py-1.5"><Bar w="30px" className="bg-ink-200" /></div><div className="py-1.5"><Bar w="30px" className="bg-ink-200" /></div></div>
        <div className="flex-1 overflow-hidden p-2.5"><div className="grid grid-cols-3 gap-2">{heights.map((h, i) => <div key={i} className={cn("rounded-lg bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100", h)} />)}</div></div>
      </div>
    </Frame>
  );
}

function CreatorStorefrontV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <div className="px-3.5 pt-3 pb-1.5 flex items-center gap-2">
          <div className="size-9 rounded-full bg-cream-200 border border-ink-100 shrink-0" />
          <div className="flex-1 space-y-1"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="70px" /></div>
          <div className="h-7 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="flex items-center gap-3 px-3.5 border-b border-ink-100">
          {["Shop", "About", "Links"].map((t, i) => (<div key={t} className="py-1.5 relative"><Bar w="28px" className={i === 0 ? "bg-ink-300" : "bg-ink-200"} />{i === 0 && <div className="absolute -bottom-px inset-x-0 h-0.5 rounded-full bg-rose-400" />}</div>))}
        </div>
        <div className="flex-1 overflow-hidden p-3"><div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden"><div className="h-12 bg-gradient-to-br from-cream-200 to-cream-100" /><div className="p-1.5 space-y-1"><Bar w="74%" className="bg-ink-300" /><div className="flex items-center justify-between"><Bar w="30%" className="bg-rose-300" /><div className="size-3.5 rounded bg-rose-100" /></div></div></div>
          ))}
        </div></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 37 — Survey / quiz flow
   V1 single question · V2 multi-question card · V3 results / score
   ════════════════════════════════════════════════════════════════════════ */

function SurveySingleV1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center px-4">
        <div className="w-[70%]">
          <div className="h-1 w-full rounded-full bg-cream-200 overflow-hidden mb-3"><div className="h-full w-2/5 bg-rose-400" /></div>
          <Bar w="34px" className="bg-rose-300 h-1.5 mb-1.5" />
          <div className="h-3 w-[80%] rounded bg-ink-300" /><div className="h-3 w-[55%] rounded bg-ink-300 mt-1 mb-2.5" />
          <div className="space-y-1.5"><OptionRow selected /><OptionRow /><OptionRow /><OptionRow /></div>
          <div className="flex justify-between mt-3"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function SurveyCardV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-100/50 flex items-center justify-center px-4">
        <div className="w-[78%] rounded-xl bg-white border border-ink-100 shadow-sm p-3 space-y-2.5">
          <div className="flex items-center justify-between"><Bar w="80px" className="bg-ink-300" /><Bar w="24px" /></div>
          <div className="h-px bg-ink-100" />
          <div className="space-y-1.5"><Bar w="70%" className="bg-ink-300" /><div className="flex gap-1.5">{[0, 1, 2, 3, 4].map((i) => <div key={i} className={cn("flex-1 h-7 rounded-md border", i === 3 ? "border-rose-300 bg-rose-50" : "border-ink-100")} />)}</div></div>
          <div className="space-y-1.5"><Bar w="60%" className="bg-ink-300" /><div className="grid grid-cols-2 gap-1.5"><OptionRow selected /><OptionRow /></div></div>
          <div className="flex justify-end"><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function SurveyResultV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2 px-4">
        <Ring size={56} />
        <div className="h-2.5 w-28 rounded bg-ink-300 mt-1" /><Bar w="150px" /><Bar w="110px" />
        <div className="w-[64%] space-y-1.5 mt-1.5">
          <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-center justify-between"><Bar w="40%" className="bg-ink-200" /><div className="h-2 w-12 rounded bg-emerald-300" /></div>
          <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-center justify-between"><Bar w="36%" className="bg-ink-200" /><div className="h-2 w-10 rounded bg-amber-300" /></div>
        </div>
        <div className="h-7 w-28 rounded-md bg-rose-400 mt-1.5" />
      </div>
    </Frame>
  );
}

function SurveyNpsV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center px-4">
        <div className="w-[82%] space-y-2.5">
          <div className="space-y-1.5"><Bar w="34px" className="bg-rose-300 h-1.5" /><div className="h-2.5 w-[70%] rounded bg-ink-300" /></div>
          <div className="flex gap-1">{Array.from({ length: 11 }).map((_, i) => (<div key={i} className={cn("flex-1 aspect-square rounded-md border flex items-center justify-center", i === 8 ? "border-rose-300 bg-rose-50" : "border-ink-200 bg-white")}><div className={cn("h-1 w-1.5 rounded", i === 8 ? "bg-rose-400" : "bg-ink-200")} /></div>))}</div>
          <div className="flex justify-between"><Bar w="40px" className="h-1" /><Bar w="40px" className="h-1" /></div>
          <div className="h-12 rounded-lg bg-white border border-ink-100 mt-1" />
          <div className="flex justify-end"><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Import + comparison helpers. */
function MapRow({ ok = true }: { ok?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_18px_1fr] items-center gap-2 px-2.5 py-1.5 border-b border-ink-100 last:border-0">
      <div className="h-6 rounded-md bg-cream-100 border border-ink-100 flex items-center px-2"><Bar w="50%" /></div>
      <div className={cn("size-3 rounded-full mx-auto", ok ? "bg-emerald-300" : "bg-cream-200")} />
      <div className="h-6 rounded-md bg-white border border-ink-100 flex items-center justify-between px-2"><Bar w="44%" className="bg-ink-300" /><div className="size-2 rounded bg-ink-200" /></div>
    </div>
  );
}
function CompareCell({ kind = "check", hot = false }: { kind?: string; hot?: boolean }) {
  return (
    <div className={cn("px-2.5 py-1.5 flex justify-center", hot && "bg-rose-50/40")}>
      {kind === "check" ? <div className={cn("size-2.5 rounded-full", hot ? "bg-rose-300" : "bg-emerald-300")} /> : kind === "dash" ? <div className="h-0.5 w-2.5 rounded bg-ink-200" /> : <Bar w="22px" className={hot ? "bg-rose-400" : "bg-ink-300"} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 38 — Data import / upload
   V1 dropzone · V2 column mapping · V3 progress / results
   ════════════════════════════════════════════════════════════════════════ */

function ImportDropV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl border-2 border-dashed border-ink-200 bg-white/60 flex flex-col items-center justify-center gap-1.5 py-5">
            <div className="size-10 rounded-2xl bg-rose-100 inline-flex items-center justify-center"><div className="size-4 rounded bg-rose-300" /></div>
            <Bar w="140px" /><Bar w="90px" /><div className="h-7 w-24 rounded-md bg-rose-400 mt-1" />
          </div>
          <div className="space-y-1"><Bar w="50px" className="bg-ink-200" /><div className="flex items-center gap-2 rounded-lg bg-white border border-ink-100 p-1.5"><div className="size-5 rounded bg-cream-200" /><Bar w="40%" /><Bar w="20px" className="ml-auto bg-emerald-300" /></div></div>
        </div>
      </div>
    </Frame>
  );
}

function ImportMapV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_18px_1fr] gap-2 px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="40px" className="bg-ink-200" /><div /><Bar w="44px" className="bg-ink-200" /></div>
            <MapRow /><MapRow /><MapRow ok={false} /><MapRow /><MapRow />
          </div>
          <div className="flex justify-end mt-2.5"><div className="h-7 w-24 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function ImportProgressV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><div className="flex items-center justify-between"><Bar w="60px" className="bg-ink-300" /><Bar w="30px" /></div><div className="h-2.5 rounded-full bg-cream-200 overflow-hidden"><div className="h-full w-3/4 rounded-full bg-rose-300" /></div></div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 space-y-1"><div className="h-3 w-8 rounded bg-emerald-400" /><Bar w="60%" /></div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 space-y-1"><div className="h-3 w-8 rounded bg-amber-400" /><Bar w="60%" /></div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1"><div className="h-3 w-8 rounded bg-ink-300" /><Bar w="60%" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ImportSourceV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <Bar w="120px" className="mb-2.5" />
          <div className="grid grid-cols-3 gap-2.5 w-[82%]">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("rounded-xl border p-2.5 flex flex-col items-center gap-1.5", i === 0 ? "border-rose-300 bg-rose-50 ring-1 ring-rose-100" : "border-ink-100 bg-white")}>
                <div className={cn("size-9 rounded-xl", i === 0 ? "bg-rose-200" : "bg-cream-200")} /><Bar w="60%" className="bg-ink-300" /><Bar w="80%" />
              </div>
            ))}
          </div>
          <Bar w="90px" className="mt-2.5" />
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 39 — Comparison page
   V1 grouped plan comparison · V2 product vs product · V3 spec highlight
   ════════════════════════════════════════════════════════════════════════ */

function CompareGroupedV1() {
  const cols = ["A", "B", "C"];
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col px-3.5 py-3 overflow-hidden">
        <div className="rounded-xl border border-ink-100 bg-white overflow-hidden">
          <div className="grid grid-cols-4 bg-cream-100 border-b border-ink-100">
            <div className="px-2.5 py-2"><Bar w="40px" className="bg-ink-200" /></div>
            {cols.map((c, i) => <div key={c} className={cn("px-2.5 py-2 flex justify-center", i === 1 && "bg-rose-50/60")}><Bar w="24px" className={i === 1 ? "bg-rose-400" : "bg-ink-300"} /></div>)}
          </div>
          <div className="px-2.5 py-1 bg-cream-50 border-b border-ink-100"><Bar w="36px" className="bg-ink-300 h-1.5" /></div>
          {[0, 1].map((r) => (<div key={r} className="grid grid-cols-4 border-b border-ink-100 items-center"><div className="px-2.5 py-1.5"><Bar w="70%" /></div><CompareCell kind="check" /><CompareCell kind="check" hot /><CompareCell kind="check" /></div>))}
          <div className="px-2.5 py-1 bg-cream-50 border-b border-ink-100"><Bar w="44px" className="bg-ink-300 h-1.5" /></div>
          {[0, 1].map((r) => (<div key={r} className="grid grid-cols-4 border-b border-ink-100 last:border-0 items-center"><div className="px-2.5 py-1.5"><Bar w="64%" /></div><CompareCell kind={r ? "dash" : "check"} /><CompareCell kind="check" hot /><CompareCell kind="check" /></div>))}
        </div>
      </div>
    </Frame>
  );
}

function CompareVsV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-stretch gap-0 p-3.5 relative">
        {[0, 1].map((side) => (
          <div key={side} className={cn("flex-1 rounded-xl border p-2.5 space-y-2", side === 0 ? "border-rose-200 bg-white ring-1 ring-rose-100" : "border-ink-100 bg-white", side === 0 ? "mr-4" : "ml-4")}>
            <div className="flex items-center gap-2"><div className={cn("size-8 rounded-lg", side === 0 ? "bg-rose-100" : "bg-cream-200")} /><div className="space-y-1"><Bar w="44px" className="bg-ink-300" /><Bar w="30px" /></div></div>
            <div className="space-y-1.5">{[0, 1, 2, 3].map((i) => <div key={i} className="flex items-center justify-between"><Bar w="50%" /><div className={cn("size-2.5 rounded-full", (side + i) % 2 ? "bg-emerald-300" : "bg-cream-200")} /></div>)}</div>
            <div className={cn("h-7 rounded-md mt-1", side === 0 ? "bg-rose-400" : "bg-cream-200 border border-ink-200")} />
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-7 rounded-full bg-ink-300 text-white inline-flex items-center justify-center"><div className="size-2 rounded-full bg-white" /></div>
      </div>
    </Frame>
  );
}

function CompareSpecV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col px-3.5 py-3 overflow-hidden">
        <div className="rounded-xl border border-ink-100 bg-white overflow-hidden">
          <div className="grid grid-cols-3 bg-cream-100 border-b border-ink-100">
            <div className="px-2.5 py-2"><Bar w="44px" className="bg-ink-200" /></div>
            <div className="px-2.5 py-2 flex justify-center bg-rose-50/60"><div className="h-3.5 px-2 rounded-full bg-rose-100 inline-flex items-center"><Bar w="22px" className="bg-rose-400 h-1" /></div></div>
            <div className="px-2.5 py-2 flex justify-center"><Bar w="24px" className="bg-ink-300" /></div>
          </div>
          {[0, 1, 2, 3, 4].map((r) => (<div key={r} className="grid grid-cols-3 border-b border-ink-100 last:border-0 items-center"><div className="px-2.5 py-1.5"><Bar w={r % 2 ? "60%" : "76%"} /></div><CompareCell kind="text" hot /><CompareCell kind={r === 2 ? "dash" : "text"} /></div>))}
        </div>
      </div>
    </Frame>
  );
}

function ComparisonCardsV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col px-3.5 py-3">
        <div className="h-2.5 w-24 rounded bg-ink-300 mb-2.5 mx-auto" />
        <div className="flex-1 flex gap-2.5 items-stretch">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("flex-1 rounded-xl border p-2.5 flex flex-col gap-2 relative", i === 1 ? "border-rose-300 bg-white ring-1 ring-rose-100" : "border-ink-100 bg-white")}>
              {i === 1 && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 px-2 rounded-full bg-rose-400 inline-flex items-center"><Bar w="22px" className="bg-white/70 h-1" /></div>}
              <div className={cn("size-8 rounded-lg mx-auto", i === 1 ? "bg-rose-200" : "bg-cream-200")} />
              <Bar w="50%" className="bg-ink-300 mx-auto" /><div className="h-4 w-12 rounded bg-ink-300 mx-auto" />
              <div className="space-y-1.5 border-t border-ink-100 pt-1.5">{[0, 1, 2].map((r) => <div key={r} className="flex items-center justify-between"><Bar w="50%" /><div className={cn("size-2.5 rounded-full", r <= i ? (i === 1 ? "bg-rose-300" : "bg-emerald-300") : "bg-cream-200")} /></div>)}</div>
              <div className={cn("h-7 rounded-md mt-auto", i === 1 ? "bg-rose-400" : "bg-cream-200 border border-ink-200")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Gantt + heatmap helpers. */
function GanttRow({ off = "10%", w = "40%", tone = "rose" }: { off?: string; w?: string; tone?: string }) {
  return (
    <div className="grid grid-cols-[64px_1fr] items-center gap-2 py-1.5 border-b border-ink-100 last:border-0">
      <Bar w="80%" className="bg-ink-300" />
      <div className="relative h-3"><div className={cn("absolute h-3 rounded-full", tone === "rose" ? "bg-rose-300" : tone === "emerald" ? "bg-emerald-300" : "bg-sky-300")} style={{ left: off, width: w }} /></div>
    </div>
  );
}
function heatTone(lvl: number) {
  return lvl === 0 ? "bg-cream-200" : lvl === 1 ? "bg-rose-100" : lvl === 2 ? "bg-rose-200" : lvl === 3 ? "bg-rose-300" : "bg-rose-400";
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 40 — Timeline / Gantt
   V1 horizontal gantt · V2 resource rows · V3 milestone timeline
   ════════════════════════════════════════════════════════════════════════ */

function GanttV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 relative">
            <div className="grid grid-cols-[64px_1fr] gap-2 pb-1 border-b border-ink-100 mb-1"><div /><div className="flex justify-between">{["W1", "W2", "W3", "W4", "W5"].map((w) => <Bar key={w} w="14px" className="bg-ink-200 h-1" />)}</div></div>
            <GanttRow off="2%" w="46%" tone="rose" /><GanttRow off="20%" w="40%" tone="sky" /><GanttRow off="38%" w="50%" tone="emerald" /><GanttRow off="55%" w="38%" tone="rose" />
            <div className="absolute top-6 bottom-2.5 pointer-events-none" style={{ left: "calc(0.625rem + 64px + 0.5rem)", right: "0.625rem" }}>
              <div className="absolute inset-y-0 left-[44%] w-px bg-rose-400/70" />
              <div className="absolute left-[44%] -translate-x-1/2 -top-0.5 size-1.5 rounded-full bg-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function GanttResourceV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-[80px_1fr] items-center gap-2 px-2.5 py-1.5 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-1.5"><div className="size-5 rounded-full bg-cream-200 shrink-0" /><Bar w="60%" /></div>
                <div className="relative h-3 flex gap-1"><div className={cn("h-3 rounded-full", i % 2 ? "bg-sky-300" : "bg-rose-300")} style={{ width: `${30 + i * 8}%`, marginLeft: `${i * 6}%` }} /><div className="h-3 rounded-full bg-emerald-200" style={{ width: "18%" }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function MilestoneV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 flex items-center overflow-hidden p-3.5">
          <div className="relative w-full"><div className="h-0.5 w-full bg-ink-200 rounded-full" />
            <div className="flex justify-between -mt-[7px]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: "20%" }}>
                  <div className={cn("size-3.5 rotate-45 rounded-[2px]", i < 2 ? "bg-emerald-300" : i === 2 ? "bg-rose-400" : "bg-cream-200 border border-ink-200")} />
                  <Bar w="60%" className={i <= 2 ? "bg-ink-300" : "bg-ink-200"} /><Bar w="40%" className="h-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function GanttRoadmapV4() {
  const rows = [
    { off: "2%", w: "44%", tone: "bg-rose-300" }, { off: "26%", w: "50%", tone: "bg-sky-300" },
    { off: "50%", w: "46%", tone: "bg-emerald-300" }, { off: "10%", w: "30%", tone: "bg-amber-300" },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden px-3.5 pb-3">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5">
            <div className="grid grid-cols-[60px_1fr] gap-2 pb-1.5 border-b border-ink-100 mb-1.5"><div /><div className="grid grid-cols-4 gap-1">{["Q1", "Q2", "Q3", "Q4"].map((q) => <Bar key={q} w="16px" className="bg-ink-200 mx-auto" />)}</div></div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr] gap-2 items-center py-1.5 border-b border-ink-100 last:border-0"><Bar w="80%" className="bg-ink-300" /><div className="relative h-4"><div className={cn("absolute h-4 rounded-md", r.tone)} style={{ left: r.off, width: r.w }} /></div></div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 41 — Activity heatmap / streaks
   V1 contribution heatmap · V2 calendar heatmap · V3 streak rings
   ════════════════════════════════════════════════════════════════════════ */

function HeatmapV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
            <Bar w="50px" className="bg-ink-300 h-2" />
            <div className="grid grid-flow-col grid-rows-7 gap-[3px] auto-cols-max">
              {Array.from({ length: 7 * 20 }).map((_, i) => <div key={i} className={cn("size-2 rounded-[2px]", heatTone((i * 7 + 3) % 5))} />)}
            </div>
            <div className="flex items-center gap-1 justify-end"><Bar w="20px" className="h-1" />{[0, 1, 2, 3, 4].map((l) => <div key={l} className={cn("size-2 rounded-[2px]", heatTone(l))} />)}<Bar w="22px" className="h-1" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function CalendarHeatmapV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">{[0, 1].map((i) => <div key={i} className={cn("h-4 w-7 rounded", i === 0 ? "bg-white" : "")} />)}</div></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((m) => (
              <div key={m} className="rounded-xl bg-white border border-ink-100 p-2 space-y-1.5">
                <Bar w="36px" className="bg-ink-200" />
                <div className="grid grid-cols-7 gap-[3px]">{Array.from({ length: 28 }).map((_, i) => <div key={i} className={cn("aspect-square rounded-[2px]", heatTone((i * 3 + m * 2) % 5))} />)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function StreakRingsV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-3 flex flex-col items-center justify-center gap-2">
          <Ring size={56} /><div className="h-2.5 w-20 rounded bg-ink-300" /><Bar w="90px" />
          <div className="flex gap-1.5 mt-1">{[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="flex flex-col items-center gap-1"><Ring size={16} /><Bar w="6px" className="h-1" /></div>)}</div>
        </div>
        <div className="w-[140px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
          <Bar w="44px" className="bg-ink-300 h-2" />
          {[0, 1, 2, 3].map((i) => (<div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><div className={cn("size-3 rounded-[2px]", heatTone(4 - i))} /><Bar w="50%" /><Bar w="18px" className="ml-auto bg-ink-200" /></div>))}
        </div>
      </div>
    </Frame>
  );
}

function HeatmapBestTimeV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-28 rounded bg-ink-300" /><Bar w="50px" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5">
            <div className="flex gap-1">
              <div className="w-6 shrink-0 flex flex-col gap-[3px] pt-3">{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <Bar key={i} w="12px" className="bg-ink-200 h-2 flex-1" />)}</div>
              <div className="flex-1 space-y-[3px]">
                <div className="flex justify-between px-0.5">{[0, 1, 2, 3].map((i) => <Bar key={i} w="16px" className="bg-ink-100 h-1" />)}</div>
                {Array.from({ length: 7 }).map((_, r) => (
                  <div key={r} className="grid grid-cols-12 gap-[3px]">{Array.from({ length: 12 }).map((_, c) => <div key={c} className={cn("aspect-square rounded-[2px]", heatTone((r * 5 + c * 3) % 5))} />)}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 justify-end mt-1.5"><Bar w="20px" className="h-1" />{[0, 1, 2, 3, 4].map((l) => <div key={l} className={cn("size-2 rounded-[2px]", heatTone(l))} />)}<Bar w="22px" className="h-1" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Wizard + preferences helpers. */
function Switch({ on = false }: { on?: boolean }) {
  return (
    <div className={cn("h-3.5 w-6 rounded-full p-0.5 flex shrink-0", on ? "bg-rose-400 justify-end" : "bg-cream-200 justify-start")}>
      <div className="size-2.5 rounded-full bg-white shadow-sm" />
    </div>
  );
}
function WizardSteps({ active = 1, count = 4 }: { active?: number; count?: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center" style={{ flex: i < count - 1 ? 1 : "0 0 auto" }}>
          <div className={cn("size-5 rounded-full inline-flex items-center justify-center text-[8px] font-bold shrink-0", i < active ? "bg-emerald-300 text-white" : i === active ? "bg-rose-400 text-white ring-2 ring-rose-100" : "bg-cream-200 text-ink-400 border border-ink-200")}>
            {i < active ? <span className="block w-[3px] h-[6px] border-b-[1.5px] border-r-[1.5px] border-white rotate-45 -mt-px" /> : <span>{i + 1}</span>}
          </div>
          {i < count - 1 && <div className={cn("flex-1 h-0.5 rounded-full mx-1", i < active ? "bg-emerald-300" : "bg-cream-200")} />}
        </div>
      ))}
    </div>
  );
}
function PrefRow({ on = true }: { on?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-ink-100 last:border-0">
      <div className="flex-1 min-w-0 space-y-1"><Bar w="50%" className="bg-ink-300" /><Bar w="74%" /></div>
      <Switch on={on} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 42 — Wizard full-page
   V1 horizontal numbered · V2 vertical steps + footer · V3 choice step
   ════════════════════════════════════════════════════════════════════════ */

function WizardHorizontalV1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center overflow-hidden">
        <div className="w-[78%] pt-3"><WizardSteps active={1} count={4} /></div>
        <div className="flex-1 w-[78%] flex items-center">
          <div className="w-full rounded-xl bg-white border border-ink-100 shadow-sm p-3 space-y-2">
            <Bar w="40px" className="bg-rose-300 h-2" /><div className="h-2.5 w-28 rounded bg-ink-300" />
            <Field labelW="36px" h="h-6" /><div className="grid grid-cols-2 gap-2"><Field labelW="30px" h="h-6" /><Field labelW="30px" h="h-6" /></div>
            <div className="flex justify-between pt-0.5"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function WizardVerticalV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col">
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[110px] shrink-0 border-r border-ink-100 pr-3 space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn("size-5 rounded-full inline-flex items-center justify-center text-[8px] font-bold shrink-0", i < 1 ? "bg-emerald-300 text-white" : i === 1 ? "bg-rose-400 text-white ring-2 ring-rose-100" : "bg-cream-200 text-ink-400 border border-ink-200")}>{i < 1 ? <span className="block w-[3px] h-[5px] border-b-[1.5px] border-r-[1.5px] border-white rotate-45 -mt-px" /> : <span>{i + 1}</span>}</div>
                <div className="space-y-1"><Bar w="50px" className={i <= 1 ? "bg-ink-300" : "bg-ink-200"} /><Bar w="34px" className="h-1" /></div>
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2.5"><div className="h-2.5 w-28 rounded bg-ink-300" /><Field labelW="40px" h="h-7" /><Field labelW="52px" h="h-7" /><Field labelW="36px" h="h-9" /></div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
      </div>
    </Frame>
  );
}

function WizardChoiceV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center overflow-hidden">
        <div className="w-[78%] pt-3"><WizardSteps active={2} count={4} /></div>
        <div className="flex-1 w-[82%] flex flex-col justify-center gap-2">
          <div className="h-2.5 w-32 rounded bg-ink-300 mx-auto" />
          <div className="flex gap-2.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("flex-1 rounded-xl border p-2.5 flex flex-col items-center gap-1.5 relative", i === 1 ? "border-rose-300 bg-rose-50 ring-1 ring-rose-100" : "border-ink-100 bg-white")}>
                {i === 1 && <div className="absolute top-1.5 right-1.5 size-3 rounded-full bg-rose-400" />}
                <div className={cn("size-8 rounded-lg", i === 1 ? "bg-rose-200" : "bg-cream-200")} /><Bar w="60%" className="bg-ink-300" /><Bar w="80%" />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function WizardSummaryV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-2.5"><WizardSteps active={2} count={4} /></div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2"><div className="h-2.5 w-24 rounded bg-ink-300" /><Field labelW="36px" h="h-7" /><div className="grid grid-cols-2 gap-2"><Field labelW="30px" h="h-7" /><Field labelW="30px" h="h-7" /></div></div>
          <div className="w-[128px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
            <Bar w="44px" className="bg-ink-300 h-2" />
            {[true, true, false, false].map((done, i) => (<div key={i} className="flex items-center gap-1.5"><div className={cn("size-3 rounded-full shrink-0", done ? "bg-emerald-300" : "bg-cream-200 border border-ink-200")} /><Bar w={i % 2 ? "60%" : "74%"} className={done ? "bg-ink-200" : "bg-ink-100"} /></div>))}
            <div className="border-t border-ink-100 pt-1.5 flex justify-between"><Bar w="40px" className="bg-ink-300" /><Bar w="24px" className="bg-rose-300" /></div>
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 43 — Notification preferences
   V1 channel matrix · V2 grouped toggles · V3 per-category cards
   ════════════════════════════════════════════════════════════════════════ */

function PrefsMatrixV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_40px_40px_40px] bg-cream-100 border-b border-ink-100">
              <div className="px-2.5 py-2"><Bar w="50px" className="bg-ink-200" /></div>
              {["Em", "Pu", "SM"].map((c) => <div key={c} className="px-2 py-2 flex justify-center"><Bar w="18px" className="bg-ink-200" /></div>)}
            </div>
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="grid grid-cols-[1fr_40px_40px_40px] border-b border-ink-100 last:border-0 items-center">
                <div className="px-2.5 py-2"><Bar w={r % 2 ? "60%" : "74%"} className="bg-ink-300" /></div>
                {[0, 1, 2].map((c) => <div key={c} className="px-2 py-2 flex justify-center"><Switch on={(r + c) % 3 !== 0} /></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function PrefsGroupedV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5"><Bar w="44px" className="bg-rose-300 h-2 mb-1" /><PrefRow on /><PrefRow on={false} /><PrefRow on /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5"><Bar w="50px" className="bg-rose-300 h-2 mb-1" /><PrefRow on={false} /><PrefRow on /></div>
        </div>
      </div>
    </Frame>
  );
}

function PrefsCardsV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 flex items-start gap-2">
              <div className={cn("size-8 rounded-lg shrink-0", i % 2 ? "bg-cream-200" : "bg-rose-100")} />
              <div className="flex-1 space-y-1"><Bar w="60%" className="bg-ink-300" /><Bar w="90%" /></div>
              <Switch on={i % 2 === 0} />
            </div>
          ))}
        </div></div>
      </div>
    </Frame>
  );
}

function PrefsDigestV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
            <Bar w="44px" className="bg-rose-300 h-2" />
            {[true, false, false].map((on, i) => (<div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><div className={cn("size-3 rounded-full border shrink-0", on ? "border-rose-400 bg-rose-400" : "border-ink-300")} /><div className="flex-1 space-y-1"><Bar w={i % 2 ? "30%" : "40%"} className="bg-ink-300" /></div></div>))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-200" /><div className="grid grid-cols-2 gap-1.5"><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="50%" /></div><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="50%" /></div></div></div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="44px" className="bg-ink-200" /><div className="flex gap-1.5">{[true, true, false].map((on, i) => <div key={i} className={cn("h-5 px-2 rounded-full inline-flex items-center", on ? "bg-rose-100" : "bg-cream-200")}><Bar w="20px" className={on ? "bg-rose-400 h-1" : "bg-ink-300 h-1"} /></div>)}</div></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Calculator + channels helpers. */
function Slider({ pct = "50%" }: { pct?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between"><Bar w="44px" className="bg-ink-200" /><Bar w="20px" className="bg-ink-300" /></div>
      <div className="relative h-1.5 rounded-full bg-cream-200"><div className="absolute inset-y-0 left-0 rounded-full bg-rose-300" style={{ width: pct }} /><div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 rounded-full bg-white border-2 border-rose-400 shadow-sm" style={{ left: pct }} /></div>
    </div>
  );
}
function AddonRow({ on = false }: { on?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-ink-100 last:border-0">
      <Switch on={on} />
      <div className="flex-1 min-w-0 space-y-1"><Bar w="50%" className="bg-ink-300" /><Bar w="70%" /></div>
      <Bar w="22px" className={on ? "bg-rose-300" : "bg-ink-200"} />
    </div>
  );
}
function ChannelCard({ connected = false }: { connected?: boolean }) {
  return (
    <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col items-center gap-1.5">
      <div className={cn("size-9 rounded-xl", connected ? "bg-rose-200" : "bg-cream-200")} />
      <Bar w="50%" className="bg-ink-300" /><Bar w="64%" />
      {connected ? <div className="h-5 w-full rounded-md bg-emerald-50 border border-emerald-100 inline-flex items-center justify-center"><Bar w="40px" className="bg-emerald-400 h-1" /></div> : <div className="h-5 w-full rounded-md bg-rose-400" />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 44 — Usage / pricing calculator
   V1 sliders + live total · V2 add-on toggles · V3 seats stepper
   ════════════════════════════════════════════════════════════════════════ */

function CalcSlidersV1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center px-3.5 gap-3">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-3 space-y-3"><Bar w="50px" className="bg-ink-300 h-2" /><Slider pct="62%" /><Slider pct="38%" /><Slider pct="80%" /></div>
        <div className="w-[120px] shrink-0 rounded-xl bg-gradient-to-br from-rose-300 to-rose-200 p-3 flex flex-col items-center justify-center gap-1.5">
          <div className="h-1.5 w-12 rounded bg-white/60" /><div className="h-6 w-16 rounded bg-white/80" /><div className="h-1.5 w-10 rounded bg-white/50" /><div className="h-7 w-full rounded-md bg-white mt-1" />
        </div>
      </div>
    </Frame>
  );
}

function CalcAddonsV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5"><Bar w="50px" className="bg-ink-300 h-2 mb-1" /><AddonRow on /><AddonRow /><AddonRow on /><AddonRow /></div>
        <div className="w-[126px] shrink-0"><SummaryCard /></div>
      </div>
    </Frame>
  );
}

function CalcSeatsV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center px-4 gap-2.5">
        <div className="w-[70%] rounded-xl bg-white border border-ink-100 p-3 space-y-2.5">
          <Bar w="40px" className="bg-ink-300 h-2" />
          <div className="flex items-center justify-between"><Bar w="50px" /><div className="inline-flex items-center gap-2"><div className="size-6 rounded-md bg-cream-200 border border-ink-200" /><div className="h-5 w-8 rounded bg-ink-300" /><div className="size-6 rounded-md bg-rose-400" /></div></div>
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className={cn("rounded-lg border p-1.5 text-center space-y-1", i === 1 ? "border-rose-300 bg-rose-50" : "border-ink-100")}><Bar w="50%" className="mx-auto bg-ink-300" /><div className="h-3 w-8 rounded bg-ink-300 mx-auto" /></div>)}</div>
          <div className="border-t border-ink-100 pt-2 flex justify-between"><div className="h-2.5 w-14 rounded bg-ink-300" /><div className="h-2.5 w-14 rounded bg-rose-300" /></div>
        </div>
      </div>
    </Frame>
  );
}

function CalcRoiV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center px-3.5 gap-3">
        <div className="flex-1 rounded-xl bg-white border border-ink-100 p-3 space-y-2.5">
          <Bar w="50px" className="bg-ink-300 h-2" />
          <Slider pct="56%" /><Slider pct="34%" />
          <div className="space-y-1"><Bar w="40px" className="bg-ink-200" /><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="40%" className="bg-ink-200" /></div></div>
        </div>
        <div className="w-[124px] shrink-0 rounded-xl bg-gradient-to-br from-emerald-100 to-cream-100 border border-emerald-200 p-3 flex flex-col items-center justify-center gap-1.5">
          <Bar w="40px" className="bg-emerald-400 h-1" /><div className="h-6 w-16 rounded bg-ink-300" /><Bar w="50px" />
          <div className="w-full space-y-1 mt-1">{[0, 1].map((i) => <div key={i} className="h-1.5 rounded-full bg-white/70 overflow-hidden"><div className={cn("h-full bg-emerald-400 rounded-full", i ? "w-1/2" : "w-3/4")} /></div>)}</div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 45 — Connected accounts / channels
   V1 channel cards · V2 list + sync status · V3 channel detail
   ════════════════════════════════════════════════════════════════════════ */

function ChannelsGridV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-4 gap-2.5"><ChannelCard connected /><ChannelCard connected /><ChannelCard /><ChannelCard /></div></div>
      </div>
    </Frame>
  );
}

function ChannelsListV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 flex items-center gap-2.5">
              <div className={cn("size-8 rounded-lg shrink-0", i < 2 ? "bg-rose-200" : "bg-cream-200")} />
              <div className="flex-1 space-y-1"><Bar w="40%" className="bg-ink-300" /><Bar w="56%" /></div>
              {i < 2 ? <div className="h-4 px-2 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="28px" className="bg-emerald-400 h-1" /></div> : <div className="h-4 px-2 rounded-full bg-cream-200 inline-flex items-center"><Bar w="28px" className="bg-ink-300 h-1" /></div>}
              <div className="size-5 rounded-md bg-cream-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ChannelDetailV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-rose-200 shrink-0" />
          <div className="flex-1 space-y-1"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="60px" /></div>
          <div className="h-4 px-2 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="30px" className="bg-emerald-400 h-1" /></div>
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="44px" className="bg-ink-300 h-2" /><PrefRow on /><PrefRow on={false} /><PrefRow on /></div>
          <div className="w-[110px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col gap-2"><div className="flex justify-around"><StatPill /><StatPill /></div><div className="h-px bg-ink-100" /><ChartCard bars={[8, 12, 10, 16]} h={34} /></div>
        </div>
      </div>
    </Frame>
  );
}

function ChannelsComposerV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 flex flex-col gap-2">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200" /><Bar w="50px" className="bg-ink-200" /></div>
            <div className="h-12 rounded-lg bg-cream-50 border border-ink-100" />
            <div className="flex items-center gap-1.5"><div className="size-5 rounded bg-cream-200" /><div className="size-5 rounded bg-cream-200" /><div className="flex-1" /><Bar w="24px" className="h-1" /></div>
          </div>
          <div className="flex items-center gap-1.5">
            {[true, true, false, false].map((on, i) => (<div key={i} className={cn("h-6 px-2 rounded-full inline-flex items-center gap-1 border", on ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}><div className={cn("size-3 rounded", on ? "bg-rose-300" : "bg-cream-200")} /><Bar w="18px" className={on ? "bg-rose-400 h-1" : "bg-ink-200 h-1"} /></div>))}
          </div>
          <div className="flex justify-end"><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
        </div>
        <div className="w-[104px] shrink-0">
          <div className="rounded-xl bg-white border border-ink-100 p-2 space-y-1.5"><Bar w="40px" className="bg-ink-200" /><div className="rounded-lg bg-cream-50 border border-ink-100 p-1.5 space-y-1"><div className="flex items-center gap-1"><div className="size-3 rounded-full bg-cream-200" /><Bar w="40%" className="h-1" /></div><Bar /><Bar w="70%" /><div className="h-8 rounded bg-gradient-to-br from-cream-200 to-cream-100 mt-0.5" /></div></div>
        </div>
      </div>
    </Frame>
  );
}

/* Account + tag helpers. */
function DeviceRow({ current = false }: { current?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-ink-100 last:border-0">
      <div className="size-7 rounded-lg bg-cream-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-1"><div className="flex items-center gap-1.5"><Bar w="50px" className="bg-ink-300" />{current && <div className="h-3 px-1.5 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="20px" className="bg-emerald-400 h-1" /></div>}</div><Bar w="64%" /></div>
      {!current && <Bar w="26px" className="bg-rose-300" />}
    </div>
  );
}
function TagChip({ tone = "rose" }: { tone?: string }) {
  return <div className={cn("h-4 px-2 rounded-full inline-flex items-center gap-1", tone === "rose" ? "bg-rose-100" : tone === "emerald" ? "bg-emerald-100" : tone === "amber" ? "bg-amber-100" : "bg-sky-100")}><div className={cn("size-1.5 rounded-full", tone === "rose" ? "bg-rose-400" : tone === "emerald" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-sky-400")} /><Bar w="22px" className="bg-ink-300 h-1" /></div>;
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 46 — Account & security
   V1 profile + password · V2 sessions / devices · V3 2FA + danger zone
   ════════════════════════════════════════════════════════════════════════ */

function AccountProfileV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2"><Bar w="40px" className="bg-rose-300 h-2" /><div className="flex items-center gap-2.5"><div className="size-10 rounded-full bg-cream-200 shrink-0" /><div className="h-7 w-20 rounded-md bg-cream-200 border border-ink-200" /></div><div className="grid grid-cols-2 gap-2.5"><Field labelW="30px" h="h-6" /><Field labelW="36px" h="h-6" /></div></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2"><Bar w="50px" className="bg-rose-300 h-2" /><Field labelW="52px" h="h-6" /><div className="grid grid-cols-2 gap-2.5"><Field labelW="40px" h="h-6" /><Field labelW="44px" h="h-6" /></div></div>
        </div>
      </div>
    </Frame>
  );
}

function AccountSessionsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="60px" className="bg-rose-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="rounded-xl bg-white border border-ink-100 px-2.5"><DeviceRow current /><DeviceRow /><DeviceRow /><DeviceRow /></div></div>
      </div>
    </Frame>
  );
}

function AccountDangerV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 flex items-center gap-2.5"><div className="size-9 rounded-lg bg-emerald-100 shrink-0" /><div className="flex-1 space-y-1"><Bar w="44px" className="bg-ink-300" /><Bar w="70%" /></div><Switch on /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-200" /><div className="grid grid-cols-4 gap-1.5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 rounded bg-cream-100 border border-ink-100" />)}</div></div>
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-2.5 flex items-center justify-between"><div className="space-y-1"><Bar w="44px" className="bg-red-400 h-2" /><Bar w="80px" /></div><div className="h-7 w-20 rounded-md border border-red-300 bg-white" /></div>
        </div>
      </div>
    </Frame>
  );
}

function AccountLoginsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
            <Bar w="50px" className="bg-rose-300 h-2" />
            {[{ on: true, tone: "rose" }, { on: true, tone: "sky" }, { on: false, tone: "ink" }].map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-ink-100 last:border-0">
                <div className={cn("size-7 rounded-lg shrink-0", r.tone === "rose" ? "bg-rose-100" : r.tone === "sky" ? "bg-sky-100" : "bg-cream-200")} />
                <div className="flex-1 space-y-1"><Bar w="44%" className="bg-ink-300" /><Bar w="60%" /></div>
                {r.on ? <div className="h-3.5 px-1.5 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="18px" className="bg-emerald-400 h-1" /></div> : <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />}
              </div>
            ))}
            <div className="h-7 w-28 rounded-md bg-cream-200 border border-ink-200 mt-0.5" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 47 — Tag / label manager
   V1 chip list + add · V2 tags table · V3 nested categories
   ════════════════════════════════════════════════════════════════════════ */

function TagChipsV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 p-3 space-y-2.5">
            <div className="flex flex-wrap gap-1.5"><TagChip tone="rose" /><TagChip tone="emerald" /><TagChip tone="amber" /><TagChip tone="sky" /><TagChip tone="rose" /><TagChip tone="emerald" /><TagChip tone="sky" /><TagChip tone="amber" /></div>
            <div className="flex items-center gap-2 border-t border-ink-100 pt-2"><div className="size-4 rounded-full bg-rose-200" /><div className="flex-1 h-7 rounded-md bg-cream-100 border border-ink-100" /><div className="h-7 w-12 rounded-md bg-rose-400" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function TagsTableV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-16 rounded bg-ink-300" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_40px_24px] gap-2 px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="30px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><div /></div>
            {["rose", "emerald", "amber", "sky", "rose"].map((t, i) => (
              <div key={i} className="grid grid-cols-[1fr_40px_24px] gap-2 items-center px-2.5 py-1.5 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-2"><div className={cn("size-3 rounded-full", t === "rose" ? "bg-rose-400" : t === "emerald" ? "bg-emerald-400" : t === "amber" ? "bg-amber-400" : "bg-sky-400")} /><Bar w="50%" className="bg-ink-300" /></div>
                <Bar w="20px" /><div className="size-4 rounded bg-cream-200 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function TagTreeV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-0.5">
            {[
              { d: 0, dot: "rose", w: "40%" }, { d: 1, dot: "rose", w: "50%" }, { d: 1, dot: "rose", w: "44%" },
              { d: 0, dot: "emerald", w: "36%" }, { d: 1, dot: "emerald", w: "52%" },
              { d: 0, dot: "sky", w: "42%" },
            ].map((r, i) => (
              <div key={i} className={cn("flex items-center gap-2 py-1.5 rounded-md", r.d === 0 ? "" : "ml-4")} >
                <div className="size-2.5 rounded bg-cream-200 shrink-0" />
                <div className={cn("size-2.5 rounded-full shrink-0", r.dot === "rose" ? "bg-rose-400" : r.dot === "emerald" ? "bg-emerald-400" : "bg-sky-400")} />
                <Bar w={r.w} className={r.d === 0 ? "bg-ink-300" : "bg-ink-200"} />
                <Bar w="16px" className="ml-auto bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function TagDetailV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="h-5 px-2 rounded-full bg-rose-100 inline-flex items-center gap-1"><div className="size-2 rounded-full bg-rose-400" /><Bar w="30px" className="bg-rose-400 h-1" /></div>
          <Bar w="40px" className="bg-ink-200" /><div className="flex-1" /><div className="size-5 rounded-md bg-cream-200" />
        </div>
        <div className="px-3.5 py-1.5 border-b border-ink-100 flex items-center gap-2"><div className="size-3 rounded-sm bg-rose-300" /><Bar w="40px" className="bg-ink-200" /><div className="flex-1" /><Bar w="44px" className="bg-rose-300" /></div>
        <div className="flex-1 overflow-hidden p-1.5">
          {[0, 1, 2, 3, 4].map((i) => (<div key={i} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md", i === 0 && "bg-rose-50/50")}><div className="size-3 rounded-sm border border-ink-200 shrink-0" /><div className="size-5 rounded bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="50%" className="bg-ink-300" /><Bar w="34%" /></div><Bar w="20px" className="h-1" /></div>))}
        </div>
      </div>
    </Frame>
  );
}

/* Changelog + consent helpers. */
function ReleaseEntry({ last = false }: { last?: boolean }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center"><div className="h-4 px-1.5 rounded-full bg-rose-100 inline-flex items-center shrink-0"><Bar w="20px" className="bg-rose-400 h-1" /></div>{!last && <div className="w-px flex-1 bg-ink-100 my-1" />}</div>
      <div className="flex-1 min-w-0 pb-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5"><Bar w="60px" className="bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-emerald-100 inline-flex items-center"><Bar w="16px" className="bg-emerald-400 h-1" /></div></div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1"><Bar /><Bar w="86%" /><Bar w="64%" /></div>
      </div>
    </div>
  );
}
function ConsentRow({ locked = false, on = true }: { locked?: boolean; on?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-ink-100 last:border-0">
      <div className="flex-1 min-w-0 space-y-1"><Bar w="44%" className="bg-ink-300" /><Bar w="80%" /></div>
      {locked ? <div className="h-3.5 px-1.5 rounded-full bg-cream-200 inline-flex items-center"><Bar w="20px" className="bg-ink-300 h-1" /></div> : <Switch on={on} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 48 — Changelog / what's new
   V1 release timeline · V2 versioned cards · V3 announcement
   ════════════════════════════════════════════════════════════════════════ */

function ChangelogTimelineV1() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center overflow-hidden">
        <div className="py-3 text-center"><div className="h-2.5 w-28 rounded bg-ink-300 mx-auto" /><Bar w="120px" className="mt-1.5 mx-auto" /></div>
        <div className="flex-1 w-[72%] overflow-hidden"><ReleaseEntry /><ReleaseEntry /><ReleaseEntry last /></div>
      </div>
    </Frame>
  );
}

function ChangelogCardsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5"><Bar w="50px" className="bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="14px" className="bg-rose-400 h-1" /></div><Bar w="30px" className="ml-auto h-1" /></div>
              <div className="h-14 rounded-lg bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100" />
              <div className="space-y-1"><div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-emerald-300" /><Bar w="70%" /></div><div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-emerald-300" /><Bar w="56%" /></div></div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function AnnouncementV3() {
  return (
    <Frame>
      <div className="flex-1 relative bg-cream-50 overflow-hidden">
        <div className="absolute inset-0 flex opacity-[0.35]"><NavRail /><div className="flex-1 p-3 space-y-2"><div className="h-5 w-32 rounded bg-ink-200" /><div className="h-20 rounded-lg bg-white border border-ink-100" /></div></div>
        <div className="absolute inset-x-0 top-0 bg-rose-300 px-3 py-1.5 flex items-center gap-2"><div className="size-3.5 rounded bg-white/70" /><Bar w="50%" className="bg-white/70" /><div className="size-3 rounded-full bg-white/50 ml-auto" /></div>
        <div className="absolute inset-0 bg-ink-500/25 flex items-center justify-center p-4">
          <div className="w-[60%] rounded-xl bg-white border border-ink-100 shadow-lg overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-rose-200 to-cream-200" />
            <div className="p-3 flex flex-col items-center gap-1.5"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="80%" /><Bar w="60%" /><div className="flex items-center gap-1 mt-1">{[0, 1, 2].map((i) => <div key={i} className={cn("size-1.5 rounded-full", i === 0 ? "bg-rose-400" : "bg-cream-200")} />)}</div><div className="h-7 w-24 rounded-md bg-rose-400 mt-1" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ChangelogRoadmapV4() {
  const cols = [
    { dot: "bg-ink-300", n: 2 }, { dot: "bg-rose-400", n: 2 }, { dot: "bg-emerald-400", n: 3 },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3 flex gap-2.5">
          {cols.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5"><div className={cn("size-2 rounded-full", c.dot)} /><Bar w="40px" className="bg-ink-200" /></div>
              <div className="space-y-1.5">
                {Array.from({ length: c.n }).map((_, k) => (
                  <div key={k} className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1"><Bar w="80%" className="bg-ink-300" /><Bar w="56%" /><div className="flex items-center gap-1 pt-0.5"><div className="h-3 px-1 rounded-full bg-cream-200 inline-flex items-center"><Bar w="10px" className="h-1" /></div></div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 49 — Consent & privacy
   V1 cookie banner · V2 preferences modal · V3 privacy center
   ════════════════════════════════════════════════════════════════════════ */

function CookieBannerV1() {
  return (
    <Frame>
      <div className="flex-1 relative bg-cream-50 overflow-hidden">
        <div className="absolute inset-0 flex opacity-[0.4]"><div className="flex-1 p-3 space-y-2"><div className="h-6 w-40 rounded bg-ink-200" /><div className="h-24 rounded-lg bg-white border border-ink-100" /><div className="grid grid-cols-3 gap-2"><div className="h-10 rounded-lg bg-white border border-ink-100" /><div className="h-10 rounded-lg bg-white border border-ink-100" /><div className="h-10 rounded-lg bg-white border border-ink-100" /></div></div></div>
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white border border-ink-100 shadow-lg p-2.5 flex items-center gap-3">
          <div className="flex-1 space-y-1"><Bar w="40%" className="bg-ink-300" /><Bar w="80%" /></div>
          <div className="flex gap-1.5 shrink-0"><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-14 rounded-md bg-cream-200 border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function ConsentModalV2() {
  return (
    <ModalShell w="66%">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><div className="h-2.5 w-28 rounded bg-ink-300" /><div className="size-4 rounded bg-cream-200" /></div>
        <Bar w="90%" />
        <div className="h-px bg-ink-100" />
        <ConsentRow locked /><ConsentRow on /><ConsentRow on={false} /><ConsentRow on />
        <div className="h-px bg-ink-100" />
        <div className="flex justify-end gap-2"><div className="h-7 w-20 rounded-md bg-white border border-ink-200" /><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
      </div>
    </ModalShell>
  );
}

function PrivacyCenterV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5"><Bar w="50px" className="bg-rose-300 h-2 mb-1" /><ConsentRow locked /><ConsentRow on /><ConsentRow on={false} /></div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 flex items-center gap-2"><div className="size-8 rounded-lg bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="60%" className="bg-ink-300" /><Bar w="80%" /></div></div>
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-2.5 flex items-center gap-2"><div className="size-8 rounded-lg bg-red-100 shrink-0" /><div className="flex-1 space-y-1"><Bar w="50%" className="bg-red-400" /><Bar w="76%" /></div></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ConsentPermissionsV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center px-4">
        <div className="w-[64%] rounded-xl bg-white border border-ink-100 shadow-sm p-3 space-y-2">
          <div className="flex items-center justify-center gap-1.5"><div className="size-7 rounded-lg bg-rose-200" /><div className="size-2 rounded-full bg-ink-200" /><div className="size-7 rounded-lg bg-cream-200" /></div>
          <div className="h-2.5 w-32 rounded bg-ink-300 mx-auto" /><Bar w="120px" className="mx-auto" />
          <div className="space-y-1.5 border-t border-ink-100 pt-2">{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-2"><div className="size-5 rounded-md bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="44%" className="bg-ink-300" /><Bar w="68%" /></div></div>)}</div>
          <div className="flex gap-2 pt-1"><div className="h-7 flex-1 rounded-md bg-white border border-ink-200" /><div className="h-7 flex-1 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

/* Palette + filter helpers. */
function CmdRow({ hot = false, shortcut = false }: { hot?: boolean; shortcut?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md", hot && "bg-rose-50")}>
      <div className={cn("size-4 rounded shrink-0", hot ? "bg-rose-200" : "bg-cream-200")} />
      <Bar w="50%" className={hot ? "bg-rose-400" : "bg-ink-300"} />
      {shortcut && <div className="ml-auto flex gap-0.5"><div className="size-3 rounded bg-cream-200" /><div className="size-3 rounded bg-cream-200" /></div>}
    </div>
  );
}
function FilterCond() {
  return (
    <div className="grid grid-cols-[1fr_60px_1fr_20px] items-center gap-1.5">
      <div className="h-6 rounded-md bg-white border border-ink-100 flex items-center justify-between px-1.5"><Bar w="50%" /><div className="size-2 rounded bg-ink-200" /></div>
      <div className="h-6 rounded-md bg-cream-100 border border-ink-100 flex items-center px-1.5"><Bar w="60%" /></div>
      <div className="h-6 rounded-md bg-white border border-ink-100 flex items-center px-1.5"><Bar w="40%" /></div>
      <div className="size-5 rounded-md bg-cream-200" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 50 — Command palette & overlays
   V1 ⌘K palette · V2 quick-add · V3 global search
   ════════════════════════════════════════════════════════════════════════ */

function CommandPaletteV1() {
  return (
    <ModalShell w="64%">
      <div className="space-y-2">
        <div className="h-7 rounded-md bg-cream-50 border border-ink-100 flex items-center gap-2 px-2"><div className="size-3 rounded-full bg-ink-200" /><Bar w="40%" /></div>
        <div className="space-y-0.5"><Bar w="30px" className="bg-ink-200 ml-1 mb-0.5" /><CmdRow hot shortcut /><CmdRow shortcut /><CmdRow /></div>
        <div className="space-y-0.5"><Bar w="36px" className="bg-ink-200 ml-1 mb-0.5" /><CmdRow /><CmdRow /></div>
      </div>
    </ModalShell>
  );
}

function QuickAddV2() {
  return (
    <ModalShell w="56%">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="size-4 rounded bg-cream-200" /></div>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (<div key={i} className={cn("rounded-lg border p-2 flex flex-col items-center gap-1.5", i === 0 ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}><div className={cn("size-7 rounded-lg", i === 0 ? "bg-rose-200" : "bg-cream-200")} /><Bar w="60%" /></div>))}
        </div>
      </div>
    </ModalShell>
  );
}

function GlobalSearchV3() {
  return (
    <ModalShell w="68%">
      <div className="space-y-2">
        <div className="h-7 rounded-full bg-cream-50 border border-ink-100 flex items-center gap-2 px-2.5"><div className="size-3.5 rounded-full bg-ink-200" /><Bar w="50%" /></div>
        <div className="grid grid-cols-3 gap-2">
          {["People", "Pages", "Files"].map((g) => (
            <div key={g} className="space-y-1"><Bar w="40px" className="bg-ink-200 mb-0.5" />{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-1.5 px-1 py-1 rounded-md hover:bg-cream-50"><div className="size-4 rounded bg-cream-200 shrink-0" /><Bar w="60%" /></div>)}</div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function CommandPreviewV4() {
  return (
    <ModalShell w="74%">
      <div className="space-y-2">
        <div className="h-7 rounded-md bg-cream-50 border border-ink-100 flex items-center gap-2 px-2"><div className="size-3 rounded-full bg-ink-200" /><Bar w="40%" /></div>
        <div className="flex gap-2 min-h-0">
          <div className="flex-1 space-y-0.5"><CmdRow hot /><CmdRow /><CmdRow /><CmdRow /></div>
          <div className="w-[40%] shrink-0 rounded-lg bg-cream-50 border border-ink-100 p-2 space-y-1.5"><div className="h-10 rounded-md bg-gradient-to-br from-rose-100 to-cream-200" /><Bar w="70%" className="bg-ink-300" /><Bar w="90%" /><Bar w="60%" /></div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 51 — Filters & faceted drawer
   V1 filter drawer · V2 top filter bar + chips · V3 advanced builder
   ════════════════════════════════════════════════════════════════════════ */

function FilterDrawerV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 relative bg-cream-50 overflow-hidden flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 opacity-60"><div className="h-2.5 w-20 rounded bg-ink-300" /></div>
        <div className="flex-1 p-3.5 space-y-1.5 opacity-60">{[0, 1, 2, 3].map((i) => <div key={i} className="h-9 rounded-lg bg-white border border-ink-100" />)}</div>
        <div className="absolute inset-0 bg-ink-500/20" />
        <div className="absolute right-0 top-0 bottom-0 w-[140px] bg-white border-l border-ink-100 shadow-lg flex flex-col">
          <div className="px-2.5 py-2 border-b border-ink-100 flex items-center justify-between"><Bar w="40px" className="bg-ink-300" /><div className="size-4 rounded bg-cream-200" /></div>
          <div className="flex-1 p-2.5 space-y-2.5 overflow-hidden"><FacetGroup rows={3} /><div className="h-px bg-ink-100" /><FacetGroup rows={2} /></div>
          <div className="border-t border-ink-100 px-2.5 py-2 flex gap-1.5"><div className="h-7 flex-1 rounded-md bg-white border border-ink-200" /><div className="h-7 flex-1 rounded-md bg-rose-400" /></div>
        </div>
      </div>
    </Frame>
  );
}

function FilterBarV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => <div key={i} className="h-6 rounded-md bg-white border border-ink-100 flex items-center gap-1 px-2"><Bar w="24px" /><div className="size-2 rounded bg-ink-200" /></div>)}
          <div className="flex-1" /><div className="h-6 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="px-3.5 py-1.5 flex items-center gap-1.5 border-b border-ink-100"><Bar w="36px" className="bg-ink-200" />{[0, 1, 2].map((i) => <div key={i} className="h-4 px-2 rounded-full bg-rose-100 inline-flex items-center gap-1"><Bar w="20px" className="bg-rose-400 h-1" /><div className="size-1.5 rounded bg-rose-300" /></div>)}</div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="rounded-xl bg-white border border-ink-100 overflow-hidden"><MemberRow /><MemberRow role="rose" /><MemberRow /></div></div>
      </div>
    </Frame>
  );
}

function FilterBuilderV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-24 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
            <Bar w="50px" className="bg-rose-300 h-2" />
            <FilterCond />
            <div className="flex items-center gap-1.5"><div className="h-4 w-8 rounded bg-rose-100 inline-flex items-center justify-center"><Bar w="12px" className="bg-rose-400 h-1" /></div><div className="flex-1 h-px bg-ink-100" /></div>
            <FilterCond />
            <FilterCond />
            <div className="flex items-center gap-1.5 pt-0.5"><div className="size-5 rounded-md bg-cream-200 inline-flex items-center justify-center"><div className="size-2 rounded bg-ink-300" /></div><Bar w="40px" className="bg-ink-200" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function FilterSavedViewsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[110px] shrink-0 border-r border-ink-100 p-2 space-y-1 bg-white/40">
          <Bar w="40px" className="bg-ink-300 mb-0.5" />
          {[false, true, false, false].map((a, i) => (<div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", a && "bg-rose-50 border border-rose-100")}><div className={cn("size-2.5 rounded-sm shrink-0", a ? "bg-rose-400" : "bg-ink-200")} /><Bar w={a ? "50px" : "44px"} className={a ? "bg-rose-400" : "bg-ink-200"} />{i === 1 && <div className="ml-auto h-2 w-3 rounded-full bg-rose-100" />}</div>))}
          <div className="h-6 rounded-md bg-cream-200 border border-ink-200 border-dashed mt-1 flex items-center justify-center"><div className="size-2 rounded bg-ink-300" /></div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 py-1.5 border-b border-ink-100 flex items-center gap-1.5"><Bar w="44px" className="bg-ink-300" /><div className="flex-1" />{[0, 1].map((i) => <div key={i} className="h-4 px-2 rounded-full bg-rose-100 inline-flex items-center"><Bar w="18px" className="bg-rose-400 h-1" /></div>)}</div>
          <div className="grid grid-cols-[1fr_60px_50px] gap-2 px-2.5 py-1.5 border-b border-ink-100"><Bar w="40px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="30px" className="bg-ink-200" /></div>
          <div className="flex-1 overflow-hidden px-1.5">{[0, 1, 2, 3].map((i) => <div key={i} className="grid grid-cols-[1fr_60px_50px] gap-2 items-center px-1 py-1.5 border-b border-ink-100 last:border-0"><div className="flex items-center gap-1.5"><div className="size-4 rounded-full bg-cream-200 shrink-0" /><Bar w="60%" className="bg-ink-300" /></div><Bar w="30px" /><div className="h-3 px-1.5 rounded-full bg-emerald-100 inline-flex items-center w-fit"><Bar w="16px" className="bg-emerald-400 h-1" /></div></div>)}</div>
        </div>
      </div>
    </Frame>
  );
}

/* Scaffold helper. */
function Block({ h = "h-12" }: { h?: string }) {
  return <div className={cn("rounded-lg bg-white border border-ink-100", h)} />;
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 52 — Page layouts / scaffolds
   V1 standard · V2 two-column + aside · V3 centered narrow · V4 sections
   ════════════════════════════════════════════════════════════════════════ */

function PageStandardV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="px-3.5 pb-3 flex-1 overflow-hidden space-y-2.5"><Block h="h-10" /><Block h="h-14" /><Block h="h-8" /></div>
      </div>
    </Frame>
  );
}

function PageTwoColV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="px-3.5 pb-3 flex-1 flex gap-3 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5"><Block h="h-12" /><Block h="h-16" /></div>
          <div className="w-[120px] shrink-0 space-y-2.5"><Block h="h-10" /><Block h="h-14" /></div>
        </div>
      </div>
    </Frame>
  );
}

function PageCenteredV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="mx-auto max-w-[64%] py-3 space-y-2.5">
          <div className="space-y-1.5"><div className="h-3 w-28 rounded bg-ink-300" /><Bar w="160px" /></div>
          <Block h="h-14" /><Block h="h-10" /><Block h="h-12" />
        </div>
      </div>
    </Frame>
  );
}

function PageSectionsV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="px-3.5 pb-3 flex-1 overflow-hidden space-y-2.5">
          {[0, 1].map((s) => (
            <div key={s} className="space-y-1.5">
              <div className="flex items-center gap-1.5"><div className="size-2 rounded-sm bg-rose-300" /><Bar w="44px" className="bg-ink-300" /></div>
              <div className="grid grid-cols-3 gap-2"><Block h="h-9" /><Block h="h-9" /><Block h="h-9" /></div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Program / course helpers. */
function LessonRow({ state = "todo", pad = true }: { state?: string; pad?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 pr-2 py-1.5 rounded-md", pad ? "pl-6" : "pl-2", state === "active" ? "bg-rose-50/70" : "hover:bg-cream-100")}>
      <div className={cn("size-4 rounded-full inline-flex items-center justify-center shrink-0", state === "done" ? "bg-emerald-300" : state === "active" ? "bg-rose-400 ring-2 ring-rose-100" : "bg-cream-200 border border-ink-200")}>
        {state === "done"
          ? <span className="block w-[2.5px] h-[5px] border-b-[1.5px] border-r-[1.5px] border-white rotate-45 -mt-px" />
          : <span className={cn("block size-0 border-y-[2.5px] border-y-transparent border-l-[3.5px] ml-px", state === "active" ? "border-l-white" : "border-l-ink-400")} />}
      </div>
      <Bar w="56%" className={state === "todo" ? "bg-ink-200" : "bg-ink-300"} />
      <Bar w="20px" className="ml-auto h-1 shrink-0" />
    </div>
  );
}
function ModuleHead({ idx = 1, open = false, done = false }: { idx?: number; open?: boolean; done?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-2.5 py-2", open && "border-b border-ink-100 bg-cream-50/60")}>
      <div className="flex flex-col gap-0.5 shrink-0"><div className="size-0.5 rounded-full bg-ink-300" /><div className="size-0.5 rounded-full bg-ink-300" /></div>
      <div className={cn("size-5 rounded-md inline-flex items-center justify-center text-[8px] font-bold shrink-0", done ? "bg-emerald-100 text-emerald-600" : open ? "bg-rose-100 text-rose-600" : "bg-cream-200 text-ink-500")}>{idx}</div>
      <Bar w="40%" className="bg-ink-300" />
      <div className="ml-auto h-3 px-1.5 rounded-full bg-cream-200 inline-flex items-center"><Bar w="22px" className="bg-ink-300 h-1" /></div>
      {open
        ? <span className="block size-0 border-x-[3px] border-x-transparent border-t-[4px] border-t-ink-400" />
        : <span className="block size-0 border-y-[3px] border-y-transparent border-l-[4px] border-l-ink-400" />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 53 — Program / course   (platform: creators build & sell programs)
   V1 curriculum builder · V2 lesson player · V3 program overview
   ════════════════════════════════════════════════════════════════════════ */

function ProgramCurriculumV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-28 rounded bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-amber-100 inline-flex items-center"><Bar w="20px" className="bg-amber-400 h-1" /></div></div>
            <div className="flex items-center gap-2"><Bar w="40px" /><div className="size-1 rounded-full bg-ink-200" /><Bar w="34px" /><div className="size-1 rounded-full bg-ink-200" /><Bar w="44px" /></div>
          </div>
          <div className="flex gap-1.5"><div className="h-6 w-14 rounded-md bg-white border border-ink-200" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-3 space-y-2">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <ModuleHead idx={1} open />
            <div className="p-1.5 space-y-0.5"><LessonRow state="done" /><LessonRow state="done" /><LessonRow state="active" /></div>
          </div>
          <div className="rounded-xl bg-white border border-ink-100"><ModuleHead idx={2} /></div>
          <div className="rounded-xl border border-dashed border-ink-200 py-2 flex items-center justify-center gap-1.5"><span className="relative block size-2.5"><span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded bg-ink-400" /><span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded bg-ink-400" /></span><Bar w="50px" className="bg-ink-200" /></div>
        </div>
      </div>
    </Frame>
  );
}

function ProgramPlayerV2() {
  return (
    <Frame>
      <div className="w-[150px] shrink-0 border-r border-ink-100 bg-cream-50 flex flex-col">
        <div className="px-2.5 py-2 border-b border-ink-100 space-y-1.5">
          <Bar w="64%" className="bg-ink-300" />
          <div className="flex items-center gap-1.5"><div className="flex-1 h-1 rounded-full bg-cream-200 overflow-hidden"><div className="h-full w-2/5 bg-rose-400" /></div><Bar w="16px" className="h-1 shrink-0" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-1.5 space-y-1.5">
          <div className="space-y-0.5"><Bar w="40px" className="bg-ink-200 ml-1 mb-0.5" /><LessonRow state="done" /><LessonRow state="active" /></div>
          <div className="space-y-0.5"><Bar w="34px" className="bg-ink-200 ml-1 mb-0.5" /><LessonRow state="todo" /><LessonRow state="todo" /></div>
        </div>
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="relative h-[92px] bg-ink-500/90 m-2.5 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="size-9 rounded-full bg-white/20 inline-flex items-center justify-center"><span className="block size-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-white ml-1" /></div>
          <div className="absolute inset-x-2 bottom-2 flex items-center gap-1.5"><span className="block size-0 border-y-[3px] border-y-transparent border-l-[4px] border-l-white/80" /><div className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"><div className="h-full w-1/3 bg-white/80" /></div><Bar w="20px" className="bg-white/40 h-1" /></div>
        </div>
        <div className="px-3 pb-2 flex-1 space-y-1.5 overflow-hidden">
          <div className="h-2.5 w-40 rounded bg-ink-300" />
          <div className="flex items-center gap-3 border-b border-ink-100">
            {["Overview", "Resources", "Q&A"].map((t, i) => <div key={t} className="py-1.5 relative"><Bar w="30px" className={i === 0 ? "bg-ink-300" : "bg-ink-200"} />{i === 0 && <div className="absolute -bottom-px inset-x-0 h-0.5 rounded-full bg-rose-400" />}</div>)}
          </div>
          <Bar /><Bar w="92%" /><Bar w="70%" />
        </div>
        <div className="border-t border-ink-100 px-3 py-2 flex items-center gap-2"><div className="h-7 w-24 rounded-md bg-white border border-ink-200" /><div className="flex-1" /><div className="h-7 w-20 rounded-md bg-rose-400" /></div>
      </div>
    </Frame>
  );
}

function ProgramOverviewV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <div className="h-[60px] bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 px-3.5 flex flex-col justify-center gap-1.5 shrink-0">
          <div className="h-3 w-48 rounded bg-white/70" />
          <div className="flex items-center gap-2"><div className="size-5 rounded-full bg-white/60" /><Bar w="50px" className="bg-white/60" /><span className="ml-1"><Stars filled={4} /></span></div>
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
              <Bar w="60px" className="bg-rose-300 h-2" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">{[0, 1, 2, 3].map((i) => <div key={i} className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-emerald-200 shrink-0 inline-flex items-center justify-center"><span className="block w-[2px] h-[4px] border-b-[1.5px] border-r-[1.5px] border-emerald-500 rotate-45 -mt-px" /></span><Bar w={i % 2 ? "58%" : "74%"} /></div>)}</div>
            </div>
            <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
              <div className="px-2.5 py-1.5 border-b border-ink-100"><Bar w="44px" className="bg-ink-300" /></div>
              {[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 border-b border-ink-100 last:border-0"><span className="size-4 rounded bg-cream-200 inline-flex items-center justify-center shrink-0"><span className="block size-0 border-x-[2px] border-x-transparent border-t-[3px] border-t-ink-400" /></span><Bar w="50%" /><Bar w="20px" className="ml-auto h-1 shrink-0" /></div>)}
            </div>
          </div>
          <div className="w-[124px] shrink-0">
            <div className="rounded-xl bg-white border border-ink-100 shadow-sm p-2.5 space-y-2 sticky top-0">
              <div className="h-12 rounded-lg bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100" />
              <div className="flex items-end gap-1"><div className="h-4 w-12 rounded bg-ink-300" /><Bar w="16px" className="mb-0.5" /></div>
              <div className="h-8 rounded-md bg-rose-400" />
              <div className="space-y-1 border-t border-ink-100 pt-1.5">{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-200 shrink-0" /><Bar w={i % 2 ? "58%" : "72%"} /></div>)}</div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Scheduler + deals helpers. */
function Plat({ tone = "rose" }: { tone?: string }) {
  return <span className={cn("size-3 rounded-[3px] shrink-0", tone === "rose" ? "bg-rose-300" : tone === "sky" ? "bg-sky-300" : tone === "violet" ? "bg-violet-300" : "bg-amber-300")} />;
}
function PostMini({ tone = "rose" }: { tone?: string }) {
  return (
    <div className="rounded-md bg-white border border-ink-100 p-1 space-y-1">
      <div className="h-6 rounded bg-gradient-to-br from-cream-200 to-cream-100" />
      <div className="flex items-center gap-1"><Plat tone={tone} /><Bar w="60%" className="h-1" /></div>
    </div>
  );
}
function DealCard({ tone = "rose" }: { tone?: string }) {
  return (
    <div className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-1.5"><div className={cn("size-4 rounded shrink-0", tone === "rose" ? "bg-rose-200" : tone === "sky" ? "bg-sky-200" : "bg-violet-200")} /><Bar w="60%" className="bg-ink-300" /></div>
      <div className="flex items-center justify-between"><div className="h-2.5 w-10 rounded bg-ink-300" /><div className="size-3 rounded-full bg-cream-200" /></div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 54 — Content scheduler   (platform: plan & schedule posts)
   V1 week board · V2 publishing queue · V3 content calendar
   ════════════════════════════════════════════════════════════════════════ */

function SchedulerWeekV1() {
  const days: (string | null)[][] = [["rose"], [], ["sky", "violet"], ["amber"], [], ["rose"], []];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5"><div className="inline-flex p-0.5 rounded-md bg-cream-200 gap-0.5">{["W", "M"].map((t, i) => <div key={t} className={cn("h-4 w-6 rounded", i === 0 ? "bg-white shadow-sm" : "")} />)}</div><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-2.5 flex gap-1.5">
          {days.map((posts, i) => (
            <div key={i} className="flex-1 min-w-0 space-y-1.5">
              <Bar w="60%" className="bg-ink-200 mx-auto" />
              {posts.map((t, j) => <PostMini key={j} tone={t as string} />)}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function SchedulerQueueV2() {
  const rows = [
    { tone: "rose", st: "ok" }, { tone: "sky", st: "ok" }, { tone: "violet", st: "draft" }, { tone: "amber", st: "ok" }, { tone: "rose", st: "draft" },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-2.5 space-y-1.5">
          {rows.map((r, i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2.5">
              <div className="text-center shrink-0 space-y-0.5"><Bar w="20px" className="bg-ink-300" /><Bar w="16px" className="h-1 mx-auto" /></div>
              <div className="w-px h-7 bg-ink-100 shrink-0" />
              <div className="size-9 rounded-md bg-gradient-to-br from-cream-200 to-cream-100 shrink-0 relative"><span className="absolute -bottom-0.5 -right-0.5"><Plat tone={r.tone} /></span></div>
              <div className="flex-1 min-w-0 space-y-1"><Bar w="70%" className="bg-ink-300" /><Bar w="50%" /></div>
              <div className={cn("h-3.5 px-1.5 rounded-full inline-flex items-center gap-1 shrink-0", r.st === "ok" ? "bg-emerald-100" : "bg-cream-200")}><span className={cn("size-1 rounded-full", r.st === "ok" ? "bg-emerald-400" : "bg-ink-300")} /><Bar w="20px" className={r.st === "ok" ? "bg-emerald-400 h-1" : "bg-ink-300 h-1"} /></div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function SchedulerCalendarV3() {
  const posts: Record<number, string[]> = { 4: ["rose"], 9: ["sky", "violet"], 12: ["amber"], 18: ["rose"], 21: ["sky"], 25: ["violet", "rose"] };
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col overflow-hidden">
        <CalHead />
        <div className="grid grid-cols-7 gap-1 mb-1">{[...Array(7).keys()].map((i) => <Bar key={i} w="60%" className="mx-auto" />)}</div>
        <div className="grid grid-cols-7 gap-1 flex-1">
          {[...Array(35).keys()].map((i) => (
            <div key={i} className="rounded bg-white border border-ink-100 p-0.5 flex flex-col gap-0.5 overflow-hidden">
              <Bar w="8px" className="h-1 self-end" />
              {(posts[i] || []).map((t, j) => <div key={j} className="flex items-center gap-0.5"><Plat tone={t} /><Bar w="60%" className="h-1" /></div>)}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 55 — Brand deals   (platform: sponsorship pipeline & partnerships)
   V1 pipeline board · V2 deals table · V3 deal detail
   ════════════════════════════════════════════════════════════════════════ */

function DealsPipelineV1() {
  const cols = [
    { dot: "bg-ink-300", deals: ["rose", "sky"] }, { dot: "bg-amber-300", deals: ["violet"] },
    { dot: "bg-rose-300", deals: ["rose", "violet"] }, { dot: "bg-emerald-300", deals: ["sky"] },
  ];
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2 overflow-hidden">
        {cols.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5"><span className={cn("size-2 rounded-full", c.dot)} /><Bar w="32px" className="bg-ink-200" /><span className="ml-auto h-2 w-3 rounded-full bg-cream-200" /></div>
            <div className="rounded-md bg-cream-100/40 border border-ink-100/60 p-1 space-y-1 flex-1">
              {c.deals.map((t, j) => <DealCard key={j} tone={t} />)}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function DealsTableV2() {
  const cols = "grid grid-cols-[1.6fr_50px_46px_44px_14px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2 overflow-hidden">
        <TableToolbar />
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}><Bar w="40px" className="bg-ink-200" /><Bar w="30px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><span /></div>
          {["rose", "sky", "violet", "amber", "rose"].map((t, i) => (
            <div key={i} className={cn(cols, "h-9 border-b border-ink-100 last:border-0")}>
              <div className="flex items-center gap-2 min-w-0"><span className={cn("size-5 rounded shrink-0", t === "rose" ? "bg-rose-200" : t === "sky" ? "bg-sky-200" : t === "violet" ? "bg-violet-200" : "bg-amber-200")} /><div className="space-y-1 min-w-0"><Bar w="56px" className="bg-ink-300" /><Bar w="34px" /></div></div>
              <div className="h-2.5 w-9 rounded bg-ink-300" />
              <Chip tone={TONES[i % 5]} />
              <Bar w="28px" className="bg-ink-200" />
              <div className="flex flex-col gap-0.5 items-center"><span className="size-0.5 rounded-full bg-ink-300" /><span className="size-0.5 rounded-full bg-ink-300" /><span className="size-0.5 rounded-full bg-ink-300" /></div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function DealDetailV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-rose-200 shrink-0" />
          <div className="flex-1 space-y-1"><div className="h-2.5 w-28 rounded bg-ink-300" /><div className="flex items-end gap-1"><div className="h-3 w-12 rounded bg-ink-300" /><Bar w="16px" className="mb-0.5" /></div></div>
          <div className="h-4 px-2 rounded-full bg-amber-100 inline-flex items-center gap-1"><span className="size-1 rounded-full bg-amber-400" /><Bar w="28px" className="bg-amber-400 h-1" /></div>
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-rose-300 h-2" />{[true, true, false].map((d, i) => <div key={i} className="flex items-center gap-2"><span className={cn("size-3.5 rounded-full inline-flex items-center justify-center shrink-0", d ? "bg-emerald-300" : "bg-cream-200 border border-ink-200")}>{d && <span className="block w-[2px] h-[4px] border-b-[1.5px] border-r-[1.5px] border-white rotate-45 -mt-px" />}</span><Bar w={i % 2 ? "60%" : "74%"} className={d ? "bg-ink-200" : "bg-ink-300"} /></div>)}</div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5"><Bar w="40px" className="bg-ink-300 h-2 mb-1.5" /><TimelineRow tone="rose" /><TimelineRow tone="emerald" last /></div>
          </div>
          <div className="w-[110px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="flex items-center gap-1.5"><div className="size-6 rounded-full bg-cream-200" /><div className="space-y-1"><Bar w="40px" className="bg-ink-300" /><Bar w="28px" className="h-1" /></div></div>
            <div className="h-7 rounded-md bg-rose-400" />
            <div className="h-7 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Revenue + audience helpers. */
function StreamRow({ tone = "rose", w = "60%" }: { tone?: string; w?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5"><span className={cn("size-2 rounded-sm shrink-0", tone === "rose" ? "bg-rose-300" : tone === "sky" ? "bg-sky-300" : tone === "violet" ? "bg-violet-300" : "bg-emerald-300")} /><Bar w="44px" className="bg-ink-200" /><div className="ml-auto h-2 w-10 rounded bg-ink-300" /></div>
      <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden"><div className={cn("h-full rounded-full", tone === "rose" ? "bg-rose-300" : tone === "sky" ? "bg-sky-300" : tone === "violet" ? "bg-violet-300" : "bg-emerald-300")} style={{ width: w }} /></div>
    </div>
  );
}
function PayoutRow({ st = "ok" }: { st?: string }) {
  return (
    <div className="grid grid-cols-[1fr_44px_50px] gap-2 items-center px-2.5 py-1.5 border-b border-ink-100 last:border-0">
      <div className="flex items-center gap-2"><div className="size-5 rounded bg-gradient-to-br from-ink-200 to-cream-200 shrink-0" /><div className="space-y-1"><Bar w="44px" className="bg-ink-300" /><Bar w="30px" className="h-1" /></div></div>
      <div className="h-2.5 w-9 rounded bg-ink-300" />
      <div className={cn("h-3.5 px-1.5 rounded-full inline-flex items-center gap-1 w-fit ml-auto", st === "ok" ? "bg-emerald-100" : "bg-amber-100")}><span className={cn("size-1 rounded-full", st === "ok" ? "bg-emerald-400" : "bg-amber-400")} /><Bar w="18px" className={st === "ok" ? "bg-emerald-400 h-1" : "bg-amber-400 h-1"} /></div>
    </div>
  );
}
function StreamCard({ tone = "rose", spark = [8, 12, 10, 14, 16] }: { tone?: string; spark?: number[] }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 p-2.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between"><span className={cn("size-6 rounded-lg shrink-0", tone === "rose" ? "bg-rose-100" : tone === "sky" ? "bg-sky-100" : tone === "violet" ? "bg-violet-100" : "bg-emerald-100")} /><div className="h-3 px-1.5 rounded-full bg-emerald-50 inline-flex items-center"><Bar w="14px" className="bg-emerald-400 h-1" /></div></div>
      <div className="h-3.5 w-12 rounded bg-ink-300" /><Bar w="44px" />
      <div className="flex items-end gap-0.5 h-5 mt-0.5">{spark.map((b, i) => <div key={i} className={cn("w-1 rounded-t", tone === "rose" ? "bg-rose-200" : tone === "sky" ? "bg-sky-200" : tone === "violet" ? "bg-violet-200" : "bg-emerald-200")} style={{ height: `${b * 1.2}px` }} />)}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 56 — Revenue & earnings   (platform: creator monetization)
   V1 revenue overview · V2 payouts · V3 streams breakdown
   ════════════════════════════════════════════════════════════════════════ */

function RevenueOverviewV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta={false} /></div>
          <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
            <ChartCard bars={[10, 16, 13, 20, 17, 23, 19, 26]} h={50} />
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2"><Bar w="56px" className="bg-ink-300 h-2" /><StreamRow tone="rose" w="72%" /><StreamRow tone="sky" w="48%" /><StreamRow tone="violet" w="30%" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function RevenuePayoutsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between">
          <div className="space-y-1"><div className="h-2.5 w-20 rounded bg-ink-300" /><Bar w="60px" /></div>
          <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-cream-100 border border-emerald-200 px-2.5 py-1.5 text-right space-y-1"><Bar w="34px" className="bg-emerald-400 h-1 ml-auto" /><div className="h-3 w-12 rounded bg-ink-300" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_44px_50px] gap-2 px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="40px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200 ml-auto" /></div>
            <PayoutRow st="ok" /><PayoutRow st="ok" /><PayoutRow st="pending" /><PayoutRow st="ok" /><PayoutRow st="ok" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function RevenueStreamsV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 flex items-center gap-3">
            <Ring size={48} />
            <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {["rose", "sky", "violet", "emerald"].map((t, i) => <div key={i} className="flex items-center gap-1.5"><span className={cn("size-2 rounded-sm shrink-0", t === "rose" ? "bg-rose-300" : t === "sky" ? "bg-sky-300" : t === "violet" ? "bg-violet-300" : "bg-emerald-300")} /><Bar w="40px" /><Bar w="18px" className="ml-auto bg-ink-300 h-1" /></div>)}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5"><StreamCard tone="rose" /><StreamCard tone="sky" spark={[14, 10, 12, 9, 13]} /><StreamCard tone="violet" spark={[6, 9, 11, 13, 17]} /><StreamCard tone="emerald" spark={[10, 11, 9, 12, 10]} /></div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 57 — Audience   (platform: subscribers & growth)
   V1 audience overview · V2 subscriber list · V3 segment detail
   ════════════════════════════════════════════════════════════════════════ */

function AudienceOverviewV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
            <ChartCard bars={[12, 14, 15, 18, 17, 21, 20, 24, 23, 27]} h={50} />
            <div className="grid grid-rows-2 gap-2.5"><StatTile delta /><StatTile delta={false} /></div>
          </div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2"><div className="flex items-center justify-between"><Bar w="50px" className="bg-ink-300 h-2" /><Bar w="30px" /></div><div className="grid grid-cols-3 gap-3"><StreamRow tone="rose" w="68%" /><StreamRow tone="sky" w="44%" /><StreamRow tone="emerald" w="26%" /></div></div>
        </div>
      </div>
    </Frame>
  );
}

function AudienceListV2() {
  const cols = "grid grid-cols-[1.7fr_56px_46px_40px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-1.5">
          <SearchBar />
          {["rose", "sky"].map((t, i) => <div key={i} className="h-5 px-2 rounded-full bg-rose-50 border border-rose-100 inline-flex items-center gap-1"><span className={cn("size-1.5 rounded-full", t === "rose" ? "bg-rose-400" : "bg-sky-400")} /><Bar w="20px" className="bg-rose-400 h-1" /></div>)}
          <div className="ml-auto h-6 w-12 rounded-md bg-cream-200" />
        </div>
        <div className="flex-1 bg-white overflow-hidden">
          <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}><Bar w="40px" className="bg-ink-200" /><Bar w="32px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200 ml-auto" /></div>
          {["rose", "sky", "violet", "emerald", "rose"].map((t, i) => (
            <div key={i} className={cn(cols, "h-9 border-b border-ink-100 last:border-0")}>
              <div className="flex items-center gap-2 min-w-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1 min-w-0"><Bar w="56px" className="bg-ink-300" /><Bar w="36px" /></div></div>
              <div className={cn("h-3.5 px-1.5 rounded-full inline-flex items-center gap-1 w-fit", t === "rose" ? "bg-rose-100" : t === "sky" ? "bg-sky-100" : t === "violet" ? "bg-violet-100" : "bg-emerald-100")}><span className={cn("size-1 rounded-full", t === "rose" ? "bg-rose-400" : t === "sky" ? "bg-sky-400" : t === "violet" ? "bg-violet-400" : "bg-emerald-400")} /><Bar w="18px" className="bg-ink-300 h-1" /></div>
              <Bar w="28px" className="bg-ink-200" />
              <div className="h-2.5 w-7 rounded bg-ink-300 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function AudienceSegmentV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 space-y-1.5">
          <div className="flex items-center gap-2"><div className="size-7 rounded-lg bg-rose-100 shrink-0" /><div className="space-y-1"><div className="h-2.5 w-28 rounded bg-ink-300" /><Bar w="50px" /></div><div className="ml-auto h-6 w-16 rounded-md bg-rose-400" /></div>
          <div className="flex items-center gap-1.5"><Bar w="30px" className="bg-ink-200" />{["rose", "sky", "violet"].map((t, i) => <div key={i} className="h-4 px-1.5 rounded-full bg-cream-200 inline-flex items-center gap-1"><span className={cn("size-1.5 rounded-full", t === "rose" ? "bg-rose-300" : t === "sky" ? "bg-sky-300" : "bg-violet-300")} /><Bar w="22px" className="h-1" /></div>)}</div>
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[120px] shrink-0"><ChartCard bars={[10, 14, 12, 17, 15, 20]} h={40} /></div>
          <div className="flex-1 rounded-xl bg-white border border-ink-100 overflow-hidden">
            {[0, 1, 2, 3].map((i) => <div key={i} className="flex items-center gap-2 px-2.5 py-2 border-b border-ink-100 last:border-0"><div className="size-5 rounded-full bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="50%" className="bg-ink-300" /><Bar w="34%" /></div><Bar w="20px" className="bg-ink-200 h-1" /></div>)}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Email + affiliate helpers. */
function LinkField() {
  return (
    <div className="h-7 rounded-md bg-cream-50 border border-ink-100 flex items-center gap-2 px-2">
      <span className="size-3 rounded bg-ink-200 shrink-0" /><Bar w="56%" className="bg-ink-200" />
      <span className="ml-auto h-5 px-2 rounded bg-rose-400 inline-flex items-center shrink-0"><Bar w="18px" className="bg-white/70 h-1" /></span>
    </div>
  );
}
function MailRow({ open = "60%", hot = false }: { open?: string; hot?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[1.7fr_44px_40px_40px] items-center gap-2 px-2.5 py-2 border-b border-ink-100 last:border-0", hot && "bg-cream-50")}>
      <div className="flex items-center gap-2 min-w-0"><span className={cn("size-2 rounded-full shrink-0", hot ? "bg-rose-400" : "bg-emerald-300")} /><div className="space-y-1 min-w-0"><Bar w="64%" className="bg-ink-300" /><Bar w="40%" /></div></div>
      <Bar w="30px" className="bg-ink-200" />
      <div className="space-y-0.5"><div className="h-1.5 rounded-full bg-cream-200 overflow-hidden"><div className="h-full bg-emerald-300 rounded-full" style={{ width: open }} /></div></div>
      <div className="h-2 w-7 rounded bg-ink-300 ml-auto" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 58 — Email & broadcasts   (platform: email the audience)
   V1 broadcast composer · V2 campaigns list · V3 broadcast report
   ════════════════════════════════════════════════════════════════════════ */

function EmailComposerV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-cream-200 inline-flex items-center"><Bar w="22px" className="bg-ink-300 h-1" /></div></div>
        <div className="flex-1 overflow-hidden p-3 space-y-2">
          <div className="flex items-center gap-1.5"><Bar w="14px" className="bg-ink-200 shrink-0" /><div className="h-5 px-2 rounded-full bg-rose-50 border border-rose-100 inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-rose-400" /><Bar w="34px" className="bg-rose-400 h-1" /></div><div className="h-5 px-2 rounded-full bg-cream-200 inline-flex items-center"><Bar w="26px" className="bg-ink-300 h-1" /></div><Bar w="40px" className="ml-auto" /></div>
          <Field labelW="36px" h="h-7" />
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden flex-1">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60">{[0, 1, 2, 3].map((i) => <span key={i} className="size-3.5 rounded bg-cream-200" />)}<span className="w-px h-3.5 bg-ink-100 mx-0.5" /><span className="size-3.5 rounded bg-cream-200" /></div>
            <div className="p-2.5 space-y-1.5"><Bar /><Bar w="92%" /><div className="h-10 rounded-md bg-gradient-to-br from-cream-200 to-cream-100 my-1" /><Bar w="80%" /><div className="h-6 w-24 rounded-md bg-rose-400 mt-1" /></div>
          </div>
        </div>
        <div className="border-t border-ink-100 px-3 py-2 flex items-center gap-2"><div className="h-7 w-20 rounded-md bg-white border border-ink-200" /><div className="flex-1" /><div className="h-7 w-16 rounded-md bg-white border border-ink-200" /><div className="h-7 w-16 rounded-md bg-rose-400" /></div>
      </div>
    </Frame>
  );
}

function EmailCampaignsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3">
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1.7fr_44px_40px_40px] gap-2 px-2.5 py-1.5 bg-cream-100 border-b border-ink-100"><Bar w="44px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="26px" className="bg-ink-200" /><Bar w="22px" className="bg-ink-200 ml-auto" /></div>
            <MailRow open="74%" /><MailRow open="58%" hot /><MailRow open="46%" /><MailRow open="32%" /><MailRow open="20%" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function EmailReportV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 space-y-1"><div className="h-2.5 w-36 rounded bg-ink-300" /><Bar w="60px" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta={false} /></div>
          <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
            <ChartCard bars={[20, 14, 10, 8, 6, 5, 4]} h={48} />
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="44px" className="bg-ink-300 h-2" />{[0, 1, 2].map((i) => <div key={i} className="space-y-0.5"><div className="flex items-center justify-between"><Bar w="50%" /><Bar w="16px" className="bg-ink-300 h-1" /></div><div className="h-1.5 rounded-full bg-cream-200 overflow-hidden"><div className="h-full bg-rose-300 rounded-full" style={{ width: i === 0 ? "70%" : i === 1 ? "44%" : "22%" }} /></div></div>)}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 59 — Affiliate & referral   (platform: referrals & commissions)
   V1 referral dashboard · V2 affiliates table · V3 referral share
   ════════════════════════════════════════════════════════════════════════ */

function ReferralDashV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-gradient-to-r from-rose-100 to-cream-100 border border-rose-100 p-2.5 space-y-1.5"><Bar w="44px" className="bg-rose-300 h-2" /><LinkField /></div>
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta={false} /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-0.5"><Bar w="50px" className="bg-ink-300 h-2 mb-1" /><LeaderRow rank={1} w="88%" hot /><LeaderRow rank={2} w="64%" /><LeaderRow rank={3} w="46%" /></div>
        </div>
      </div>
    </Frame>
  );
}

function AffiliatesTableV2() {
  const cols = "grid grid-cols-[1.7fr_44px_44px_50px_44px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2 overflow-hidden">
        <TableToolbar />
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}><Bar w="44px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><Bar w="32px" className="bg-ink-200" /><Bar w="22px" className="bg-ink-200" /></div>
          {["emerald", "amber", "emerald", "rose", "amber"].map((t, i) => (
            <div key={i} className={cn(cols, "h-9 border-b border-ink-100 last:border-0")}>
              <div className="flex items-center gap-2 min-w-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1 min-w-0"><Bar w="56px" className="bg-ink-300" /><Bar w="34px" /></div></div>
              <Bar w="26px" className="bg-ink-200" /><Bar w="22px" className="bg-ink-200" />
              <div className="h-2.5 w-10 rounded bg-ink-300" />
              <Chip tone={t as "emerald" | "amber" | "rose" | "ink"} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ReferralShareV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center px-4">
        <div className="w-[74%] rounded-xl bg-white border border-ink-100 shadow-sm p-3 space-y-2.5">
          <div className="flex flex-col items-center gap-1.5"><div className="size-9 rounded-2xl bg-rose-100 inline-flex items-center justify-center"><div className="size-4 rounded bg-rose-300" /></div><div className="h-2.5 w-32 rounded bg-ink-300" /><Bar w="140px" /></div>
          <div className="flex items-center px-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center" style={{ flex: i < 3 ? 1 : "0 0 auto" }}>
                <div className="flex flex-col items-center gap-0.5"><span className={cn("size-4 rounded-full shrink-0", i < 2 ? "bg-rose-400" : "bg-cream-200 border border-ink-200")} /><Bar w="16px" className="h-1" /></div>
                {i < 3 && <div className={cn("flex-1 h-0.5 rounded-full mx-1 -mt-3", i < 1 ? "bg-rose-400" : "bg-cream-200")} />}
              </div>
            ))}
          </div>
          <LinkField />
          <div className="flex items-center justify-center gap-2 pt-0.5">{["rose", "sky", "violet", "amber"].map((t, i) => <span key={i} className={cn("size-6 rounded-full", t === "rose" ? "bg-rose-100" : t === "sky" ? "bg-sky-100" : t === "violet" ? "bg-violet-100" : "bg-amber-100")} />)}</div>
        </div>
      </div>
    </Frame>
  );
}

/* Live / events helpers. */
function DateBlock({ hot = false }: { hot?: boolean }) {
  return (
    <div className={cn("w-9 shrink-0 rounded-md border text-center overflow-hidden", hot ? "border-rose-200" : "border-ink-100")}>
      <div className={cn("py-0.5", hot ? "bg-rose-100" : "bg-cream-100")}><Bar w="60%" className={cn("mx-auto h-1", hot ? "bg-rose-400" : "bg-ink-300")} /></div>
      <div className="py-1"><div className={cn("h-3 w-4 rounded mx-auto", hot ? "bg-rose-400" : "bg-ink-300")} /></div>
    </div>
  );
}
function CtrlBtn({ tone = "ink" }: { tone?: string }) {
  return <span className={cn("size-6 rounded-full inline-flex items-center justify-center", tone === "leave" ? "bg-rose-400" : "bg-white/20")}><span className="size-2.5 rounded-[3px] bg-white/70" /></span>;
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 60 — Live & events   (platform: lives, workshops, sessions)
   V1 events list · V2 live room · V3 event detail
   ════════════════════════════════════════════════════════════════════════ */

function EventsListV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3 space-y-1.5">
          {[true, false, false, false].map((hot, i) => (
            <div key={i} className={cn("rounded-xl border p-2 flex items-center gap-2.5", hot ? "border-rose-200 bg-rose-50/40" : "border-ink-100 bg-white")}>
              <DateBlock hot={hot} />
              <div className="flex-1 min-w-0 space-y-1"><div className="flex items-center gap-1.5"><Bar w="50%" className="bg-ink-300" />{hot && <span className="h-3 px-1.5 rounded-full bg-rose-100 inline-flex items-center gap-1"><span className="size-1 rounded-full bg-rose-500" /><Bar w="16px" className="bg-rose-500 h-1" /></span>}</div><div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-cream-200" /><Bar w="40px" /></div></div>
              <div className="flex -space-x-1 shrink-0">{[0, 1, 2].map((a) => <span key={a} className="size-5 rounded-full bg-cream-200 ring-1 ring-white" />)}</div>
              <div className={cn("h-7 w-14 rounded-md shrink-0", hot ? "bg-rose-400" : "bg-white border border-ink-200")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function LiveRoomV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col p-2.5 gap-2">
        <div className="relative flex-1 rounded-lg bg-ink-500/90 overflow-hidden flex items-center justify-center">
          <div className="absolute top-2 left-2 h-4 px-1.5 rounded-full bg-rose-500 inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-white" /><Bar w="18px" className="bg-white/80 h-1" /></div>
          <div className="absolute top-2 right-2 h-4 px-1.5 rounded-full bg-black/30 inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-white/70" /><Bar w="16px" className="bg-white/60 h-1" /></div>
          <div className="size-12 rounded-full bg-white/15" />
          <div className="absolute left-2 bottom-2 flex gap-1.5">{[0, 1, 2].map((a) => <span key={a} className="size-8 rounded-md bg-white/15 border border-white/20" />)}</div>
        </div>
        <div className="rounded-full bg-white border border-ink-100 shadow-sm py-1.5 flex items-center justify-center gap-2.5">
          {["ink", "ink", "ink", "ink"].map((_, i) => <span key={i} className="size-6 rounded-full bg-cream-200 inline-flex items-center justify-center"><span className="size-2.5 rounded-[3px] bg-ink-300" /></span>)}
          <span className="size-6 rounded-full bg-rose-400 inline-flex items-center justify-center"><span className="size-2.5 rounded-[3px] bg-white/80" /></span>
        </div>
      </div>
      <div className="w-[126px] shrink-0 border-l border-ink-100 bg-cream-50 flex flex-col">
        <div className="px-2.5 py-2 border-b border-ink-100 flex items-center gap-1.5"><Bar w="30px" className="bg-ink-300" /><span className="ml-auto h-2 w-3 rounded-full bg-cream-200" /></div>
        <div className="flex-1 overflow-hidden p-2 space-y-1.5">
          {[0, 1, 2].map((i) => <div key={i} className="flex gap-1.5"><span className="size-4 rounded-full bg-cream-200 shrink-0" /><div className="flex-1 space-y-0.5"><Bar w="40px" className="bg-ink-300 h-1" /><Bar w="90%" /></div></div>)}
        </div>
        <div className="border-t border-ink-100 px-2 py-1.5 flex items-center gap-1.5"><div className="flex-1 h-6 rounded-full bg-white border border-ink-100" /><span className="size-6 rounded-full bg-rose-400 shrink-0" /></div>
      </div>
    </Frame>
  );
}

function EventDetailV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <div className="h-[60px] bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 px-3.5 flex flex-col justify-center gap-1.5 shrink-0">
          <div className="h-3 w-44 rounded bg-white/70" />
          <div className="flex items-center gap-2"><span className="size-5 rounded-full bg-white/60" /><Bar w="46px" className="bg-white/60" /><span className="size-1 rounded-full bg-white/50" /><Bar w="40px" className="bg-white/50" /></div>
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <div className="space-y-1.5"><Bar /><Bar w="92%" /><Bar w="70%" /></div>
            <div className="rounded-xl bg-white border border-ink-100 overflow-hidden"><div className="px-2.5 py-1.5 border-b border-ink-100"><Bar w="40px" className="bg-ink-300" /></div>{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 border-b border-ink-100 last:border-0"><Bar w="24px" className="bg-ink-200 shrink-0" /><span className="w-px h-4 bg-ink-100 shrink-0" /><Bar w="50%" /></div>)}</div>
          </div>
          <div className="w-[120px] shrink-0">
            <div className="rounded-xl bg-white border border-ink-100 shadow-sm p-2.5 space-y-2 sticky top-0">
              <DateBlock hot />
              <div className="space-y-1"><Bar w="60%" className="bg-ink-300" /><Bar w="44%" /></div>
              <div className="h-8 rounded-md bg-rose-400" />
              <div className="flex items-center gap-1.5"><div className="flex -space-x-1">{[0, 1, 2].map((a) => <span key={a} className="size-4 rounded-full bg-cream-200 ring-1 ring-white" />)}</div><Bar w="40px" className="h-1" /></div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Moderation + shop helpers. */
function StatusPill({ tone = "emerald" }: { tone?: string }) {
  return (
    <span className={cn("h-3.5 px-1.5 rounded-full inline-flex items-center gap-1 w-fit", tone === "emerald" ? "bg-emerald-100" : tone === "amber" ? "bg-amber-100" : "bg-red-100")}>
      <span className={cn("size-1 rounded-full", tone === "emerald" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-red-400")} />
      <Bar w="18px" className={cn("h-1", tone === "emerald" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-red-400")} />
    </span>
  );
}
function ProductCard() {
  return (
    <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
      <div className="h-12 bg-gradient-to-br from-cream-200 to-cream-100 relative"><span className="absolute top-1 right-1"><StatusPill tone="emerald" /></span></div>
      <div className="p-1.5 space-y-1"><Bar w="74%" className="bg-ink-300" /><div className="flex items-center justify-between"><div className="h-2.5 w-8 rounded bg-ink-300" /><Bar w="24%" /></div></div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 61 — Community moderation   (platform: keep the community healthy)
   V1 reports queue · V2 members admin · V3 auto-mod rules
   ════════════════════════════════════════════════════════════════════════ */

function ModerationQueueV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-2.5 pb-0">
          <div className="flex items-center justify-between mb-1.5"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="16px" className="bg-rose-400 h-1" /></div></div>
          <div className="flex items-center gap-3 border-b border-ink-100">{["Pending", "Resolved"].map((t, i) => <div key={t} className="py-1.5 relative"><Bar w="34px" className={i === 0 ? "bg-ink-300" : "bg-ink-200"} />{i === 0 && <div className="absolute -bottom-px inset-x-0 h-0.5 rounded-full bg-rose-400" />}</div>)}</div>
        </div>
        <div className="flex-1 overflow-hidden p-3 space-y-2">
          {[{ r: "amber" }, { r: "red" }].map((it, i) => (
            <div key={i} className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
              <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1"><Bar w="50px" className="bg-ink-300" /><Bar w="32px" className="h-1" /></div><span className={cn("ml-auto h-3.5 px-1.5 rounded-full inline-flex items-center gap-1", it.r === "red" ? "bg-red-100" : "bg-amber-100")}><span className={cn("size-1 rounded-full", it.r === "red" ? "bg-red-400" : "bg-amber-400")} /><Bar w="26px" className={cn("h-1", it.r === "red" ? "bg-red-400" : "bg-amber-400")} /></span></div>
              <div className="rounded-md bg-cream-50 border border-ink-100 p-1.5 space-y-1"><Bar w="92%" /><Bar w="64%" /></div>
              <div className="flex items-center gap-2"><Bar w="50px" className="h-1" /><div className="flex-1" /><div className="h-6 w-14 rounded-md bg-white border border-ink-200" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ModerationMembersV2() {
  const cols = "grid grid-cols-[1.7fr_46px_50px_40px_14px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2 overflow-hidden">
        <TableToolbar />
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}><Bar w="44px" className="bg-ink-200" /><Bar w="26px" className="bg-ink-200" /><Bar w="30px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><span /></div>
          {[{ s: "emerald", role: "rose" }, { s: "emerald", role: "ink" }, { s: "amber", role: "ink" }, { s: "red", role: "ink" }, { s: "emerald", role: "ink" }].map((r, i) => (
            <div key={i} className={cn(cols, "h-9 border-b border-ink-100 last:border-0")}>
              <div className="flex items-center gap-2 min-w-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1 min-w-0"><Bar w="56px" className="bg-ink-300" /><Bar w="36px" /></div></div>
              <div className={cn("h-3 px-1.5 rounded-full inline-flex items-center w-fit", r.role === "rose" ? "bg-rose-100" : "bg-cream-200")}><Bar w="20px" className={r.role === "rose" ? "bg-rose-400 h-1" : "bg-ink-300 h-1"} /></div>
              <StatusPill tone={r.s} />
              <Bar w="28px" className="bg-ink-200" />
              <div className="flex flex-col gap-0.5 items-center"><span className="size-0.5 rounded-full bg-ink-300" /><span className="size-0.5 rounded-full bg-ink-300" /><span className="size-0.5 rounded-full bg-ink-300" /></div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ModerationRulesV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100"><div className="h-2.5 w-28 rounded bg-ink-300" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 flex items-center gap-2.5"><div className="size-8 rounded-lg bg-rose-100 shrink-0" /><div className="flex-1 space-y-1"><Bar w="44%" className="bg-ink-300" /><Bar w="72%" /></div><Switch on /></div>
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5">
            <Bar w="40px" className="bg-rose-300 h-2" />
            {[true, true, false].map((on, i) => (
              <div key={i} className="flex items-center gap-1.5 py-1 border-b border-ink-100 last:border-0">
                <div className="h-4 px-1.5 rounded bg-cream-100 border border-ink-100 inline-flex items-center"><Bar w="28px" className="h-1" /></div>
                <span className="size-0 border-y-[2.5px] border-y-transparent border-l-[3.5px] border-l-ink-400" />
                <div className="h-4 px-1.5 rounded bg-rose-50 border border-rose-100 inline-flex items-center"><Bar w="24px" className="bg-rose-300 h-1" /></div>
                <Switch on={on} />
              </div>
            ))}
            <div className="h-6 rounded-md border border-dashed border-ink-200 flex items-center justify-center gap-1.5 mt-0.5"><span className="relative block size-2.5"><span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded bg-ink-400" /><span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded bg-ink-400" /></span><Bar w="44px" className="bg-ink-200" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PATTERN 62 — Digital products   (platform: sell digital products)
   V1 products · V2 product editor · V3 orders & sales
   ════════════════════════════════════════════════════════════════════════ */

function ShopProductsV1() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2"><div className="h-2.5 w-20 rounded bg-ink-300" /><div className="ml-auto h-6 w-12 rounded-md bg-cream-200" /><div className="h-6 w-20 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3.5"><div className="grid grid-cols-3 gap-2.5"><ProductCard /><ProductCard /><ProductCard /><ProductCard /><ProductCard /><ProductCard /></div></div>
      </div>
    </Frame>
  );
}

function ShopEditorV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="flex gap-1.5"><div className="h-6 w-14 rounded-md bg-white border border-ink-200" /><div className="h-6 w-16 rounded-md bg-rose-400" /></div></div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2">
            <Field labelW="36px" h="h-7" />
            <Field labelW="52px" h="h-10" />
            <div className="grid grid-cols-2 gap-2.5"><Field labelW="30px" h="h-6" /><Field labelW="44px" h="h-6" /></div>
            <div className="h-12 rounded-lg border border-dashed border-ink-200 bg-white/50 flex items-center justify-center gap-1.5"><span className="size-6 rounded-lg bg-cream-200 inline-flex items-center justify-center"><span className="size-2.5 rounded bg-rose-200" /></span><Bar w="60px" className="bg-ink-200" /></div>
          </div>
          <div className="w-[118px] shrink-0 space-y-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="40px" className="bg-ink-300 h-2" /><div className="flex items-center justify-between"><Bar w="50%" /><StatusPill tone="emerald" /></div><div className="flex items-center justify-between"><Bar w="44%" /><Switch on /></div></div>
            <div className="rounded-xl bg-white border border-ink-100 p-2 space-y-1.5"><Bar w="40px" className="bg-ink-200" /><div className="h-12 rounded-md bg-gradient-to-br from-cream-200 to-cream-100" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ShopOrdersV3() {
  const cols = "grid grid-cols-[40px_1.4fr_44px_44px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden px-3.5 pb-3 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta={false} /></div>
          <div className="rounded-xl bg-white border border-ink-100 overflow-hidden">
            <div className={cn(cols, "py-1.5 bg-cream-100 border-b border-ink-100")}><Bar w="22px" className="bg-ink-200" /><Bar w="40px" className="bg-ink-200" /><Bar w="26px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200 ml-auto" /></div>
            {["emerald", "emerald", "amber", "emerald"].map((t, i) => (
              <div key={i} className={cn(cols, "h-8 border-b border-ink-100 last:border-0")}>
                <Bar w="24px" className="bg-ink-200" />
                <div className="flex items-center gap-2 min-w-0"><div className="size-5 rounded-full bg-cream-200 shrink-0" /><Bar w="56%" className="bg-ink-300" /></div>
                <div className="h-2.5 w-8 rounded bg-ink-300" />
                <span className="ml-auto"><StatusPill tone={t} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Platform pattern V4s — round each platform surface out to four ── */

function ProgramStudentsV4() {
  const cols = "grid grid-cols-[1.6fr_1fr_46px_44px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2"><div className="h-2.5 w-24 rounded bg-ink-300" /><div className="h-3 px-1.5 rounded-full bg-cream-200 inline-flex items-center"><Bar w="16px" className="bg-ink-300 h-1" /></div><div className="ml-auto h-6 w-16 rounded-md bg-rose-400" /></div>
        <div className="flex-1 overflow-hidden p-3">
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}><Bar w="44px" className="bg-ink-200" /><Bar w="40px" className="bg-ink-200" /><Bar w="28px" className="bg-ink-200" /><span /></div>
            {[{ p: "92%", s: "emerald" }, { p: "68%", s: "emerald" }, { p: "40%", s: "amber" }, { p: "100%", s: "emerald" }, { p: "16%", s: "amber" }].map((r, i) => (
              <div key={i} className={cn(cols, "h-9 border-b border-ink-100 last:border-0")}>
                <div className="flex items-center gap-2 min-w-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1 min-w-0"><Bar w="56px" className="bg-ink-300" /><Bar w="36px" /></div></div>
                <div className="flex items-center gap-1.5"><div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden"><div className="h-full bg-rose-300 rounded-full" style={{ width: r.p }} /></div><Bar w="16px" className="h-1 shrink-0" /></div>
                <Bar w="28px" className="bg-ink-200" />
                <span className="ml-auto"><StatusPill tone={r.s} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SchedulerComposeV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 flex flex-col gap-2">
          <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2 flex-1">
            <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-cream-200" /><Bar w="50px" className="bg-ink-200" /></div>
            <Bar /><Bar w="86%" /><Bar w="64%" />
            <div className="h-12 rounded-md bg-gradient-to-br from-cream-200 to-cream-100 border border-ink-100" />
          </div>
          <div className="flex items-center gap-1.5">{[true, true, false, false].map((on, i) => <div key={i} className={cn("h-6 px-2 rounded-full inline-flex items-center gap-1 border", on ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}><Plat tone={["rose", "sky", "violet", "amber"][i]} /><Bar w="14px" className={on ? "bg-rose-400 h-1" : "bg-ink-200 h-1"} /></div>)}</div>
        </div>
        <div className="w-[126px] shrink-0 rounded-xl bg-white border border-ink-100 p-2.5 space-y-2">
          <Bar w="44px" className="bg-ink-300 h-2" />
          <MiniCal active={16} />
          <div className="grid grid-cols-2 gap-1.5"><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="60%" /></div><div className="h-6 rounded-md bg-cream-50 border border-ink-100 flex items-center px-1.5"><Bar w="60%" /></div></div>
          <div className="h-7 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

function DealsOverviewV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta /><StatTile delta={false} /></div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-2"><Bar w="44px" className="bg-ink-300 h-2" /><FunnelBar w="92%" /><FunnelBar w="64%" tone="lt" /><FunnelBar w="38%" tone="lt" /></div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-300 h-2" />{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><span className={cn("size-4 rounded shrink-0", ["bg-rose-200", "bg-sky-200", "bg-violet-200"][i])} /><div className="flex-1 space-y-1"><Bar w="60%" className="bg-ink-300" /><Bar w="36%" /></div><div className="h-2 w-8 rounded bg-ink-300" /></div>)}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function RevenueGoalV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 flex gap-2.5">
          <div className="w-[128px] shrink-0 rounded-xl bg-white border border-ink-100 p-3 flex flex-col items-center justify-center gap-1.5"><Ring size={52} /><Bar w="60px" className="bg-ink-300" /><Bar w="44px" /><div className="h-3 px-2 rounded-full bg-emerald-100 inline-flex items-center mt-0.5"><Bar w="30px" className="bg-emerald-400 h-1" /></div></div>
          <div className="flex-1 space-y-2.5">
            <ChartCard bars={[10, 14, 12, 18, 16, 22, 20, 26]} h={48} />
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-300 h-2" /><div className="grid grid-cols-2 gap-3"><div className="space-y-1"><Bar w="40px" /><div className="h-2.5 w-12 rounded bg-ink-300" /></div><div className="space-y-1"><Bar w="40px" /><div className="h-2.5 w-12 rounded bg-ink-300" /></div></div></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ShopProductPageV4() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col overflow-hidden">
        <MktNav />
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 rounded-xl bg-gradient-to-br from-cream-200 via-rose-100 to-cream-100 border border-ink-100" />
          <div className="w-[158px] shrink-0 space-y-2">
            <div className="h-2.5 w-32 rounded bg-ink-300" />
            <div className="flex items-center gap-1.5"><Stars filled={5} /><Bar w="28px" /></div>
            <div className="flex items-end gap-1"><div className="h-5 w-14 rounded bg-ink-300" /><Bar w="16px" className="mb-0.5" /></div>
            <div className="h-8 rounded-md bg-rose-400" />
            <div className="space-y-1 border-t border-ink-100 pt-2">{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-200 shrink-0" /><Bar w={i % 2 ? "58%" : "74%"} /></div>)}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AudienceProfileV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center gap-2.5">
          <div className="size-10 rounded-full bg-cream-200 shrink-0" />
          <div className="flex-1 space-y-1"><div className="h-2.5 w-28 rounded bg-ink-300" /><div className="flex items-center gap-1.5"><div className="h-3.5 px-1.5 rounded-full bg-rose-100 inline-flex items-center"><Bar w="20px" className="bg-rose-400 h-1" /></div><div className="h-3.5 px-1.5 rounded-full bg-sky-100 inline-flex items-center"><Bar w="18px" className="bg-sky-400 h-1" /></div></div></div>
          <div className="h-6 w-12 rounded-md bg-white border border-ink-200" /><div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 space-y-2.5">
            <div className="grid grid-cols-3 gap-2.5"><StatTile delta /><StatTile delta={false} /><StatTile delta={false} /></div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5"><Bar w="40px" className="bg-ink-300 h-2 mb-1.5" /><TimelineRow tone="rose" /><TimelineRow tone="emerald" /><TimelineRow tone="ink" last /></div>
          </div>
          <div className="w-[110px] shrink-0 space-y-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="40px" className="bg-ink-300 h-2" />{[0, 1, 2].map((i) => <div key={i} className="flex justify-between"><Bar w="44px" /><Bar w="24px" className="bg-ink-200" /></div>)}</div>
            <div className="rounded-xl bg-cream-100 border border-ink-100 p-2 space-y-1"><Bar w="36px" className="bg-ink-200" /><Bar /><Bar w="70%" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ModerationDashV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <PageHead breadcrumb actions />
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta={false} /><StatTile delta /><StatTile delta={false} /></div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-300 h-2" />{[{ t: "emerald" }, { t: "red" }, { t: "amber" }].map((r, i) => <div key={i} className="flex items-center gap-2 py-1 border-b border-ink-100 last:border-0"><span className={cn("size-2 rounded-full shrink-0", r.t === "emerald" ? "bg-emerald-400" : r.t === "red" ? "bg-red-400" : "bg-amber-400")} /><div className="flex-1 space-y-1"><Bar w="74%" /></div><Bar w="16px" className="h-1" /></div>)}</div>
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-0.5"><Bar w="44px" className="bg-ink-300 h-2 mb-1" /><LeaderRow rank={1} w="84%" hot /><LeaderRow rank={2} w="56%" /><LeaderRow rank={3} w="40%" /></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function EmailAutomationV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between"><div className="h-2.5 w-24 rounded bg-ink-300" /><Switch on /></div>
        <div className="flex-1 overflow-hidden p-3 flex flex-col items-center">
          <div className="w-[64%] flex flex-col items-center">
            <div className="w-full rounded-xl bg-rose-50 border border-rose-200 p-2 flex items-center gap-2"><span className="size-6 rounded-lg bg-rose-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="40%" className="bg-rose-400" /><Bar w="64%" /></div></div>
            <div className="h-3 w-px bg-ink-200" />
            <div className="w-full rounded-xl bg-white border border-ink-100 p-2 flex items-center gap-2"><span className="size-6 rounded-lg bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="44%" className="bg-ink-300" /><Bar w="70%" /></div></div>
            <div className="h-3 w-px bg-ink-200" />
            <div className="h-4 px-2 rounded-full bg-cream-200 inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-ink-300" /><Bar w="34px" className="h-1" /></div>
            <div className="h-3 w-px bg-ink-200" />
            <div className="w-full rounded-xl bg-white border border-ink-100 p-2 flex items-center gap-2"><span className="size-6 rounded-lg bg-cream-200 shrink-0" /><div className="flex-1 space-y-1"><Bar w="40%" className="bg-ink-300" /><Bar w="60%" /></div></div>
            <div className="h-3 w-px bg-ink-200" />
            <div className="size-6 rounded-full border border-dashed border-ink-200 inline-flex items-center justify-center"><span className="relative block size-2.5"><span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded bg-ink-400" /><span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded bg-ink-400" /></span></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AffiliatePayoutsV4() {
  const cols = "grid grid-cols-[1.6fr_50px_44px_44px] items-center gap-2 px-2.5";
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center justify-between">
          <div className="space-y-1"><div className="h-2.5 w-24 rounded bg-ink-300" /><Bar w="50px" /></div>
          <div className="rounded-lg bg-gradient-to-br from-rose-100 to-cream-100 border border-rose-100 px-2.5 py-1.5 flex items-center gap-2"><div className="text-right space-y-1"><Bar w="30px" className="bg-rose-300 h-1 ml-auto" /><div className="h-3 w-12 rounded bg-ink-300" /></div><div className="h-6 w-14 rounded-md bg-rose-400" /></div>
        </div>
        <div className="flex-1 overflow-hidden p-3">
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className={cn(cols, "h-7 bg-cream-100 border-b border-ink-100")}><Bar w="44px" className="bg-ink-200" /><Bar w="30px" className="bg-ink-200" /><Bar w="24px" className="bg-ink-200" /><span /></div>
            {[{ st: "ok" }, { st: "ok" }, { st: "pending" }, { st: "ok" }].map((r, i) => (
              <div key={i} className={cn(cols, "h-9 border-b border-ink-100 last:border-0")}>
                <div className="flex items-center gap-2 min-w-0"><div className="size-6 rounded-full bg-cream-200 shrink-0" /><div className="space-y-1 min-w-0"><Bar w="54px" className="bg-ink-300" /><Bar w="34px" /></div></div>
                <div className="h-2.5 w-9 rounded bg-ink-300" />
                <div className="h-3 px-1.5 rounded-full bg-cream-200 inline-flex items-center w-fit"><Bar w="18px" className="bg-ink-300 h-1" /></div>
                {r.st === "ok" ? <div className="h-6 w-12 rounded-md bg-rose-400 ml-auto" /> : <span className="ml-auto"><StatusPill tone="amber" /></span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function EventRecapV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 py-2 border-b border-ink-100 flex items-center gap-2"><div className="space-y-1"><div className="h-2.5 w-32 rounded bg-ink-300" /><Bar w="50px" /></div><div className="ml-auto h-6 w-16 rounded-md bg-white border border-ink-200" /></div>
        <div className="flex-1 overflow-hidden p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5"><StatTile delta={false} /><StatTile delta /><StatTile delta={false} /></div>
          <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
            <ChartCard bars={[8, 16, 22, 24, 23, 20, 14, 9]} h={48} />
            <div className="rounded-xl bg-white border border-ink-100 p-2.5 space-y-1.5"><Bar w="50px" className="bg-ink-300 h-2" />{[0, 1, 2].map((i) => <div key={i} className="flex gap-1.5"><span className="size-4 rounded-full bg-cream-200 shrink-0" /><div className="flex-1 space-y-0.5"><Bar w="40px" className="bg-ink-300 h-1" /><Bar w="86%" /></div></div>)}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Gallery category export
   ════════════════════════════════════════════════════════════════════════ */

type PdxCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const PAGE_EXPLORATION_CATEGORIES: PdxCategory[] = [
  {
    id: "pdx-app-shell",
    label: "Pages · App shell",
    icon: LayoutPanelLeft,
    blurb: "App-shell explorations — single, double, right-rail, and collapsed.",
    items: [
      { label: "V1 · Single sidebar", code: "ShellV1", node: <TaggedFrame tag="V1"><ShellV1 /></TaggedFrame> },
      { label: "V2 · Double + tabs", code: "ShellV2", node: <TaggedFrame tag="V2"><ShellV2 /></TaggedFrame> },
      { label: "V3 · Sidebar + right rail", code: "ShellV3", node: <TaggedFrame tag="V3"><ShellV3 /></TaggedFrame> },
      { label: "V4 · Collapsed rail", code: "ShellV4", node: <TaggedFrame tag="V4"><ShellV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-dashboard",
    label: "Pages · Dashboard",
    icon: LayoutPanelLeft,
    blurb: "Dashboard explorations — standard, hero-KPI, bento grid, dense.",
    items: [
      { label: "V1 · Standard KPIs + chart", code: "DashV1", node: <TaggedFrame tag="V1"><DashV1 /></TaggedFrame> },
      { label: "V2 · Hero KPI led", code: "DashV2", node: <TaggedFrame tag="V2"><DashV2 /></TaggedFrame> },
      { label: "V3 · Bento grid", code: "DashV3", node: <TaggedFrame tag="V3"><DashV3 /></TaggedFrame> },
      { label: "V4 · Dense analytics", code: "DashV4", node: <TaggedFrame tag="V4"><DashV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-data-table",
    label: "Pages · Data table",
    icon: LayoutPanelLeft,
    blurb: "Data-table explorations — classic, card rows, dense, minimal.",
    items: [
      { label: "V1 · Classic table", code: "TableV1", node: <TaggedFrame tag="V1"><TableV1 /></TaggedFrame> },
      { label: "V2 · Card rows", code: "TableV2", node: <TaggedFrame tag="V2"><TableV2 /></TaggedFrame> },
      { label: "V3 · Dense compact", code: "TableV3", node: <TaggedFrame tag="V3"><TableV3 /></TaggedFrame> },
      { label: "V4 · Minimal clean", code: "TableV4", node: <TaggedFrame tag="V4"><TableV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-list-detail",
    label: "Pages · List + detail",
    icon: LayoutPanelLeft,
    blurb: "Master-detail explorations — master-detail, 3-pane inbox, split preview.",
    items: [
      { label: "V1 · Master-detail", code: "ListDetailV1", node: <TaggedFrame tag="V1"><ListDetailV1 /></TaggedFrame> },
      { label: "V2 · Inbox 3-pane", code: "ListDetailV2", node: <TaggedFrame tag="V2"><ListDetailV2 /></TaggedFrame> },
      { label: "V3 · Split preview", code: "ListDetailV3", node: <TaggedFrame tag="V3"><ListDetailV3 /></TaggedFrame> },
      { label: "V4 · List + detail + meta", code: "ListDetailV4", node: <TaggedFrame tag="V4"><ListDetailV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-settings",
    label: "Pages · Settings",
    icon: LayoutPanelLeft,
    blurb: "Settings explorations — subnav + sections, two-column, centered cards.",
    items: [
      { label: "V1 · Subnav + sections", code: "SettingsV1", node: <TaggedFrame tag="V1"><SettingsV1 /></TaggedFrame> },
      { label: "V2 · Two-column + aside", code: "SettingsV2", node: <TaggedFrame tag="V2"><SettingsV2 /></TaggedFrame> },
      { label: "V3 · Centered cards", code: "SettingsV3", node: <TaggedFrame tag="V3"><SettingsV3 /></TaggedFrame> },
      { label: "V4 · Search console", code: "SettingsV4", node: <TaggedFrame tag="V4"><SettingsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-profile",
    label: "Pages · Profile",
    icon: LayoutPanelLeft,
    blurb: "Profile / detail explorations — cover + stats, sticky aside, tabs.",
    items: [
      { label: "V1 · Cover + stats", code: "ProfileV1", node: <TaggedFrame tag="V1"><ProfileV1 /></TaggedFrame> },
      { label: "V2 · Detail + sticky aside", code: "ProfileV2", node: <TaggedFrame tag="V2"><ProfileV2 /></TaggedFrame> },
      { label: "V3 · Cover + tabs", code: "ProfileV3", node: <TaggedFrame tag="V3"><ProfileV3 /></TaggedFrame> },
      { label: "V4 · Creator overview", code: "ProfileV4", node: <TaggedFrame tag="V4"><ProfileV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-kanban",
    label: "Pages · Kanban",
    icon: LayoutPanelLeft,
    blurb: "Board explorations — classic columns, swimlanes, compact WIP.",
    items: [
      { label: "V1 · Classic columns", code: "KanbanV1", node: <TaggedFrame tag="V1"><KanbanV1 /></TaggedFrame> },
      { label: "V2 · Swimlanes", code: "KanbanV2", node: <TaggedFrame tag="V2"><KanbanV2 /></TaggedFrame> },
      { label: "V3 · Compact WIP", code: "KanbanV3", node: <TaggedFrame tag="V3"><KanbanV3 /></TaggedFrame> },
      { label: "V4 · Grouped + WIP limits", code: "KanbanV4", node: <TaggedFrame tag="V4"><KanbanV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-feed",
    label: "Pages · Feed",
    icon: LayoutPanelLeft,
    blurb: "Feed / timeline explorations — centered, feed + rail, masonry.",
    items: [
      { label: "V1 · Centered feed", code: "FeedV1", node: <TaggedFrame tag="V1"><FeedV1 /></TaggedFrame> },
      { label: "V2 · Feed + right rail", code: "FeedV2", node: <TaggedFrame tag="V2"><FeedV2 /></TaggedFrame> },
      { label: "V3 · Masonry cards", code: "FeedV3", node: <TaggedFrame tag="V3"><FeedV3 /></TaggedFrame> },
      { label: "V4 · Grouped digest", code: "FeedV4", node: <TaggedFrame tag="V4"><FeedV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-calendar",
    label: "Pages · Calendar",
    icon: LayoutPanelLeft,
    blurb: "Calendar explorations — month grid, week columns, agenda list.",
    items: [
      { label: "V1 · Month grid", code: "CalendarMonthV1", node: <TaggedFrame tag="V1"><CalendarMonthV1 /></TaggedFrame> },
      { label: "V2 · Week columns", code: "CalendarWeekV2", node: <TaggedFrame tag="V2"><CalendarWeekV2 /></TaggedFrame> },
      { label: "V3 · Agenda list", code: "CalendarAgendaV3", node: <TaggedFrame tag="V3"><CalendarAgendaV3 /></TaggedFrame> },
      { label: "V4 · Day schedule", code: "CalendarScheduleV4", node: <TaggedFrame tag="V4"><CalendarScheduleV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-forms",
    label: "Pages · Forms",
    icon: LayoutPanelLeft,
    blurb: "Form explorations — single column, two-column + aside, stepper, review summary.",
    items: [
      { label: "V1 · Single column", code: "FormV1", node: <TaggedFrame tag="V1"><FormV1 /></TaggedFrame> },
      { label: "V2 · Two-column + aside", code: "FormV2", node: <TaggedFrame tag="V2"><FormV2 /></TaggedFrame> },
      { label: "V3 · Stepper", code: "FormV3", node: <TaggedFrame tag="V3"><FormV3 /></TaggedFrame> },
      { label: "V4 · Review summary", code: "FormV4", node: <TaggedFrame tag="V4"><FormV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-auth",
    label: "Pages · Auth",
    icon: LayoutPanelLeft,
    blurb: "Auth explorations — split panel, centered card, minimal.",
    items: [
      { label: "V1 · Split panel", code: "AuthV1", node: <TaggedFrame tag="V1"><AuthV1 /></TaggedFrame> },
      { label: "V2 · Centered card", code: "AuthV2", node: <TaggedFrame tag="V2"><AuthV2 /></TaggedFrame> },
      { label: "V3 · Minimal", code: "AuthV3", node: <TaggedFrame tag="V3"><AuthV3 /></TaggedFrame> },
      { label: "V4 · Verification code", code: "AuthV4", node: <TaggedFrame tag="V4"><AuthV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-pricing",
    label: "Pages · Pricing",
    icon: LayoutPanelLeft,
    blurb: "Pricing explorations — three-tier, highlighted + toggle, comparison matrix.",
    items: [
      { label: "V1 · Three-tier", code: "PricingV1", node: <TaggedFrame tag="V1"><PricingV1 /></TaggedFrame> },
      { label: "V2 · Highlighted + toggle", code: "PricingV2", node: <TaggedFrame tag="V2"><PricingV2 /></TaggedFrame> },
      { label: "V3 · Comparison matrix", code: "PricingV3", node: <TaggedFrame tag="V3"><PricingV3 /></TaggedFrame> },
      { label: "V4 · Single plan + perks", code: "PricingV4", node: <TaggedFrame tag="V4"><PricingV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-empty",
    label: "Pages · Empty & onboarding",
    icon: LayoutPanelLeft,
    blurb: "Empty-state & onboarding explorations — empty state, fullscreen steps, checklist.",
    items: [
      { label: "V1 · Empty state", code: "EmptyV1", node: <TaggedFrame tag="V1"><EmptyV1 /></TaggedFrame> },
      { label: "V2 · Fullscreen steps", code: "OnboardingV2", node: <TaggedFrame tag="V2"><OnboardingV2 /></TaggedFrame> },
      { label: "V3 · Checklist", code: "OnboardingChecklistV3", node: <TaggedFrame tag="V3"><OnboardingChecklistV3 /></TaggedFrame> },
      { label: "V4 · Start from template", code: "EmptyTemplatesV4", node: <TaggedFrame tag="V4"><EmptyTemplatesV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-grid",
    label: "Pages · Card grid & files",
    icon: LayoutPanelLeft,
    blurb: "Gallery & browser explorations — card grid, masonry media, file browser.",
    items: [
      { label: "V1 · Card grid", code: "GridV1", node: <TaggedFrame tag="V1"><GridV1 /></TaggedFrame> },
      { label: "V2 · Masonry media", code: "MasonryV2", node: <TaggedFrame tag="V2"><MasonryV2 /></TaggedFrame> },
      { label: "V3 · File browser", code: "FileBrowserV3", node: <TaggedFrame tag="V3"><FileBrowserV3 /></TaggedFrame> },
      { label: "V4 · Grid + preview", code: "GridQuickLookV4", node: <TaggedFrame tag="V4"><GridQuickLookV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-chat",
    label: "Pages · Chat & messaging",
    icon: LayoutPanelLeft,
    blurb: "Messaging explorations — two-pane, three-pane inbox, thread-focused.",
    items: [
      { label: "V1 · Two-pane", code: "ChatV1", node: <TaggedFrame tag="V1"><ChatV1 /></TaggedFrame> },
      { label: "V2 · Three-pane inbox", code: "ChatV2", node: <TaggedFrame tag="V2"><ChatV2 /></TaggedFrame> },
      { label: "V3 · Thread-focused", code: "ChatV3", node: <TaggedFrame tag="V3"><ChatV3 /></TaggedFrame> },
      { label: "V4 · Assistant + suggestions", code: "ChatAssistantV4", node: <TaggedFrame tag="V4"><ChatAssistantV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-document",
    label: "Pages · Document & detail",
    icon: LayoutPanelLeft,
    blurb: "Document explorations — invoice document, article / reading, record detail + sticky aside.",
    items: [
      { label: "V1 · Invoice document", code: "DocInvoiceV1", node: <TaggedFrame tag="V1"><DocInvoiceV1 /></TaggedFrame> },
      { label: "V2 · Article / reading", code: "DocArticleV2", node: <TaggedFrame tag="V2"><DocArticleV2 /></TaggedFrame> },
      { label: "V3 · Record + sticky aside", code: "DocRecordV3", node: <TaggedFrame tag="V3"><DocRecordV3 /></TaggedFrame> },
      { label: "V4 · Document + comments", code: "DocCommentsV4", node: <TaggedFrame tag="V4"><DocCommentsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-activity",
    label: "Pages · Notifications & activity",
    icon: LayoutPanelLeft,
    blurb: "Notification & activity explorations — notification center, activity timeline, list + preview.",
    items: [
      { label: "V1 · Notification center", code: "NotifCenterV1", node: <TaggedFrame tag="V1"><NotifCenterV1 /></TaggedFrame> },
      { label: "V2 · Activity timeline", code: "ActivityTimelineV2", node: <TaggedFrame tag="V2"><ActivityTimelineV2 /></TaggedFrame> },
      { label: "V3 · List + preview", code: "NotifSplitV3", node: <TaggedFrame tag="V3"><NotifSplitV3 /></TaggedFrame> },
      { label: "V4 · Filtered feed", code: "NotifActivityV4", node: <TaggedFrame tag="V4"><NotifActivityV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-error",
    label: "Pages · Error & status",
    icon: LayoutPanelLeft,
    blurb: "Error & status explorations — 404 not found, maintenance, access denied.",
    items: [
      { label: "V1 · 404 not found", code: "Error404V1", node: <TaggedFrame tag="V1"><Error404V1 /></TaggedFrame> },
      { label: "V2 · Maintenance", code: "MaintenanceV2", node: <TaggedFrame tag="V2"><MaintenanceV2 /></TaggedFrame> },
      { label: "V3 · Access denied", code: "AccessDeniedV3", node: <TaggedFrame tag="V3"><AccessDeniedV3 /></TaggedFrame> },
      { label: "V4 · Offline / retry", code: "ErrorOfflineV4", node: <TaggedFrame tag="V4"><ErrorOfflineV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-landing",
    label: "Pages · Marketing landing",
    icon: LayoutPanelLeft,
    blurb: "Marketing landing explorations — hero + features, hero split + logos, centered + CTA band.",
    items: [
      { label: "V1 · Hero + features", code: "LandingV1", node: <TaggedFrame tag="V1"><LandingV1 /></TaggedFrame> },
      { label: "V2 · Hero split + logos", code: "LandingV2", node: <TaggedFrame tag="V2"><LandingV2 /></TaggedFrame> },
      { label: "V3 · Centered + CTA band", code: "LandingV3", node: <TaggedFrame tag="V3"><LandingV3 /></TaggedFrame> },
      { label: "V4 · Alternating sections", code: "LandingSectionsV4", node: <TaggedFrame tag="V4"><LandingSectionsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-search",
    label: "Pages · Search results",
    icon: LayoutPanelLeft,
    blurb: "Search-results explorations — list results, results + filters, grid results.",
    items: [
      { label: "V1 · List results", code: "SearchListV1", node: <TaggedFrame tag="V1"><SearchListV1 /></TaggedFrame> },
      { label: "V2 · Results + filters", code: "SearchFiltersV2", node: <TaggedFrame tag="V2"><SearchFiltersV2 /></TaggedFrame> },
      { label: "V3 · Grid results", code: "SearchGridV3", node: <TaggedFrame tag="V3"><SearchGridV3 /></TaggedFrame> },
      { label: "V4 · Tabbed results", code: "SearchTabsV4", node: <TaggedFrame tag="V4"><SearchTabsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-workspace",
    label: "Pages · Split workspace",
    icon: LayoutPanelLeft,
    blurb: "Split-workspace explorations — map + list, multi-pane workspace, editor + live preview.",
    items: [
      { label: "V1 · Map + list", code: "MapListV1", node: <TaggedFrame tag="V1"><MapListV1 /></TaggedFrame> },
      { label: "V2 · Multi-pane workspace", code: "WorkspaceV2", node: <TaggedFrame tag="V2"><WorkspaceV2 /></TaggedFrame> },
      { label: "V3 · Editor + live preview", code: "EditorPreviewV3", node: <TaggedFrame tag="V3"><EditorPreviewV3 /></TaggedFrame> },
      { label: "V4 · Canvas + tracks", code: "WorkspaceTracksV4", node: <TaggedFrame tag="V4"><WorkspaceTracksV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-report",
    label: "Pages · Analytics report",
    icon: LayoutPanelLeft,
    blurb: "Analytics-report explorations — KPI band + charts, funnel + cohort, single-metric deep-dive.",
    items: [
      { label: "V1 · KPI band + charts", code: "ReportKpiV1", node: <TaggedFrame tag="V1"><ReportKpiV1 /></TaggedFrame> },
      { label: "V2 · Funnel + cohort", code: "ReportFunnelV2", node: <TaggedFrame tag="V2"><ReportFunnelV2 /></TaggedFrame> },
      { label: "V3 · Single-metric deep-dive", code: "ReportDeepDiveV3", node: <TaggedFrame tag="V3"><ReportDeepDiveV3 /></TaggedFrame> },
      { label: "V4 · Scorecard grid", code: "ReportScorecardV4", node: <TaggedFrame tag="V4"><ReportScorecardV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-checkout",
    label: "Pages · Checkout & cart",
    icon: LayoutPanelLeft,
    blurb: "Checkout explorations — cart + summary, multi-step checkout, single-page checkout.",
    items: [
      { label: "V1 · Cart + summary", code: "CartV1", node: <TaggedFrame tag="V1"><CartV1 /></TaggedFrame> },
      { label: "V2 · Multi-step checkout", code: "CheckoutStepsV2", node: <TaggedFrame tag="V2"><CheckoutStepsV2 /></TaggedFrame> },
      { label: "V3 · Single-page checkout", code: "CheckoutSingleV3", node: <TaggedFrame tag="V3"><CheckoutSingleV3 /></TaggedFrame> },
      { label: "V4 · Cart drawer", code: "CheckoutDrawerV4", node: <TaggedFrame tag="V4"><CheckoutDrawerV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-docs",
    label: "Pages · Help & docs",
    icon: LayoutPanelLeft,
    blurb: "Help & docs explorations — docs sidebar + article, help center landing, FAQ accordion.",
    items: [
      { label: "V1 · Docs sidebar + article", code: "DocsV1", node: <TaggedFrame tag="V1"><DocsV1 /></TaggedFrame> },
      { label: "V2 · Help center landing", code: "HelpCenterV2", node: <TaggedFrame tag="V2"><HelpCenterV2 /></TaggedFrame> },
      { label: "V3 · FAQ accordion", code: "FaqV3", node: <TaggedFrame tag="V3"><FaqV3 /></TaggedFrame> },
      { label: "V4 · Guided tutorial", code: "DocsGuideV4", node: <TaggedFrame tag="V4"><DocsGuideV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-billing",
    label: "Pages · Billing & subscription",
    icon: LayoutPanelLeft,
    blurb: "Billing explorations — plan + usage + invoices, payment methods + history, usage-focused.",
    items: [
      { label: "V1 · Plan + usage + invoices", code: "BillingPlanV1", node: <TaggedFrame tag="V1"><BillingPlanV1 /></TaggedFrame> },
      { label: "V2 · Payment methods + history", code: "BillingMethodsV2", node: <TaggedFrame tag="V2"><BillingMethodsV2 /></TaggedFrame> },
      { label: "V3 · Usage-focused", code: "BillingUsageV3", node: <TaggedFrame tag="V3"><BillingUsageV3 /></TaggedFrame> },
      { label: "V4 · Invoices table", code: "BillingInvoicesV4", node: <TaggedFrame tag="V4"><BillingInvoicesV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-members",
    label: "Pages · Team & members",
    icon: LayoutPanelLeft,
    blurb: "Team & members explorations — table + roles, member cards, invite + pending.",
    items: [
      { label: "V1 · Table + roles", code: "MembersTableV1", node: <TaggedFrame tag="V1"><MembersTableV1 /></TaggedFrame> },
      { label: "V2 · Member cards", code: "MembersCardsV2", node: <TaggedFrame tag="V2"><MembersCardsV2 /></TaggedFrame> },
      { label: "V3 · Invite + pending", code: "MembersInviteV3", node: <TaggedFrame tag="V3"><MembersInviteV3 /></TaggedFrame> },
      { label: "V4 · Roles & permissions", code: "MembersRolesV4", node: <TaggedFrame tag="V4"><MembersRolesV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-modals",
    label: "Pages · Modals & dialogs",
    icon: LayoutPanelLeft,
    blurb: "Overlay explorations — confirm dialog, form modal, upgrade / paywall.",
    items: [
      { label: "V1 · Confirm dialog", code: "ConfirmDialogV1", node: <TaggedFrame tag="V1"><ConfirmDialogV1 /></TaggedFrame> },
      { label: "V2 · Form modal", code: "FormModalV2", node: <TaggedFrame tag="V2"><FormModalV2 /></TaggedFrame> },
      { label: "V3 · Upgrade / paywall", code: "UpgradeModalV3", node: <TaggedFrame tag="V3"><UpgradeModalV3 /></TaggedFrame> },
      { label: "V4 · Side sheet", code: "SideSheetV4", node: <TaggedFrame tag="V4"><SideSheetV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-tabs",
    label: "Pages · Tabbed detail",
    icon: LayoutPanelLeft,
    blurb: "Tabbed-detail explorations — top tabs, side tabs, segmented pills.",
    items: [
      { label: "V1 · Top tabs", code: "TabsTopV1", node: <TaggedFrame tag="V1"><TabsTopV1 /></TaggedFrame> },
      { label: "V2 · Side tabs", code: "TabsSideV2", node: <TaggedFrame tag="V2"><TabsSideV2 /></TaggedFrame> },
      { label: "V3 · Segmented pills", code: "TabsSegmentedV3", node: <TaggedFrame tag="V3"><TabsSegmentedV3 /></TaggedFrame> },
      { label: "V4 · Hero + sticky tabs", code: "TabsHeroV4", node: <TaggedFrame tag="V4"><TabsHeroV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-media",
    label: "Pages · Media & gallery detail",
    icon: LayoutPanelLeft,
    blurb: "Media-detail explorations — lightbox, split media + info, album header + grid.",
    items: [
      { label: "V1 · Lightbox", code: "LightboxV1", node: <TaggedFrame tag="V1"><LightboxV1 /></TaggedFrame> },
      { label: "V2 · Split media + info", code: "MediaSplitV2", node: <TaggedFrame tag="V2"><MediaSplitV2 /></TaggedFrame> },
      { label: "V3 · Album header + grid", code: "AlbumV3", node: <TaggedFrame tag="V3"><AlbumV3 /></TaggedFrame> },
      { label: "V4 · Reel / story viewer", code: "MediaReelV4", node: <TaggedFrame tag="V4"><MediaReelV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-bento",
    label: "Pages · Bento home",
    icon: LayoutPanelLeft,
    blurb: "Customizable-home explorations — mixed-size bento, widget board + add, greeting + focus.",
    items: [
      { label: "V1 · Mixed-size bento", code: "BentoV1", node: <TaggedFrame tag="V1"><BentoV1 /></TaggedFrame> },
      { label: "V2 · Widget board + add", code: "WidgetBoardV2", node: <TaggedFrame tag="V2"><WidgetBoardV2 /></TaggedFrame> },
      { label: "V3 · Greeting + focus", code: "GreetingHomeV3", node: <TaggedFrame tag="V3"><GreetingHomeV3 /></TaggedFrame> },
      { label: "V4 · Goals & streaks", code: "BentoGoalsV4", node: <TaggedFrame tag="V4"><BentoGoalsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-community",
    label: "Pages · Community & leaderboard",
    icon: LayoutPanelLeft,
    blurb: "Community explorations — leaderboard table, feed + leaderboard rail, challenges.",
    items: [
      { label: "V1 · Leaderboard table", code: "LeaderboardV1", node: <TaggedFrame tag="V1"><LeaderboardV1 /></TaggedFrame> },
      { label: "V2 · Feed + leaderboard rail", code: "CommunityFeedV2", node: <TaggedFrame tag="V2"><CommunityFeedV2 /></TaggedFrame> },
      { label: "V3 · Challenges", code: "ChallengesV3", node: <TaggedFrame tag="V3"><ChallengesV3 /></TaggedFrame> },
      { label: "V4 · Spaces / groups", code: "CommunitySpacesV4", node: <TaggedFrame tag="V4"><CommunitySpacesV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-inbox",
    label: "Pages · Inbox & triage",
    icon: LayoutPanelLeft,
    blurb: "Inbox explorations — list + reading pane, bulk-select toolbar, priority split.",
    items: [
      { label: "V1 · List + reading pane", code: "InboxReadV1", node: <TaggedFrame tag="V1"><InboxReadV1 /></TaggedFrame> },
      { label: "V2 · Bulk-select toolbar", code: "InboxBulkV2", node: <TaggedFrame tag="V2"><InboxBulkV2 /></TaggedFrame> },
      { label: "V3 · Priority split", code: "InboxPriorityV3", node: <TaggedFrame tag="V3"><InboxPriorityV3 /></TaggedFrame> },
      { label: "V4 · Folders + compact", code: "InboxFoldersV4", node: <TaggedFrame tag="V4"><InboxFoldersV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-tracker",
    label: "Pages · Order & progress tracker",
    icon: LayoutPanelLeft,
    blurb: "Tracker explorations — horizontal step tracker, vertical timeline, status card + history.",
    items: [
      { label: "V1 · Horizontal tracker", code: "TrackerHorizontalV1", node: <TaggedFrame tag="V1"><TrackerHorizontalV1 /></TaggedFrame> },
      { label: "V2 · Vertical timeline", code: "TrackerVerticalV2", node: <TaggedFrame tag="V2"><TrackerVerticalV2 /></TaggedFrame> },
      { label: "V3 · Status card + history", code: "TrackerStatusV3", node: <TaggedFrame tag="V3"><TrackerStatusV3 /></TaggedFrame> },
      { label: "V4 · Map + stops", code: "TrackerMapV4", node: <TaggedFrame tag="V4"><TrackerMapV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-reviews",
    label: "Pages · Reviews & ratings",
    icon: LayoutPanelLeft,
    blurb: "Reviews explorations — summary + distribution + list, review cards, breakdown + filters.",
    items: [
      { label: "V1 · Summary + distribution", code: "ReviewsSummaryV1", node: <TaggedFrame tag="V1"><ReviewsSummaryV1 /></TaggedFrame> },
      { label: "V2 · Review cards", code: "ReviewsCardsV2", node: <TaggedFrame tag="V2"><ReviewsCardsV2 /></TaggedFrame> },
      { label: "V3 · Breakdown + filters", code: "ReviewsBreakdownV3", node: <TaggedFrame tag="V3"><ReviewsBreakdownV3 /></TaggedFrame> },
      { label: "V4 · Ratings trend", code: "ReviewsTrendV4", node: <TaggedFrame tag="V4"><ReviewsTrendV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-booking",
    label: "Pages · Booking & scheduling",
    icon: LayoutPanelLeft,
    blurb: "Booking explorations — slot picker, service list + calendar, confirmation summary.",
    items: [
      { label: "V1 · Slot picker", code: "BookingSlotV1", node: <TaggedFrame tag="V1"><BookingSlotV1 /></TaggedFrame> },
      { label: "V2 · Service list + calendar", code: "BookingServiceV2", node: <TaggedFrame tag="V2"><BookingServiceV2 /></TaggedFrame> },
      { label: "V3 · Confirmation summary", code: "BookingConfirmV3", node: <TaggedFrame tag="V3"><BookingConfirmV3 /></TaggedFrame> },
      { label: "V4 · Weekly availability", code: "BookingWeekV4", node: <TaggedFrame tag="V4"><BookingWeekV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-creator",
    label: "Pages · Public creator page",
    icon: LayoutPanelLeft,
    blurb: "Public creator-page explorations — link-in-bio, media kit, portfolio grid.",
    items: [
      { label: "V1 · Link-in-bio", code: "LinkInBioV1", node: <TaggedFrame tag="V1"><LinkInBioV1 /></TaggedFrame> },
      { label: "V2 · Media kit", code: "MediaKitV2", node: <TaggedFrame tag="V2"><MediaKitV2 /></TaggedFrame> },
      { label: "V3 · Portfolio grid", code: "PortfolioGridV3", node: <TaggedFrame tag="V3"><PortfolioGridV3 /></TaggedFrame> },
      { label: "V4 · Storefront", code: "CreatorStorefrontV4", node: <TaggedFrame tag="V4"><CreatorStorefrontV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-survey",
    label: "Pages · Survey & quiz",
    icon: LayoutPanelLeft,
    blurb: "Survey & quiz explorations — single question, multi-question card, results / score.",
    items: [
      { label: "V1 · Single question", code: "SurveySingleV1", node: <TaggedFrame tag="V1"><SurveySingleV1 /></TaggedFrame> },
      { label: "V2 · Multi-question card", code: "SurveyCardV2", node: <TaggedFrame tag="V2"><SurveyCardV2 /></TaggedFrame> },
      { label: "V3 · Results / score", code: "SurveyResultV3", node: <TaggedFrame tag="V3"><SurveyResultV3 /></TaggedFrame> },
      { label: "V4 · NPS scale", code: "SurveyNpsV4", node: <TaggedFrame tag="V4"><SurveyNpsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-import",
    label: "Pages · Data import & upload",
    icon: LayoutPanelLeft,
    blurb: "Import explorations — dropzone, column mapping, progress / results.",
    items: [
      { label: "V1 · Dropzone", code: "ImportDropV1", node: <TaggedFrame tag="V1"><ImportDropV1 /></TaggedFrame> },
      { label: "V2 · Column mapping", code: "ImportMapV2", node: <TaggedFrame tag="V2"><ImportMapV2 /></TaggedFrame> },
      { label: "V3 · Progress / results", code: "ImportProgressV3", node: <TaggedFrame tag="V3"><ImportProgressV3 /></TaggedFrame> },
      { label: "V4 · Source picker", code: "ImportSourceV4", node: <TaggedFrame tag="V4"><ImportSourceV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-compare",
    label: "Pages · Comparison",
    icon: LayoutPanelLeft,
    blurb: "Comparison explorations — grouped plan comparison, product vs product, spec highlight.",
    items: [
      { label: "V1 · Grouped comparison", code: "CompareGroupedV1", node: <TaggedFrame tag="V1"><CompareGroupedV1 /></TaggedFrame> },
      { label: "V2 · Product vs product", code: "CompareVsV2", node: <TaggedFrame tag="V2"><CompareVsV2 /></TaggedFrame> },
      { label: "V3 · Spec highlight", code: "CompareSpecV3", node: <TaggedFrame tag="V3"><CompareSpecV3 /></TaggedFrame> },
      { label: "V4 · Card comparison", code: "ComparisonCardsV4", node: <TaggedFrame tag="V4"><ComparisonCardsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-gantt",
    label: "Pages · Timeline & Gantt",
    icon: LayoutPanelLeft,
    blurb: "Timeline explorations — horizontal gantt, resource rows, milestone timeline.",
    items: [
      { label: "V1 · Horizontal gantt", code: "GanttV1", node: <TaggedFrame tag="V1"><GanttV1 /></TaggedFrame> },
      { label: "V2 · Resource rows", code: "GanttResourceV2", node: <TaggedFrame tag="V2"><GanttResourceV2 /></TaggedFrame> },
      { label: "V3 · Milestone timeline", code: "MilestoneV3", node: <TaggedFrame tag="V3"><MilestoneV3 /></TaggedFrame> },
      { label: "V4 · Quarterly roadmap", code: "GanttRoadmapV4", node: <TaggedFrame tag="V4"><GanttRoadmapV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-heatmap",
    label: "Pages · Activity heatmap & streaks",
    icon: LayoutPanelLeft,
    blurb: "Activity explorations — contribution heatmap, calendar heatmap, streak rings.",
    items: [
      { label: "V1 · Contribution heatmap", code: "HeatmapV1", node: <TaggedFrame tag="V1"><HeatmapV1 /></TaggedFrame> },
      { label: "V2 · Calendar heatmap", code: "CalendarHeatmapV2", node: <TaggedFrame tag="V2"><CalendarHeatmapV2 /></TaggedFrame> },
      { label: "V3 · Streak rings", code: "StreakRingsV3", node: <TaggedFrame tag="V3"><StreakRingsV3 /></TaggedFrame> },
      { label: "V4 · Best time to post", code: "HeatmapBestTimeV4", node: <TaggedFrame tag="V4"><HeatmapBestTimeV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-wizard",
    label: "Pages · Wizard (full-page)",
    icon: LayoutPanelLeft,
    blurb: "Wizard explorations — horizontal numbered, vertical steps + footer, choice step.",
    items: [
      { label: "V1 · Horizontal numbered", code: "WizardHorizontalV1", node: <TaggedFrame tag="V1"><WizardHorizontalV1 /></TaggedFrame> },
      { label: "V2 · Vertical steps + footer", code: "WizardVerticalV2", node: <TaggedFrame tag="V2"><WizardVerticalV2 /></TaggedFrame> },
      { label: "V3 · Choice step", code: "WizardChoiceV3", node: <TaggedFrame tag="V3"><WizardChoiceV3 /></TaggedFrame> },
      { label: "V4 · Steps + live summary", code: "WizardSummaryV4", node: <TaggedFrame tag="V4"><WizardSummaryV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-prefs",
    label: "Pages · Notification preferences",
    icon: LayoutPanelLeft,
    blurb: "Preferences explorations — channel matrix, grouped toggles, per-category cards.",
    items: [
      { label: "V1 · Channel matrix", code: "PrefsMatrixV1", node: <TaggedFrame tag="V1"><PrefsMatrixV1 /></TaggedFrame> },
      { label: "V2 · Grouped toggles", code: "PrefsGroupedV2", node: <TaggedFrame tag="V2"><PrefsGroupedV2 /></TaggedFrame> },
      { label: "V3 · Per-category cards", code: "PrefsCardsV3", node: <TaggedFrame tag="V3"><PrefsCardsV3 /></TaggedFrame> },
      { label: "V4 · Digest schedule", code: "PrefsDigestV4", node: <TaggedFrame tag="V4"><PrefsDigestV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-calc",
    label: "Pages · Usage calculator",
    icon: LayoutPanelLeft,
    blurb: "Calculator explorations — sliders + live total, add-on toggles, seats stepper.",
    items: [
      { label: "V1 · Sliders + live total", code: "CalcSlidersV1", node: <TaggedFrame tag="V1"><CalcSlidersV1 /></TaggedFrame> },
      { label: "V2 · Add-on toggles", code: "CalcAddonsV2", node: <TaggedFrame tag="V2"><CalcAddonsV2 /></TaggedFrame> },
      { label: "V3 · Seats stepper", code: "CalcSeatsV3", node: <TaggedFrame tag="V3"><CalcSeatsV3 /></TaggedFrame> },
      { label: "V4 · ROI / savings", code: "CalcRoiV4", node: <TaggedFrame tag="V4"><CalcRoiV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-channels",
    label: "Pages · Connected accounts",
    icon: LayoutPanelLeft,
    blurb: "Connected-account explorations — channel cards, list + sync status, channel detail.",
    items: [
      { label: "V1 · Channel cards", code: "ChannelsGridV1", node: <TaggedFrame tag="V1"><ChannelsGridV1 /></TaggedFrame> },
      { label: "V2 · List + sync status", code: "ChannelsListV2", node: <TaggedFrame tag="V2"><ChannelsListV2 /></TaggedFrame> },
      { label: "V3 · Channel detail", code: "ChannelDetailV3", node: <TaggedFrame tag="V3"><ChannelDetailV3 /></TaggedFrame> },
      { label: "V4 · Cross-post composer", code: "ChannelsComposerV4", node: <TaggedFrame tag="V4"><ChannelsComposerV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-account",
    label: "Pages · Account & security",
    icon: LayoutPanelLeft,
    blurb: "Account explorations — profile + password, sessions / devices, 2FA + danger zone.",
    items: [
      { label: "V1 · Profile + password", code: "AccountProfileV1", node: <TaggedFrame tag="V1"><AccountProfileV1 /></TaggedFrame> },
      { label: "V2 · Sessions / devices", code: "AccountSessionsV2", node: <TaggedFrame tag="V2"><AccountSessionsV2 /></TaggedFrame> },
      { label: "V3 · 2FA + danger zone", code: "AccountDangerV3", node: <TaggedFrame tag="V3"><AccountDangerV3 /></TaggedFrame> },
      { label: "V4 · Login methods", code: "AccountLoginsV4", node: <TaggedFrame tag="V4"><AccountLoginsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-tags",
    label: "Pages · Tag & label manager",
    icon: LayoutPanelLeft,
    blurb: "Tag-manager explorations — chip list + add, tags table, nested categories.",
    items: [
      { label: "V1 · Chip list + add", code: "TagChipsV1", node: <TaggedFrame tag="V1"><TagChipsV1 /></TaggedFrame> },
      { label: "V2 · Tags table", code: "TagsTableV2", node: <TaggedFrame tag="V2"><TagsTableV2 /></TaggedFrame> },
      { label: "V3 · Nested categories", code: "TagTreeV3", node: <TaggedFrame tag="V3"><TagTreeV3 /></TaggedFrame> },
      { label: "V4 · Tag detail + items", code: "TagDetailV4", node: <TaggedFrame tag="V4"><TagDetailV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-changelog",
    label: "Pages · Changelog & what's new",
    icon: LayoutPanelLeft,
    blurb: "Changelog explorations — release timeline, versioned cards, announcement.",
    items: [
      { label: "V1 · Release timeline", code: "ChangelogTimelineV1", node: <TaggedFrame tag="V1"><ChangelogTimelineV1 /></TaggedFrame> },
      { label: "V2 · Versioned cards", code: "ChangelogCardsV2", node: <TaggedFrame tag="V2"><ChangelogCardsV2 /></TaggedFrame> },
      { label: "V3 · Announcement", code: "AnnouncementV3", node: <TaggedFrame tag="V3"><AnnouncementV3 /></TaggedFrame> },
      { label: "V4 · Roadmap columns", code: "ChangelogRoadmapV4", node: <TaggedFrame tag="V4"><ChangelogRoadmapV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-consent",
    label: "Pages · Consent & privacy",
    icon: LayoutPanelLeft,
    blurb: "Consent explorations — cookie banner, preferences modal, privacy center.",
    items: [
      { label: "V1 · Cookie banner", code: "CookieBannerV1", node: <TaggedFrame tag="V1"><CookieBannerV1 /></TaggedFrame> },
      { label: "V2 · Preferences modal", code: "ConsentModalV2", node: <TaggedFrame tag="V2"><ConsentModalV2 /></TaggedFrame> },
      { label: "V3 · Privacy center", code: "PrivacyCenterV3", node: <TaggedFrame tag="V3"><PrivacyCenterV3 /></TaggedFrame> },
      { label: "V4 · Permissions request", code: "ConsentPermissionsV4", node: <TaggedFrame tag="V4"><ConsentPermissionsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-command",
    label: "Pages · Command palette",
    icon: LayoutPanelLeft,
    blurb: "Overlay explorations — ⌘K command palette, quick-add, global search.",
    items: [
      { label: "V1 · Command palette", code: "CommandPaletteV1", node: <TaggedFrame tag="V1"><CommandPaletteV1 /></TaggedFrame> },
      { label: "V2 · Quick-add", code: "QuickAddV2", node: <TaggedFrame tag="V2"><QuickAddV2 /></TaggedFrame> },
      { label: "V3 · Global search", code: "GlobalSearchV3", node: <TaggedFrame tag="V3"><GlobalSearchV3 /></TaggedFrame> },
      { label: "V4 · Palette + preview", code: "CommandPreviewV4", node: <TaggedFrame tag="V4"><CommandPreviewV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-filters",
    label: "Pages · Filters & faceted",
    icon: LayoutPanelLeft,
    blurb: "Filter explorations — filter drawer, top filter bar + chips, advanced builder.",
    items: [
      { label: "V1 · Filter drawer", code: "FilterDrawerV1", node: <TaggedFrame tag="V1"><FilterDrawerV1 /></TaggedFrame> },
      { label: "V2 · Filter bar + chips", code: "FilterBarV2", node: <TaggedFrame tag="V2"><FilterBarV2 /></TaggedFrame> },
      { label: "V3 · Advanced builder", code: "FilterBuilderV3", node: <TaggedFrame tag="V3"><FilterBuilderV3 /></TaggedFrame> },
      { label: "V4 · Saved views", code: "FilterSavedViewsV4", node: <TaggedFrame tag="V4"><FilterSavedViewsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-scaffold",
    label: "Pages · Page layouts",
    icon: LayoutPanelLeft,
    blurb: "Foundational page scaffolds — standard, two-column + aside, centered narrow, sections.",
    items: [
      { label: "V1 · Standard", code: "PageStandardV1", node: <TaggedFrame tag="V1"><PageStandardV1 /></TaggedFrame> },
      { label: "V2 · Two-column + aside", code: "PageTwoColV2", node: <TaggedFrame tag="V2"><PageTwoColV2 /></TaggedFrame> },
      { label: "V3 · Centered narrow", code: "PageCenteredV3", node: <TaggedFrame tag="V3"><PageCenteredV3 /></TaggedFrame> },
      { label: "V4 · Sections", code: "PageSectionsV4", node: <TaggedFrame tag="V4"><PageSectionsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-program",
    label: "Pages · Program & course",
    icon: LayoutPanelLeft,
    blurb: "Program explorations — curriculum builder, lesson player, program overview.",
    items: [
      { label: "V1 · Curriculum builder", code: "ProgramCurriculumV1", node: <TaggedFrame tag="V1"><ProgramCurriculumV1 /></TaggedFrame> },
      { label: "V2 · Lesson player", code: "ProgramPlayerV2", node: <TaggedFrame tag="V2"><ProgramPlayerV2 /></TaggedFrame> },
      { label: "V3 · Program overview", code: "ProgramOverviewV3", node: <TaggedFrame tag="V3"><ProgramOverviewV3 /></TaggedFrame> },
      { label: "V4 · Students roster", code: "ProgramStudentsV4", node: <TaggedFrame tag="V4"><ProgramStudentsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-scheduler",
    label: "Pages · Content scheduler",
    icon: LayoutPanelLeft,
    blurb: "Scheduler explorations — week board, publishing queue, content calendar.",
    items: [
      { label: "V1 · Week board", code: "SchedulerWeekV1", node: <TaggedFrame tag="V1"><SchedulerWeekV1 /></TaggedFrame> },
      { label: "V2 · Publishing queue", code: "SchedulerQueueV2", node: <TaggedFrame tag="V2"><SchedulerQueueV2 /></TaggedFrame> },
      { label: "V3 · Content calendar", code: "SchedulerCalendarV3", node: <TaggedFrame tag="V3"><SchedulerCalendarV3 /></TaggedFrame> },
      { label: "V4 · Schedule composer", code: "SchedulerComposeV4", node: <TaggedFrame tag="V4"><SchedulerComposeV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-deals",
    label: "Pages · Brand deals",
    icon: LayoutPanelLeft,
    blurb: "Brand-deal explorations — pipeline board, deals table, deal detail.",
    items: [
      { label: "V1 · Pipeline board", code: "DealsPipelineV1", node: <TaggedFrame tag="V1"><DealsPipelineV1 /></TaggedFrame> },
      { label: "V2 · Deals table", code: "DealsTableV2", node: <TaggedFrame tag="V2"><DealsTableV2 /></TaggedFrame> },
      { label: "V3 · Deal detail", code: "DealDetailV3", node: <TaggedFrame tag="V3"><DealDetailV3 /></TaggedFrame> },
      { label: "V4 · Deals overview", code: "DealsOverviewV4", node: <TaggedFrame tag="V4"><DealsOverviewV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-revenue",
    label: "Pages · Revenue & earnings",
    icon: LayoutPanelLeft,
    blurb: "Revenue explorations — earnings overview, payouts, streams breakdown.",
    items: [
      { label: "V1 · Revenue overview", code: "RevenueOverviewV1", node: <TaggedFrame tag="V1"><RevenueOverviewV1 /></TaggedFrame> },
      { label: "V2 · Payouts", code: "RevenuePayoutsV2", node: <TaggedFrame tag="V2"><RevenuePayoutsV2 /></TaggedFrame> },
      { label: "V3 · Streams breakdown", code: "RevenueStreamsV3", node: <TaggedFrame tag="V3"><RevenueStreamsV3 /></TaggedFrame> },
      { label: "V4 · Goal & forecast", code: "RevenueGoalV4", node: <TaggedFrame tag="V4"><RevenueGoalV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-audience",
    label: "Pages · Audience",
    icon: LayoutPanelLeft,
    blurb: "Audience explorations — growth overview, subscriber list, segment detail.",
    items: [
      { label: "V1 · Audience overview", code: "AudienceOverviewV1", node: <TaggedFrame tag="V1"><AudienceOverviewV1 /></TaggedFrame> },
      { label: "V2 · Subscriber list", code: "AudienceListV2", node: <TaggedFrame tag="V2"><AudienceListV2 /></TaggedFrame> },
      { label: "V3 · Segment detail", code: "AudienceSegmentV3", node: <TaggedFrame tag="V3"><AudienceSegmentV3 /></TaggedFrame> },
      { label: "V4 · Subscriber profile", code: "AudienceProfileV4", node: <TaggedFrame tag="V4"><AudienceProfileV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-email",
    label: "Pages · Email & broadcasts",
    icon: LayoutPanelLeft,
    blurb: "Email explorations — broadcast composer, campaigns list, broadcast report.",
    items: [
      { label: "V1 · Broadcast composer", code: "EmailComposerV1", node: <TaggedFrame tag="V1"><EmailComposerV1 /></TaggedFrame> },
      { label: "V2 · Campaigns list", code: "EmailCampaignsV2", node: <TaggedFrame tag="V2"><EmailCampaignsV2 /></TaggedFrame> },
      { label: "V3 · Broadcast report", code: "EmailReportV3", node: <TaggedFrame tag="V3"><EmailReportV3 /></TaggedFrame> },
      { label: "V4 · Automation flow", code: "EmailAutomationV4", node: <TaggedFrame tag="V4"><EmailAutomationV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-affiliate",
    label: "Pages · Affiliate & referral",
    icon: LayoutPanelLeft,
    blurb: "Referral explorations — referral dashboard, affiliates table, referral share.",
    items: [
      { label: "V1 · Referral dashboard", code: "ReferralDashV1", node: <TaggedFrame tag="V1"><ReferralDashV1 /></TaggedFrame> },
      { label: "V2 · Affiliates table", code: "AffiliatesTableV2", node: <TaggedFrame tag="V2"><AffiliatesTableV2 /></TaggedFrame> },
      { label: "V3 · Referral share", code: "ReferralShareV3", node: <TaggedFrame tag="V3"><ReferralShareV3 /></TaggedFrame> },
      { label: "V4 · Commission payouts", code: "AffiliatePayoutsV4", node: <TaggedFrame tag="V4"><AffiliatePayoutsV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-events",
    label: "Pages · Live & events",
    icon: LayoutPanelLeft,
    blurb: "Live & event explorations — events list, live room, event detail.",
    items: [
      { label: "V1 · Events list", code: "EventsListV1", node: <TaggedFrame tag="V1"><EventsListV1 /></TaggedFrame> },
      { label: "V2 · Live room", code: "LiveRoomV2", node: <TaggedFrame tag="V2"><LiveRoomV2 /></TaggedFrame> },
      { label: "V3 · Event detail", code: "EventDetailV3", node: <TaggedFrame tag="V3"><EventDetailV3 /></TaggedFrame> },
      { label: "V4 · Event recap", code: "EventRecapV4", node: <TaggedFrame tag="V4"><EventRecapV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-moderation",
    label: "Pages · Community moderation",
    icon: LayoutPanelLeft,
    blurb: "Moderation explorations — reports queue, members admin, auto-mod rules.",
    items: [
      { label: "V1 · Reports queue", code: "ModerationQueueV1", node: <TaggedFrame tag="V1"><ModerationQueueV1 /></TaggedFrame> },
      { label: "V2 · Members admin", code: "ModerationMembersV2", node: <TaggedFrame tag="V2"><ModerationMembersV2 /></TaggedFrame> },
      { label: "V3 · Auto-mod rules", code: "ModerationRulesV3", node: <TaggedFrame tag="V3"><ModerationRulesV3 /></TaggedFrame> },
      { label: "V4 · Moderation dashboard", code: "ModerationDashV4", node: <TaggedFrame tag="V4"><ModerationDashV4 /></TaggedFrame> },
    ],
  },
  {
    id: "pdx-shop",
    label: "Pages · Digital products",
    icon: LayoutPanelLeft,
    blurb: "Product explorations — products grid, product editor, orders & sales.",
    items: [
      { label: "V1 · Products", code: "ShopProductsV1", node: <TaggedFrame tag="V1"><ShopProductsV1 /></TaggedFrame> },
      { label: "V2 · Product editor", code: "ShopEditorV2", node: <TaggedFrame tag="V2"><ShopEditorV2 /></TaggedFrame> },
      { label: "V3 · Orders & sales", code: "ShopOrdersV3", node: <TaggedFrame tag="V3"><ShopOrdersV3 /></TaggedFrame> },
      { label: "V4 · Product page", code: "ShopProductPageV4", node: <TaggedFrame tag="V4"><ShopProductPageV4 /></TaggedFrame> },
    ],
  },
];
