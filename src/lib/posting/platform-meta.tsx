import type { ReactNode } from "react";
import { Ghost, Briefcase, Layers, Globe } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import type { PlatformKey } from "@/lib/posting/queries";

/* Single source of truth for platform branding (label + colored tile + icon),
   shared by the Planned Posts table and the Active Plan card so the two
   surfaces never drift. No "use client" — safe in server components too. */

export type PlatformMeta = {
  label: string;
  /** Icon-tile background + text, e.g. "bg-red-600 text-white". */
  tile: string;
  icon: ReactNode;
};

export function platformMeta(p: PlatformKey): PlatformMeta {
  switch (p) {
    case "youtube":
      return { label: "YouTube", tile: "bg-red-600 text-white", icon: <YoutubeIcon size={16} /> };
    case "tiktok":
      return { label: "TikTok", tile: "bg-ink-900 text-white", icon: <TiktokIcon size={15} /> };
    case "instagram":
      return {
        label: "Instagram",
        tile: "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-white",
        icon: <InstagramIcon size={15} />,
      };
    case "snapchat":
      return { label: "Snapchat", tile: "bg-yellow-300 text-ink-900", icon: <Ghost className="size-4" strokeWidth={2} /> };
    case "linkedin":
      return { label: "LinkedIn", tile: "bg-sky-600 text-white", icon: <Briefcase className="size-4" strokeWidth={2} /> };
    case "multiple":
      return { label: "Multiple", tile: "bg-cream-200 text-ink-600", icon: <Layers className="size-4" strokeWidth={2} /> };
    default:
      return { label: "Other", tile: "bg-cream-200 text-ink-600", icon: <Globe className="size-4" strokeWidth={2} /> };
  }
}
