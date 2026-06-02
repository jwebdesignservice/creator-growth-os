/* Media kit & Profile ────────────────────────────────────────────────────
   The creator one-pager and profile header — built from the same fields as
   src/components/monetization/media-kit-builder.tsx and the profile pages.
   Presentational only.
   ───────────────────────────────────────────────────────────────────── */

import { Share2, CircleCheck, Users, Eye, Heart, PenLine } from "lucide-react";

export function MediaKitCard() {
  const stats = [
    { icon: Users, label: "Followers", value: "48.2K" },
    { icon: Eye, label: "Avg views", value: "112K" },
    { icon: Heart, label: "Eng. rate", value: "6.4%" },
  ];
  const rates = [
    { label: "Reel / Short-form video", price: "$850" },
    { label: "Carousel post", price: "$500" },
    { label: "Story set (3)", price: "$300" },
  ];
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <header className="flex items-start gap-3.5">
        <span className="size-14 rounded-full bg-rose-600 text-white text-[20px] font-semibold inline-flex items-center justify-center shrink-0">
          JW
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-ink-900 leading-tight">Jack Wilson</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
              <CircleCheck className="size-3.5" strokeWidth={2.2} />
              Published
            </span>
          </div>
          <span className="chip chip-rose mt-1">Fitness &amp; wellness</span>
          <p className="text-[12.5px] text-ink-500 leading-snug mt-2">
            Helping busy people train smarter — short, science-backed workouts.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[12px] bg-cream-100 p-3 text-center">
              <Icon className="size-4 text-rose-600 mx-auto mb-1" strokeWidth={1.9} />
              <div className="text-[15px] font-bold text-ink-900 tabular-nums leading-none">{s.value}</div>
              <div className="text-[10.5px] text-ink-500 mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-2">Rate card</div>
        <ul className="divide-y divide-ink-100">
          {rates.map((r) => (
            <li key={r.label} className="flex items-center justify-between py-2 text-[13px]">
              <span className="text-ink-700">{r.label}</span>
              <span className="font-semibold text-ink-900 tabular-nums">{r.price}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 h-10 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
      >
        <Share2 className="size-4" strokeWidth={2} />
        Share media kit
      </button>
    </div>
  );
}

export function ProfileHeader() {
  const stats = [
    { label: "Followers", value: "48.2K" },
    { label: "Following", value: "312" },
    { label: "Posts", value: "1,204" },
  ];
  return (
    <div className="card overflow-hidden w-[460px] max-w-full">
      <div className="h-24 bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200" />
      <div className="px-5 pb-5">
        <div className="flex items-end justify-between -mt-9">
          <span className="size-[72px] rounded-full bg-rose-600 text-white text-[24px] font-semibold inline-flex items-center justify-center ring-4 ring-white shrink-0">
            JW
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <PenLine className="size-3.5" strokeWidth={2} />
            Edit profile
          </button>
        </div>
        <div className="mt-3">
          <h3 className="text-h5 text-ink-900 leading-tight">Jack Wilson</h3>
          <p className="text-[12.5px] text-ink-500">@jackwilson · Fitness creator</p>
          <p className="text-[13px] text-ink-700 leading-snug mt-2">
            Short, science-backed workouts for busy people. New videos every week.
          </p>
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-ink-100">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[15px] font-bold text-ink-900 tabular-nums leading-none">{s.value}</div>
              <div className="text-[11.5px] text-ink-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
