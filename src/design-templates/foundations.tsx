/* Foundations ──────────────────────────────────────────────────────────
   Style-guide foundations rendered from the app's REAL design tokens
   (src/styles/tokens/*). Each section is presentational and exported as a
   ready-made gallery category via FOUNDATION_CATEGORIES, so the gallery
   only needs to spread it into CATEGORIES.

   Typography · Other HTML Tags · Text Sizes · Paddings · Margins ·
   Spacers · Max Widths · Responsive Sizes · Structure Classes
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import {
  Type,
  Code,
  CaseSensitive,
  Frame,
  Maximize,
  StretchHorizontal,
  MoveHorizontal,
  MonitorSmartphone,
  LayoutDashboard,
  Palette,
  Layers,
  Shapes,
  Circle,
  Home,
  Search,
  Bell,
  Settings,
  User,
  Heart,
  Star,
  Calendar,
  Mail,
  MessageSquare,
  Check,
  Plus,
  Trash2,
  Download,
  Eye,
  Lock,
  Zap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

/* ── 1 · Typography (fluid serif heading scale) ───────────────────────── */

const HEADINGS = [
  { cls: "text-h1", sample: "Heading 1", name: ".text-h1", size: "32 → 52px" },
  { cls: "text-h2", sample: "Heading 2", name: ".text-h2", size: "26 → 42px" },
  { cls: "text-h3", sample: "Heading 3", name: ".text-h3", size: "22 → 32px" },
  { cls: "text-h4", sample: "Heading 4", name: ".text-h4", size: "18 → 24px" },
  { cls: "text-h5", sample: "Heading 5", name: ".text-h5", size: "16 → 20px" },
  { cls: "text-h6", sample: "Heading 6", name: ".text-h6", size: "15 → 18px" },
  { cls: "text-page-title", sample: "Page title", name: ".text-page-title", size: "22 → 30px" },
];

function Typography() {
  return (
    <div className="w-full space-y-4">
      {HEADINGS.map((h, i) => (
        <div
          key={h.name}
          className={cn(
            "flex items-baseline justify-between gap-6 pb-4",
            i < HEADINGS.length - 1 && "border-b border-ink-100",
          )}
        >
          {/* plain string, not cn(): twMerge would strip the custom .text-h* class */}
          <span className={`${h.cls} text-ink-900 leading-none`}>{h.sample}</span>
          <span className="shrink-0 whitespace-nowrap text-[11.5px] font-mono text-ink-400">
            {h.name} · {h.size}
          </span>
        </div>
      ))}
      <p className="pt-1 text-[12px] text-ink-400 leading-relaxed">
        Headings use the serif display face (<code className="font-mono">--font-heading</code>); body uses the sans
        face. Every size scales fluidly between breakpoints via <code className="font-mono">clamp()</code>.
      </p>
    </div>
  );
}

/* ── 2 · Other HTML Tags (rich text) ──────────────────────────────────── */

function HtmlTags() {
  return (
    <div className="w-full max-w-[640px] space-y-4 text-ink-800">
      <h3 className="text-h3 text-ink-900">Rich text heading</h3>
      <p className="text-body leading-relaxed">
        A paragraph of body copy with a{" "}
        <a href="#" className="text-rose-600 underline underline-offset-2 hover:text-rose-700">
          text link
        </a>{" "}
        and some{" "}
        <code className="font-mono text-[13px] bg-cream-200 text-ink-700 px-1.5 py-0.5 rounded">inline code</code>{" "}
        inside it.
      </p>
      <blockquote className="border-l-[3px] border-rose-300 pl-4 italic text-ink-600">
        “A block quote for emphasis — styled with a rose left rule.”
      </blockquote>
      <ul className="list-disc pl-5 space-y-1 text-body">
        <li>Unordered list item one</li>
        <li>Item two</li>
        <li>Item three</li>
      </ul>
      <ol className="list-decimal pl-5 space-y-1 text-body">
        <li>Ordered list item one</li>
        <li>Item two</li>
      </ol>
      <hr className="border-ink-100" />
      <div className="rounded-[10px] bg-cream-100 h-28 flex items-center justify-center text-ink-400 text-[12px]">
        Image / embed block
      </div>
    </div>
  );
}

/* ── 3 · Text Sizes (fluid body & UI scale) ───────────────────────────── */

const TEXT_SIZES = [
  { cls: "text-body-lg", name: ".text-body-lg", size: "16 → 18px" },
  { cls: "text-body", name: ".text-body", size: "14 → 16px" },
  { cls: "text-body-sm", name: ".text-body-sm", size: "13 → 15px" },
  { cls: "text-small", name: ".text-small", size: "12 → 14px" },
  { cls: "text-tiny", name: ".text-tiny", size: "11 → 12px" },
];

function TextSizes() {
  return (
    <div className="w-full space-y-3.5">
      {TEXT_SIZES.map((t, i) => (
        <div
          key={t.name}
          className={cn(
            "flex items-baseline justify-between gap-6 pb-3.5",
            i < TEXT_SIZES.length - 1 && "border-b border-ink-100",
          )}
        >
          {/* plain string, not cn(): twMerge would strip the custom .text-* class */}
          <span className={`${t.cls} text-ink-900 truncate`}>{SAMPLE}</span>
          <span className="shrink-0 whitespace-nowrap text-[11.5px] font-mono text-ink-400">
            {t.name} · {t.size}
          </span>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-6 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-700">
          Caps label
        </span>
        <span className="shrink-0 text-[11.5px] font-mono text-ink-400">.text-label · 11 → 12px</span>
      </div>
    </div>
  );
}

/* ── Spacing primitive scale (shared by Paddings / Margins / Spacers) ──── */

const SPACE = [
  { n: "1", px: 4 },
  { n: "2", px: 8 },
  { n: "3", px: 12 },
  { n: "4", px: 16 },
  { n: "5", px: 20 },
  { n: "6", px: 24 },
  { n: "8", px: 32 },
  { n: "10", px: 40 },
  { n: "12", px: 48 },
  { n: "16", px: 64 },
  { n: "20", px: 80 },
  { n: "24", px: 96 },
];

/* ── 4 · Paddings ─────────────────────────────────────────────────────── */

function Paddings() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        {SPACE.map((s) => (
          <div key={s.n} className="flex flex-col items-center gap-2">
            <div className="inline-flex bg-rose-100 rounded-[6px]" style={{ padding: s.px }}>
              <div className="bg-rose-500 rounded-[3px]" style={{ width: 20, height: 20 }} />
            </div>
            <div className="text-center leading-tight">
              <div className="text-[11px] font-mono text-ink-600 tabular-nums">{s.px}px</div>
              <div className="text-[10px] text-ink-400 font-mono">--space-{s.n}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[12px] text-ink-400 leading-relaxed">
        Padding utilities apply the spacing scale <em>inside</em> an element. Semantic:{" "}
        <code className="font-mono">p-card</code> (20→28px), <code className="font-mono">px-page</code>.
      </p>
    </div>
  );
}

/* ── 5 · Margins ──────────────────────────────────────────────────────── */

function Margins() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        {SPACE.map((s) => (
          <div key={s.n} className="flex flex-col items-center gap-2">
            <div className="inline-flex border border-dashed border-rose-300 rounded-[6px]">
              <div className="bg-rose-500 rounded-[3px]" style={{ width: 20, height: 20, margin: s.px }} />
            </div>
            <div className="text-center leading-tight">
              <div className="text-[11px] font-mono text-ink-600 tabular-nums">{s.px}px</div>
              <div className="text-[10px] text-ink-400 font-mono">--space-{s.n}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[12px] text-ink-400 leading-relaxed">
        Margin utilities apply the spacing scale <em>outside</em> an element. Section rhythm uses{" "}
        <code className="font-mono">gap-section</code>.
      </p>
    </div>
  );
}

/* ── 6 · Spacers ──────────────────────────────────────────────────────── */

function Spacers() {
  return (
    <div className="w-full">
      <div className="flex items-end flex-wrap gap-x-5 gap-y-4">
        {SPACE.map((s) => (
          <div key={s.n} className="flex flex-col items-center gap-2">
            <div className="w-8 bg-rose-500 rounded-[3px]" style={{ height: s.px }} />
            <div className="text-[10.5px] text-ink-400 tabular-nums font-mono">{s.px}px</div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[12px] text-ink-400 leading-relaxed">
        Spacer blocks insert fixed vertical rhythm between stacked sections.
      </p>
    </div>
  );
}

/* ── Container max-width tokens (shared by Max Widths / Structure) ─────── */

const CONTAINERS = [
  { name: ".container-page", px: 1536 },
  { name: ".container-admin", px: 1472 },
  { name: ".container-app", px: 1240 },
  { name: ".container-content", px: 1100 },
  { name: ".container-narrow", px: 832 },
  { name: ".container-form", px: 640 },
  { name: ".container-auth", px: 448 },
];

/* ── 7 · Max Widths ───────────────────────────────────────────────────── */

function MaxWidths() {
  return (
    <div className="w-full space-y-2.5">
      {CONTAINERS.map((c) => (
        <div key={c.name} className="flex items-center gap-4">
          <code className="w-[150px] shrink-0 text-[12px] font-mono text-ink-600">{c.name}</code>
          <div className="flex-1 min-w-0">
            <div className="h-3 rounded-full bg-rose-500" style={{ width: `${(c.px / 1536) * 100}%` }} />
          </div>
          <span className="w-[60px] text-right shrink-0 text-[11.5px] text-ink-400 tabular-nums">
            {c.px}px
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── 8 · Responsive Sizes (breakpoints) ───────────────────────────────── */

const BREAKPOINTS = [
  { name: "sm", px: 640 },
  { name: "md", px: 768 },
  { name: "lg", px: 1024 },
  { name: "xl", px: 1280 },
  { name: "2xl", px: 1536 },
];

function ResponsiveSizes() {
  return (
    <div className="w-full space-y-2.5">
      {BREAKPOINTS.map((b) => (
        <div key={b.name} className="flex items-center gap-4">
          <code className="w-[60px] shrink-0 text-[12px] font-mono text-ink-700">{b.name}</code>
          <div className="flex-1 min-w-0">
            <div className="h-3 rounded-full bg-rose-400" style={{ width: `${(b.px / 1536) * 100}%` }} />
          </div>
          <span className="w-[72px] text-right shrink-0 text-[11.5px] text-ink-400 tabular-nums">
            ≥ {b.px}px
          </span>
        </div>
      ))}
      <p className="pt-2 text-[12px] text-ink-400 leading-relaxed">
        Type and spacing also scale fluidly between these breakpoints via{" "}
        <code className="font-mono">clamp()</code> — no hard jumps.
      </p>
    </div>
  );
}

/* ── 9 · Structure Classes ────────────────────────────────────────────── */

function StructureClasses() {
  return (
    <div className="w-full space-y-5">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Surfaces</div>
        <div className="flex flex-wrap gap-3">
          <div className="card p-4 text-[12px] font-mono text-ink-700">.card</div>
          <div className="card-flat p-4 text-[12px] font-mono text-ink-700">.card-flat</div>
          <div className="card-cream p-4 text-[12px] font-mono text-ink-700">.card-cream</div>
        </div>
      </div>
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Containers</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
          {CONTAINERS.map((c) => (
            <div key={c.name} className="flex items-baseline justify-between gap-2 text-[12px]">
              <code className="font-mono text-ink-600">{c.name}</code>
              <span className="text-ink-400 tabular-nums">{c.px}px</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Spacing utilities
        </div>
        <div className="flex flex-wrap gap-2">
          {["px-page", "py-page", "p-card", "gap-section", "gap-grid", "container-app"].map((u) => (
            <code
              key={u}
              className="inline-flex items-center h-7 px-2.5 rounded-full bg-cream-100 text-[11.5px] font-mono text-ink-600"
            >
              .{u}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 10 · Colors ──────────────────────────────────────────────────────── */

const PALETTE: { group: string; colors: [string, string][] }[] = [
  { group: "Cream — surfaces", colors: [["cream-50", "#FDFBF8"], ["cream-100", "#FAF6F2"], ["cream-200", "#F4ECE3"], ["cream-300", "#E9DDCF"]] },
  { group: "Rose — brand", colors: [["rose-50", "#FCEFEC"], ["rose-100", "#F7E1DC"], ["rose-200", "#F0CFC8"], ["rose-300", "#E0A89E"], ["rose-400", "#D08171"], ["rose-500", "#C26174"], ["rose-600", "#B9485C"], ["rose-700", "#97384A"]] },
  { group: "Ink — text & neutral", colors: [["ink-50", "#F7F5F2"], ["ink-100", "#ECE8E3"], ["ink-200", "#DDD7D0"], ["ink-300", "#C2BAB0"], ["ink-400", "#9B928A"], ["ink-500", "#756E66"], ["ink-700", "#3A3631"], ["ink-900", "#1A1816"]] },
  { group: "Gold & status", colors: [["gold-400", "#D9B66B"], ["gold-500", "#C9A14A"], ["success", "#3DA862"], ["success-bg", "#E2F2E8"]] },
];

function Colors() {
  return (
    <div className="w-full space-y-5">
      {PALETTE.map((g) => (
        <div key={g.group}>
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{g.group}</div>
          <div className="flex flex-wrap gap-3">
            {g.colors.map(([name, hex]) => (
              <div key={name} className="w-[104px]">
                <div className="h-14 rounded-[10px] border border-ink-100" style={{ backgroundColor: hex }} />
                <div className="mt-1.5 text-[11.5px] font-mono text-ink-700">{name}</div>
                <div className="text-[10.5px] font-mono text-ink-400">{hex}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 11 · Icons ───────────────────────────────────────────────────────── */

const ICON_SET: LucideIcon[] = [
  Home, Search, Bell, Settings, User, Heart, Star, Calendar,
  Mail, MessageSquare, Check, Plus, Trash2, Download, Eye, Lock, Zap, Sparkles,
];

function Icons() {
  return (
    <div className="w-full space-y-5">
      <div>
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Lucide · UI icons</div>
        <div className="flex flex-wrap gap-2.5">
          {ICON_SET.map((Ic, i) => (
            <div key={i} className="size-11 rounded-[10px] bg-cream-100 border border-ink-100 flex items-center justify-center text-ink-700">
              <Ic className="size-[18px]" strokeWidth={1.8} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Brand glyphs</div>
        <div className="flex flex-wrap gap-2.5">
          {[InstagramIcon, TiktokIcon, YoutubeIcon].map((G, i) => (
            <div key={i} className="size-11 rounded-[10px] bg-cream-100 border border-ink-100 flex items-center justify-center text-ink-800">
              <G size={18} />
            </div>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-ink-400 leading-relaxed">
        Outline icons from <code className="font-mono">lucide-react</code> at <code className="font-mono">1.8</code> stroke; brand marks are custom SVGs.
      </p>
    </div>
  );
}

/* ── 12 · Border Radius ───────────────────────────────────────────────── */

const RADII = [
  { name: "radius-2xs", px: 4 },
  { name: "radius-xs", px: 6 },
  { name: "radius-sm", px: 8 },
  { name: "radius-md", px: 12 },
  { name: "radius-lg", px: 16 },
  { name: "radius-xl", px: 20 },
  { name: "radius-2xl", px: 24 },
  { name: "radius-3xl", px: 32 },
];

function BorderRadius() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-x-7 gap-y-5">
        {RADII.map((r) => (
          <div key={r.name} className="flex flex-col items-center gap-2">
            <div className="size-16 bg-rose-100 border border-rose-300" style={{ borderRadius: r.px }} />
            <div className="text-center leading-tight">
              <div className="text-[11px] font-mono text-ink-600 tabular-nums">{r.px}px</div>
              <div className="text-[10px] font-mono text-ink-400">--{r.name}</div>
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <div className="size-16 bg-rose-100 border border-rose-300 rounded-full" />
          <div className="text-center leading-tight">
            <div className="text-[11px] font-mono text-ink-600">full</div>
            <div className="text-[10px] font-mono text-ink-400">--radius-full</div>
          </div>
        </div>
      </div>
      <p className="mt-5 text-[12px] text-ink-400 leading-relaxed">
        Aliases: <code className="font-mono">--radius-card</code> (16px), <code className="font-mono">--radius-button</code> (12px),{" "}
        <code className="font-mono">--radius-pill</code> (full).
      </p>
    </div>
  );
}

/* ── 13 · Shadows ─────────────────────────────────────────────────────── */

const SHADOWS = [
  { name: "shadow-xs", v: "--shadow-xs" },
  { name: "shadow-sm", v: "--shadow-sm" },
  { name: "shadow-soft", v: "--shadow-soft" },
  { name: "shadow-card", v: "--shadow-card" },
  { name: "shadow-md", v: "--shadow-md" },
  { name: "shadow-lg", v: "--shadow-lg" },
  { name: "shadow-xl", v: "--shadow-xl" },
];

function Shadows() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-6">
        {SHADOWS.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-2.5">
            <div
              className="size-20 rounded-[12px] bg-white border border-ink-100/50"
              style={{ boxShadow: `var(${s.v})` }}
            />
            <div className="text-[10.5px] font-mono text-ink-500">{s.name}</div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[12px] text-ink-400 leading-relaxed">
        Applied via <code className="font-mono">shadow-card</code> / <code className="font-mono">shadow-soft</code> utilities; semantic{" "}
        <code className="font-mono">--shadow-modal</code> and <code className="font-mono">--shadow-popover</code> extend the scale.
      </p>
    </div>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type FCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const FOUNDATION_CATEGORIES: FCategory[] = [
  {
    id: "typography",
    label: "Typography",
    icon: Type,
    blurb: "Fluid serif heading scale + page title.",
    items: [{ label: "Heading scale", code: "Typography", node: <Typography /> }],
  },
  {
    id: "html-tags",
    label: "Other HTML Tags",
    icon: Code,
    blurb: "Rich-text elements — quotes, lists, links, code.",
    items: [{ label: "Rich text", code: "HtmlTags", node: <HtmlTags /> }],
  },
  {
    id: "text-sizes",
    label: "Text Sizes",
    icon: CaseSensitive,
    blurb: "Fluid body & UI text scale.",
    items: [{ label: "Text size scale", code: "TextSizes", node: <TextSizes /> }],
  },
  {
    id: "colors",
    label: "Colors",
    icon: Palette,
    blurb: "Brand, neutral and status palette.",
    items: [{ label: "Color palette", code: "Colors", node: <Colors /> }],
  },
  {
    id: "icons",
    label: "Icons",
    icon: Shapes,
    blurb: "Lucide UI icons + brand glyphs.",
    items: [{ label: "Icon set", code: "Icons", node: <Icons /> }],
  },
  {
    id: "border-radius",
    label: "Border Radius",
    icon: Circle,
    blurb: "Corner-radius scale + component aliases.",
    items: [{ label: "Radius scale", code: "BorderRadius", node: <BorderRadius /> }],
  },
  {
    id: "shadows",
    label: "Shadows",
    icon: Layers,
    blurb: "Elevation scale + focus rings.",
    items: [{ label: "Elevation scale", code: "Shadows", node: <Shadows /> }],
  },
  {
    id: "paddings",
    label: "Paddings",
    icon: Frame,
    blurb: "Spacing scale applied as padding.",
    items: [{ label: "Padding scale", code: "Paddings", node: <Paddings /> }],
  },
  {
    id: "margins",
    label: "Margins",
    icon: Maximize,
    blurb: "Spacing scale applied as margin.",
    items: [{ label: "Margin scale", code: "Margins", node: <Margins /> }],
  },
  {
    id: "spacers",
    label: "Spacers",
    icon: StretchHorizontal,
    blurb: "Fixed vertical spacing blocks.",
    items: [{ label: "Spacer scale", code: "Spacers", node: <Spacers /> }],
  },
  {
    id: "max-widths",
    label: "Max Widths",
    icon: MoveHorizontal,
    blurb: "Container max-width tokens.",
    items: [{ label: "Container widths", code: "MaxWidths", node: <MaxWidths /> }],
  },
  {
    id: "responsive",
    label: "Responsive Sizes",
    icon: MonitorSmartphone,
    blurb: "Breakpoints + fluid clamp scaling.",
    items: [{ label: "Breakpoints", code: "ResponsiveSizes", node: <ResponsiveSizes /> }],
  },
  {
    id: "structure",
    label: "Structure Classes",
    icon: LayoutDashboard,
    blurb: "Container, card and spacing utilities.",
    items: [{ label: "Structure", code: "StructureClasses", node: <StructureClasses /> }],
  },
];
