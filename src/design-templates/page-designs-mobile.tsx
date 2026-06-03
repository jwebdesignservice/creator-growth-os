/* Page Designs · mobile screens ──────────────────────────────────────────────
   The mobile dimension the rest of Page Designs is missing — every other layout
   is a desktop browser frame, so these are phone-frame blueprints shown as short
   flows (two or three screens side by side): dashboard, feed, course, composer,
   chat, checkout, onboarding and profile. Same skeleton language + rose / ink /
   cream / emerald accents, staged on a soft canvas. Self-contained, no deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { Smartphone, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Device primitives ────────────────────────────────────────────────────── */

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-gradient-to-br from-cream-100 via-cream-50 to-rose-50 overflow-hidden flex items-center justify-center gap-3 px-4 shadow-sm">
      {children}
    </div>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="w-[148px] h-[236px] rounded-[20px] bg-ink-900 p-[3px] shadow-md shrink-0">
      <div className="relative w-full h-full rounded-[17px] bg-cream-50 overflow-hidden flex flex-col">
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-2 w-9 rounded-full bg-ink-900 z-10" />
        <div className="h-6 shrink-0 flex items-end justify-between px-3 pb-1">
          <div className="h-1 w-4 rounded bg-ink-300" />
          <div className="flex items-center gap-0.5">
            <div className="size-1 rounded-full bg-ink-300" />
            <div className="size-1 rounded-full bg-ink-300" />
            <div className="h-1 w-2 rounded-sm bg-ink-300" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function PhoneHeader({ back = false }: { back?: boolean }) {
  return (
    <div className="px-2.5 pb-1.5 flex items-center gap-1.5">
      {back && <div className="size-4 rounded-md bg-white border border-ink-200 shrink-0" />}
      <div className="h-2 w-16 rounded bg-ink-300" />
      <div className="ml-auto size-5 rounded-full bg-white border border-ink-100" />
    </div>
  );
}

function TabBar({ active = 0 }: { active?: number }) {
  return (
    <div className="h-7 shrink-0 bg-white border-t border-ink-100 flex items-center justify-around px-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={cn("size-3.5 rounded-md", i === active ? "bg-rose-400" : "bg-ink-200")} />
      ))}
    </div>
  );
}

function Bars({ data, className = "h-[34px]", bar = "bg-rose-200" }: { data: number[]; className?: string; bar?: string }) {
  return (
    <div className={cn("flex items-end gap-1", className)}>
      {data.map((h, i) => (
        <div key={i} className={cn("flex-1 rounded-t", bar)} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function PlayGlyph() {
  return <div className="ml-0.5 size-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-ink-900" />;
}

/* ── 1 · Mobile dashboard — home + metric detail ───────────────────────────── */
export function MobileDashboard() {
  return (
    <Stage>
      <Phone>
        <div className="flex-1 min-h-0 px-2.5 space-y-2 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              <div className="h-1.5 w-8 rounded bg-ink-100" />
            </div>
            <div className="ml-auto size-6 rounded-full bg-white border border-ink-100" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 p-1.5 space-y-1">
                <div className="h-1.5 w-8 rounded bg-ink-100" />
                <div className="h-2.5 w-10 rounded bg-ink-300" />
                <div className="h-1.5 w-6 rounded-full bg-emerald-100" />
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white border border-ink-100 p-2">
            <div className="h-1.5 w-12 rounded bg-ink-200 mb-1.5" />
            <Bars data={[40, 65, 50, 80, 60, 72]} />
          </div>
        </div>
        <TabBar active={0} />
      </Phone>
      <Phone>
        <PhoneHeader back />
        <div className="flex-1 min-h-0 px-2.5 space-y-2 overflow-hidden">
          <div className="rounded-lg bg-rose-50 border border-rose-100 p-2 space-y-1">
            <div className="h-1.5 w-10 rounded bg-rose-300" />
            <div className="h-3.5 w-20 rounded bg-ink-300" />
            <div className="h-1.5 w-12 rounded bg-emerald-200" />
          </div>
          <Bars data={[30, 50, 42, 70, 58, 84, 64]} className="h-[44px]" bar="bg-rose-300" />
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-2 rounded-sm bg-rose-200 shrink-0" />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
                <div className="h-1.5 w-6 rounded bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 2 · Mobile feed — scroll + post detail ────────────────────────────────── */
export function MobileFeed() {
  return (
    <Stage>
      <Phone>
        <PhoneHeader />
        <div className="flex-1 min-h-0 px-2.5 space-y-2 overflow-hidden">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
              <div className="flex items-center gap-1.5 p-1.5">
                <div className="size-5 rounded-full bg-cream-200 shrink-0" />
                <div className="h-1.5 w-14 rounded bg-ink-200" />
                <div className="ml-auto h-1 w-3 rounded bg-ink-100" />
              </div>
              <div className="h-12 bg-cream-200" />
              <div className="flex items-center gap-2.5 p-1.5">
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-rose-300" />
                  <div className="h-1.5 w-4 rounded bg-ink-200" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-ink-200" />
                  <div className="h-1.5 w-4 rounded bg-ink-100" />
                </div>
                <div className="ml-auto size-2.5 rounded-full bg-cream-200" />
              </div>
            </div>
          ))}
        </div>
        <TabBar active={0} />
      </Phone>
      <Phone>
        <PhoneHeader back />
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-24 bg-cream-200" />
          <div className="p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="size-6 rounded-full bg-cream-200 shrink-0" />
              <div className="space-y-1">
                <div className="h-1.5 w-16 rounded bg-ink-200" />
                <div className="h-1.5 w-10 rounded bg-ink-100" />
              </div>
              <div className="ml-auto h-5 w-12 rounded-full bg-rose-400" />
            </div>
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          </div>
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 3 · Mobile course — lesson list + player ──────────────────────────────── */
export function MobileCourse() {
  return (
    <Stage>
      <Phone>
        <PhoneHeader />
        <div className="flex-1 min-h-0 px-2.5 space-y-2 overflow-hidden">
          <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <div className="h-1.5 w-20 rounded bg-ink-200" />
            <div className="h-1 w-full rounded-full bg-cream-200">
              <div className="h-full w-1/2 rounded-full bg-emerald-300" />
            </div>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn("size-5 rounded-full shrink-0", i < 2 ? "bg-emerald-300" : i === 2 ? "bg-rose-400" : "bg-cream-200")} />
              <div className="flex-1 space-y-1">
                <div className={cn("h-1.5 rounded", i === 2 ? "w-full bg-ink-300" : "w-3/4 bg-ink-100")} />
              </div>
              <div className="h-1.5 w-4 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <TabBar active={1} />
      </Phone>
      <Phone>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="relative h-20 bg-ink-900 flex items-center justify-center shrink-0">
            <div className="size-8 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
              <div className="h-full w-1/3 bg-rose-400" />
            </div>
          </div>
          <div className="p-2.5 space-y-1.5">
            <div className="h-2 w-24 rounded bg-ink-300" />
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 flex-1 rounded-md bg-white border border-ink-200" />
              ))}
            </div>
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
          </div>
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 4 · Mobile composer — write + preview & publish ───────────────────────── */
export function MobileComposer() {
  return (
    <Stage>
      <Phone>
        <PhoneHeader back />
        <div className="flex-1 min-h-0 px-2.5 space-y-2 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="h-1.5 w-14 rounded bg-ink-200" />
            <div className="ml-auto h-5 w-10 rounded-full bg-cream-100 border border-ink-200" />
          </div>
          <div className="h-1.5 w-full rounded bg-ink-200" />
          <div className="h-1.5 w-5/6 rounded bg-ink-100" />
          <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          <div className="flex gap-1.5 pt-0.5">
            <div className="h-12 w-12 rounded-md bg-cream-200" />
            <div className="h-12 w-12 rounded-md bg-cream-100 border border-dashed border-ink-200" />
          </div>
        </div>
        <div className="h-9 shrink-0 bg-white border-t border-ink-100 flex items-center gap-2 px-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-5 rounded-md bg-cream-100" />
          ))}
          <div className="ml-auto h-6 w-16 rounded-full bg-rose-400" />
        </div>
      </Phone>
      <Phone>
        <PhoneHeader />
        <div className="flex-1 min-h-0 px-2.5 flex flex-col items-center justify-center gap-2">
          <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <div className="size-6 rounded-full bg-emerald-300" />
          </div>
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="h-1.5 w-24 rounded bg-ink-100" />
          <div className="h-1.5 w-16 rounded bg-ink-100" />
          <div className="h-7 w-24 rounded-full bg-rose-400 mt-1" />
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 5 · Mobile chat — conversations + thread ──────────────────────────────── */
export function MobileChat() {
  return (
    <Stage>
      <Phone>
        <PhoneHeader />
        <div className="flex-1 min-h-0 px-2.5 space-y-2 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-7 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-16 rounded bg-ink-200" />
                <div className="h-1.5 w-20 rounded bg-ink-100" />
              </div>
              {i === 0 && <div className="size-3 rounded-full bg-rose-400 shrink-0" />}
            </div>
          ))}
        </div>
        <TabBar active={2} />
      </Phone>
      <Phone>
        <PhoneHeader back />
        <div className="flex-1 min-h-0 px-2.5 py-1 flex flex-col gap-1.5 overflow-hidden">
          <div className="h-5 w-2/3 rounded-xl rounded-tl-sm bg-white border border-ink-100" />
          <div className="h-7 w-3/4 rounded-xl rounded-tl-sm bg-white border border-ink-100" />
          <div className="h-5 w-1/2 self-end rounded-xl rounded-tr-sm bg-rose-400" />
          <div className="h-6 w-2/3 self-end rounded-xl rounded-tr-sm bg-rose-400" />
          <div className="h-5 w-1/2 rounded-xl rounded-tl-sm bg-white border border-ink-100" />
        </div>
        <div className="h-8 shrink-0 bg-white border-t border-ink-100 flex items-center gap-1.5 px-2.5">
          <div className="flex-1 h-5 rounded-full bg-cream-100 border border-ink-200" />
          <div className="size-6 rounded-full bg-rose-400" />
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 6 · Mobile checkout — product + success ───────────────────────────────── */
export function MobileCheckout() {
  return (
    <Stage>
      <Phone>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="h-24 bg-cream-200 shrink-0" />
          <div className="p-2.5 space-y-1.5 flex-1">
            <div className="h-2.5 w-24 rounded bg-ink-300" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-3 w-12 rounded bg-ink-300" />
              <div className="h-1.5 w-8 rounded bg-ink-100" />
            </div>
          </div>
          <div className="p-2.5 border-t border-ink-100">
            <div className="h-8 rounded-full bg-rose-400" />
          </div>
        </div>
      </Phone>
      <Phone>
        <div className="flex-1 min-h-0 px-2.5 flex flex-col items-center justify-center gap-2">
          <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <div className="size-6 rounded-full bg-emerald-300" />
          </div>
          <div className="h-2 w-20 rounded bg-ink-300" />
          <div className="h-1.5 w-24 rounded bg-ink-100" />
          <div className="w-full rounded-lg bg-white border border-ink-100 p-2 space-y-1 mt-1">
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-10 rounded bg-ink-100" />
              <div className="h-1.5 w-8 rounded bg-ink-200" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-12 rounded bg-ink-100" />
              <div className="h-1.5 w-6 rounded bg-ink-200" />
            </div>
          </div>
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 7 · Mobile onboarding — welcome → goals → ready ───────────────────────── */
export function MobileOnboarding() {
  return (
    <Stage>
      <Phone>
        <div className="flex-1 min-h-0 px-3 flex flex-col items-center justify-center gap-2">
          <div className="size-12 rounded-2xl bg-rose-400" />
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-1.5 w-28 rounded bg-ink-100" />
          <div className="h-1.5 w-20 rounded bg-ink-100" />
          <div className="h-7 w-28 rounded-full bg-rose-400 mt-1" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-1 rounded-full", i === 0 ? "w-4 bg-rose-400" : "w-1 bg-ink-200")} />
            ))}
          </div>
        </div>
      </Phone>
      <Phone>
        <PhoneHeader />
        <div className="flex-1 min-h-0 px-2.5 space-y-1.5 overflow-hidden">
          <div className="h-1.5 w-20 rounded bg-ink-200" />
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("rounded-lg border p-1.5 h-10 flex items-center gap-1", i === 0 ? "border-rose-300 bg-rose-50" : "border-ink-100 bg-white")}>
                <div className={cn("size-4 rounded shrink-0", i === 0 ? "bg-rose-400" : "bg-cream-200")} />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="h-6 rounded-full bg-rose-400 mt-1" />
        </div>
      </Phone>
      <Phone>
        <div className="flex-1 min-h-0 px-3 flex flex-col items-center justify-center gap-2">
          <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <div className="size-6 rounded-full bg-emerald-300" />
          </div>
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="h-1.5 w-24 rounded bg-ink-100" />
          <div className="h-7 w-28 rounded-full bg-rose-400 mt-1" />
        </div>
      </Phone>
    </Stage>
  );
}

/* ── 8 · Mobile profile — public profile + edit sheet ──────────────────────── */
export function MobileProfile() {
  return (
    <Stage>
      <Phone>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="h-12 bg-gradient-to-r from-rose-200 to-cream-200 shrink-0" />
          <div className="px-2.5 -mt-5">
            <div className="size-10 rounded-full bg-white border-2 border-white shadow-sm" />
            <div className="mt-1 space-y-1">
              <div className="h-2 w-20 rounded bg-ink-300" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
            </div>
            <div className="flex gap-2 mt-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2 w-6 rounded bg-ink-300" />
                  <div className="h-1.5 w-5 rounded bg-ink-100" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 px-2.5 mt-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square rounded bg-cream-200" />
            ))}
          </div>
        </div>
        <TabBar active={3} />
      </Phone>
      <Phone>
        <div className="flex-1 min-h-0 flex flex-col justify-end">
          <div className="rounded-t-2xl bg-white border-t border-ink-100 p-2.5 space-y-2 shadow-md">
            <div className="h-1 w-8 rounded-full bg-ink-200 mx-auto" />
            <div className="h-2 w-20 rounded bg-ink-300" />
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-1.5 w-12 rounded bg-ink-100" />
                  <div className="h-7 rounded-md bg-cream-100 border border-ink-200" />
                </div>
              ))}
            </div>
            <div className="h-7 rounded-full bg-rose-400" />
          </div>
        </div>
      </Phone>
    </Stage>
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

export const PAGE_DESIGNS_MOBILE: PageCategory[] = [
  {
    id: "page-designs-mobile",
    label: "Mobile screens",
    icon: Smartphone,
    blurb: "The mobile dimension — phone-frame page blueprints shown as short flows: dashboard, feed, course, composer, chat, checkout, onboarding & profile.",
    items: [
      { label: "Mobile · dashboard + metric", code: "MobileDashboard", node: <MobileDashboard /> },
      { label: "Mobile · feed + post detail", code: "MobileFeed", node: <MobileFeed /> },
      { label: "Mobile · course + player", code: "MobileCourse", node: <MobileCourse /> },
      { label: "Mobile · composer + published", code: "MobileComposer", node: <MobileComposer /> },
      { label: "Mobile · chat list + thread", code: "MobileChat", node: <MobileChat /> },
      { label: "Mobile · checkout + success", code: "MobileCheckout", node: <MobileCheckout /> },
      { label: "Mobile · onboarding flow", code: "MobileOnboarding", node: <MobileOnboarding /> },
      { label: "Mobile · profile + edit sheet", code: "MobileProfile", node: <MobileProfile /> },
    ],
  },
];
