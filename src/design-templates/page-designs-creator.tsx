/* Page Designs · creator pages ───────────────────────────────────────────────
   Higher-detail, creator-platform-specific page blueprints that complement the
   core Page Designs set — course / lesson player, watch page, search, command
   palette, help center, leaderboard, data grid, live studio, and a link-in-bio.
   Same visual language as Page Designs (a 560×268 app-shell frame built from
   skeleton bars with rose / ink / cream / emerald accents), composed denser for
   more detail. Self-contained & presentational — copy-paste, no shared deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { MonitorPlay, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Shell primitives ─────────────────────────────────────────────────────── */

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

/* Compact app nav rail — logo, items (one active), profile footer. */
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

function PlayGlyph({ tone = "border-l-ink-900" }: { tone?: string }) {
  return <div className={cn("ml-0.5 size-0 border-y-[5px] border-y-transparent border-l-[9px]", tone)} />;
}

/* ── 1 · Course player — lesson video + tabs + curriculum rail ─────────────── */
export function CoursePlayer() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2.5">
          <div className="relative rounded-lg bg-ink-900 h-[112px] overflow-hidden flex items-center justify-center">
            <div className="size-9 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
            <div className="absolute bottom-2 right-2 h-3 w-9 rounded bg-white/15" />
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
              <div className="h-full w-1/3 bg-rose-400" />
            </div>
          </div>
          <div className="h-3 w-44 rounded bg-ink-300" />
          <div className="flex items-center gap-3 border-b border-ink-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pb-1.5">
                <div className={cn("h-1.5 w-12 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
                {i === 0 && <div className="mt-1.5 h-0.5 w-12 rounded-full bg-rose-400" />}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          </div>
        </div>
        <div className="w-[150px] shrink-0 bg-white border-l border-ink-100 p-2.5 space-y-2 overflow-hidden">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="h-1 w-full rounded-full bg-cream-200">
            <div className="h-full w-2/5 rounded-full bg-emerald-300" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn("size-3.5 rounded-full shrink-0", i < 2 ? "bg-emerald-300" : i === 2 ? "bg-rose-400" : "bg-cream-200")} />
              <div className={cn("h-1.5 rounded flex-1", i === 2 ? "bg-ink-300" : "bg-ink-100")} />
              <div className="h-1.5 w-4 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 2 · Course player · V2 — module rail left, completion CTA ─────────────── */
export function CoursePlayerV2() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[150px] shrink-0 border-r border-ink-100 p-2.5 space-y-2.5 bg-cream-50 overflow-hidden">
          {[0, 1].map((m) => (
            <div key={m} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-sm bg-rose-300" />
                <div className="h-2 w-20 rounded bg-ink-300" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5 pl-3.5">
                  <div className={cn("size-2.5 rounded-full shrink-0", m === 0 && i < 2 ? "bg-emerald-300" : "bg-cream-200")} />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2.5 bg-cream-50">
          <div className="relative rounded-lg bg-ink-900 h-[128px] overflow-hidden flex items-center justify-center">
            <div className="size-10 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
            <div className="absolute top-2 left-2 h-3 w-12 rounded-full bg-white/20" />
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
              <div className="h-full w-1/2 bg-rose-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-40 rounded bg-ink-300" />
            <div className="h-6 w-24 rounded-md bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-white border border-ink-200" />
            <div className="ml-auto h-7 w-16 rounded-md bg-white border border-ink-200" />
            <div className="h-7 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 3 · Watch page — player + meta + up-next playlist ─────────────────────── */
export function WatchPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2.5">
          <div className="relative rounded-lg bg-ink-900 h-[120px] overflow-hidden flex items-center justify-center">
            <div className="size-10 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
              <div className="h-full w-2/5 bg-rose-400" />
            </div>
          </div>
          <div className="h-2.5 w-3/4 rounded bg-ink-300" />
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-1.5 w-20 rounded bg-ink-200" />
              <div className="h-1.5 w-12 rounded bg-ink-100" />
            </div>
            <div className="ml-auto h-7 w-16 rounded-full bg-rose-400" />
          </div>
          <div className="flex items-center gap-1.5">
            {[12, 12, 14].map((w, i) => (
              <div
                key={i}
                className="h-5 rounded-full bg-white border border-ink-200 flex items-center justify-center gap-1"
                style={{ width: `${w * 4}px` }}
              >
                <div className="size-1.5 rounded-full bg-ink-300" />
                <div className="h-1 w-3 rounded bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-[160px] shrink-0 bg-white border-l border-ink-100 p-2.5 space-y-2 overflow-hidden">
          <div className="h-2 w-16 rounded bg-ink-300" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-1.5">
              <div className="h-9 w-14 rounded-md bg-cream-200 shrink-0 relative overflow-hidden">
                {i === 0 && <div className="absolute inset-0 m-auto size-4 rounded-full bg-white/80" />}
              </div>
              <div className="flex-1 space-y-1 pt-0.5">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-1.5 w-1/3 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 4 · Watch page · V2 — vertical / shorts with side actions ─────────────── */
export function WatchPageV2() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-ink-900 flex items-center justify-center gap-3 p-3">
        <div className="relative h-full w-[124px] rounded-xl bg-ink-700 overflow-hidden flex items-center justify-center shadow-sm">
          <div className="size-9 rounded-full bg-white/90 flex items-center justify-center">
            <PlayGlyph />
          </div>
          <div className="absolute bottom-2 left-2 right-2 space-y-1">
            <div className="h-1.5 w-3/4 rounded bg-white/70" />
            <div className="h-1.5 w-1/2 rounded bg-white/40" />
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div className="h-full w-1/3 bg-rose-400" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 pb-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={cn("size-7 rounded-full", i === 0 ? "bg-rose-400" : "bg-white/15")} />
              <div className="h-1 w-4 rounded bg-white/30" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 5 · Search results — query bar, filters, result rows ──────────────────── */
export function SearchResults() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="flex-1 h-7 rounded-full bg-cream-100 border border-ink-200 flex items-center px-2.5 gap-1.5">
            <div className="size-2.5 rounded-full border-2 border-ink-300" />
            <div className="h-1.5 w-28 rounded bg-ink-200" />
          </div>
          <div className="h-7 w-14 rounded-md bg-rose-400 shrink-0" />
        </div>
        <div className="flex-1 min-h-0 flex">
          <div className="w-[120px] shrink-0 p-2.5 space-y-2.5 border-r border-ink-100">
            <div className="h-1.5 w-12 rounded bg-ink-300" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("size-3 rounded border", i === 1 ? "bg-rose-400 border-rose-400" : "bg-white border-ink-200")} />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
            <div className="h-1.5 w-10 rounded bg-ink-300 mt-1" />
            <div className="flex flex-wrap gap-1">
              {[8, 10, 7, 9].map((w, i) => (
                <div key={i} className="h-3.5 rounded-full bg-white border border-ink-200" style={{ width: `${w * 3}px` }} />
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0 p-2.5 space-y-2 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 rounded-lg bg-white border border-ink-100 p-2">
                <div className="size-10 rounded-md bg-cream-200 shrink-0" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-1.5 w-2/3 rounded bg-ink-300" />
                  <div className="h-1.5 w-full rounded bg-ink-100" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-10 rounded-full bg-rose-100" />
                    <div className="h-1.5 w-8 rounded bg-ink-100" />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-1 pt-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("size-4 rounded", i === 0 ? "bg-rose-400" : "bg-white border border-ink-200")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 6 · Command palette — dimmed shell + centered command menu ─────────────── */
export function CommandPalette() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 relative bg-cream-50 flex">
        {/* dimmed shell underneath */}
        <div className="w-[110px] shrink-0 bg-white/60 border-r border-ink-100 p-2.5 space-y-1.5 opacity-50">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-3 w-full rounded bg-ink-100" />
          ))}
        </div>
        <div className="flex-1 p-3 space-y-2 opacity-40">
          <div className="h-3 w-28 rounded bg-ink-200" />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white border border-ink-100" />
            ))}
          </div>
        </div>
        {/* scrim + palette */}
        <div className="absolute inset-0 bg-ink-900/30" />
        <div className="absolute left-1/2 top-7 -translate-x-1/2 w-[300px] rounded-xl bg-white border border-ink-200 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 h-9 border-b border-ink-100">
            <div className="size-3 rounded-full border-2 border-ink-300" />
            <div className="h-2 w-32 rounded bg-ink-200" />
            <div className="ml-auto h-3.5 w-7 rounded bg-cream-200" />
          </div>
          <div className="p-1.5 space-y-0.5">
            <div className="ml-2 mb-1 h-2 w-14 rounded bg-cream-100" />
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5", i === 0 && "bg-rose-50")}>
                <div className={cn("size-4 rounded shrink-0", i === 0 ? "bg-rose-400" : "bg-cream-200")} />
                <div className={cn("h-1.5 rounded", i === 0 ? "w-32 bg-ink-300" : "w-28 bg-ink-100")} />
                <div className="ml-auto h-3 w-8 rounded bg-cream-100" />
              </div>
            ))}
          </div>
          <div className="h-5 border-t border-ink-100 bg-cream-50 flex items-center gap-2 px-3">
            <div className="h-1.5 w-10 rounded bg-ink-100" />
            <div className="ml-auto h-1.5 w-12 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 7 · Help center — docs article with TOC + on-this-page ────────────────── */
export function HelpCenter() {
  return (
    <Frame>
      <div className="w-[130px] shrink-0 bg-white border-r border-ink-100 p-2.5 space-y-2.5 overflow-hidden">
        <div className="h-6 rounded-md bg-cream-100 border border-ink-200" />
        {[0, 1].map((g) => (
          <div key={g} className="space-y-1.5">
            <div className="h-1.5 w-14 rounded bg-ink-300" />
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-1.5 rounded ml-1", g === 0 && i === 1 ? "w-20 bg-rose-300" : "w-16 bg-ink-100")} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-8 rounded bg-ink-100" />
          <div className="size-1 rounded-full bg-ink-200" />
          <div className="h-1.5 w-12 rounded bg-ink-100" />
        </div>
        <div className="h-3.5 w-2/3 rounded bg-ink-300" />
        <div className="space-y-1.5 pt-0.5">
          <div className="h-1.5 w-full rounded bg-ink-100" />
          <div className="h-1.5 w-11/12 rounded bg-ink-100" />
          <div className="h-1.5 w-3/4 rounded bg-ink-100" />
        </div>
        <div className="rounded-lg border-l-2 border-rose-300 bg-rose-50/60 p-2 space-y-1">
          <div className="h-1.5 w-1/2 rounded bg-rose-300" />
          <div className="h-1.5 w-3/4 rounded bg-ink-100" />
        </div>
        <div className="rounded-lg bg-ink-900 p-2 space-y-1">
          <div className="h-1.5 w-2/3 rounded bg-white/30" />
          <div className="h-1.5 w-1/2 rounded bg-white/20" />
        </div>
      </div>
      <div className="w-[96px] shrink-0 bg-cream-50 border-l border-ink-100 p-2.5 space-y-1.5 overflow-hidden">
        <div className="h-1.5 w-14 rounded bg-ink-300" />
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("h-1.5 rounded", i === 0 ? "w-16 bg-rose-300" : "w-12 bg-ink-100")} />
        ))}
      </div>
    </Frame>
  );
}

/* ── 8 · Help center · V2 — support home with category grid ────────────────── */
export function HelpCenterV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="bg-gradient-to-b from-rose-50 to-cream-50 px-4 pt-4 pb-3 text-center border-b border-ink-100">
          <div className="h-3 w-40 rounded bg-ink-300 mx-auto" />
          <div className="h-7 w-2/3 rounded-full bg-white border border-ink-200 mx-auto mt-2.5 flex items-center px-3 gap-1.5">
            <div className="size-2.5 rounded-full border-2 border-ink-300" />
            <div className="h-1.5 w-28 rounded bg-ink-100" />
          </div>
        </div>
        <div className="p-3 grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="size-6 rounded-md bg-rose-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-200" />
              <div className="h-1.5 w-1/2 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 9 · Leaderboard — podium + ranked list ────────────────────────────────── */
export function Leaderboard() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="h-2.5 w-28 rounded bg-ink-300" />
        <div className="flex items-end justify-center gap-2">
          {[
            { h: 40, a: "bg-cream-300", r: "bg-ink-200" },
            { h: 56, a: "bg-amber-300", r: "bg-amber-400" },
            { h: 32, a: "bg-rose-200", r: "bg-rose-300" },
          ].map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1 w-16">
              <div className={cn("size-7 rounded-full", p.a)} />
              <div className="h-1.5 w-9 rounded bg-ink-200" />
              <div className={cn("w-full rounded-t-md", p.r)} style={{ height: `${p.h}px` }} />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-ink-100 px-2 py-1.5">
              <div className="h-2 w-3 rounded bg-ink-200 shrink-0" />
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
              <div className="h-1.5 w-20 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-100" />
              <div className="h-2.5 w-6 rounded-full bg-emerald-100 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 10 · Data grid — spreadsheet toolbar + frozen header + cells ──────────── */
export function DataGrid() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-white flex flex-col">
        <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-6 rounded-md bg-cream-100 border border-ink-200" />
          <div className="h-6 w-6 rounded-md bg-cream-100 border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* header row */}
          <div className="flex border-b border-ink-200 bg-cream-100">
            <div className="w-7 shrink-0 border-r border-ink-200 py-1.5" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 border-r border-ink-100 px-2 py-1.5">
                <div className="h-1.5 w-3/4 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex border-b border-ink-100">
              <div className="w-7 shrink-0 border-r border-ink-200 bg-cream-50 px-1.5 py-1.5">
                <div className="h-1.5 w-3 rounded bg-ink-200" />
              </div>
              {[0, 1, 2, 3, 4].map((c) => (
                <div key={c} className={cn("flex-1 border-r border-ink-100 px-2 py-1.5", r === 2 && c === 2 && "ring-2 ring-inset ring-rose-400 bg-rose-50/40")}>
                  <div className={cn("h-1.5 rounded bg-ink-100", c === 0 ? "w-full" : c === 4 ? "w-1/3" : "w-2/3")} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 11 · Live studio — stream preview + controls + chat ───────────────────── */
export function LiveStudio() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2.5">
          <div className="relative flex-1 rounded-lg bg-ink-900 overflow-hidden flex items-center justify-center">
            <div className="absolute top-2 left-2 flex items-center gap-1 h-4 px-1.5 rounded-full bg-rose-500">
              <div className="size-1.5 rounded-full bg-white" />
              <div className="h-1 w-5 rounded bg-white/80" />
            </div>
            <div className="absolute top-2 right-2 h-4 w-12 rounded-full bg-white/15" />
            <div className="size-12 rounded-full bg-white/10" />
          </div>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-8 rounded-full bg-white border border-ink-200" />
            ))}
            <div className="h-8 w-16 rounded-full bg-rose-500" />
          </div>
        </div>
        <div className="w-[150px] shrink-0 bg-white border-l border-ink-100 flex flex-col">
          <div className="px-2.5 py-2 border-b border-ink-100">
            <div className="h-2 w-16 rounded bg-ink-300" />
          </div>
          <div className="flex-1 min-h-0 p-2.5 space-y-2 overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-1.5">
                <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-10 rounded bg-rose-200" />
                  <div className={cn("h-1.5 rounded bg-ink-100", i % 2 ? "w-2/3" : "w-full")} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-ink-100">
            <div className="h-6 rounded-full bg-cream-100 border border-ink-200" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 12 · Link-in-bio — creator landing with stacked links ─────────────────── */
export function LinkInBio() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-gradient-to-b from-rose-100 via-cream-50 to-cream-100 flex items-start justify-center overflow-hidden">
        <div className="w-[220px] mt-3 flex flex-col items-center gap-2">
          <div className="size-12 rounded-full bg-white border-2 border-white shadow-sm" />
          <div className="h-2 w-24 rounded bg-ink-300" />
          <div className="h-1.5 w-32 rounded bg-ink-200" />
          <div className="flex items-center gap-2 py-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="size-5 rounded-full bg-white shadow-sm" />
            ))}
          </div>
          <div className="w-full space-y-2 mt-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("h-8 rounded-full flex items-center px-3 gap-2 shadow-sm", i === 0 ? "bg-rose-400" : "bg-white")}>
                <div className={cn("size-4 rounded-full shrink-0", i === 0 ? "bg-white/40" : "bg-cream-200")} />
                <div className={cn("h-1.5 rounded", i === 0 ? "w-24 bg-white/70" : "w-24 bg-ink-200")} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Category registration ─────────────────────────────────────────────────── */

/* ── More variants · V2 / V3 — deeper takes on the pages above ─────────────── */

/* 13 · Course player · V3 — transcript / notes split. */
export function CoursePlayerV3() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="relative rounded-lg bg-ink-900 flex-1 overflow-hidden flex items-center justify-center">
            <div className="size-9 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
              <div className="h-full w-1/2 bg-rose-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 flex-1 rounded-md bg-white border border-ink-200" />
            ))}
          </div>
        </div>
        <div className="w-[172px] shrink-0 bg-white border border-ink-100 rounded-lg p-2.5 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-1.5">
            <div className="h-1.5 w-12 rounded bg-rose-300" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-1.5">
              <div className="h-1.5 w-5 rounded bg-ink-100 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className={cn("h-1.5 rounded", i === 2 ? "bg-rose-200 w-full" : "bg-ink-100 w-full")} />
                {i === 2 && <div className="h-1.5 w-2/3 rounded bg-rose-200" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* 14 · Search results · V2 — grid layout + sort / view bar. */
export function SearchResultsV2() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="flex-1 h-7 rounded-full bg-cream-100 border border-ink-200 flex items-center px-2.5 gap-1.5">
            <div className="size-2.5 rounded-full border-2 border-ink-300" />
            <div className="h-1.5 w-24 rounded bg-ink-200" />
          </div>
          <div className="h-7 w-12 rounded-md bg-white border border-ink-200 shrink-0" />
          <div className="flex gap-1 shrink-0">
            <div className="size-7 rounded-md bg-rose-400" />
            <div className="size-7 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
        <div className="flex-1 min-h-0 p-2.5 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="h-1.5 w-20 rounded bg-ink-200" />
            <div className="h-1.5 w-12 rounded bg-ink-100" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
                <div className="h-12 bg-cream-200" />
                <div className="p-1.5 space-y-1">
                  <div className="h-1.5 w-full rounded bg-ink-200" />
                  <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* 15 · Leaderboard · V2 — timeframe tabs + ranked table. */
export function LeaderboardV2() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="flex gap-1 p-0.5 rounded-md bg-cream-200">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-4 w-10 rounded", i === 0 && "bg-white shadow-sm")} />
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-ink-200 bg-cream-50">
            <div className="h-1.5 w-4 rounded bg-ink-300" />
            <div className="h-1.5 w-16 rounded bg-ink-300" />
            <div className="ml-auto h-1.5 w-10 rounded bg-ink-300" />
            <div className="h-1.5 w-8 rounded bg-ink-300" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex items-center gap-2 px-2.5 py-1.5 border-b border-ink-100", i === 2 && "bg-rose-50")}>
              <div className={cn("h-2 w-4 rounded shrink-0", i === 0 ? "bg-amber-400" : "bg-ink-200")} />
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
              <div className={cn("h-1.5 rounded", i === 2 ? "w-20 bg-rose-300" : "w-16 bg-ink-200")} />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-100" />
              <div className="h-1.5 w-6 rounded bg-emerald-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* 16 · Data grid · V2 — saved-views rail + summary header. */
export function DataGridV2() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[110px] shrink-0 border-r border-ink-100 bg-cream-50 p-2.5 space-y-1.5">
          <div className="h-1.5 w-14 rounded bg-ink-300" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", i === 1 && "bg-white border border-ink-200")}>
              <div className={cn("size-2.5 rounded-sm", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-md bg-cream-50 border border-ink-100 px-2 py-1 space-y-1">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-2 w-10 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="flex border-b border-ink-200 bg-cream-100">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex-1 border-r border-ink-100 px-2 py-1.5">
                  <div className="h-1.5 w-3/4 rounded bg-ink-300" />
                </div>
              ))}
            </div>
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="flex border-b border-ink-100">
                {[0, 1, 2, 3].map((c) => (
                  <div key={c} className="flex-1 border-r border-ink-100 px-2 py-1.5">
                    <div className={cn("h-1.5 rounded bg-ink-100", c === 0 ? "w-full" : "w-1/2")} />
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

/* 17 · Live studio · V2 — pre-live setup + go-live panel. */
export function LiveStudioV2() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="relative flex-1 rounded-lg bg-ink-900 overflow-hidden flex items-center justify-center">
            <div className="size-12 rounded-full bg-white/10" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="size-6 rounded-full bg-white/15" />
              ))}
            </div>
          </div>
        </div>
        <div className="w-[160px] shrink-0 bg-white border border-ink-100 rounded-lg p-2.5 flex flex-col gap-2">
          <div className="h-2 w-16 rounded bg-ink-300" />
          <div className="h-7 rounded-md bg-cream-100 border border-ink-200" />
          <div className="h-2 w-12 rounded bg-ink-200" />
          <div className="h-12 rounded-md bg-cream-100 border border-ink-200" />
          <div className="space-y-1.5 mt-0.5">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-emerald-300 shrink-0" />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="mt-auto h-8 rounded-md bg-rose-500" />
        </div>
      </div>
    </Frame>
  );
}

/* 18 · Link-in-bio · V2 — featured video + card grid. */
export function LinkInBioV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-gradient-to-b from-rose-100 via-cream-50 to-cream-100 flex items-start justify-center overflow-hidden">
        <div className="w-[240px] mt-3 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 w-full">
            <div className="size-10 rounded-full bg-white border-2 border-white shadow-sm shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-2 w-20 rounded bg-ink-300" />
              <div className="h-1.5 w-28 rounded bg-ink-200" />
            </div>
            <div className="h-6 w-12 rounded-full bg-rose-400 shrink-0" />
          </div>
          <div className="w-full h-16 rounded-xl bg-white shadow-sm overflow-hidden flex">
            <div className="w-20 bg-ink-900 shrink-0 relative flex items-center justify-center">
              <div className="size-6 rounded-full bg-white/90 flex items-center justify-center">
                <PlayGlyph />
              </div>
            </div>
            <div className="flex-1 p-2 space-y-1">
              <div className="h-1.5 w-12 rounded bg-rose-200" />
              <div className="h-1.5 w-full rounded bg-ink-200" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-white shadow-sm flex items-center px-2 gap-1.5">
                <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                <div className="h-1.5 flex-1 rounded bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

type PageCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scale?: number;
  items: { label: string; code: string; node: ReactNode; scale?: number }[];
};

export const PAGE_DESIGNS_CREATOR: PageCategory[] = [
  {
    id: "page-designs-creator",
    label: "Creator pages",
    icon: MonitorPlay,
    blurb: "Creator-platform page blueprints — course player, watch, search, command palette, help center, leaderboard, data grid, live studio & link-in-bio.",
    items: [
      { label: "Course player · V1 tabs + curriculum", code: "CoursePlayer", node: <CoursePlayer /> },
      { label: "Course player · V2 modules + complete", code: "CoursePlayerV2", node: <CoursePlayerV2 /> },
      { label: "Watch page · player + up-next", code: "WatchPage", node: <WatchPage /> },
      { label: "Watch page · V2 vertical / shorts", code: "WatchPageV2", node: <WatchPageV2 /> },
      { label: "Search results · filters + rows", code: "SearchResults", node: <SearchResults /> },
      { label: "Command palette · overlay", code: "CommandPalette", node: <CommandPalette /> },
      { label: "Help center · docs article", code: "HelpCenter", node: <HelpCenter /> },
      { label: "Help center · V2 support home", code: "HelpCenterV2", node: <HelpCenterV2 /> },
      { label: "Leaderboard · podium + ranks", code: "Leaderboard", node: <Leaderboard /> },
      { label: "Data grid · spreadsheet", code: "DataGrid", node: <DataGrid /> },
      { label: "Live studio · stream + chat", code: "LiveStudio", node: <LiveStudio /> },
      { label: "Link-in-bio · creator landing", code: "LinkInBio", node: <LinkInBio /> },
      { label: "Course player · V3 transcript / notes", code: "CoursePlayerV3", node: <CoursePlayerV3 /> },
      { label: "Search results · V2 grid", code: "SearchResultsV2", node: <SearchResultsV2 /> },
      { label: "Leaderboard · V2 ranked table", code: "LeaderboardV2", node: <LeaderboardV2 /> },
      { label: "Data grid · V2 saved views", code: "DataGridV2", node: <DataGridV2 /> },
      { label: "Live studio · V2 pre-live setup", code: "LiveStudioV2", node: <LiveStudioV2 /> },
      { label: "Link-in-bio · V2 featured grid", code: "LinkInBioV2", node: <LinkInBioV2 /> },
    ],
  },
];
