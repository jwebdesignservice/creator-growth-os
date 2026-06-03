/* Link in bio ─────────────────────────────────────────────────────────────
   A creator's public link-in-bio mini-page (avatar, bio, link buttons,
   socials) and a compact social-stats row. Creator-facing.
   ───────────────────────────────────────────────────────────────────── */

import { ExternalLink } from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";

export function LinkInBioCard() {
  const links = ["Latest YouTube video", "Free hook templates", "Book a 1:1 call", "Shop my gear"];
  return (
    <div className="w-[300px] max-w-full rounded-[20px] border border-ink-100 bg-gradient-to-b from-rose-50 to-cream-100 p-5 text-center">
      <span className="size-16 rounded-full bg-rose-600 text-white text-[22px] font-bold inline-flex items-center justify-center mx-auto">JW</span>
      <h3 className="text-[15px] font-bold text-ink-900 mt-3">Jack Wilson</h3>
      <p className="text-[12px] text-ink-500 mt-0.5">Fitness creator · 48K followers</p>
      <div className="flex items-center justify-center gap-3 mt-3">
        <InstagramIcon className="text-ink-500" size={18} />
        <TiktokIcon className="text-ink-500" size={18} />
        <YoutubeIcon className="text-ink-500" size={18} />
      </div>
      <div className="space-y-2 mt-4">
        {links.map((l) => (
          <span key={l} className="flex items-center justify-between gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-900 hover:border-rose-200 transition-colors">
            {l}
            <ExternalLink className="size-3.5 text-ink-400" strokeWidth={2} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function SocialLinksRow() {
  const socials = [
    { Icon: InstagramIcon, label: "48.2K" },
    { Icon: TiktokIcon, label: "112K" },
    { Icon: YoutubeIcon, label: "23.4K" },
  ];
  return (
    <div className="flex items-center gap-3">
      {socials.map((s, i) => {
        const Icon = s.Icon;
        return (
          <div key={i} className="flex items-center gap-2 h-10 px-3 rounded-[12px] border border-ink-100 bg-white">
            <Icon className="text-rose-600" size={18} />
            <span className="text-[13px] font-semibold text-ink-900 tabular-nums">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
