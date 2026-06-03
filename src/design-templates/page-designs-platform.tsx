/* Page Designs · platform pages ──────────────────────────────────────────────
   Canonical full-page blueprints for the actual product — the key screens a
   creator works in every day: dashboard home, performance, members, content
   calendar, notifications, settings, billing, pricing, a program sales page,
   and a public creator profile. Same visual language as the rest of Page
   Designs (a 560×268 app-shell frame from skeleton bars, rose / ink / cream /
   emerald accents, flat inner cards), composed at page level for structure and
   hierarchy. Self-contained & presentational — no shared deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { LayoutDashboard, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Shell primitives (kept identical to the other Page Design files) ──────── */

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

function Bars({ data, className = "h-[44px]", bar = "bg-rose-200" }: { data: number[]; className?: string; bar?: string }) {
  return (
    <div className={cn("flex items-end gap-1", className)}>
      {data.map((h, i) => (
        <div key={i} className={cn("flex-1 rounded-t", bar)} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function Donut({ size = 44 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-[6px] border-cream-200" />
      <div className="absolute inset-0 rounded-full border-[6px] border-rose-400 border-r-transparent border-b-transparent" />
    </div>
  );
}

/* ── 1 · Dashboard home — greeting, KPI row, revenue chart + activity ──────── */
export function DashboardHome() {
  return (
    <Frame>
      <Rail active={0} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-cream-200 shrink-0" />
          <div className="space-y-1">
            <div className="h-2.5 w-32 rounded bg-ink-300" />
            <div className="h-1.5 w-20 rounded bg-ink-100" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="size-7 rounded-md bg-white border border-ink-200" />
            <div className="h-7 w-20 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className="h-1.5 w-12 rounded bg-ink-100" />
              <div className="h-3.5 w-16 rounded bg-ink-300" />
              <div className={cn("h-2 w-10 rounded-full", i === 2 ? "bg-amber-100" : "bg-emerald-100")} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.6fr_1fr] gap-2 flex-1 min-h-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="h-2 w-16 rounded bg-ink-200" />
              <div className="flex gap-1">
                <div className="h-1.5 w-6 rounded-full bg-rose-300" />
                <div className="h-1.5 w-6 rounded-full bg-ink-100" />
              </div>
            </div>
            <Bars data={[42, 60, 48, 72, 56, 80, 64, 88]} className="flex-1" />
          </div>
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="h-2 w-14 rounded bg-ink-200" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full shrink-0", i === 0 ? "bg-rose-400" : "bg-cream-200")} />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 2 · Performance — filters, KPI row, chart + breakdown ─────────────────── */
export function PerformancePage() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-20 rounded-md bg-white border border-ink-200" />
            <div className="size-6 rounded-md bg-white border border-ink-200" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1">
              <div className="h-1.5 w-8 rounded bg-ink-100" />
              <div className="h-2.5 w-10 rounded bg-ink-300" />
              <div className={cn("h-1.5 w-6 rounded-full", i === 1 ? "bg-amber-100" : "bg-emerald-100")} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex flex-col">
            <div className="h-1.5 w-12 rounded bg-ink-200 mb-2" />
            <Bars data={[40, 55, 48, 68, 60, 82, 70]} bar="bg-rose-300" className="flex-1" />
          </div>
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex items-center gap-2.5">
            <Donut size={46} />
            <div className="space-y-1.5 flex-1 min-w-0">
              {["bg-rose-400", "bg-cream-300", "bg-ink-200"].map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={cn("size-2 rounded-sm shrink-0", c)} />
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

/* ── 3 · Members — toolbar + roster table with status ──────────────────────── */
export function MembersPage() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-7 w-28 rounded-full bg-cream-100 border border-ink-200" />
          <div className="size-7 rounded-md bg-white border border-ink-200" />
          <div className="h-7 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 min-h-0 p-2.5">
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-ink-200 bg-cream-50">
              <div className="size-3 rounded border border-ink-300 shrink-0" />
              <div className="h-1.5 w-16 rounded bg-ink-300" />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-300" />
              <div className="h-1.5 w-12 rounded bg-ink-300" />
              <div className="h-1.5 w-8 rounded bg-ink-300" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-ink-100 last:border-0">
                <div className="size-3 rounded border border-ink-200 shrink-0" />
                <div className="size-6 rounded-full bg-cream-200 shrink-0" />
                <div className="space-y-1">
                  <div className="h-1.5 w-16 rounded bg-ink-200" />
                  <div className="h-1.5 w-10 rounded bg-ink-100" />
                </div>
                <div className="ml-auto h-1.5 w-8 rounded bg-ink-100" />
                <div className="h-1 w-12 rounded-full bg-cream-200 overflow-hidden">
                  <div className={cn("h-full rounded-full bg-emerald-300", i === 0 ? "w-full" : i === 1 ? "w-2/3" : "w-1/3")} />
                </div>
                <div className={cn("h-2.5 w-8 rounded-full shrink-0", i < 2 ? "bg-emerald-100" : "bg-amber-100")} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 4 · Content calendar — month grid with scheduled posts ────────────────── */
export function ContentCalendar() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-20 rounded bg-ink-300" />
            <div className="flex gap-1">
              <div className="size-5 rounded-md bg-white border border-ink-200" />
              <div className="size-5 rounded-md bg-white border border-ink-200" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="mx-auto h-1.5 w-5 rounded bg-ink-200" />
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-4 gap-1 flex-1 min-h-0">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="rounded-md bg-white border border-ink-100 p-1 flex flex-col gap-0.5 overflow-hidden">
              <div className="h-1 w-2 rounded bg-ink-200" />
              {i % 5 === 0 && <div className="h-1.5 rounded-sm bg-rose-200" />}
              {i % 9 === 4 && <div className="h-1.5 rounded-sm bg-emerald-200" />}
              {i % 7 === 3 && <div className="h-1.5 rounded-sm bg-amber-200" />}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 5 · Notifications — filter tabs + grouped activity ────────────────────── */
export function NotificationsPage() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-5 w-12 rounded-full", i === 0 ? "bg-rose-100" : "bg-cream-100")} />
            ))}
          </div>
          <div className="h-1.5 w-12 rounded bg-rose-300 ml-1" />
        </div>
        <div className="flex-1 min-h-0 p-2.5 space-y-2 overflow-hidden">
          <div className="h-1.5 w-10 rounded bg-ink-300" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-ink-100 p-2">
              <div className={cn("size-7 rounded-full shrink-0", i === 0 ? "bg-rose-100" : "bg-cream-200")} />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
              <div className="h-1.5 w-8 rounded bg-ink-100 shrink-0" />
              {i === 0 && <div className="size-2 rounded-full bg-rose-400 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 6 · Settings — inner nav + profile form + save bar ────────────────────── */
export function SettingsPage() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[118px] shrink-0 border-r border-ink-100 bg-cream-50 p-2.5 space-y-1">
          <div className="h-2 w-14 rounded bg-ink-300 mb-1.5" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1.5", i === 1 && "bg-white border border-ink-200")}>
              <div className={cn("size-2.5 rounded shrink-0", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 p-3.5 flex flex-col gap-2.5 bg-cream-50 overflow-hidden">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="flex items-center gap-2.5">
            <div className="size-11 rounded-full bg-cream-200 shrink-0" />
            <div className="h-7 w-20 rounded-md bg-white border border-ink-200" />
            <div className="h-7 w-16 rounded-md bg-white border border-ink-200" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-14 rounded bg-ink-200" />
              <div className="h-8 rounded-md bg-white border border-ink-200" />
            </div>
          ))}
          <div className="mt-auto flex justify-end gap-2 pt-2 border-t border-ink-100">
            <div className="h-7 w-16 rounded-md bg-white border border-ink-200" />
            <div className="h-7 w-20 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 7 · Billing — current plan banner + invoices ──────────────────────────── */
export function BillingPage() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="h-2.5 w-20 rounded bg-ink-300" />
        <div className="rounded-lg bg-gradient-to-r from-rose-50 to-cream-50 border border-rose-100 p-2.5 flex items-center gap-2.5">
          <div className="size-9 rounded-md bg-rose-100 shrink-0" />
          <div className="space-y-1">
            <div className="h-2 w-16 rounded bg-ink-300" />
            <div className="h-1.5 w-24 rounded bg-ink-100" />
          </div>
          <div className="ml-auto h-7 w-20 rounded-md bg-white border border-ink-200" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden flex-1 min-h-0">
          <div className="px-3 py-1.5 border-b border-ink-100">
            <div className="h-1.5 w-16 rounded bg-ink-300" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-ink-100 last:border-0">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-12 rounded bg-ink-100" />
              <div className="h-2.5 w-10 rounded-full bg-emerald-100" />
              <div className="size-4 rounded bg-cream-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 8 · Pricing — billing toggle + tiers (one recommended) ────────────────── */
export function PricingPlans() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col items-center overflow-hidden p-3">
        <div className="h-2.5 w-32 rounded bg-ink-300 mt-1" />
        <div className="h-1.5 w-44 rounded bg-ink-100 mt-1.5" />
        <div className="mt-2.5 flex items-center gap-0.5 p-0.5 rounded-full bg-cream-200">
          <div className="h-5 w-14 rounded-full bg-white shadow-sm" />
          <div className="h-5 w-14 rounded-full" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 w-full flex-1 min-h-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-2.5 flex flex-col gap-1.5",
                i === 1 ? "border-rose-300 bg-white ring-1 ring-rose-100" : "border-ink-100 bg-white",
              )}
            >
              {i === 1 && <div className="h-2 w-12 rounded-full bg-rose-400 -mt-3.5 mb-0.5 self-center" />}
              <div className={cn("h-1.5 w-10 rounded", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
              <div className="h-3.5 w-14 rounded bg-ink-300" />
              <div className="space-y-1 mt-0.5">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-emerald-300 shrink-0" />
                    <div className="h-1.5 flex-1 rounded bg-ink-100" />
                  </div>
                ))}
              </div>
              <div className={cn("mt-auto h-6 rounded-md", i === 1 ? "bg-rose-400" : "bg-white border border-ink-200")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 9 · Program landing — marketing / sales page for a program ────────────── */
export function ProgramLanding() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <div className="h-8 shrink-0 border-b border-ink-100 flex items-center gap-2 px-3">
          <div className="size-4 rounded bg-rose-400" />
          <div className="h-1.5 w-14 rounded bg-ink-200" />
          <div className="ml-auto flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 w-8 rounded bg-ink-100" />
            ))}
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 p-3.5 bg-gradient-to-b from-rose-50/60 to-white min-h-0">
          <div className="flex flex-col justify-center gap-2">
            <div className="h-3 w-16 rounded-full bg-rose-100" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full rounded bg-ink-300" />
              <div className="h-3.5 w-3/4 rounded bg-ink-300" />
            </div>
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
            <div className="flex items-center gap-2 mt-1">
              <div className="h-8 w-24 rounded-md bg-rose-400" />
              <div className="h-8 w-20 rounded-md bg-white border border-ink-200" />
            </div>
          </div>
          <div className="rounded-xl bg-ink-900 relative overflow-hidden flex items-center justify-center">
            <div className="size-10 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
          </div>
        </div>
        <div className="h-12 shrink-0 border-t border-ink-100 grid grid-cols-3 gap-2 p-2 bg-white">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md bg-cream-50 border border-ink-100 flex items-center gap-1.5 px-2">
              <div className="size-4 rounded bg-rose-100 shrink-0" />
              <div className="space-y-1">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="h-1.5 w-8 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 10 · Public profile — creator's public page ───────────────────────────── */
export function PublicProfile() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <div className="h-14 shrink-0 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200" />
        <div className="px-3.5 -mt-5 flex items-end gap-2.5">
          <div className="size-12 rounded-full bg-cream-200 border-2 border-white shadow-sm shrink-0" />
          <div className="flex-1 space-y-1 pb-1">
            <div className="h-2.5 w-28 rounded bg-ink-300" />
            <div className="h-1.5 w-20 rounded bg-ink-100" />
          </div>
          <div className="h-7 w-20 rounded-full bg-rose-400 shrink-0 mb-1" />
        </div>
        <div className="px-3.5 mt-2 flex gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-8 rounded bg-ink-300" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="px-3.5 mt-2 flex gap-3 border-b border-ink-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pb-1.5">
              <div className={cn("h-1.5 w-10 rounded", i === 0 ? "bg-rose-400" : "bg-ink-100")} />
              {i === 0 && <div className="mt-1.5 h-0.5 w-10 rounded-full bg-rose-400" />}
            </div>
          ))}
        </div>
        <div className="flex-1 min-h-0 p-3 grid grid-cols-3 gap-2 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className={cn("h-10", i % 3 === 0 ? "bg-rose-100" : i % 3 === 1 ? "bg-cream-200" : "bg-emerald-100")} />
              <div className="p-1.5 space-y-1">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="h-1.5 w-1/2 rounded bg-ink-100" />
              </div>
            </div>
          ))}
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

export const PAGE_DESIGNS_PLATFORM: PageCategory[] = [
  {
    id: "page-designs-platform",
    label: "Platform pages",
    icon: LayoutDashboard,
    blurb: "Canonical full-page blueprints for the product — dashboard, performance, members, calendar, notifications, settings, billing, pricing, program landing & public profile.",
    items: [
      { label: "Dashboard home", code: "DashboardHome", node: <DashboardHome /> },
      { label: "Performance · analytics", code: "PerformancePage", node: <PerformancePage /> },
      { label: "Members · roster table", code: "MembersPage", node: <MembersPage /> },
      { label: "Content calendar · month", code: "ContentCalendar", node: <ContentCalendar /> },
      { label: "Notifications · activity", code: "NotificationsPage", node: <NotificationsPage /> },
      { label: "Settings · inner nav + form", code: "SettingsPage", node: <SettingsPage /> },
      { label: "Billing · plan + invoices", code: "BillingPage", node: <BillingPage /> },
      { label: "Pricing · plans", code: "PricingPlans", node: <PricingPlans /> },
      { label: "Program landing · sales", code: "ProgramLanding", node: <ProgramLanding /> },
      { label: "Public profile · creator page", code: "PublicProfile", node: <PublicProfile /> },
    ],
  },
];
