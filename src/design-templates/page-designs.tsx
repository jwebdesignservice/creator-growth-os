/* Page Designs ──────────────────────────────────────────────────────────
   Schematic app-shell layout skeletons (wireframes) for the page-structure
   patterns the product uses: single vs double sidebar, with / without top
   tabs, right rail, and centered/full-width. Rendered in the app's own
   tokens (cream / ink / rose). Exported as a ready gallery category via
   PAGE_DESIGN_CATEGORIES so the gallery only spreads it in.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { LayoutPanelLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { EMAIL_DESIGN_CATEGORIES } from "./email-designs";

/* ── Wireframe primitives ─────────────────────────────────────────────── */

function Topbar() {
  return (
    <div className="h-7 shrink-0 border-b border-ink-100 bg-white flex items-center gap-2 px-3">
      <div className="size-3 rounded-[4px] bg-rose-500" />
      <div className="h-1.5 w-10 rounded-full bg-ink-200" />
      <div className="ml-2 flex h-4 w-[150px] items-center gap-1.5 rounded-full bg-cream-100 border border-ink-100 px-2">
        <div className="size-1.5 rounded-full bg-ink-300" />
        <div className="h-1 w-14 rounded bg-ink-200" />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="size-3.5 rounded-full bg-ink-100" />
        <div className="size-3.5 rounded-full bg-ink-100" />
        <div className="size-4 rounded-full bg-cream-300" />
      </div>
    </div>
  );
}

/* Narrow icon-only nav (the primary app rail) */
function IconRail() {
  return (
    <div className="w-10 shrink-0 border-r border-ink-100 bg-white flex flex-col items-center py-2.5 gap-2">
      <div className="size-4 rounded-[5px] bg-rose-400 mb-1" />
      <div className="size-4 rounded-[5px] bg-rose-200" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
      <div className="size-4 rounded-[5px] bg-ink-100" />
    </div>
  );
}

/* Wider labelled nav rail */
function NavRail() {
  return (
    <div className="w-[104px] shrink-0 border-r border-ink-100 bg-white p-2.5">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="size-3 rounded-[4px] bg-rose-500" />
        <div className="h-2 w-12 rounded bg-ink-200" />
      </div>
      <div className="space-y-1">
        {[true, false, false, false, false].map((active, i) => (
          <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", active && "bg-rose-50")}>
            <div className={cn("size-2.5 rounded-sm shrink-0", active ? "bg-rose-400" : "bg-ink-200")} />
            <div className={cn("h-1.5 rounded", active ? "w-10 bg-rose-300" : "w-9 bg-ink-100")} />
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center gap-1.5">
        <div className="size-4 rounded-full bg-cream-200 shrink-0" />
        <div className="h-1.5 w-8 rounded bg-ink-100" />
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div className="border-b border-ink-100">
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <div className="space-y-1">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-1.5 w-32 rounded bg-ink-100" />
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
  );
}

function Header() {
  return (
    <div className="px-3.5 pt-3 pb-2">
      <div className="mb-2 flex items-center gap-1.5">
        <div className="h-1.5 w-6 rounded bg-ink-100" />
        <div className="size-1 rounded-full bg-ink-200" />
        <div className="h-1.5 w-10 rounded bg-ink-200" />
      </div>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-ink-300" />
          <div className="h-2 w-40 rounded bg-ink-100" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-12 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </div>
  );
}

function ContentBlocks() {
  return (
    <div className="px-3.5 pb-3.5 pt-2.5 space-y-2.5">
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[44px] rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-sm bg-rose-200" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
            <div className="flex items-end justify-between">
              <div className="h-2.5 w-9 rounded bg-ink-300" />
              <div className="h-1.5 w-5 rounded-full bg-emerald-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="h-2 w-16 rounded bg-ink-200" />
            <div className="flex gap-1">
              <div className="h-1.5 w-6 rounded-full bg-rose-200" />
              <div className="h-1.5 w-6 rounded-full bg-ink-100" />
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-[52px]">
            {[50, 72, 45, 85, 60, 78, 55].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-4 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 rounded bg-ink-100" />
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              </div>
              <div className="h-2 w-4 rounded-full bg-rose-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Body({ tabs }: { tabs?: boolean }) {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      {tabs ? <Tabs /> : <Header />}
      <ContentBlocks />
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

/* ── Detail helpers (charts / nav) ────────────────────────────────────── */

function Bars({ data, className = "h-[52px]", bar = "bg-rose-200" }: { data: number[]; className?: string; bar?: string }) {
  return (
    <div className={cn("flex items-end gap-1.5", className)}>
      {data.map((h, i) => (
        <div key={i} className={cn("flex-1 rounded-t", bar)} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function Donut({ size = 46, tone = "border-rose-300", track = "border-cream-200" }: { size?: number; tone?: string; track?: string }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className={cn("absolute inset-0 rounded-full border-[5px]", track)} />
      <div className={cn("absolute inset-0 rounded-full border-[5px] border-r-transparent border-b-transparent", tone)} />
    </div>
  );
}

/* Grouped nav rail — two labelled sections + a profile footer. */
function NavGrouped() {
  return (
    <div className="w-[116px] shrink-0 border-r border-ink-100 bg-white p-2.5 flex flex-col">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="size-4 rounded-[5px] bg-rose-500" />
        <div className="h-2 w-14 rounded bg-ink-300" />
      </div>
      <div className="h-6 rounded-md bg-rose-400 mb-2.5" />
      <div className="space-y-2.5">
        {[
          { head: "w-8", rows: [true, false, false] },
          { head: "w-10", rows: [false, false] },
        ].map((grp, g) => (
          <div key={g}>
            <div className={cn("mb-1 ml-1 h-1 rounded bg-ink-200", grp.head)} />
            <div className="space-y-0.5">
              {grp.rows.map((a, i) => (
                <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", a && "bg-rose-50")}>
                  <div className={cn("size-2.5 rounded-sm shrink-0", a ? "bg-rose-400" : "bg-ink-200")} />
                  <div className={cn("h-1.5 rounded", a ? "w-10 bg-rose-300" : "w-9 bg-ink-100")} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-2.5 border-t border-ink-100 flex items-center gap-1.5">
        <div className="size-5 rounded-full bg-cream-200 shrink-0" />
        <div className="space-y-1">
          <div className="h-1.5 w-10 rounded bg-ink-200" />
          <div className="h-1 w-7 rounded bg-ink-100" />
        </div>
      </div>
    </div>
  );
}

/* ── Variants ─────────────────────────────────────────────────────────── */

/* Single sidebar · V1 — refined classic dashboard (bordered header + KPIs). */
function SingleSidebar() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="px-3.5 pt-3 pb-2.5 border-b border-ink-100 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-6 rounded bg-ink-100" />
              <div className="size-1 rounded-full bg-ink-200" />
              <div className="h-1.5 w-10 rounded bg-ink-200" />
            </div>
            <div className="h-3 w-28 rounded bg-ink-300" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-6 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-2">
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-sm bg-rose-200" />
                  <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                </div>
                <div className="flex items-end justify-between">
                  <div className="h-3 w-9 rounded bg-ink-300" />
                  <div className="h-1.5 w-5 rounded-full bg-emerald-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1.6fr_1fr] gap-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-2 w-16 rounded bg-ink-200" />
                <div className="flex gap-1">
                  <div className="h-1.5 w-6 rounded-full bg-rose-200" />
                  <div className="h-1.5 w-6 rounded-full bg-ink-100" />
                </div>
              </div>
              <Bars data={[48, 68, 40, 82, 58, 74, 52, 66]} className="h-[58px]" />
            </div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 rounded bg-ink-100" />
                    <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                  </div>
                  <div className="h-2 w-4 rounded-full bg-rose-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Single sidebar · V2 — grouped nav + main column with a context aside. */
function SingleSidebarV2() {
  return (
    <Frame>
      <NavGrouped />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-ink-300" />
            <div className="h-2 w-36 rounded bg-ink-100" />
          </div>
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="px-3.5 pb-3.5 grid grid-cols-[1fr_132px] gap-2.5">
          <div className="space-y-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-2 w-20 rounded bg-ink-200" />
                <div className="h-1.5 w-8 rounded-full bg-cream-200" />
              </div>
              <div className="flex items-center gap-2.5">
                <Donut size={44} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 rounded bg-ink-100" />
                  <div className="h-1.5 w-4/5 rounded bg-ink-100" />
                  <div className="h-1.5 w-3/5 rounded bg-ink-100" />
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className="h-6 bg-cream-100 border-b border-ink-100" />
              {[0, 1].map((i) => (
                <div key={i} className="h-7 border-b border-ink-100 last:border-0 flex items-center gap-2 px-2">
                  <div className="size-3 rounded-full bg-ink-100" />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                  <div className="h-3 w-9 rounded-full bg-emerald-100" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-2.5 w-10 rounded bg-ink-300" />
              <div className="h-1.5 w-5 rounded-full bg-emerald-200" />
            </div>
            <div className="rounded-lg bg-cream-100 border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-white border border-ink-100" />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Single sidebar · V3 — toolbar + browse card grid (library feel). */
function SingleSidebarV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="px-3 py-2.5 border-b border-ink-100 flex items-center gap-2">
          <div className="h-6 w-32 rounded-md bg-white border border-ink-100 flex items-center px-2 gap-1.5">
            <div className="size-2 rounded-full bg-ink-200" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
          </div>
          <div className="h-6 w-12 rounded-full bg-cream-100 border border-ink-100" />
          <div className="h-6 w-10 rounded-full bg-cream-100 border border-ink-100" />
          <div className="ml-auto h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className="h-12 bg-cream-100" />
              <div className="p-1.5 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="flex items-center justify-between">
                  <div className="h-1 w-8 rounded bg-ink-100" />
                  <div className="h-2 w-5 rounded-full bg-rose-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Double sidebar · V1 — icon rail + labelled nav + compact KPI dashboard. */
function DoubleSidebar() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="px-3.5 pt-3 pb-2.5 border-b border-ink-100 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-ink-300" />
            <div className="h-2 w-32 rounded bg-ink-100" />
          </div>
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-2.5 w-3/5 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white border border-ink-100 p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-2 w-16 rounded bg-ink-200" />
              <div className="h-2 w-10 rounded-full bg-cream-200" />
            </div>
            <Bars data={[40, 62, 48, 72, 55, 80, 60, 70, 52, 66]} className="h-[64px]" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Double sidebar · V2 — icon rail + contextual list panel + main content. */
function DoubleSidebarV2() {
  return (
    <Frame>
      <IconRail />
      <div className="w-[122px] shrink-0 border-r border-ink-100 bg-white flex flex-col">
        <div className="px-2 pt-2.5 pb-2 border-b border-ink-100 space-y-1.5">
          <div className="h-2 w-16 rounded bg-ink-300" />
          <div className="h-5 rounded-md bg-cream-100 border border-ink-100" />
        </div>
        <div className="p-2 space-y-2">
          {[0, 1].map((g) => (
            <div key={g} className="space-y-0.5">
              <div className="ml-1 h-1 w-8 rounded bg-ink-200" />
              {[g === 0, false, false].map((a, i) => (
                <div key={i} className={cn("flex items-center gap-1.5 rounded px-1.5 py-1", a && "bg-rose-50")}>
                  <div className={cn("size-2 rounded-full shrink-0", a ? "bg-rose-400" : "bg-ink-200")} />
                  <div className={cn("h-1.5 rounded", a ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-ink-100">
          <div className="space-y-1.5">
            <div className="h-2.5 w-28 rounded bg-ink-300" />
            <div className="h-1.5 w-20 rounded bg-ink-100" />
          </div>
          <div className="flex gap-1.5">
            <div className="size-6 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-14 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="h-16 rounded-lg bg-white border border-ink-100" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 rounded-lg bg-white border border-ink-100" />
            <div className="h-12 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Double sidebar · V3 — icon rail + nav + tabbed two-column cards. */
function DoubleSidebarV3() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-6 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="flex items-center gap-3 px-3.5 border-b border-ink-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pt-0.5 pb-1.5">
              <div className={cn("h-2 w-9 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1 h-0.5 w-9 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="p-3 grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Single sidebar · top tabs · V1 — underline tabs over a KPI + chart view. */
function SingleSidebarTabs() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="border-b border-ink-100">
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
            <div className="space-y-1">
              <div className="h-2.5 w-24 rounded bg-ink-300" />
              <div className="h-1.5 w-32 rounded bg-ink-100" />
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
        <div className="p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[42px] rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-2.5 w-1/2 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white border border-ink-100 p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-2 w-16 rounded bg-ink-200" />
              <div className="h-2 w-8 rounded-full bg-cream-200" />
            </div>
            <Bars data={[52, 70, 46, 80, 58, 74]} className="h-[44px]" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Single sidebar · top tabs · V2 — segmented control over a data table. */
function SingleSidebarTabsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="px-3.5 pt-3 pb-2.5 flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="flex items-center gap-0.5 rounded-md bg-cream-100 border border-ink-100 p-0.5">
            {[true, false, false].map((a, i) => (
              <div key={i} className={cn("h-4 w-8 rounded", a && "bg-white shadow-sm")} />
            ))}
          </div>
        </div>
        <div className="px-3.5 pb-3.5">
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className="h-6 bg-cream-100 border-b border-ink-100" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-7 border-b border-ink-100 last:border-0 flex items-center gap-2 px-2.5">
                <div className="size-3.5 rounded-full bg-cream-200 shrink-0" />
                <div className="h-1.5 w-1/4 rounded bg-ink-200" />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
                <div className="h-3 w-9 rounded-full bg-emerald-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Single sidebar · top tabs · V3 — tabs + filter toolbar + dense list. */
function SingleSidebarTabsV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-3.5 pt-3 border-b border-ink-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-2">
              <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1.5 h-0.5 w-10 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-ink-100">
          <div className="h-5 w-24 rounded-md bg-white border border-ink-100" />
          <div className="h-5 w-12 rounded-full bg-cream-100 border border-ink-100" />
          <div className="h-5 w-10 rounded-full bg-cream-100 border border-ink-100" />
          <div className="ml-auto h-5 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 border-b border-ink-100 flex items-center gap-2 px-3">
              <div className="size-2.5 rounded-sm bg-ink-100" />
              <div className="h-1.5 w-1/4 rounded bg-ink-200" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
              <div className="h-3 w-8 rounded-full bg-rose-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Double sidebar · top tabs · V1 — tabs over a mixed KPI + row layout. */
function DoubleSidebarTabs() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="border-b border-ink-100">
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            <div className="h-6 w-12 rounded-md bg-rose-400" />
          </div>
          <div className="flex items-center gap-3 px-3.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="pt-0.5 pb-1.5">
                <div className={cn("h-2 w-9 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
                {i === 0 && <div className="mt-1 h-0.5 w-9 rounded-full bg-rose-400" />}
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                <div className="h-1.5 w-6 rounded-full bg-emerald-200" />
              </div>
              <Bars data={[50, 72, 48, 80, 60]} className="h-[40px]" />
            </div>
          ))}
          <div className="col-span-2 rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2">
            <div className="size-8 rounded-full bg-cream-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 w-1/3 rounded bg-ink-200" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
            <div className="h-6 w-12 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Double sidebar · top tabs · V2 — tabs + master list / detail pane. */
function DoubleSidebarTabsV2() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-3.5 pt-3 border-b border-ink-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-2">
              <div className={cn("h-2 w-9 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1.5 h-0.5 w-9 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="flex-1 flex min-h-0">
          <div className="w-[120px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("rounded-md border p-1.5 space-y-1", i === 1 ? "border-rose-200 bg-rose-50" : "border-ink-100")}>
                <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-3 space-y-2">
            <div className="h-2.5 w-1/2 rounded bg-ink-300" />
            <div className="h-2 w-1/3 rounded bg-ink-100" />
            <div className="h-16 rounded-lg bg-white border border-ink-100 mt-1" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Double sidebar · top tabs · V3 — tabs over a three-column board. */
function DoubleSidebarTabsV3() {
  return (
    <Frame>
      <IconRail />
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-2 w-9 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
            ))}
          </div>
          <div className="h-6 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 p-2.5 flex gap-2 overflow-hidden">
          {["bg-rose-200", "bg-ink-200", "bg-emerald-200"].map((h, c) => (
            <div key={h} className="flex-1 space-y-1.5">
              <div className={cn("h-1.5 rounded-full", h)} />
              <div className="h-10 rounded-md bg-white border border-ink-100" />
              <div className="h-10 rounded-md bg-white border border-ink-100" />
              {c < 2 && <div className="h-10 rounded-md bg-white border border-ink-100" />}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Sidebar + right rail · V1 — content + an activity / summary rail. */
function SidebarRightRail() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-ink-300" />
            <div className="h-2 w-32 rounded bg-ink-100" />
          </div>
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="px-3.5 pb-3.5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1].map((i) => (
              <div key={i} className="h-[44px] rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-2.5 w-1/2 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="h-20 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
      <div className="w-[92px] shrink-0 border-l border-ink-100 bg-white p-2.5 space-y-2">
        <div className="h-1.5 w-2/3 rounded bg-ink-300" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="size-4 rounded-full bg-cream-200 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
          </div>
        ))}
        <div className="h-8 rounded-md bg-cream-100 mt-1" />
      </div>
    </Frame>
  );
}

/* Sidebar + right rail · V2 — browse grid + a filter rail. */
function SidebarRightRailV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden p-3">
        <div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className="h-12 bg-cream-100" />
              <div className="p-1.5 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1 w-1/2 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[104px] shrink-0 border-l border-ink-100 bg-white p-2.5 space-y-2.5">
        <div className="h-2 w-16 rounded bg-ink-300" />
        {[0, 1].map((g) => (
          <div key={g} className="space-y-1.5">
            <div className="h-1.5 w-12 rounded bg-ink-200" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("size-2.5 rounded-sm border", g === 0 && i === 0 ? "bg-rose-400 border-rose-400" : "border-ink-200")} />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ))}
        <div className="h-6 rounded-md bg-rose-400 mt-1" />
      </div>
    </Frame>
  );
}

/* Sidebar + right rail · V3 — list + a detail inspector rail. */
function SidebarRightRailV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-2">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-12 rounded-md bg-white border border-ink-100" />
        </div>
        <div className="p-3 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("h-8 rounded-lg border flex items-center gap-2 px-2", i === 1 ? "border-rose-200 bg-rose-50" : "border-ink-100 bg-white")}>
              <div className="size-4 rounded bg-cream-200" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
              <div className="h-1.5 w-8 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="w-[116px] shrink-0 border-l border-ink-100 bg-white p-2.5 space-y-2">
        <div className="h-14 rounded-lg bg-cream-100" />
        <div className="h-2 w-2/3 rounded bg-ink-300" />
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1.5 w-8 rounded bg-ink-100" />
              <div className="h-1.5 w-10 rounded bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="h-6 rounded-md bg-rose-400 mt-1" />
      </div>
    </Frame>
  );
}

function FullWidthCentered() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-100/60 overflow-hidden">
        <div className="mx-auto h-full w-[80%] border-x border-ink-100 bg-cream-50">
          <div className="px-3.5 pt-3 flex items-center gap-1.5">
            <div className="h-1.5 w-6 rounded bg-ink-100" />
            <div className="size-1 rounded-full bg-ink-200" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
            <div className="size-1 rounded-full bg-ink-200" />
            <div className="h-1.5 w-12 rounded bg-ink-200" />
          </div>
          <div className="px-3.5 pt-2 flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-ink-300" />
              <div className="h-2 w-40 rounded bg-ink-100" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-12 rounded-md bg-white border border-ink-200" />
              <div className="h-6 w-16 rounded-md bg-rose-400" />
            </div>
          </div>
          <div className="px-3.5 pt-3 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="flex items-end justify-between">
                  <div className="h-3 w-9 rounded bg-ink-300" />
                  <div className="h-1.5 w-5 rounded-full bg-emerald-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-3.5 pt-2.5 grid grid-cols-[1.5fr_1fr] gap-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-2 w-16 rounded bg-ink-200" />
                <div className="flex gap-1">
                  <div className="h-1.5 w-6 rounded-full bg-rose-200" />
                  <div className="h-1.5 w-6 rounded-full bg-ink-100" />
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-[50px]">
                {[50, 72, 45, 85, 60, 78, 55].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 rounded bg-ink-100" />
                    <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Content-pattern variants ─────────────────────────────────────────── */

function SplitBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="flex-1 border-r border-ink-100 flex flex-col">
        <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
          <div className="h-1.5 w-14 rounded bg-ink-200" />
          <div className="ml-auto size-3.5 rounded bg-cream-200" />
          <div className="size-3.5 rounded bg-cream-200" />
        </div>
        <div className="p-3 space-y-1.5">
          <div className="h-1.5 w-5/6 rounded bg-ink-100" />
          <div className="h-1.5 w-full rounded bg-ink-100" />
          <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          <div className="h-1.5 w-4/5 rounded bg-ink-100" />
          <div className="h-1.5 w-1/2 rounded bg-ink-100" />
        </div>
      </div>
      <div className="flex-1 bg-white/40 flex flex-col">
        <div className="h-7 border-b border-ink-100 flex items-center px-2.5">
          <div className="h-1.5 w-12 rounded bg-rose-300" />
        </div>
        <div className="p-3 flex-1">
          <div className="h-full min-h-[120px] rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </div>
  );
}

function ListDetailBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[128px] shrink-0 border-r border-ink-100 bg-white">
        <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2">
          <div className="h-1.5 w-12 rounded bg-ink-300" />
          <div className="ml-auto size-3 rounded bg-cream-200" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("border-b border-ink-100 p-2 space-y-1", i === 1 && "bg-rose-50")}>
            <div className="flex items-center gap-1.5">
              <div className="size-4 rounded-full bg-cream-200" />
              <div className="h-1.5 w-14 rounded bg-ink-200" />
            </div>
            <div className="h-1.5 w-3/4 rounded bg-ink-100" />
          </div>
        ))}
      </div>
      <div className="flex-1 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 rounded bg-ink-300" />
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="h-2 w-24 rounded bg-ink-100" />
        <div className="h-20 rounded-lg bg-white border border-ink-100 mt-1" />
        <div className="space-y-1.5">
          <div className="h-1.5 rounded bg-ink-100" />
          <div className="h-1.5 w-4/5 rounded bg-ink-100" />
        </div>
      </div>
    </div>
  );
}

function KanbanBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5 overflow-hidden">
      {["bg-rose-200", "bg-ink-200", "bg-emerald-200", "bg-amber-200"].map((head, c) => (
        <div key={head} className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className={cn("h-2 flex-1 rounded-full", head)} />
            <div className="size-3.5 rounded-full bg-white border border-ink-100" />
          </div>
          {[0, 1, 2].slice(0, c % 2 === 0 ? 3 : 2).map((i) => (
            <div key={i} className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1.5">
              <div className="h-1.5 w-3/4 rounded bg-ink-200" />
              <div className="flex items-center justify-between">
                <div className="h-2 w-6 rounded-full bg-rose-100" />
                <div className="size-3.5 rounded-full bg-cream-200" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex flex-col items-center justify-center gap-2 p-4">
      <div className="size-12 rounded-2xl bg-rose-100 flex items-center justify-center">
        <div className="size-6 rounded-lg bg-rose-300" />
      </div>
      <div className="h-2.5 w-32 rounded bg-ink-300 mt-1" />
      <div className="h-2 w-44 rounded bg-ink-100" />
      <div className="h-2 w-36 rounded bg-ink-100" />
      <div className="flex gap-2 mt-1.5">
        <div className="h-7 w-24 rounded-lg bg-rose-400" />
        <div className="h-7 w-20 rounded-lg bg-white border border-ink-200" />
      </div>
    </div>
  );
}

function GridBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="h-2.5 w-20 rounded bg-ink-300" />
        <div className="h-6 w-16 rounded-md bg-rose-400" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className="h-12 bg-cream-100" />
            <div className="p-1.5 space-y-1">
              <div className="h-1.5 w-3/4 rounded bg-ink-200" />
              <div className="flex items-center justify-between">
                <div className="h-1 w-8 rounded bg-ink-100" />
                <div className="size-3 rounded-full bg-cream-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WizardBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
      <div className="flex items-center justify-center gap-2 pt-3.5 pb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={cn("size-5 rounded-full", i === 0 ? "bg-rose-400" : i === 1 ? "bg-rose-200" : "bg-ink-100")} />
              <div className="h-1 w-8 rounded bg-ink-100" />
            </div>
            {i < 2 && <div className="-mt-2.5 h-0.5 w-8 bg-ink-100" />}
          </div>
        ))}
      </div>
      <div className="flex-1 px-3.5">
        <div className="mx-auto max-w-[72%] space-y-2.5">
          <div className="h-2 w-20 rounded bg-rose-300" />
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-8 rounded-lg bg-white border border-ink-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between bg-white/50">
        <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
        <div className="h-6 w-16 rounded-md bg-rose-400" />
      </div>
    </div>
  );
}

function SplitView() {
  return (
    <Frame>
      <NavRail />
      <SplitBody />
    </Frame>
  );
}
function ListDetail() {
  return (
    <Frame>
      <NavRail />
      <ListDetailBody />
    </Frame>
  );
}
function KanbanBoard() {
  return (
    <Frame>
      <NavRail />
      <KanbanBody />
    </Frame>
  );
}
function EmptyStateLayout() {
  return (
    <Frame>
      <NavRail />
      <EmptyBody />
    </Frame>
  );
}
function CardGrid() {
  return (
    <Frame>
      <NavRail />
      <GridBody />
    </Frame>
  );
}
function WizardSteps() {
  return (
    <Frame>
      <NavRail />
      <WizardBody />
    </Frame>
  );
}

/* ── More page patterns ───────────────────────────────────────────────── */

function ChatBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[116px] shrink-0 border-r border-ink-100 bg-white flex flex-col">
        <div className="h-7 border-b border-ink-100 flex items-center px-2">
          <div className="h-1.5 w-12 rounded bg-ink-300" />
          <div className="ml-auto size-3 rounded bg-cream-200" />
        </div>
        <div className="p-1.5 space-y-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 p-1 rounded-md", i === 0 && "bg-rose-50")}>
              <div className="size-6 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1.5 w-full rounded bg-ink-100" />
              </div>
              {i === 0 && <div className="size-1.5 rounded-full bg-rose-400 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
          <div className="size-4 rounded-full bg-cream-200" />
          <div className="h-1.5 w-16 rounded bg-ink-200" />
        </div>
        <div className="flex-1 p-2.5 space-y-1.5">
          <div className="h-1 w-10 rounded-full bg-ink-100 mx-auto" />
          <div className="flex items-end gap-1">
            <div className="size-4 rounded-full bg-cream-200 shrink-0" />
            <div className="h-6 w-2/5 rounded-xl rounded-bl-sm bg-white border border-ink-100" />
          </div>
          <div className="h-7 w-1/2 rounded-xl rounded-br-sm bg-rose-100 ml-auto" />
          <div className="flex items-end gap-1">
            <div className="size-4 rounded-full bg-cream-200 shrink-0" />
            <div className="h-6 w-3/5 rounded-xl rounded-bl-sm bg-white border border-ink-100" />
          </div>
          <div className="h-6 w-2/5 rounded-xl rounded-br-sm bg-rose-100 ml-auto" />
        </div>
        <div className="border-t border-ink-100 p-2 flex items-center gap-1.5">
          <div className="size-5 rounded-md bg-cream-100 shrink-0" />
          <div className="h-7 flex-1 rounded-lg bg-white border border-ink-100" />
          <div className="size-7 rounded-lg bg-rose-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function CalendarBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2.5 w-16 rounded bg-ink-300" />
        <div className="flex items-center gap-1">
          <div className="size-4 rounded bg-white border border-ink-100" />
          <div className="size-4 rounded bg-white border border-ink-100" />
        </div>
        <div className="ml-auto flex items-center gap-0.5 rounded-md bg-cream-100 border border-ink-100 p-0.5">
          {[true, false].map((a, i) => (
            <div key={i} className={cn("h-4 w-7 rounded", a && "bg-white shadow-sm")} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="mx-auto h-1.5 w-4 rounded bg-ink-100" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1">
        {[...Array(28).keys()].map((i) => (
          <div key={i} className={cn("rounded bg-white border border-ink-100 p-0.5", (i === 9 || i === 16) && "border-rose-200")}>
            <div className="h-1 w-2 rounded bg-ink-200" />
            {i === 9 && <div className="mt-0.5 h-1 w-full rounded-full bg-rose-200" />}
            {i === 16 && <div className="mt-0.5 h-1 w-full rounded-full bg-emerald-200" />}
            {i === 4 && <div className="mt-0.5 h-1 w-2/3 rounded-full bg-ink-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1">
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            <div className="flex items-end justify-between">
              <div className="h-2.5 w-8 rounded bg-ink-300" />
              <div className="h-1.5 w-4 rounded-full bg-emerald-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 rounded-lg bg-white border border-ink-100 p-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="h-1.5 w-14 rounded bg-ink-200" />
            <div className="flex gap-1">
              <div className="h-1.5 w-5 rounded-full bg-rose-200" />
              <div className="h-1.5 w-5 rounded-full bg-ink-100" />
            </div>
          </div>
          <Bars data={[40, 70, 50, 85, 60, 75, 55, 68]} className="h-[58px]" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 flex flex-col items-center justify-center gap-1.5">
          <Donut size={40} />
          <div className="w-full space-y-1">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={cn("size-1.5 rounded-full", i === 0 ? "bg-rose-300" : "bg-ink-200")} />
                <div className="h-1 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      <div className="mx-auto max-w-[64%] py-3 space-y-2.5">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="size-6 rounded-full bg-cream-200" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-20 rounded bg-ink-200" />
                <div className="h-1 w-12 rounded bg-ink-100" />
              </div>
              <div className="size-3 rounded-full bg-cream-200" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
            {i === 0 && <div className="h-16 rounded-lg bg-cream-100" />}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex items-center gap-1">
                <div className="size-3 rounded-full bg-rose-100" />
                <div className="h-1 w-4 rounded bg-ink-100" />
              </div>
              <div className="flex items-center gap-1">
                <div className="size-3 rounded-full bg-cream-200" />
                <div className="h-1 w-4 rounded bg-ink-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsFormBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[104px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", i === 0 && "bg-rose-50")}>
            <div className={cn("size-2.5 rounded-sm", i === 0 ? "bg-rose-400" : "bg-ink-200")} />
            <div className={cn("h-1.5 rounded", i === 0 ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-3 space-y-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-7 rounded-lg bg-white border border-ink-100" />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg bg-white border border-ink-100 p-2">
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-1 w-24 rounded bg-ink-100" />
            </div>
            <div className="h-4 w-7 rounded-full bg-rose-300 relative">
              <div className="absolute right-0.5 top-0.5 size-3 rounded-full bg-white" />
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 px-3 py-2 flex justify-end gap-2 bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </div>
  );
}

function TableViewBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-6 w-28 rounded-md bg-white border border-ink-100 flex items-center px-2 gap-1.5">
          <div className="size-2 rounded-full bg-ink-200" />
          <div className="h-1.5 w-14 rounded bg-ink-100" />
        </div>
        <div className="h-6 w-12 rounded-full bg-cream-100 border border-ink-100" />
        <div className="ml-auto size-6 rounded-md bg-white border border-ink-100" />
        <div className="h-6 w-14 rounded-md bg-rose-400" />
      </div>
      <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
        <div className="h-7 bg-cream-100 border-b border-ink-100 flex items-center gap-2 px-2">
          <div className="size-2.5 rounded-sm border border-ink-200" />
          <div className="h-1.5 w-12 rounded bg-ink-200" />
          <div className="ml-auto h-1.5 w-16 rounded bg-ink-200" />
          <div className="h-1.5 w-10 rounded bg-ink-200" />
          <div className="h-1.5 w-8 rounded bg-ink-200" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 border-b border-ink-100 last:border-0 flex items-center gap-2 px-2">
            <div className="size-2.5 rounded-sm border border-ink-200" />
            <div className="size-4 rounded-full bg-cream-200" />
            <div className="h-1.5 w-16 rounded bg-ink-200" />
            <div className="ml-auto h-1.5 w-16 rounded bg-ink-100" />
            <div className="h-3 w-10 rounded-full bg-emerald-100" />
            <div className="h-1 w-3 rounded bg-ink-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileDetailBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      <div className="h-14 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200" />
      <div className="px-3 -mt-5 flex items-end gap-2">
        <div className="size-12 rounded-2xl bg-white border-2 border-white shadow-sm" />
        <div className="flex-1 mb-1 space-y-1">
          <div className="h-2 w-24 rounded bg-ink-300" />
          <div className="h-1.5 w-16 rounded bg-ink-100" />
        </div>
        <div className="mb-1 h-6 w-16 rounded-md bg-rose-400" />
      </div>
      <div className="px-3 pt-2 flex items-center gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-2.5 w-8 rounded bg-ink-300" />
            <div className="h-1 w-10 rounded bg-ink-100" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 px-3 mt-2 border-b border-ink-100">
        {[0, 1, 2].map((i) => (
          <div key={i} className="pb-2">
            <div className={cn("h-2 w-8 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
            {i === 0 && <div className="mt-1.5 h-0.5 w-8 rounded-full bg-rose-400" />}
          </div>
        ))}
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-white border border-ink-100" />
        ))}
      </div>
    </div>
  );
}

function ChatLayout() {
  return (
    <Frame>
      <NavRail />
      <ChatBody />
    </Frame>
  );
}
function CalendarLayout() {
  return (
    <Frame>
      <NavRail />
      <CalendarBody />
    </Frame>
  );
}
function AnalyticsDashboard() {
  return (
    <Frame>
      <NavRail />
      <AnalyticsBody />
    </Frame>
  );
}
function FeedTimeline() {
  return (
    <Frame>
      <NavRail />
      <FeedBody />
    </Frame>
  );
}
function SettingsForm() {
  return (
    <Frame>
      <NavRail />
      <SettingsFormBody />
    </Frame>
  );
}
function DataTableView() {
  return (
    <Frame>
      <NavRail />
      <TableViewBody />
    </Frame>
  );
}
function ProfileDetail() {
  return (
    <Frame>
      <NavRail />
      <ProfileDetailBody />
    </Frame>
  );
}
function CollapsedSidebar() {
  return (
    <Frame>
      <IconRail />
      <Body />
    </Frame>
  );
}

/* ── Public + specialised patterns ────────────────────────────────────── */

function AuthSplit() {
  return (
    <Frame>
      <div className="flex-1 flex flex-col justify-center gap-2 bg-cream-50 px-5">
        <div className="size-7 rounded-[8px] bg-rose-400 mb-1" />
        <div className="h-2.5 w-24 rounded bg-ink-300" />
        <div className="mb-1 h-1.5 w-32 rounded bg-ink-100" />
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              <div className="h-7 rounded-lg bg-white border border-ink-100" />
            </div>
          ))}
          <div className="mt-1 h-7 rounded-lg bg-rose-400" />
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-ink-100" />
            <div className="h-1 w-4 rounded bg-ink-100" />
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <div className="h-7 rounded-lg bg-white border border-ink-200" />
        </div>
      </div>
      <div className="flex-1 bg-gradient-to-br from-rose-300 via-rose-200 to-cream-200 flex items-end p-3">
        <div className="w-full rounded-lg bg-white/80 p-2 space-y-1.5">
          <div className="h-1.5 rounded bg-ink-100" />
          <div className="h-1.5 w-3/4 rounded bg-ink-100" />
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="size-4 rounded-full bg-cream-200" />
            <div className="h-1.5 w-12 rounded bg-ink-200" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function PricingBody() {
  return (
    <div className="flex-1 bg-cream-50 p-3">
      <div className="flex flex-col items-center gap-1.5 mb-2.5">
        <div className="h-3 w-32 rounded bg-ink-300" />
        <div className="flex items-center gap-0.5 rounded-full bg-cream-100 border border-ink-100 p-0.5">
          {[true, false].map((a, i) => (
            <div key={i} className={cn("h-4 w-10 rounded-full", a && "bg-white shadow-sm")} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("relative rounded-lg border p-2.5 space-y-2", i === 1 ? "border-rose-300 bg-white shadow-sm" : "border-ink-100 bg-white")}>
            {i === 1 && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-12 rounded-full bg-rose-400" />}
            <div className="h-2 w-12 rounded bg-ink-200" />
            <div className="flex items-end gap-1">
              <div className="h-4 w-12 rounded bg-ink-300" />
              <div className="mb-0.5 h-1.5 w-6 rounded bg-ink-100" />
            </div>
            <div className="space-y-1 pt-1">
              {[0, 1, 2].map((r) => (
                <div key={r} className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-emerald-200" />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                </div>
              ))}
            </div>
            <div className={cn("mt-1 h-6 rounded-md", i === 1 ? "bg-rose-400" : "bg-cream-200")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaBody() {
  const heights = [60, 40, 52, 44, 56, 48, 64, 42];
  return (
    <div className="flex-1 bg-cream-50 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="h-2.5 w-20 rounded bg-ink-300" />
        <div className="flex gap-1.5">
          <div className="h-6 w-12 rounded-full bg-cream-100 border border-ink-100" />
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
      </div>
      <div className="columns-4 gap-2 [&>div]:mb-2 [&>div]:break-inside-avoid">
        {heights.map((h, i) => (
          <div key={i} className="rounded-lg bg-cream-100 border border-ink-100 relative overflow-hidden" style={{ height: h }}>
            <div className="absolute inset-x-1 bottom-1 h-1.5 w-2/3 rounded bg-white/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonBody() {
  return (
    <div className="flex-1 bg-cream-50 p-3">
      <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
        <div className="grid grid-cols-4 border-b border-ink-100 bg-cream-100">
          <div className="h-8 flex items-center px-2">
            <div className="h-1.5 w-12 rounded bg-ink-200" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-8 flex flex-col items-center justify-center gap-0.5", i === 1 && "bg-white")}>
              <div className={cn("h-1.5 w-10 rounded-full", i === 1 ? "bg-rose-300" : "bg-ink-200")} />
              <div className="h-2 w-8 rounded bg-ink-300" />
            </div>
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((r) => (
          <div key={r} className="grid grid-cols-4 border-b border-ink-100 last:border-0">
            <div className="h-6 flex items-center px-2">
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
            {[0, 1, 2].map((c) => (
              <div key={c} className={cn("h-6 flex items-center justify-center", c === 1 && "bg-rose-50/40")}>
                {c <= r % 3 || c === 1 ? <div className="size-2.5 rounded-full bg-emerald-200" /> : <div className="h-0.5 w-2 rounded bg-ink-200" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MapBody() {
  return (
    <div className="flex-1 bg-cream-50 flex">
      <div className="w-[132px] shrink-0 border-r border-ink-100 bg-white flex flex-col">
        <div className="h-7 border-b border-ink-100 flex items-center px-2">
          <div className="h-5 flex-1 rounded-md bg-cream-100 border border-ink-100" />
        </div>
        <div className="p-1.5 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("rounded-md border p-1.5 flex gap-1.5", i === 0 ? "border-rose-200 bg-rose-50" : "border-ink-100")}>
              <div className="size-8 rounded bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
                <div className="h-1.5 w-8 rounded-full bg-rose-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 relative bg-cream-100">
        <div className="absolute inset-2 rounded-lg bg-white/60 border border-ink-100" />
        <div className="absolute left-[30%] top-[34%] size-3 rounded-full bg-rose-500 border-2 border-white shadow" />
        <div className="absolute left-[55%] top-[55%] size-3 rounded-full bg-rose-400 border-2 border-white" />
        <div className="absolute left-[45%] top-[24%] size-3 rounded-full bg-rose-400 border-2 border-white" />
        <div className="absolute left-[40%] top-[44%] w-[88px] rounded-md bg-white border border-ink-100 shadow-sm p-1 space-y-1">
          <div className="h-6 rounded bg-cream-100" />
          <div className="h-1.5 w-2/3 rounded bg-ink-200" />
        </div>
      </div>
    </div>
  );
}

function FileBody() {
  return (
    <div className="flex-1 bg-cream-50 flex">
      <div className="w-[104px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn("flex items-center gap-1.5 rounded px-1 py-0.5", i === 2 && "bg-rose-50")} style={{ paddingLeft: i > 1 ? 12 : 4 }}>
            <div className={cn("size-2.5 rounded-sm", i < 2 ? "bg-amber-300" : "bg-ink-200")} />
            <div className={cn("h-1.5 rounded", i === 2 ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-8 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
          <div className="h-1.5 w-8 rounded bg-ink-200" />
          <div className="size-1 rounded-full bg-ink-200" />
          <div className="h-1.5 w-10 rounded bg-ink-300" />
          <div className="ml-auto size-5 rounded bg-cream-100 border border-ink-100" />
          <div className="h-5 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-9 rounded-md bg-white border border-ink-100 flex items-center justify-center">
                <div className={cn("size-4 rounded", i % 3 === 0 ? "bg-amber-200" : i % 3 === 1 ? "bg-rose-200" : "bg-ink-200")} />
              </div>
              <div className="h-1.5 w-2/3 rounded bg-ink-100 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingMarketing() {
  return (
    <Frame>
      <PricingBody />
    </Frame>
  );
}
function MediaGallery() {
  return (
    <Frame>
      <NavRail />
      <MediaBody />
    </Frame>
  );
}
function ComparisonTable() {
  return (
    <Frame>
      <NavRail />
      <ComparisonBody />
    </Frame>
  );
}
function MapList() {
  return (
    <Frame>
      <NavRail />
      <MapBody />
    </Frame>
  );
}
function FileBrowser() {
  return (
    <Frame>
      <NavRail />
      <FileBody />
    </Frame>
  );
}

/* ── Focused & power-user patterns ────────────────────────────────────── */

function TwoColFormBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
      <div className="px-3.5 pt-3 pb-2 border-b border-ink-100 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-1.5 w-32 rounded bg-ink-100" />
        </div>
        <div className="h-2 w-12 rounded-full bg-cream-200" />
      </div>
      <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
        <div className="flex-1 space-y-2">
          <div className="h-2 w-16 rounded bg-rose-300" />
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="h-6 rounded-md bg-white border border-ink-100" />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-16 rounded bg-ink-200" />
            <div className="h-10 rounded-md bg-white border border-ink-100" />
          </div>
          <div className="h-1.5 w-40 rounded bg-ink-100" />
        </div>
        <div className="w-[108px] shrink-0 space-y-2.5">
          <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <div className="size-8 rounded-full bg-rose-100 mx-auto" />
            <div className="h-1.5 w-3/4 rounded bg-ink-200 mx-auto" />
            <div className="h-1.5 w-1/2 rounded bg-ink-100 mx-auto" />
          </div>
          <div className="rounded-lg bg-cream-100 border border-ink-100 p-2 space-y-1.5">
            <div className="h-1.5 w-2/3 rounded bg-ink-200" />
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 w-3/4 rounded bg-ink-100" />
          </div>
        </div>
      </div>
      <div className="border-t border-ink-100 px-3.5 py-2 flex items-center justify-end gap-2 bg-white/50">
        <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
        <div className="h-6 w-16 rounded-md bg-rose-400" />
      </div>
    </div>
  );
}

function NotificationCenterBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
      <div className="mx-auto max-w-[74%] py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="h-1.5 w-16 rounded bg-rose-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-10 rounded-full bg-rose-100" />
          <div className="h-2 w-12 rounded-full bg-cream-100 border border-ink-100" />
        </div>
        <div className="mt-0.5 h-1.5 w-12 rounded bg-ink-300" />
        {[0, 1].map((i) => (
          <div key={`t${i}`} className="flex items-start gap-2 rounded-lg bg-white border border-ink-100 p-2">
            <div className="size-6 rounded-full bg-rose-100 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded bg-ink-200" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="h-1 w-6 rounded bg-ink-100" />
              <div className="size-1.5 rounded-full bg-rose-400" />
            </div>
          </div>
        ))}
        <div className="mt-1 h-1.5 w-16 rounded bg-ink-300" />
        {[0, 1].map((i) => (
          <div key={`e${i}`} className="flex items-start gap-2 rounded-lg bg-white border border-ink-100 p-2 opacity-80">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiPaneBody() {
  return (
    <div className="flex-1 min-w-0 bg-cream-50 flex">
      <div className="w-[88px] shrink-0 border-r border-ink-100 bg-white p-1.5 space-y-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", i === 1 && "bg-rose-50")}>
            <div className={cn("size-2 rounded-sm", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
            <div className={cn("h-1.5 rounded", i === 1 ? "w-9 bg-rose-300" : "w-8 bg-ink-100")} />
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col border-r border-ink-100 min-w-0">
        <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2">
          <div className="h-1.5 w-16 rounded bg-ink-300" />
          <div className="ml-auto size-4 rounded bg-cream-100" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="h-10 rounded-lg bg-white border border-ink-100" />
          <div className="h-8 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
      <div className="w-[96px] shrink-0 bg-white p-2 space-y-1.5">
        <div className="h-12 rounded-lg bg-cream-100" />
        <div className="h-1.5 w-2/3 rounded bg-ink-300" />
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1.5 w-6 rounded bg-ink-100" />
              <div className="h-1.5 w-8 rounded bg-ink-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwoColumnForm() {
  return (
    <Frame>
      <NavRail />
      <TwoColFormBody />
    </Frame>
  );
}
function NotificationCenter() {
  return (
    <Frame>
      <NavRail />
      <NotificationCenterBody />
    </Frame>
  );
}
function MultiPaneWorkspace() {
  return (
    <Frame>
      <NavRail />
      <MultiPaneBody />
    </Frame>
  );
}
function OnboardingFullscreen() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2.5 p-4">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-rose-400" />
          <div className="h-0.5 w-8 bg-rose-200" />
          <div className="size-3 rounded-full bg-rose-200" />
          <div className="h-0.5 w-8 bg-ink-100" />
          <div className="size-3 rounded-full bg-ink-100" />
        </div>
        <div className="mt-1 h-2.5 w-40 rounded bg-ink-300" />
        <div className="h-2 w-52 rounded bg-ink-100" />
        <div className="mt-1 flex gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("w-20 h-20 rounded-lg border bg-white p-2 flex flex-col items-center justify-center gap-1.5", i === 1 ? "border-rose-300 shadow-sm" : "border-ink-100")}>
              <div className="size-7 rounded-lg bg-rose-100" />
              <div className="h-1.5 w-12 rounded bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-7 w-20 rounded-lg bg-white border border-ink-200" />
          <div className="h-7 w-28 rounded-lg bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}
function ErrorPageLayout() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2 p-4">
        <div className="h-8 w-20 rounded-lg bg-rose-100 flex items-center justify-center">
          <div className="h-3 w-12 rounded bg-rose-300" />
        </div>
        <div className="mt-1 h-3 w-40 rounded bg-ink-300" />
        <div className="h-2 w-52 rounded bg-ink-100" />
        <div className="h-2 w-40 rounded bg-ink-100" />
        <div className="mt-1.5 flex gap-2">
          <div className="h-7 w-24 rounded-lg bg-rose-400" />
          <div className="h-7 w-24 rounded-lg bg-white border border-ink-200" />
        </div>
        <div className="mt-1 h-6 w-[60%] rounded-md bg-white border border-ink-100 flex items-center px-2">
          <div className="size-2 rounded-full bg-ink-200" />
          <div className="ml-1.5 h-1.5 w-20 rounded bg-ink-100" />
        </div>
      </div>
    </Frame>
  );
}
function DocumentInvoice() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-100 flex justify-center p-3 overflow-hidden">
        <div className="w-[64%] bg-white border border-ink-100 rounded-md shadow-sm p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="size-6 rounded bg-rose-400" />
              <div className="h-1.5 w-16 rounded bg-ink-200" />
            </div>
            <div className="space-y-1">
              <div className="h-2 w-14 rounded bg-ink-300 ml-auto" />
              <div className="h-1.5 w-10 rounded bg-ink-100 ml-auto" />
              <div className="h-1.5 w-12 rounded bg-ink-100 ml-auto" />
            </div>
          </div>
          <div className="flex justify-between pt-1">
            <div className="space-y-1">
              <div className="h-1 w-8 rounded bg-ink-200" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-8 rounded bg-ink-200 ml-auto" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
            </div>
          </div>
          <div className="mt-1 rounded border border-ink-100 overflow-hidden">
            <div className="h-5 bg-cream-100 border-b border-ink-100 flex items-center gap-2 px-1.5">
              <div className="h-1 w-12 rounded bg-ink-200" />
              <div className="ml-auto h-1 w-6 rounded bg-ink-200" />
              <div className="h-1 w-8 rounded bg-ink-200" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-5 border-b border-ink-100 last:border-0 flex items-center gap-2 px-1.5">
                <div className="h-1 w-1/2 rounded bg-ink-100" />
                <div className="ml-auto h-1 w-6 rounded bg-ink-100" />
                <div className="h-1 w-8 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="w-1/2 space-y-1">
              <div className="flex justify-between">
                <div className="h-1.5 w-10 rounded bg-ink-100" />
                <div className="h-1.5 w-8 rounded bg-ink-100" />
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-1">
                <div className="h-2 w-10 rounded bg-ink-300" />
                <div className="h-2 w-10 rounded bg-rose-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Page-only (content area, no app shell) ───────────────────────────── */

function ContentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

function PageOnlyStandard() {
  return (
    <ContentFrame>
      <div className="h-full p-4 space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-ink-300" />
            <div className="h-2 w-44 rounded bg-ink-100" />
          </div>
          <div className="flex gap-2">
            <div className="size-8 rounded-lg bg-white border border-ink-200" />
            <div className="h-8 w-24 rounded-lg bg-rose-400" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              <div className="flex items-end justify-between">
                <div className="h-3 w-9 rounded bg-ink-300" />
                <div className="h-1.5 w-5 rounded-full bg-emerald-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="h-2 w-16 rounded bg-ink-200" />
            <div className="h-2 w-10 rounded-full bg-cream-200" />
          </div>
          <Bars data={[45, 62, 52, 78, 60, 84, 68, 74]} className="h-[56px]" />
        </div>
      </div>
    </ContentFrame>
  );
}

function PageOnlyTwoColumn() {
  return (
    <ContentFrame>
      <div className="h-full p-4 space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-ink-300" />
            <div className="h-2 w-40 rounded bg-ink-100" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-rose-400" />
        </div>
        <div className="grid grid-cols-[1fr_148px] gap-3">
          <div className="space-y-2.5">
            <div className="h-24 rounded-lg bg-white border border-ink-100 p-2.5">
              <div className="mb-2 h-2 w-1/3 rounded bg-ink-200" />
              <Bars data={[50, 72, 48, 80, 60]} className="h-[44px]" />
            </div>
            <div className="h-16 rounded-lg bg-white border border-ink-100" />
          </div>
          <div className="space-y-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
            <div className="h-16 rounded-lg bg-cream-100 border border-ink-100" />
          </div>
        </div>
      </div>
    </ContentFrame>
  );
}

function PageOnlyCentered() {
  return (
    <ContentFrame>
      <div className="h-full p-4 overflow-hidden">
        <div className="mx-auto max-w-[66%] space-y-2.5">
          <div className="h-1.5 w-14 rounded-full bg-rose-200" />
          <div className="h-4 w-3/4 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-cream-200" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
          </div>
          <div className="h-20 rounded-lg bg-white border border-ink-100" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
            <div className="h-1.5 w-full rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </ContentFrame>
  );
}

function PageOnlySections() {
  return (
    <ContentFrame>
      <div className="h-full p-4 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-28 rounded bg-ink-300" />
          <div className="h-7 w-16 rounded-md bg-rose-400" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="size-4 rounded bg-rose-100" />
              <div className="h-2 w-24 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-8 rounded bg-ink-100" />
            </div>
            <div className="h-10 rounded bg-cream-50 border border-ink-100" />
          </div>
        ))}
      </div>
    </ContentFrame>
  );
}

/* ── Detailed page-layout variants ────────────────────────────────────── */

/* Sidebar-less dashboard that fills the full width (edge-to-edge). */
function FullWidthFluid() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-16 rounded-md bg-white border border-ink-100" />
          <div className="size-6 rounded-md bg-white border border-ink-100" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 p-3 space-y-2.5 min-h-0">
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="flex items-end justify-between">
                  <div className="h-2.5 w-9 rounded bg-ink-300" />
                  <div className="h-1.5 w-5 rounded-full bg-emerald-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-2.5">
            <div className="rounded-lg bg-white border border-ink-100 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-2 w-16 rounded bg-ink-200" />
                <div className="h-2 w-10 rounded-full bg-cream-200" />
              </div>
              <div className="flex items-end gap-1.5 h-[60px]">
                {[55, 72, 48, 84, 62, 78, 58, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-rose-200" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="size-3.5 rounded-full bg-cream-200 shrink-0" />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                  <div className="h-1.5 w-5 rounded bg-ink-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Narrow centered reading column — article / doc / changelog. */
function CenteredNarrow() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="mx-auto max-w-[58%] pt-4 space-y-2.5">
          <div className="h-1.5 w-12 rounded-full bg-rose-200" />
          <div className="h-4 w-5/6 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="size-4 rounded-full bg-cream-200" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
          </div>
          <div className="h-[104px] rounded-lg bg-white border border-ink-100" />
          <div className="space-y-1.5 pt-0.5">
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Marketing-style hero band over feature sections. */
function HeroOverview() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="h-[88px] bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 px-4 flex flex-col justify-center gap-1.5">
          <div className="h-3.5 w-40 rounded bg-white/70" />
          <div className="h-2 w-52 rounded bg-white/50" />
          <div className="flex gap-1.5 mt-1">
            <div className="h-6 w-20 rounded-md bg-rose-400" />
            <div className="h-6 w-16 rounded-md bg-white/70" />
          </div>
        </div>
        <div className="p-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
                <div className="size-5 rounded-md bg-rose-100" />
                <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                <div className="h-1.5 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="h-12 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* Centered single-column labelled form with a sticky footer. */
function FormSingleColumn() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
        </div>
        <div className="flex-1 overflow-hidden px-3.5 py-3">
          <div className="mx-auto max-w-[82%] space-y-2.5">
            <div className="h-2 w-16 rounded bg-rose-300" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1.5 w-14 rounded bg-ink-200" />
                <div className="h-7 rounded-md bg-white border border-ink-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-end gap-2 bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Multi-step form with a vertical stepper rail. */
function FormStepperAside() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="flex-1 flex gap-3 p-3.5 min-h-0 overflow-hidden">
          <div className="w-[92px] shrink-0 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("size-4 rounded-full shrink-0", i === 1 ? "bg-rose-400" : i < 1 ? "bg-rose-300" : "bg-ink-100")} />
                <div className="space-y-1">
                  <div className={cn("h-1.5 w-12 rounded", i === 1 ? "bg-ink-300" : "bg-ink-200")} />
                  <div className="h-1 w-8 rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2.5 border-l border-ink-100 pl-3">
            <div className="h-2.5 w-20 rounded bg-ink-300" />
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-1.5 w-12 rounded bg-ink-200" />
                  <div className="h-7 rounded-md bg-white border border-ink-100" />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-10 rounded-md bg-white border border-ink-100" />
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Form on the left + live order / review summary on the right. */
function FormReview() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2.5">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-7 rounded-md bg-white border border-ink-100" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1.5 w-10 rounded bg-ink-200" />
                <div className="h-7 rounded-md bg-white border border-ink-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-[124px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="h-2 w-16 rounded bg-ink-300" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1.5 w-12 rounded bg-ink-100" />
                <div className="h-1.5 w-6 rounded bg-ink-200" />
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

/* Executive dashboard led by a large hero KPI tile. */
function DashboardHero() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5 overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
          <div className="h-[96px] rounded-lg bg-gradient-to-br from-rose-300 to-rose-200 p-2.5 flex flex-col justify-between">
            <div className="h-1.5 w-16 rounded bg-white/60" />
            <div className="h-6 w-24 rounded bg-white/70" />
            <div className="flex items-end gap-1 h-6">
              {[40, 60, 50, 75, 65, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-white/50" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2.5">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="flex items-end justify-between">
                  <div className="h-2.5 w-10 rounded bg-ink-300" />
                  <div className="h-1.5 w-6 rounded-full bg-emerald-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white border border-ink-100" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Detail page with a sticky summary / action card aside. */
function DetailStickyAside() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-8 rounded bg-ink-100" />
            <div className="size-1 rounded-full bg-ink-200" />
            <div className="h-1.5 w-12 rounded bg-ink-200" />
          </div>
          <div className="h-3 w-32 rounded bg-ink-300" />
          <div className="h-2 w-40 rounded bg-ink-100" />
          <div className="h-20 rounded-lg bg-white border border-ink-100 mt-1" />
          <div className="space-y-1.5">
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
          </div>
        </div>
        <div className="w-[120px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-200 shadow-sm p-2.5 space-y-2">
            <div className="h-2 w-12 rounded bg-ink-300" />
            <div className="h-3 w-16 rounded bg-rose-300" />
            <div className="h-7 rounded-md bg-rose-400" />
            <div className="h-7 rounded-md bg-white border border-ink-200" />
            <div className="border-t border-ink-100 pt-1.5 space-y-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-1.5 w-8 rounded bg-ink-100" />
                  <div className="h-1.5 w-10 rounded bg-ink-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Tabs + sub-nav · V1 — top tabs + a labelled vertical sub-nav rail. */
function TabbedSubnav() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="flex items-center gap-3 px-3.5 border-b border-ink-100">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pt-0.5 pb-1.5">
              <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1 h-0.5 w-10 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="flex-1 flex gap-3 p-3 min-h-0">
          <div className="w-[92px] shrink-0 space-y-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("flex items-center gap-1.5 rounded px-1.5 py-1", i === 1 && "bg-rose-50")}>
                <div className={cn("size-2 rounded-sm shrink-0", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
                <div className={cn("h-1.5 rounded", i === 1 ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2 border-l border-ink-100 pl-3">
            <div className="h-2.5 w-1/3 rounded bg-ink-300" />
            <div className="h-16 rounded-lg bg-white border border-ink-100" />
            <div className="h-9 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Tabs + sub-nav · V2 — tabs with a horizontal pill sub-nav + card grid. */
function TabbedSubnavV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-3.5 pt-3 border-b border-ink-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-2">
              <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1.5 h-0.5 w-10 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-ink-100">
          {[true, false, false, false].map((a, i) => (
            <div key={i} className={cn("h-5 w-10 rounded-full", a ? "bg-rose-100" : "bg-cream-100 border border-ink-100")} />
          ))}
        </div>
        <div className="p-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[52px] rounded-lg bg-white border border-ink-100" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Tabs + sub-nav · V3 — tabs + sub-nav list driving a settings detail. */
function TabbedSubnavV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex gap-3 p-3 min-h-0">
          <div className="w-[88px] shrink-0 space-y-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("h-6 rounded-md flex items-center px-1.5", i === 0 && "bg-rose-50")}>
                <div className={cn("h-1.5 rounded", i === 0 ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-2 w-1/4 rounded bg-rose-300" />
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1.5 w-14 rounded bg-ink-200" />
                <div className="h-7 rounded-md bg-white border border-ink-100" />
              </div>
            ))}
            <div className="flex justify-end">
              <div className="h-6 w-16 rounded-md bg-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Classic 3-pane inbox — folder rail, message list, reading pane. */
function InboxThreePane() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[148px] shrink-0 border-r border-ink-100 bg-white flex flex-col">
          <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2">
            <div className="h-2 w-12 rounded bg-ink-300" />
            <div className="ml-auto size-3.5 rounded bg-cream-200" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("border-b border-ink-100 p-2 space-y-1", i === 0 && "bg-rose-50")}>
              <div className="flex items-center gap-1.5">
                {i === 0 && <div className="size-1.5 rounded-full bg-rose-400 shrink-0" />}
                <div className={cn("h-1.5 w-14 rounded", i === 0 ? "bg-ink-300" : "bg-ink-200")} />
                <div className="ml-auto h-1 w-5 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-1.5 w-full rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-8 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
            <div className="size-5 rounded-md bg-cream-100" />
            <div className="size-5 rounded-md bg-cream-100" />
            <div className="ml-auto size-5 rounded-md bg-cream-100" />
          </div>
          <div className="p-3 space-y-2 min-w-0">
            <div className="h-2.5 w-2/3 rounded bg-ink-300" />
            <div className="flex items-center gap-1.5">
              <div className="size-5 rounded-full bg-cream-200" />
              <div className="space-y-1">
                <div className="h-1.5 w-16 rounded bg-ink-200" />
                <div className="h-1 w-10 rounded bg-ink-100" />
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-4/5 rounded bg-ink-100" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · full-width & centered family ────────────── */

/* Full-width centered · V2 — contained page led by a hero band. */
function FullWidthCenteredV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-100/60 overflow-hidden">
        <div className="mx-auto h-full w-[80%] border-x border-ink-100 bg-cream-50">
          <div className="h-[70px] bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 px-3.5 flex flex-col justify-center gap-1.5">
            <div className="h-3 w-32 rounded bg-white/70" />
            <div className="h-2 w-44 rounded bg-white/50" />
          </div>
          <div className="px-3.5 pt-3 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-3 w-1/2 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="px-3.5 pt-2.5">
            <div className="h-16 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Full-width centered · V3 — contained page with a main + aside split. */
function FullWidthCenteredV3() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-100/60 overflow-hidden">
        <div className="mx-auto h-full w-[82%] border-x border-ink-100 bg-cream-50 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-ink-300" />
              <div className="h-2 w-36 rounded bg-ink-100" />
            </div>
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div className="space-y-2.5">
              <div className="h-24 rounded-lg bg-white border border-ink-100" />
              <div className="h-14 rounded-lg bg-white border border-ink-100" />
            </div>
            <div className="space-y-2.5">
              <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                <div className="h-1.5 rounded bg-ink-100" />
                <div className="h-1.5 w-3/4 rounded bg-ink-100" />
              </div>
              <div className="h-16 rounded-lg bg-cream-100 border border-ink-100" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Full-width fluid · V2 — edge-to-edge with a hero KPI row. */
function FullWidthFluidV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-ink-100">
          <div className="h-2.5 w-28 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2.5">
            <div className="h-[72px] rounded-lg bg-gradient-to-br from-rose-300 to-rose-200 p-2.5 flex flex-col justify-between">
              <div className="h-1.5 w-16 rounded bg-white/60" />
              <div className="h-5 w-24 rounded bg-white/70" />
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="h-[72px] rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-2.5 w-1/2 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white border border-ink-100" />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Full-width fluid · V3 — work area + a full-height side panel. */
function FullWidthFluidV3() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-12 rounded-md bg-white border border-ink-100" />
          <div className="h-5 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 p-3 space-y-2.5">
            <div className="h-2 w-1/3 rounded bg-ink-200" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-20 rounded-lg bg-white border border-ink-100" />
              <div className="h-20 rounded-lg bg-white border border-ink-100" />
              <div className="h-14 rounded-lg bg-white border border-ink-100" />
              <div className="h-14 rounded-lg bg-white border border-ink-100" />
            </div>
          </div>
          <div className="w-[132px] shrink-0 border-l border-ink-100 bg-white p-2.5 space-y-2">
            <div className="h-2 w-2/3 rounded bg-ink-300" />
            <div className="h-16 rounded-lg bg-cream-100" />
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-1.5 rounded bg-ink-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Centered narrow · V2 — reading column with a side table of contents. */
function CenteredNarrowV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex justify-center">
        <div className="w-[72%] flex gap-3 pt-4">
          <div className="w-[72px] shrink-0 space-y-1.5">
            <div className="h-1.5 w-10 rounded bg-ink-300" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("h-1.5 rounded", i === 0 ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
            ))}
          </div>
          <div className="flex-1 space-y-2 border-l border-ink-100 pl-3">
            <div className="h-3.5 w-3/4 rounded bg-ink-300" />
            <div className="space-y-1.5">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-4/5 rounded bg-ink-100" />
            </div>
            <div className="h-16 rounded-lg bg-white border border-ink-100" />
            <div className="space-y-1.5">
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Centered narrow · V3 — dated changelog / release-notes column. */
function CenteredNarrowV3() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="mx-auto max-w-[64%] pt-4 space-y-2.5">
          <div className="h-3.5 w-28 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-12 shrink-0 space-y-1">
                <div className="h-1.5 w-10 rounded bg-ink-200" />
                <div className="h-1.5 w-8 rounded-full bg-rose-100" />
              </div>
              <div className="flex-1 space-y-1.5 border-l border-ink-100 pl-2.5 pb-1">
                <div className="h-2 w-1/2 rounded bg-ink-300" />
                <div className="h-1.5 rounded bg-ink-100" />
                <div className="h-1.5 w-3/4 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Hero + sections · V2 — hero, a centred feature grid, and a CTA band. */
function HeroOverviewV2() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="h-[64px] bg-gradient-to-br from-rose-200 to-cream-200 flex flex-col items-center justify-center gap-1.5">
          <div className="h-3 w-36 rounded bg-white/70" />
          <div className="h-2 w-48 rounded bg-white/50" />
        </div>
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5 flex flex-col items-center text-center">
                <div className="size-6 rounded-lg bg-rose-100" />
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1.5 w-full rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="h-10 rounded-lg bg-rose-400/90 flex items-center justify-center">
            <div className="h-2 w-24 rounded bg-white/60" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Hero + sections · V3 — split hero (copy + visual) over a stat strip. */
function HeroOverviewV3() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="flex gap-3 p-3.5 items-center">
          <div className="flex-1 space-y-2">
            <div className="h-1.5 w-12 rounded-full bg-rose-200" />
            <div className="h-3.5 w-3/4 rounded bg-ink-300" />
            <div className="h-2 w-full rounded bg-ink-100" />
            <div className="h-2 w-2/3 rounded bg-ink-100" />
            <div className="flex gap-1.5 mt-1">
              <div className="h-6 w-20 rounded-md bg-rose-400" />
              <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            </div>
          </div>
          <div className="w-[180px] h-[120px] rounded-lg bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 border border-ink-100 shrink-0" />
        </div>
        <div className="px-3.5">
          <div className="h-px bg-ink-100" />
        </div>
        <div className="flex items-center justify-around px-3.5 py-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1 flex flex-col items-center">
              <div className="h-3 w-8 rounded bg-ink-300" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · workspace patterns ──────────────────────── */

/* Split view · V2 — editor with a properties panel. */
function SplitViewV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 flex flex-col border-r border-ink-100">
          <div className="h-8 border-b border-ink-100 flex items-center gap-2 px-3">
            <div className="h-2 w-20 rounded bg-ink-300" />
            <div className="ml-auto h-5 w-12 rounded-md bg-rose-400" />
          </div>
          <div className="p-3 flex-1">
            <div className="h-full min-h-[150px] rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
        <div className="w-[120px] shrink-0 p-2.5 space-y-2 bg-white">
          <div className="h-2 w-2/3 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              <div className="h-6 rounded-md bg-cream-50 border border-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Split view · V3 — side-by-side compare / diff columns. */
function SplitViewV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-8 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="h-1.5 w-16 rounded bg-ink-200" />
          <div className="ml-auto h-1.5 w-16 rounded bg-ink-200" />
        </div>
        <div className="flex-1 flex">
          {[0, 1].map((col) => (
            <div key={col} className={cn("flex-1 p-2.5 space-y-1.5", col === 0 && "border-r border-ink-100")}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-8 rounded-md border",
                    col === 1 && i === 1 ? "border-emerald-200 bg-emerald-50" : col === 0 && i === 1 ? "border-rose-200 bg-rose-50" : "border-ink-100 bg-white",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* List + detail · V2 — avatar list driving a tabbed detail. */
function ListDetailV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[120px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md p-1.5", i === 2 && "bg-rose-50")}>
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1 w-1/2 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-3 pt-3 pb-2">
            <div className="h-2.5 w-28 rounded bg-ink-300" />
          </div>
          <div className="flex items-center gap-3 px-3 border-b border-ink-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pb-2">
                <div className={cn("h-2 w-8 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
                {i === 0 && <div className="mt-1.5 h-0.5 w-8 rounded-full bg-rose-400" />}
              </div>
            ))}
          </div>
          <div className="p-3 space-y-2">
            <div className="h-16 rounded-lg bg-white border border-ink-100" />
            <div className="h-10 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* List + detail · V3 — dense list + a hero-banner detail. */
function ListDetailV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[108px] shrink-0 border-r border-ink-100 bg-white">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-8 border-b border-ink-100 flex items-center gap-1.5 px-2", i === 0 && "bg-rose-50")}>
              <div className={cn("size-1.5 rounded-full", i === 0 ? "bg-rose-400" : "bg-ink-200")} />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="h-16 bg-gradient-to-r from-rose-200 to-cream-200 flex items-end p-2.5">
            <div className="size-8 rounded-lg bg-white shadow-sm" />
            <div className="ml-2 mb-1 h-2 w-20 rounded bg-white/70" />
          </div>
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-white border border-ink-100" />
              ))}
            </div>
            <div className="h-12 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Kanban · V2 — toolbar over horizontal swimlanes. */
function KanbanBoardV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <div className="h-8 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-12 rounded-full bg-cream-100 border border-ink-100" />
          <div className="h-5 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 p-2.5 space-y-2 overflow-hidden">
          {[0, 1].map((lane) => (
            <div key={lane} className="flex items-stretch gap-2">
              <div className="w-[18px] shrink-0 rounded bg-cream-100 border border-ink-100" />
              <div className="flex-1 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-md bg-white border border-ink-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Kanban · V3 — columns with chips and a per-column count. */
function KanbanBoardV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex gap-2.5 overflow-hidden">
        {["bg-ink-200", "bg-rose-300", "bg-emerald-300"].map((head, c) => (
          <div key={head} className="flex-1 rounded-lg bg-cream-100/60 border border-ink-100 p-1.5 space-y-1.5">
            <div className="flex items-center gap-1.5 px-0.5">
              <div className={cn("size-2 rounded-full", head)} />
              <div className="h-1.5 w-10 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-4 rounded-full bg-ink-100" />
            </div>
            {[0, 1, 2].slice(0, c === 1 ? 3 : 2).map((i) => (
              <div key={i} className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1">
                <div className="h-1.5 w-12 rounded-full bg-rose-100" />
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Empty state · V2 — getting-started checklist. */
function EmptyStateV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex items-center justify-center p-4">
        <div className="w-[72%] space-y-2.5">
          <div className="text-center space-y-1.5">
            <div className="h-2.5 w-32 rounded bg-ink-300 mx-auto" />
            <div className="h-2 w-44 rounded bg-ink-100 mx-auto" />
          </div>
          <div className="rounded-lg bg-white border border-ink-100 divide-y divide-ink-100">
            {[true, true, false, false].map((done, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <div className={cn("size-4 rounded-full shrink-0", done ? "bg-emerald-200" : "border-2 border-ink-200")} />
                <div className="h-1.5 flex-1 rounded bg-ink-200" />
                <div className="h-5 w-10 rounded-md bg-cream-100 border border-ink-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Empty state · V3 — pick a starter template. */
function EmptyStateV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col items-center justify-center gap-2.5 p-4">
        <div className="h-2.5 w-36 rounded bg-ink-300" />
        <div className="h-2 w-48 rounded bg-ink-100" />
        <div className="grid grid-cols-3 gap-2.5 mt-1 w-[80%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("rounded-lg border bg-white p-2 space-y-1.5", i === 1 ? "border-rose-300 shadow-sm" : "border-ink-100")}>
              <div className="h-10 rounded-md bg-cream-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-1.5 w-full rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · grids, wizards, collapsed ───────────────── */

/* Card grid · V2 — toolbar over a masonry grid. */
function CardGridV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="h-9 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="h-6 w-28 rounded-md bg-white border border-ink-100" />
          <div className="ml-auto h-6 w-12 rounded-full bg-cream-100 border border-ink-100" />
          <div className="h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 columns-3 gap-2.5 [&>div]:mb-2.5 [&>div]:break-inside-avoid">
          {[64, 48, 56, 44, 60, 50].map((h, i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100" style={{ height: h }} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Card grid · V3 — horizontal list cards. */
function CardGridV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2">
        <div className="h-2.5 w-24 rounded bg-ink-300 mb-1" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2.5">
            <div className="size-11 rounded-md bg-cream-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 w-1/3 rounded bg-ink-200" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="h-2 w-8 rounded-full bg-emerald-100" />
              <div className="h-5 w-12 rounded-md bg-white border border-ink-200" />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Wizard · V2 — vertical stepper rail + form. */
function WizardStepsV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[120px] shrink-0 bg-white border-r border-ink-100 p-3 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("size-5 rounded-full shrink-0", i === 0 ? "bg-rose-300" : i === 1 ? "bg-rose-400" : "bg-ink-100")} />
              <div className="space-y-1">
                <div className={cn("h-1.5 w-12 rounded", i <= 1 ? "bg-ink-300" : "bg-ink-200")} />
                <div className="h-1 w-8 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-3.5 space-y-2.5">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-1.5 w-12 rounded bg-ink-200" />
                  <div className="h-7 rounded-lg bg-white border border-ink-100" />
                </div>
              ))}
            </div>
            <div className="h-9 rounded-lg bg-white border border-ink-100" />
          </div>
          <div className="border-t border-ink-100 px-3.5 py-2 flex justify-end gap-2 bg-white/50">
            <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Wizard · V3 — progress bar + a pick-one card step. */
function WizardStepsV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="h-2 w-20 rounded bg-ink-300" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
          </div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <div className="h-full w-2/5 rounded-full bg-rose-400" />
          </div>
        </div>
        <div className="flex-1 p-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn("rounded-lg border bg-white p-2 space-y-1.5", i === 2 ? "border-rose-300 shadow-sm" : "border-ink-100")}>
                <div className="size-6 rounded-md bg-rose-100 mx-auto" />
                <div className="h-1.5 w-3/4 rounded bg-ink-200 mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Collapsed sidebar · V2 — icon rail + top bar + KPI content. */
function CollapsedSidebarV2() {
  return (
    <Frame>
      <IconRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="h-9 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="size-6 rounded-md bg-white border border-ink-100" />
          <div className="h-2 w-24 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[44px] rounded-lg bg-white border border-ink-100 p-2 flex flex-col justify-between">
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              <div className="h-2.5 w-1/2 rounded bg-ink-300" />
            </div>
          ))}
          <div className="col-span-3 h-16 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* Collapsed sidebar · V3 — icon rail + focused work canvas. */
function CollapsedSidebarV3() {
  return (
    <Frame>
      <IconRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-ink-100">
          <div className="h-2 w-28 rounded bg-ink-300" />
          <div className="flex gap-1.5">
            <div className="size-6 rounded-md bg-white border border-ink-100" />
            <div className="size-6 rounded-md bg-white border border-ink-100" />
          </div>
        </div>
        <div className="flex-1 p-3">
          <div className="h-full min-h-[170px] rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · messaging & calendar ────────────────────── */

/* Chat · V2 — conversation with a member / details panel. */
function ChatLayoutV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 flex flex-col min-w-0 border-r border-ink-100">
          <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
            <div className="size-4 rounded-full bg-cream-200" />
            <div className="h-1.5 w-20 rounded bg-ink-200" />
          </div>
          <div className="flex-1 p-2.5 space-y-1.5">
            <div className="h-6 w-3/5 rounded-xl rounded-bl-sm bg-white border border-ink-100" />
            <div className="h-7 w-1/2 rounded-xl rounded-br-sm bg-rose-100 ml-auto" />
            <div className="h-6 w-2/5 rounded-xl rounded-bl-sm bg-white border border-ink-100" />
          </div>
          <div className="border-t border-ink-100 p-2">
            <div className="h-7 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
        <div className="w-[112px] shrink-0 bg-white p-2.5 space-y-2">
          <div className="size-10 rounded-full bg-cream-200 mx-auto" />
          <div className="h-1.5 w-3/4 rounded bg-ink-300 mx-auto" />
          <div className="h-1.5 w-1/2 rounded bg-ink-100 mx-auto" />
          <div className="pt-1 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1.5 w-8 rounded bg-ink-100" />
                <div className="h-1.5 w-10 rounded bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Chat · V3 — workspace channels (icon rail + channel list + thread). */
function ChatLayoutV3() {
  return (
    <Frame>
      <IconRail />
      <div className="w-[112px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-2">
        {[0, 1].map((g) => (
          <div key={g} className="space-y-0.5">
            <div className="ml-1 h-1 w-10 rounded bg-ink-200" />
            {[g === 0, false, false].map((a, i) => (
              <div key={i} className={cn("flex items-center gap-1.5 rounded px-1.5 py-1", a && "bg-rose-50")}>
                <div className="h-1.5 w-2 rounded bg-ink-300" />
                <div className={cn("h-1.5 rounded", a ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-cream-50">
        <div className="h-7 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
          <div className="h-1.5 w-2 rounded bg-ink-300" />
          <div className="h-1.5 w-16 rounded bg-ink-200" />
        </div>
        <div className="flex-1 p-2.5 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1.5">
              <div className="size-5 rounded-md bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-1/4 rounded bg-ink-200" />
                <div className="h-1.5 w-3/4 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 p-2">
          <div className="h-7 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* Inbox · V2 — compact list + reading pane with reply actions. */
function InboxThreePaneV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[136px] shrink-0 border-r border-ink-100 bg-white">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-9 border-b border-ink-100 px-2 flex flex-col justify-center gap-1", i === 1 && "bg-rose-50")}>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="ml-auto h-1 w-4 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="p-3 space-y-2 flex-1">
            <div className="h-2.5 w-3/5 rounded bg-ink-300" />
            <div className="h-2 w-1/3 rounded bg-ink-100" />
            <div className="h-14 rounded-lg bg-white border border-ink-100 mt-1" />
          </div>
          <div className="border-t border-ink-100 p-2 flex gap-1.5">
            <div className="h-6 w-14 rounded-md bg-rose-400" />
            <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            <div className="ml-auto size-6 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Inbox · V3 — horizontal split (list above, reading below). */
function InboxThreePaneV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-[120px] border-b border-ink-100 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("h-7 border-b border-ink-100 flex items-center gap-2 px-2.5", i === 1 && "bg-rose-50")}>
              <div className="size-1.5 rounded-full bg-ink-200" />
              <div className="h-1.5 w-1/5 rounded bg-ink-200" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
              <div className="h-1 w-6 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 space-y-2">
          <div className="h-2.5 w-1/2 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-cream-200" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 w-3/4 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Calendar · V2 — week view with time-blocked events. */
function CalendarLayoutV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-8 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 flex">
          <div className="w-7 shrink-0 border-r border-ink-100 py-1 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mx-auto h-1 w-4 rounded bg-ink-100" />
            ))}
          </div>
          <div className="flex-1 grid grid-cols-5">
            {[0, 1, 2, 3, 4].map((c) => (
              <div key={c} className="border-r border-ink-100 last:border-0 relative">
                {c === 1 && <div className="absolute left-0.5 right-0.5 top-3 h-8 rounded bg-rose-100 border border-rose-200" />}
                {c === 3 && <div className="absolute left-0.5 right-0.5 top-10 h-10 rounded bg-emerald-100 border border-emerald-200" />}
                {c === 2 && <div className="absolute left-0.5 right-0.5 top-6 h-6 rounded bg-ink-100" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Calendar · V3 — date-grouped agenda list. */
function CalendarLayoutV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="h-5 w-14 rounded-md bg-rose-400" />
        </div>
        {[0, 1].map((g) => (
          <div key={g} className="space-y-1.5">
            <div className="h-1.5 w-16 rounded bg-ink-200" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-ink-100 p-2">
                <div className={cn("h-8 w-1 rounded-full", i === 0 ? "bg-rose-300" : "bg-emerald-300")} />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-1/2 rounded bg-ink-200" />
                  <div className="h-1.5 w-1/3 rounded bg-ink-100" />
                </div>
                <div className="h-1.5 w-10 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · dashboards & feeds ──────────────────────── */

/* Analytics · V2 — date-range header, area chart, breakdown bars. */
function AnalyticsDashboardV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-9 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-20 rounded-md bg-white border border-ink-100" />
        </div>
        <div className="p-3 space-y-2.5">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-2 w-16 rounded bg-ink-200" />
              <div className="h-2.5 w-12 rounded bg-ink-300" />
            </div>
            <div className="h-[60px] rounded bg-gradient-to-t from-rose-100 to-transparent border-b border-rose-300" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[70, 45, 85].map((w, i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                  <div className="h-full rounded-full bg-rose-300" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Analytics · V3 — metric cards with sparklines + a leaderboard. */
function AnalyticsDashboardV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 grid grid-cols-[1fr_140px] gap-2.5 overflow-hidden">
        <div className="grid grid-cols-2 gap-2.5 content-start">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                <div className="h-1.5 w-4 rounded-full bg-emerald-200" />
              </div>
              <div className="h-2.5 w-1/2 rounded bg-ink-300" />
              <Bars data={[40, 60, 50, 75, 55]} className="h-[20px]" />
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
          <div className="h-1.5 w-2/3 rounded bg-ink-300" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-1.5 w-2 rounded bg-ink-200" />
              <div className="size-3.5 rounded-full bg-cream-200" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
              <div className="h-1.5 w-5 rounded bg-ink-200" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Dashboard hero · V2 — chart hero + a KPI strip. */
function DashboardHeroV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5 overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-3 w-20 rounded bg-ink-300" />
            </div>
            <div className="flex items-center gap-0.5 rounded-md bg-cream-100 border border-ink-100 p-0.5">
              {[true, false, false].map((a, i) => (
                <div key={i} className={cn("h-3.5 w-6 rounded", a && "bg-white shadow-sm")} />
              ))}
            </div>
          </div>
          <Bars data={[45, 62, 52, 78, 60, 84, 68, 74, 58, 80]} className="h-[56px]" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1">
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              <div className="h-2.5 w-1/2 rounded bg-ink-300" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Dashboard hero · V3 — greeting, quick-action tiles, activity. */
function DashboardHeroV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2.5 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-rose-100" />
          <div className="space-y-1">
            <div className="h-2.5 w-28 rounded bg-ink-300" />
            <div className="h-1.5 w-20 rounded bg-ink-100" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex flex-col items-center gap-1.5">
              <div className="size-6 rounded-lg bg-rose-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
          <div className="h-1.5 w-1/4 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-3.5 rounded-full bg-cream-200" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
              <div className="h-1.5 w-8 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Feed · V2 — vertical timeline with connected nodes. */
function FeedTimelineV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden p-3">
        <div className="mx-auto max-w-[78%]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2.5">
              <div className="flex flex-col items-center">
                <div className={cn("size-3 rounded-full border-2 border-white shrink-0", i === 0 ? "bg-rose-400" : "bg-ink-200")} />
                {i < 3 && <div className="w-px flex-1 bg-ink-100" />}
              </div>
              <div className="flex-1 pb-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1/3 rounded bg-ink-200" />
                  <div className="h-1 w-8 rounded bg-ink-100" />
                </div>
                <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1">
                  <div className="h-1.5 rounded bg-ink-100" />
                  <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Feed · V3 — main feed + a suggestions sidebar. */
function FeedTimelineV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex gap-3 p-3">
        <div className="flex-1 space-y-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="size-5 rounded-full bg-cream-200" />
                <div className="h-1.5 w-16 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 rounded bg-ink-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="w-[120px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <div className="h-1.5 w-2/3 rounded bg-ink-300" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-4 rounded-full bg-cream-200" />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
                <div className="h-3 w-6 rounded-md bg-rose-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Settings · V2 — section cards with toggles. */
function SettingsFormV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden p-3 space-y-2.5">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
          <div className="h-2 w-1/4 rounded bg-ink-300" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="h-6 rounded-md bg-cream-50 border border-ink-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
          <div className="h-2 w-1/3 rounded bg-ink-300" />
          {[true, false].map((on, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              <div className={cn("h-4 w-7 rounded-full relative", on ? "bg-rose-300" : "bg-ink-200")}>
                <div className={cn("absolute top-0.5 size-3 rounded-full bg-white", on ? "right-0.5" : "left-0.5")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Settings · V3 — profile header + tabbed sections. */
function SettingsFormV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <div className="size-9 rounded-full bg-cream-200" />
          <div className="space-y-1">
            <div className="h-2 w-20 rounded bg-ink-300" />
            <div className="h-1.5 w-14 rounded bg-ink-100" />
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 border-b border-ink-100">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pb-2">
              <div className={cn("h-2 w-8 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1.5 h-0.5 w-8 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-7 rounded-lg bg-white border border-ink-100" />
            </div>
          ))}
          <div className="flex justify-end">
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · data table & detail ─────────────────────── */

/* Data table · V2 — dense compact rows with pagination. */
function DataTableV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-8 border-b border-ink-100 flex items-center gap-2 px-2.5">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-16 rounded-md bg-white border border-ink-100" />
          <div className="h-5 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="h-6 bg-cream-100 border-b border-ink-100 flex items-center gap-2 px-2">
            {[48, 64, 40, 48, 32].map((w, i) => (
              <div key={i} className={cn("h-1.5 rounded bg-ink-200", i === 2 && "ml-auto")} style={{ width: w }} />
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={cn("h-6 border-b border-ink-100 flex items-center gap-2 px-2", i % 2 === 1 && "bg-cream-100/40")}>
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-100" />
              <div className="h-1.5 w-12 rounded bg-ink-100" />
              <div className={cn("size-2 rounded-full", i % 3 === 0 ? "bg-emerald-300" : i % 3 === 1 ? "bg-amber-300" : "bg-ink-200")} />
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 px-2.5 py-1.5 flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded bg-ink-100" />
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("size-4 rounded", i === 0 ? "bg-rose-100" : "bg-cream-100 border border-ink-100")} />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Data table · V3 — card-influenced rows. */
function DataTableV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2.5">
              <div className="size-7 rounded-md bg-cream-100 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-1/3 rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 w-12 rounded bg-ink-100" />
              <div className="h-3 w-12 rounded-full bg-emerald-100" />
              <div className="size-6 rounded-md bg-white border border-ink-200" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Data table · V4 — minimal, borderless, airy. */
function DataTableV4() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 px-4 py-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-1.5 w-12 rounded bg-ink-100" />
        </div>
        <div>
          <div className="flex items-center gap-3 pb-2 border-b border-ink-200">
            <div className="h-1.5 w-16 rounded bg-ink-300" />
            <div className="ml-auto h-1.5 w-16 rounded bg-ink-300" />
            <div className="h-1.5 w-10 rounded bg-ink-300" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-ink-100/70">
              <div className="size-5 rounded-full bg-cream-200" />
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-16 rounded bg-ink-100" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Profile · V2 — stat cards + activity. */
function ProfileDetailV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden p-3 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="size-12 rounded-full bg-cream-200" />
          <div className="flex-1 space-y-1">
            <div className="h-2.5 w-28 rounded bg-ink-300" />
            <div className="h-1.5 w-20 rounded bg-ink-100" />
          </div>
          <div className="h-6 w-16 rounded-md bg-white border border-ink-200" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              <div className="h-2.5 w-1/2 rounded bg-ink-300" />
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
          <div className="h-1.5 w-1/4 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-3.5 rounded-full bg-cream-200" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Profile · V3 — compact header + two-column body. */
function ProfileDetailV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 overflow-hidden">
        <div className="flex items-center gap-2.5 p-3 border-b border-ink-100">
          <div className="size-10 rounded-full bg-cream-200" />
          <div className="flex-1 space-y-1">
            <div className="h-2 w-24 rounded bg-ink-300" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
          </div>
          <div className="flex gap-1.5">
            <div className="size-6 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-14 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="p-3 grid grid-cols-[1fr_130px] gap-3">
          <div className="space-y-2">
            <div className="h-2 w-1/3 rounded bg-ink-300" />
            <div className="h-20 rounded-lg bg-white border border-ink-100" />
            <div className="h-1.5 w-full rounded bg-ink-100" />
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1">
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-1.5 rounded bg-ink-100" />
            </div>
            <div className="h-14 rounded-lg bg-cream-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Detail sticky aside · V2 — media gallery + a buy aside. */
function DetailStickyAsideV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2">
          <div className="h-24 rounded-lg bg-cream-100 border border-ink-100" />
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("h-9 rounded-md border", i === 0 ? "border-rose-300" : "border-ink-100 bg-white")} />
            ))}
          </div>
        </div>
        <div className="w-[140px] shrink-0 space-y-2">
          <div className="h-2.5 w-28 rounded bg-ink-300" />
          <div className="h-1.5 w-20 rounded bg-ink-100" />
          <div className="h-3 w-16 rounded bg-rose-300" />
          <div className="space-y-1.5 pt-1">
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 w-3/4 rounded bg-ink-100" />
          </div>
          <div className="h-7 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Detail sticky aside · V3 — tabbed body + sticky profile card. */
function DetailStickyAsideV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-3 w-32 rounded bg-ink-300 mb-2" />
          <div className="flex items-center gap-3 border-b border-ink-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pb-2">
                <div className={cn("h-2 w-8 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
                {i === 0 && <div className="mt-1.5 h-0.5 w-8 rounded-full bg-rose-400" />}
              </div>
            ))}
          </div>
          <div className="pt-2.5 space-y-2">
            <div className="h-16 rounded-lg bg-white border border-ink-100" />
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          </div>
        </div>
        <div className="w-[112px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-200 shadow-sm p-2.5 space-y-2">
            <div className="size-10 rounded-full bg-cream-200 mx-auto" />
            <div className="h-1.5 w-3/4 rounded bg-ink-200 mx-auto" />
            <div className="h-7 rounded-md bg-rose-400" />
            <div className="h-7 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · public & marketing ──────────────────────── */

/* Auth · V2 — centered card on a soft gradient. */
function AuthSplitV2() {
  return (
    <Frame>
      <div className="flex-1 bg-gradient-to-br from-cream-100 to-rose-100/60 flex items-center justify-center p-4">
        <div className="w-[64%] rounded-xl bg-white border border-ink-100 shadow-sm p-3.5 space-y-2">
          <div className="size-7 rounded-[8px] bg-rose-400 mx-auto mb-1" />
          <div className="h-2.5 w-24 rounded bg-ink-300 mx-auto" />
          <div className="mb-1 h-1.5 w-32 rounded bg-ink-100 mx-auto" />
          {[0, 1].map((i) => (
            <div key={i} className="h-7 rounded-lg bg-cream-50 border border-ink-100" />
          ))}
          <div className="h-7 rounded-lg bg-rose-400" />
          <div className="h-1.5 w-2/3 rounded bg-ink-100 mx-auto" />
        </div>
      </div>
    </Frame>
  );
}

/* Auth · V3 — brand panel with feature bullets + form. */
function AuthSplitV3() {
  return (
    <Frame>
      <div className="w-[46%] shrink-0 bg-gradient-to-br from-rose-300 to-rose-200 p-3.5 flex flex-col justify-center gap-2">
        <div className="size-7 rounded-[8px] bg-white/70" />
        <div className="h-2.5 w-3/4 rounded bg-white/70" />
        <div className="space-y-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-white/60" />
              <div className="h-1.5 flex-1 rounded bg-white/50" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-cream-50 flex flex-col justify-center px-4 gap-2">
        <div className="h-2.5 w-20 rounded bg-ink-300" />
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-1.5 w-12 rounded bg-ink-200" />
            <div className="h-7 rounded-lg bg-white border border-ink-100" />
          </div>
        ))}
        <div className="mt-1 h-7 rounded-lg bg-rose-400" />
      </div>
    </Frame>
  );
}

/* Pricing · V2 — feature comparison grid. */
function PricingMarketingV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 p-3">
        <div className="mx-auto mb-2.5 h-2.5 w-28 rounded bg-ink-300" />
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className="grid grid-cols-4 bg-cream-100 border-b border-ink-100">
            <div className="h-8" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 flex flex-col items-center justify-center gap-0.5">
                <div className={cn("h-1.5 w-8 rounded", i === 1 ? "bg-rose-300" : "bg-ink-200")} />
                <div className="h-2 w-10 rounded bg-ink-300" />
              </div>
            ))}
          </div>
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="grid grid-cols-4 border-b border-ink-100 last:border-0">
              <div className="h-6 flex items-center px-2">
                <div className="h-1.5 w-3/4 rounded bg-ink-100" />
              </div>
              {[0, 1, 2].map((c) => (
                <div key={c} className="h-6 flex items-center justify-center">
                  <div className={cn("size-2.5 rounded-full", c >= r % 2 ? "bg-emerald-200" : "bg-ink-100")} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Pricing · V3 — single highlighted plan. */
function PricingMarketingV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center p-4">
        <div className="w-[70%] rounded-xl bg-white border border-rose-300 shadow-sm p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-2 w-16 rounded bg-ink-200" />
              <div className="flex items-end gap-1">
                <div className="h-4 w-14 rounded bg-ink-300" />
                <div className="mb-0.5 h-1.5 w-6 rounded bg-ink-100" />
              </div>
            </div>
            <div className="h-3 w-12 rounded-full bg-rose-100" />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-emerald-200" />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="h-8 rounded-lg bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Media gallery · V2 — uniform grid with a filter bar. */
function MediaGalleryV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-9 border-b border-ink-100 flex items-center gap-1.5 px-3">
          {[true, false, false].map((a, i) => (
            <div key={i} className={cn("h-6 w-12 rounded-full", a ? "bg-rose-100" : "bg-cream-100 border border-ink-100")} />
          ))}
          <div className="ml-auto h-6 w-14 rounded-md bg-rose-400" />
        </div>
        <div className="p-3 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-[52px] rounded-lg bg-cream-100 border border-ink-100" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Media gallery · V3 — featured image + thumbnail strip. */
function MediaGalleryV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2">
        <div className="flex-1 rounded-lg bg-cream-100 border border-ink-100 relative">
          <div className="absolute inset-x-2 bottom-2 h-2 w-1/3 rounded bg-white/70" />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-9 rounded-md border", i === 0 ? "border-rose-300" : "border-ink-100 bg-cream-100")} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Comparison · V2 — feature matrix with category groups. */
function ComparisonTableV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-ink-100 bg-cream-100">
            <div className="h-7" />
            {[0, 1].map((i) => (
              <div key={i} className="h-7 flex items-center justify-center">
                <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-300" : "bg-ink-200")} />
              </div>
            ))}
          </div>
          {[0, 1].map((g) => (
            <div key={g}>
              <div className="bg-cream-50 border-b border-ink-100 px-2 py-1">
                <div className="h-1.5 w-16 rounded bg-ink-300" />
              </div>
              {[0, 1].map((r) => (
                <div key={r} className="grid grid-cols-3 border-b border-ink-100">
                  <div className="h-6 flex items-center px-2">
                    <div className="h-1.5 w-3/4 rounded bg-ink-100" />
                  </div>
                  {[0, 1].map((c) => (
                    <div key={c} className="h-6 flex items-center justify-center">
                      <div className="size-2.5 rounded-full bg-emerald-200" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Comparison · V3 — two product cards side by side. */
function ComparisonTableV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 grid grid-cols-2 gap-2.5">
        {[0, 1].map((i) => (
          <div key={i} className={cn("rounded-lg border bg-white p-2.5 space-y-2", i === 0 ? "border-rose-300 shadow-sm" : "border-ink-100")}>
            <div className="flex items-center gap-1.5">
              <div className="size-7 rounded-md bg-cream-100" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              {[0, 1, 2, 3].map((r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <div className={cn("size-2.5 rounded-full", r < 3 ? "bg-emerald-200" : "bg-ink-100")} />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                </div>
              ))}
            </div>
            <div className={cn("h-6 rounded-md", i === 0 ? "bg-rose-400" : "bg-cream-200")} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · map, files, forms ───────────────────────── */

/* Map + list · V2 — map on top, result cards below. */
function MapListV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-[112px] relative bg-cream-100 border-b border-ink-100">
          <div className="absolute inset-2 rounded-lg bg-white/60 border border-ink-100" />
          {[[30, 40], [55, 55], [45, 28], [68, 38]].map((p, i) => (
            <div key={i} className={cn("absolute size-3 rounded-full border-2 border-white", i === 0 ? "bg-rose-500" : "bg-rose-400")} style={{ left: `${p[0]}%`, top: `${p[1]}%` }} />
          ))}
        </div>
        <div className="flex-1 p-2 grid grid-cols-3 gap-2 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className="h-10 bg-cream-100" />
              <div className="p-1.5 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Map + list · V3 — full map with a floating search + bottom sheet. */
function MapListV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 relative bg-cream-100">
        <div className="absolute inset-0 m-2 rounded-lg bg-white/50 border border-ink-100" />
        <div className="absolute top-2 left-2 right-2 h-6 rounded-md bg-white border border-ink-100 shadow-sm flex items-center px-2">
          <div className="size-2 rounded-full bg-ink-200" />
          <div className="ml-1.5 h-1.5 w-20 rounded bg-ink-100" />
        </div>
        {[[35, 42], [58, 52], [46, 30]].map((p, i) => (
          <div key={i} className={cn("absolute size-3.5 rounded-full border-2 border-white", i === 0 ? "bg-rose-500" : "bg-rose-400")} style={{ left: `${p[0]}%`, top: `${p[1]}%` }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-ink-100 rounded-t-xl p-2 space-y-1.5">
          <div className="h-1 w-8 rounded-full bg-ink-200 mx-auto" />
          <div className="flex gap-1.5 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[110px] shrink-0 rounded-md bg-cream-50 border border-ink-100 p-1.5 flex gap-1.5">
                <div className="size-7 rounded bg-cream-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-2/3 rounded bg-ink-200" />
                  <div className="h-1.5 w-1/2 rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* File browser · V2 — detail list / table view. */
function FileBrowserV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-8 border-b border-ink-100 flex items-center gap-1.5 px-2.5">
          <div className="h-1.5 w-16 rounded bg-ink-200" />
          <div className="ml-auto size-5 rounded bg-cream-100 border border-ink-100" />
          <div className="h-5 w-12 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="h-6 bg-cream-100 border-b border-ink-100 flex items-center gap-2 px-2.5">
            <div className="h-1.5 w-16 rounded bg-ink-200" />
            <div className="ml-auto h-1.5 w-10 rounded bg-ink-200" />
            <div className="h-1.5 w-12 rounded bg-ink-200" />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 border-b border-ink-100 flex items-center gap-2 px-2.5">
              <div className={cn("size-3.5 rounded", i % 2 === 0 ? "bg-amber-200" : "bg-rose-200")} />
              <div className="h-1.5 w-20 rounded bg-ink-100" />
              <div className="ml-auto h-1.5 w-8 rounded bg-ink-100" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* File browser · V3 — tree + grid + preview pane. */
function FileBrowserV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[80px] shrink-0 border-r border-ink-100 bg-white p-2 space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1" style={{ paddingLeft: i > 0 ? 8 : 0 }}>
              <div className="size-2.5 rounded-sm bg-amber-300" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-2 grid grid-cols-3 gap-1.5 content-start">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <div className={cn("h-9 rounded-md border flex items-center justify-center", i === 1 ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}>
                <div className="size-4 rounded bg-ink-200" />
              </div>
              <div className="h-1.5 w-2/3 rounded bg-ink-100 mx-auto" />
            </div>
          ))}
        </div>
        <div className="w-[104px] shrink-0 border-l border-ink-100 bg-white p-2 space-y-1.5">
          <div className="h-14 rounded-md bg-cream-100" />
          <div className="h-2 w-2/3 rounded bg-ink-300" />
          <div className="space-y-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1.5 w-8 rounded bg-ink-100" />
                <div className="h-1.5 w-8 rounded bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Two-column form · V2 — stacked section cards. */
function TwoColumnFormV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
        </div>
        <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
          {[0, 1].map((s) => (
            <div key={s} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
              <div className="h-2 w-1/4 rounded bg-ink-300" />
              <div className="grid grid-cols-2 gap-2.5">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-1.5 w-12 rounded bg-ink-200" />
                    <div className="h-6 rounded-md bg-cream-50 border border-ink-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-end gap-2 bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Two-column form · V3 — fields with an inline help aside. */
function TwoColumnFormV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="size-2 rounded-full bg-ink-100" />
              </div>
              <div className="h-7 rounded-md bg-white border border-ink-100" />
              <div className="h-1 w-2/3 rounded bg-ink-100" />
            </div>
          ))}
          <div className="mt-1 h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="w-[116px] shrink-0">
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 space-y-1.5">
            <div className="h-1.5 w-2/3 rounded bg-rose-300" />
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 rounded bg-ink-100" />
            <div className="h-1.5 w-3/4 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · forms & notifications ───────────────────── */

/* Form single column · V2 — grouped sections. */
function FormSingleColumnV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 border-b border-ink-100">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
        </div>
        <div className="flex-1 overflow-hidden px-3.5 py-3">
          <div className="mx-auto max-w-[84%] space-y-2.5">
            {[0, 1].map((s) => (
              <div key={s} className="space-y-1.5">
                <div className="h-2 w-16 rounded bg-rose-300" />
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-1.5 w-14 rounded bg-ink-200" />
                    <div className="h-7 rounded-md bg-white border border-ink-100" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-end gap-2 bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Form single column · V3 — long form with a progress bar. */
function FormSingleColumnV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 space-y-1.5 border-b border-ink-100">
          <div className="flex items-center justify-between">
            <div className="h-2 w-20 rounded bg-ink-300" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
          </div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-rose-400" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden px-3.5 py-3">
          <div className="mx-auto max-w-[82%] space-y-2.5">
            <div className="h-2 w-16 rounded bg-rose-300" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1.5 w-14 rounded bg-ink-200" />
                <div className="h-7 rounded-md bg-white border border-ink-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Form stepper · V2 — horizontal stepper at top. */
function FormStepperAsideV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="flex items-center justify-center gap-2 pt-3 pb-2.5 border-b border-ink-100">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("size-5 rounded-full", i === 1 ? "bg-rose-400" : i < 1 ? "bg-rose-300" : "bg-ink-100")} />
              {i < 3 && <div className="h-0.5 w-6 bg-ink-100" />}
            </div>
          ))}
        </div>
        <div className="flex-1 p-3.5">
          <div className="mx-auto max-w-[78%] space-y-2.5">
            <div className="h-2.5 w-20 rounded bg-ink-300" />
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-1.5 w-12 rounded bg-ink-200" />
                  <div className="h-7 rounded-md bg-white border border-ink-100" />
                </div>
              ))}
            </div>
            <div className="h-9 rounded-md bg-white border border-ink-100" />
          </div>
        </div>
        <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between bg-white/50">
          <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

/* Form stepper · V3 — final review step. */
function FormStepperAsideV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[100px] shrink-0 bg-white border-r border-ink-100 p-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("size-5 rounded-full shrink-0", i < 2 ? "bg-rose-300" : "bg-rose-400")} />
              <div className="h-1.5 w-12 rounded bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-3.5 space-y-2">
            <div className="h-2.5 w-20 rounded bg-ink-300" />
            <div className="rounded-lg bg-white border border-ink-100 divide-y divide-ink-100">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="h-1.5 w-16 rounded bg-ink-100" />
                  <div className="h-1.5 w-20 rounded bg-ink-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-ink-100 px-3.5 py-2 flex justify-between bg-white/50">
            <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-20 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Form review · V2 — checkout line items + totals. */
function FormReviewV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex gap-3 p-3.5">
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-ink-100 p-1.5">
              <div className="size-8 rounded bg-cream-100" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-1/2 rounded bg-ink-200" />
                <div className="h-1.5 w-1/3 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 w-8 rounded bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="w-[124px] shrink-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="h-2 w-16 rounded bg-ink-300" />
            {[0, 1].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1.5 w-12 rounded bg-ink-100" />
                <div className="h-1.5 w-8 rounded bg-ink-200" />
              </div>
            ))}
            <div className="border-t border-ink-100 pt-1.5 flex justify-between">
              <div className="h-2 w-10 rounded bg-ink-300" />
              <div className="h-2 w-10 rounded bg-rose-300" />
            </div>
            <div className="mt-1 h-7 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Form review · V3 — success confirmation. */
function FormReviewV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col items-center justify-center gap-2 p-4">
        <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <div className="size-6 rounded-full bg-emerald-300" />
        </div>
        <div className="mt-1 h-2.5 w-32 rounded bg-ink-300" />
        <div className="h-2 w-44 rounded bg-ink-100" />
        <div className="mt-1 w-[64%] rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1.5 w-14 rounded bg-ink-100" />
              <div className="h-1.5 w-10 rounded bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2">
          <div className="h-7 w-24 rounded-lg bg-rose-400" />
          <div className="h-7 w-20 rounded-lg bg-white border border-ink-200" />
        </div>
      </div>
    </Frame>
  );
}

/* Notification center · V2 — dropdown popover. */
function NotificationCenterV2() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 relative">
        <div className="absolute top-2 right-2 size-6 rounded-md bg-white border border-ink-100" />
        <div className="absolute top-9 right-2 w-[150px] rounded-lg bg-white border border-ink-100 shadow-md overflow-hidden">
          <div className="h-7 border-b border-ink-100 flex items-center px-2">
            <div className="h-1.5 w-12 rounded bg-ink-300" />
            <div className="ml-auto h-1.5 w-8 rounded bg-rose-300" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("flex items-start gap-1.5 p-2 border-b border-ink-100 last:border-0", i === 0 && "bg-rose-50/50")}>
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 rounded bg-ink-200" />
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Notification center · V3 — date-grouped activity with a filter. */
function NotificationCenterV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="h-8 border-b border-ink-100 flex items-center gap-1.5 px-3">
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-5 w-12 rounded-full bg-cream-100 border border-ink-100" />
        </div>
        <div className="p-3 space-y-2 overflow-hidden">
          {[0, 1].map((g) => (
            <div key={g} className="space-y-1.5">
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full", i === 0 ? "bg-rose-400" : "bg-ink-200")} />
                  <div className="size-5 rounded-full bg-cream-200" />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                  <div className="h-1 w-6 rounded bg-ink-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · workspace & utility pages ───────────────── */

/* Multi-pane · V2 — four panes (rail + list + content + inspector). */
function MultiPaneWorkspaceV2() {
  return (
    <Frame>
      <IconRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="w-[92px] shrink-0 border-r border-ink-100 bg-white p-1.5 space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("rounded-md border p-1 space-y-1", i === 0 ? "border-rose-200 bg-rose-50" : "border-ink-100")}>
              <div className="h-1.5 w-2/3 rounded bg-ink-200" />
              <div className="h-1 w-1/2 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-2 space-y-1.5 border-r border-ink-100 min-w-0">
          <div className="h-2 w-1/2 rounded bg-ink-300" />
          <div className="h-16 rounded-lg bg-white border border-ink-100" />
        </div>
        <div className="w-[84px] shrink-0 bg-white p-1.5 space-y-1.5">
          <div className="h-2 w-2/3 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1 w-1/2 rounded bg-ink-100" />
              <div className="h-5 rounded bg-cream-50 border border-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Multi-pane · V3 — main panes over a bottom panel. */
function MultiPaneWorkspaceV3() {
  return (
    <Frame>
      <NavRail />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 p-2.5 space-y-1.5 border-r border-ink-100">
            <div className="h-2 w-1/3 rounded bg-ink-300" />
            <div className="h-full min-h-[80px] rounded-lg bg-white border border-ink-100" />
          </div>
          <div className="w-[120px] shrink-0 p-2 space-y-1.5">
            <div className="h-2 w-2/3 rounded bg-ink-300" />
            <div className="space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-1.5 rounded bg-ink-100" />
              ))}
            </div>
          </div>
        </div>
        <div className="h-[68px] border-t border-ink-100 bg-white p-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-10 rounded bg-rose-300" />
            <div className="h-1.5 w-10 rounded bg-ink-100" />
          </div>
          <div className="h-8 rounded bg-cream-50 border border-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* Onboarding · V2 — single welcome screen. */
function OnboardingFullscreenV2() {
  return (
    <Frame>
      <div className="flex-1 bg-gradient-to-b from-rose-100/60 to-cream-50 flex flex-col items-center justify-center gap-2.5 p-4">
        <div className="size-16 rounded-2xl bg-white border border-ink-100 shadow-sm flex items-center justify-center">
          <div className="size-8 rounded-xl bg-rose-200" />
        </div>
        <div className="mt-1 h-3 w-44 rounded bg-ink-300" />
        <div className="h-2 w-56 rounded bg-ink-100" />
        <div className="h-2 w-48 rounded bg-ink-100" />
        <div className="mt-1 h-8 w-32 rounded-lg bg-rose-400" />
        <div className="h-1.5 w-24 rounded bg-ink-100" />
      </div>
    </Frame>
  );
}

/* Onboarding · V3 — getting-started checklist. */
function OnboardingFullscreenV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex items-center justify-center p-4">
        <div className="w-[70%] space-y-2.5">
          <div className="space-y-1">
            <div className="h-2.5 w-40 rounded bg-ink-300" />
            <div className="mt-1.5 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full w-2/5 rounded-full bg-rose-400" />
            </div>
          </div>
          <div className="rounded-lg bg-white border border-ink-100 divide-y divide-ink-100">
            {[true, false, false, false].map((done, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <div className={cn("size-4 rounded-full shrink-0", done ? "bg-emerald-300" : "border-2 border-ink-200")} />
                <div className="h-1.5 flex-1 rounded bg-ink-200" />
                <div className={cn("h-5 w-12 rounded-md", i === 1 ? "bg-rose-400" : "bg-cream-100 border border-ink-100")} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Error · V2 — illustration block + single CTA. */
function ErrorPageLayoutV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2.5 p-4">
        <div className="w-[44%] h-24 rounded-xl bg-cream-100 border border-ink-100 flex items-center justify-center">
          <div className="size-10 rounded-full bg-rose-200" />
        </div>
        <div className="mt-1 h-2.5 w-36 rounded bg-ink-300" />
        <div className="h-2 w-48 rounded bg-ink-100" />
        <div className="mt-1 h-8 w-28 rounded-lg bg-rose-400" />
      </div>
    </Frame>
  );
}

/* Error · V3 — maintenance / status state. */
function ErrorPageLayoutV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-50 flex flex-col items-center justify-center gap-2 p-4">
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1">
          <div className="size-2 rounded-full bg-amber-400" />
          <div className="h-1.5 w-16 rounded bg-amber-300" />
        </div>
        <div className="mt-1 h-3 w-44 rounded bg-ink-300" />
        <div className="h-2 w-52 rounded bg-ink-100" />
        <div className="mt-1 w-[56%] rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-1.5 w-16 rounded bg-ink-100" />
              <div className={cn("size-2 rounded-full", i === 0 ? "bg-emerald-300" : "bg-amber-300")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Invoice · V2 — narrow itemised receipt. */
function DocumentInvoiceV2() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-100 flex justify-center p-3 overflow-hidden">
        <div className="w-[40%] bg-white border border-ink-100 rounded-md shadow-sm p-2.5 space-y-1.5">
          <div className="size-6 rounded bg-rose-400 mx-auto" />
          <div className="h-1.5 w-2/3 rounded bg-ink-200 mx-auto" />
          <div className="h-1 w-1/2 rounded bg-ink-100 mx-auto" />
          <div className="border-t border-dashed border-ink-200 pt-1.5 space-y-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
                <div className="h-1.5 w-6 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-ink-200 pt-1.5 flex justify-between">
            <div className="h-2 w-10 rounded bg-ink-300" />
            <div className="h-2 w-10 rounded bg-ink-300" />
          </div>
          <div className="mt-1 h-6 rounded bg-cream-100" />
        </div>
      </div>
    </Frame>
  );
}

/* Invoice · V3 — letter / document body. */
function DocumentInvoiceV3() {
  return (
    <Frame>
      <div className="flex-1 bg-cream-100 flex justify-center p-3 overflow-hidden">
        <div className="w-[64%] bg-white border border-ink-100 rounded-md shadow-sm p-3.5 space-y-2">
          <div className="h-2.5 w-1/2 rounded bg-ink-300" />
          <div className="h-1.5 w-1/4 rounded bg-ink-100" />
          <div className="space-y-1.5 pt-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("h-1.5 rounded bg-ink-100", i === 4 && "w-2/3")} />
            ))}
          </div>
          <div className="pt-2 space-y-1">
            <div className="h-3 w-16 rounded bg-ink-200" />
            <div className="h-1.5 w-12 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── Versioned explorations · page-only (content area) ────────────────── */

/* Page only standard · V2 — header with tabs. */
function PageOnlyStandardV2() {
  return (
    <ContentFrame>
      <div className="h-full flex flex-col">
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3.5 w-32 rounded bg-ink-300" />
            <div className="h-8 w-24 rounded-lg bg-rose-400" />
          </div>
          <div className="flex items-center gap-3 border-b border-ink-100">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="pb-2">
                <div className={cn("h-2 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
                {i === 0 && <div className="mt-1.5 h-0.5 w-10 rounded-full bg-rose-400" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 grid grid-cols-3 gap-2.5">
          <div className="col-span-2 rounded-lg bg-white border border-ink-100" />
          <div className="rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </ContentFrame>
  );
}

/* Page only standard · V3 — toolbar + table. */
function PageOnlyStandardV3() {
  return (
    <ContentFrame>
      <div className="h-full p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-32 rounded bg-ink-300" />
          <div className="h-8 w-24 rounded-lg bg-rose-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-32 rounded-md bg-white border border-ink-100" />
          <div className="h-7 w-16 rounded-full bg-cream-100 border border-ink-100" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className="h-7 bg-cream-100 border-b border-ink-100" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 border-b border-ink-100 last:border-0 flex items-center gap-2 px-3">
              <div className="size-4 rounded-full bg-cream-200" />
              <div className="h-1.5 w-24 rounded bg-ink-100" />
              <div className="ml-auto h-3 w-12 rounded-full bg-emerald-100" />
            </div>
          ))}
        </div>
      </div>
    </ContentFrame>
  );
}

/* Page only two-column · V2 — content sidebar + main. */
function PageOnlyTwoColumnV2() {
  return (
    <ContentFrame>
      <div className="h-full flex">
        <div className="w-[120px] shrink-0 border-r border-ink-100 p-3 space-y-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1", i === 1 && "bg-rose-50")}>
              <div className={cn("size-2.5 rounded-sm", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
              <div className={cn("h-1.5 rounded", i === 1 ? "w-12 bg-rose-300" : "w-10 bg-ink-100")} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 space-y-2.5">
          <div className="h-3 w-28 rounded bg-ink-300" />
          <div className="h-2 w-40 rounded bg-ink-100" />
          <div className="mt-1 h-28 rounded-lg bg-white border border-ink-100" />
        </div>
      </div>
    </ContentFrame>
  );
}

/* Page only two-column · V3 — aside-led layout. */
function PageOnlyTwoColumnV3() {
  return (
    <ContentFrame>
      <div className="h-full p-4 grid grid-cols-[150px_1fr] gap-3">
        <div className="space-y-2.5">
          <div className="h-20 rounded-lg bg-cream-100" />
          <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <div className="h-1.5 w-2/3 rounded bg-ink-200" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 rounded bg-ink-100" />
            ))}
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="h-3.5 w-1/3 rounded bg-ink-300" />
          <div className="h-2 w-1/2 rounded bg-ink-100" />
          <div className="mt-1 grid grid-cols-2 gap-2.5">
            <div className="h-20 rounded-lg bg-white border border-ink-100" />
            <div className="h-20 rounded-lg bg-white border border-ink-100" />
          </div>
        </div>
      </div>
    </ContentFrame>
  );
}

/* Page only centered · V2 — centered form. */
function PageOnlyCenteredV2() {
  return (
    <ContentFrame>
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-[60%] space-y-2.5">
          <div className="text-center space-y-1.5">
            <div className="h-3 w-32 rounded bg-ink-300 mx-auto" />
            <div className="h-2 w-44 rounded bg-ink-100 mx-auto" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-8 rounded-lg bg-white border border-ink-100" />
            </div>
          ))}
          <div className="h-8 rounded-lg bg-rose-400" />
        </div>
      </div>
    </ContentFrame>
  );
}

/* Page only centered · V3 — centered empty / CTA. */
function PageOnlyCenteredV3() {
  return (
    <ContentFrame>
      <div className="h-full flex flex-col items-center justify-center gap-2.5 p-4">
        <div className="size-14 rounded-2xl bg-rose-100 flex items-center justify-center">
          <div className="size-7 rounded-xl bg-rose-300" />
        </div>
        <div className="mt-1 h-2.5 w-40 rounded bg-ink-300" />
        <div className="h-2 w-52 rounded bg-ink-100" />
        <div className="h-2 w-44 rounded bg-ink-100" />
        <div className="mt-1 flex gap-2">
          <div className="h-8 w-28 rounded-lg bg-rose-400" />
          <div className="h-8 w-24 rounded-lg bg-white border border-ink-200" />
        </div>
      </div>
    </ContentFrame>
  );
}

/* Page only sections · V2 — accordion list. */
function PageOnlySectionsV2() {
  return (
    <ContentFrame>
      <div className="h-full p-4 space-y-2 overflow-hidden">
        <div className="mb-1 h-3.5 w-28 rounded bg-ink-300" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className={cn("flex items-center gap-2 p-2.5", i === 0 && "border-b border-ink-100")}>
              <div className="h-2 w-28 rounded bg-ink-200" />
              <div className="ml-auto size-3 rounded bg-ink-200" />
            </div>
            {i === 0 && (
              <div className="p-2.5 pt-0 space-y-1.5">
                <div className="h-1.5 rounded bg-ink-100" />
                <div className="h-1.5 w-3/4 rounded bg-ink-100" />
              </div>
            )}
          </div>
        ))}
      </div>
    </ContentFrame>
  );
}

/* Page only sections · V3 — settings sections with toggles. */
function PageOnlySectionsV3() {
  return (
    <ContentFrame>
      <div className="h-full p-4 space-y-2.5 overflow-hidden">
        <div className="h-3.5 w-28 rounded bg-ink-300" />
        {[0, 1].map((s) => (
          <div key={s} className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="h-2 w-1/4 rounded bg-ink-300" />
            {[true, false].map((on, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-1.5 w-20 rounded bg-ink-200" />
                  <div className="h-1 w-28 rounded bg-ink-100" />
                </div>
                <div className={cn("h-4 w-7 rounded-full relative", on ? "bg-rose-300" : "bg-ink-200")}>
                  <div className={cn("absolute top-0.5 size-3 rounded-full bg-white", on ? "right-0.5" : "left-0.5")} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ContentFrame>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type PdCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const PAGE_DESIGN_CATEGORIES: PdCategory[] = [
  {
    id: "page-designs",
    label: "Page Designs",
    icon: LayoutPanelLeft,
    blurb: "App-shell layouts — single / double sidebar, top tabs, right rail.",
    items: [
      { label: "Single sidebar · V1 dashboard", code: "SingleSidebar", node: <SingleSidebar /> },
      { label: "Single sidebar · V2 grouped + aside", code: "SingleSidebarV2", node: <SingleSidebarV2 /> },
      { label: "Single sidebar · V3 toolbar + grid", code: "SingleSidebarV3", node: <SingleSidebarV3 /> },
      { label: "Double sidebar · V1 dashboard", code: "DoubleSidebar", node: <DoubleSidebar /> },
      { label: "Double sidebar · V2 context panel", code: "DoubleSidebarV2", node: <DoubleSidebarV2 /> },
      { label: "Double sidebar · V3 nav + tabs", code: "DoubleSidebarV3", node: <DoubleSidebarV3 /> },
      { label: "Single sidebar · top tabs · V1 underline", code: "SingleSidebarTabs", node: <SingleSidebarTabs /> },
      { label: "Single sidebar · top tabs · V2 segmented", code: "SingleSidebarTabsV2", node: <SingleSidebarTabsV2 /> },
      { label: "Single sidebar · top tabs · V3 + filters", code: "SingleSidebarTabsV3", node: <SingleSidebarTabsV3 /> },
      { label: "Double sidebar · top tabs · V1 mixed", code: "DoubleSidebarTabs", node: <DoubleSidebarTabs /> },
      { label: "Double sidebar · top tabs · V2 master/detail", code: "DoubleSidebarTabsV2", node: <DoubleSidebarTabsV2 /> },
      { label: "Double sidebar · top tabs · V3 board", code: "DoubleSidebarTabsV3", node: <DoubleSidebarTabsV3 /> },
      { label: "Tabs + sub-nav · V1 vertical", code: "TabbedSubnav", node: <TabbedSubnav /> },
      { label: "Tabs + sub-nav · V2 horizontal pills", code: "TabbedSubnavV2", node: <TabbedSubnavV2 /> },
      { label: "Tabs + sub-nav · V3 settings detail", code: "TabbedSubnavV3", node: <TabbedSubnavV3 /> },
      { label: "Sidebar + right rail · V1 activity", code: "SidebarRightRail", node: <SidebarRightRail /> },
      { label: "Sidebar + right rail · V2 filters", code: "SidebarRightRailV2", node: <SidebarRightRailV2 /> },
      { label: "Sidebar + right rail · V3 inspector", code: "SidebarRightRailV3", node: <SidebarRightRailV3 /> },
      { label: "Full-width · centered · V1 dashboard", code: "FullWidthCentered", node: <FullWidthCentered /> },
      { label: "Full-width · centered · V2 hero", code: "FullWidthCenteredV2", node: <FullWidthCenteredV2 /> },
      { label: "Full-width · centered · V3 main + aside", code: "FullWidthCenteredV3", node: <FullWidthCenteredV3 /> },
      { label: "Full-width · fluid · V1 dashboard", code: "FullWidthFluid", node: <FullWidthFluid /> },
      { label: "Full-width · fluid · V2 hero KPI", code: "FullWidthFluidV2", node: <FullWidthFluidV2 /> },
      { label: "Full-width · fluid · V3 work + panel", code: "FullWidthFluidV3", node: <FullWidthFluidV3 /> },
      { label: "Centered · narrow · V1 article", code: "CenteredNarrow", node: <CenteredNarrow /> },
      { label: "Centered · narrow · V2 + contents", code: "CenteredNarrowV2", node: <CenteredNarrowV2 /> },
      { label: "Centered · narrow · V3 changelog", code: "CenteredNarrowV3", node: <CenteredNarrowV3 /> },
      { label: "Hero + sections · V1 overview", code: "HeroOverview", node: <HeroOverview /> },
      { label: "Hero + sections · V2 features + CTA", code: "HeroOverviewV2", node: <HeroOverviewV2 /> },
      { label: "Hero + sections · V3 split hero", code: "HeroOverviewV3", node: <HeroOverviewV3 /> },
      { label: "Split view · V1 editor + preview", code: "SplitView", node: <SplitView /> },
      { label: "Split view · V2 editor + properties", code: "SplitViewV2", node: <SplitViewV2 /> },
      { label: "Split view · V3 compare", code: "SplitViewV3", node: <SplitViewV3 /> },
      { label: "List + detail · V1 classic", code: "ListDetail", node: <ListDetail /> },
      { label: "List + detail · V2 tabbed", code: "ListDetailV2", node: <ListDetailV2 /> },
      { label: "List + detail · V3 dense + hero", code: "ListDetailV3", node: <ListDetailV3 /> },
      { label: "Kanban board · V1 columns", code: "KanbanBoard", node: <KanbanBoard /> },
      { label: "Kanban board · V2 swimlanes", code: "KanbanBoardV2", node: <KanbanBoardV2 /> },
      { label: "Kanban board · V3 chips + count", code: "KanbanBoardV3", node: <KanbanBoardV3 /> },
      { label: "Empty state · V1 cta", code: "EmptyStateLayout", node: <EmptyStateLayout /> },
      { label: "Empty state · V2 checklist", code: "EmptyStateV2", node: <EmptyStateV2 /> },
      { label: "Empty state · V3 templates", code: "EmptyStateV3", node: <EmptyStateV3 /> },
      { label: "Card grid · V1 thumbnails", code: "CardGrid", node: <CardGrid /> },
      { label: "Card grid · V2 masonry", code: "CardGridV2", node: <CardGridV2 /> },
      { label: "Card grid · V3 list cards", code: "CardGridV3", node: <CardGridV3 /> },
      { label: "Wizard · V1 horizontal steps", code: "WizardSteps", node: <WizardSteps /> },
      { label: "Wizard · V2 vertical stepper", code: "WizardStepsV2", node: <WizardStepsV2 /> },
      { label: "Wizard · V3 progress + cards", code: "WizardStepsV3", node: <WizardStepsV3 /> },
      { label: "Collapsed sidebar · V1 dashboard", code: "CollapsedSidebar", node: <CollapsedSidebar /> },
      { label: "Collapsed sidebar · V2 top bar", code: "CollapsedSidebarV2", node: <CollapsedSidebarV2 /> },
      { label: "Collapsed sidebar · V3 canvas", code: "CollapsedSidebarV3", node: <CollapsedSidebarV3 /> },
      { label: "Chat · V1 conversation", code: "ChatLayout", node: <ChatLayout /> },
      { label: "Chat · V2 + details panel", code: "ChatLayoutV2", node: <ChatLayoutV2 /> },
      { label: "Chat · V3 channels workspace", code: "ChatLayoutV3", node: <ChatLayoutV3 /> },
      { label: "Inbox · V1 3-pane", code: "InboxThreePane", node: <InboxThreePane /> },
      { label: "Inbox · V2 compact + reply", code: "InboxThreePaneV2", node: <InboxThreePaneV2 /> },
      { label: "Inbox · V3 horizontal split", code: "InboxThreePaneV3", node: <InboxThreePaneV3 /> },
      { label: "Calendar · V1 month", code: "CalendarLayout", node: <CalendarLayout /> },
      { label: "Calendar · V2 week", code: "CalendarLayoutV2", node: <CalendarLayoutV2 /> },
      { label: "Calendar · V3 agenda", code: "CalendarLayoutV3", node: <CalendarLayoutV3 /> },
      { label: "Analytics · V1 KPIs + chart", code: "AnalyticsDashboard", node: <AnalyticsDashboard /> },
      { label: "Analytics · V2 area + breakdown", code: "AnalyticsDashboardV2", node: <AnalyticsDashboardV2 /> },
      { label: "Analytics · V3 cards + leaderboard", code: "AnalyticsDashboardV3", node: <AnalyticsDashboardV3 /> },
      { label: "Dashboard hero · V1 KPI tile", code: "DashboardHero", node: <DashboardHero /> },
      { label: "Dashboard hero · V2 chart hero", code: "DashboardHeroV2", node: <DashboardHeroV2 /> },
      { label: "Dashboard hero · V3 greeting + actions", code: "DashboardHeroV3", node: <DashboardHeroV3 /> },
      { label: "Feed · V1 cards", code: "FeedTimeline", node: <FeedTimeline /> },
      { label: "Feed · V2 timeline", code: "FeedTimelineV2", node: <FeedTimelineV2 /> },
      { label: "Feed · V3 + suggestions", code: "FeedTimelineV3", node: <FeedTimelineV3 /> },
      { label: "Settings · V1 form", code: "SettingsForm", node: <SettingsForm /> },
      { label: "Settings · V2 section cards", code: "SettingsFormV2", node: <SettingsFormV2 /> },
      { label: "Settings · V3 tabbed", code: "SettingsFormV3", node: <SettingsFormV3 /> },
      { label: "Data table · V1 classic", code: "DataTableView", node: <DataTableView /> },
      { label: "Data table · V2 dense", code: "DataTableV2", node: <DataTableV2 /> },
      { label: "Data table · V3 card rows", code: "DataTableV3", node: <DataTableV3 /> },
      { label: "Data table · V4 minimal", code: "DataTableV4", node: <DataTableV4 /> },
      { label: "Profile · V1 cover + tabs", code: "ProfileDetail", node: <ProfileDetail /> },
      { label: "Profile · V2 stats + activity", code: "ProfileDetailV2", node: <ProfileDetailV2 /> },
      { label: "Profile · V3 compact + columns", code: "ProfileDetailV3", node: <ProfileDetailV3 /> },
      { label: "Detail · V1 sticky aside", code: "DetailStickyAside", node: <DetailStickyAside /> },
      { label: "Detail · V2 gallery + buy", code: "DetailStickyAsideV2", node: <DetailStickyAsideV2 /> },
      { label: "Detail · V3 tabbed + card", code: "DetailStickyAsideV3", node: <DetailStickyAsideV3 /> },
      { label: "Auth · V1 split", code: "AuthSplit", node: <AuthSplit /> },
      { label: "Auth · V2 centered card", code: "AuthSplitV2", node: <AuthSplitV2 /> },
      { label: "Auth · V3 brand + features", code: "AuthSplitV3", node: <AuthSplitV3 /> },
      { label: "Pricing · V1 tiers", code: "PricingMarketing", node: <PricingMarketing /> },
      { label: "Pricing · V2 comparison grid", code: "PricingMarketingV2", node: <PricingMarketingV2 /> },
      { label: "Pricing · V3 single plan", code: "PricingMarketingV3", node: <PricingMarketingV3 /> },
      { label: "Media gallery · V1 masonry", code: "MediaGallery", node: <MediaGallery /> },
      { label: "Media gallery · V2 grid + filter", code: "MediaGalleryV2", node: <MediaGalleryV2 /> },
      { label: "Media gallery · V3 featured", code: "MediaGalleryV3", node: <MediaGalleryV3 /> },
      { label: "Comparison · V1 matrix", code: "ComparisonTable", node: <ComparisonTable /> },
      { label: "Comparison · V2 grouped", code: "ComparisonTableV2", node: <ComparisonTableV2 /> },
      { label: "Comparison · V3 cards", code: "ComparisonTableV3", node: <ComparisonTableV3 /> },
      { label: "Map + list · V1 list + pins", code: "MapList", node: <MapList /> },
      { label: "Map + list · V2 map + cards", code: "MapListV2", node: <MapListV2 /> },
      { label: "Map + list · V3 full + sheet", code: "MapListV3", node: <MapListV3 /> },
      { label: "File browser · V1 grid", code: "FileBrowser", node: <FileBrowser /> },
      { label: "File browser · V2 list", code: "FileBrowserV2", node: <FileBrowserV2 /> },
      { label: "File browser · V3 tree + preview", code: "FileBrowserV3", node: <FileBrowserV3 /> },
      { label: "Two-column form · V1 form + aside", code: "TwoColumnForm", node: <TwoColumnForm /> },
      { label: "Two-column form · V2 section cards", code: "TwoColumnFormV2", node: <TwoColumnFormV2 /> },
      { label: "Two-column form · V3 inline help", code: "TwoColumnFormV3", node: <TwoColumnFormV3 /> },
      { label: "Form single col · V1 labelled", code: "FormSingleColumn", node: <FormSingleColumn /> },
      { label: "Form single col · V2 sections", code: "FormSingleColumnV2", node: <FormSingleColumnV2 /> },
      { label: "Form single col · V3 progress", code: "FormSingleColumnV3", node: <FormSingleColumnV3 /> },
      { label: "Form stepper · V1 vertical", code: "FormStepperAside", node: <FormStepperAside /> },
      { label: "Form stepper · V2 horizontal", code: "FormStepperAsideV2", node: <FormStepperAsideV2 /> },
      { label: "Form stepper · V3 review step", code: "FormStepperAsideV3", node: <FormStepperAsideV3 /> },
      { label: "Form review · V1 summary", code: "FormReview", node: <FormReview /> },
      { label: "Form review · V2 checkout", code: "FormReviewV2", node: <FormReviewV2 /> },
      { label: "Form review · V3 success", code: "FormReviewV3", node: <FormReviewV3 /> },
      { label: "Notification center · V1 list", code: "NotificationCenter", node: <NotificationCenter /> },
      { label: "Notification center · V2 popover", code: "NotificationCenterV2", node: <NotificationCenterV2 /> },
      { label: "Notification center · V3 grouped", code: "NotificationCenterV3", node: <NotificationCenterV3 /> },
      { label: "Multi-pane · V1 three-pane", code: "MultiPaneWorkspace", node: <MultiPaneWorkspace /> },
      { label: "Multi-pane · V2 four-pane", code: "MultiPaneWorkspaceV2", node: <MultiPaneWorkspaceV2 /> },
      { label: "Multi-pane · V3 + bottom panel", code: "MultiPaneWorkspaceV3", node: <MultiPaneWorkspaceV3 /> },
      { label: "Onboarding · V1 pick path", code: "OnboardingFullscreen", node: <OnboardingFullscreen /> },
      { label: "Onboarding · V2 welcome", code: "OnboardingFullscreenV2", node: <OnboardingFullscreenV2 /> },
      { label: "Onboarding · V3 checklist", code: "OnboardingFullscreenV3", node: <OnboardingFullscreenV3 /> },
      { label: "Error · V1 404", code: "ErrorPageLayout", node: <ErrorPageLayout /> },
      { label: "Error · V2 illustration", code: "ErrorPageLayoutV2", node: <ErrorPageLayoutV2 /> },
      { label: "Error · V3 maintenance", code: "ErrorPageLayoutV3", node: <ErrorPageLayoutV3 /> },
      { label: "Invoice · V1 document", code: "DocumentInvoice", node: <DocumentInvoice /> },
      { label: "Invoice · V2 receipt", code: "DocumentInvoiceV2", node: <DocumentInvoiceV2 /> },
      { label: "Invoice · V3 letter", code: "DocumentInvoiceV3", node: <DocumentInvoiceV3 /> },
      { label: "Page only standard · V1 dashboard", code: "PageOnlyStandard", node: <PageOnlyStandard /> },
      { label: "Page only standard · V2 tabs", code: "PageOnlyStandardV2", node: <PageOnlyStandardV2 /> },
      { label: "Page only standard · V3 table", code: "PageOnlyStandardV3", node: <PageOnlyStandardV3 /> },
      { label: "Page only two-col · V1 main + aside", code: "PageOnlyTwoColumn", node: <PageOnlyTwoColumn /> },
      { label: "Page only two-col · V2 sidebar", code: "PageOnlyTwoColumnV2", node: <PageOnlyTwoColumnV2 /> },
      { label: "Page only two-col · V3 aside-led", code: "PageOnlyTwoColumnV3", node: <PageOnlyTwoColumnV3 /> },
      { label: "Page only centered · V1 article", code: "PageOnlyCentered", node: <PageOnlyCentered /> },
      { label: "Page only centered · V2 form", code: "PageOnlyCenteredV2", node: <PageOnlyCenteredV2 /> },
      { label: "Page only centered · V3 empty", code: "PageOnlyCenteredV3", node: <PageOnlyCenteredV3 /> },
      { label: "Page only sections · V1 cards", code: "PageOnlySections", node: <PageOnlySections /> },
      { label: "Page only sections · V2 accordion", code: "PageOnlySectionsV2", node: <PageOnlySectionsV2 /> },
      { label: "Page only sections · V3 settings", code: "PageOnlySectionsV3", node: <PageOnlySectionsV3 /> },
    ],
  },
  ...EMAIL_DESIGN_CATEGORIES,
];
