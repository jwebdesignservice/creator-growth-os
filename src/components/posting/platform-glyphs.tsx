import { cn } from "@/lib/cn";
import type { PostingItem } from "@/lib/posting/queries";

// Official TikTok note (simple-icons geometry, viewBox 0 0 24 24). Drawn three
// times inside the tile — cyan + magenta offsets behind a white note — for the
// signature glitch look.
const TIKTOK_NOTE =
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";

const GHOST =
  "M12 5.5c2.15 0 3.35 1.55 3.45 3.5.03.5 0 1.05.02 1.45.01.32.12.46.45.55.6.16 1.18.27 1.18.73 0 .43-.6.59-1.18.77-.43.13-.49.42-.49.6 0 .14.02.27-.12.36-.16.1-.45-.02-.78.06-.42.1-.85.46-1.63.46h-.62c-.78 0-1.21-.36-1.63-.46-.33-.08-.62.04-.78-.06-.14-.09-.12-.22-.12-.36 0-.18-.06-.47-.49-.6-.58-.18-1.18-.34-1.18-.77 0-.46.58-.57 1.18-.73.33-.09.44-.23.45-.55.02-.4-.01-.95.02-1.45C8.65 7.05 9.85 5.5 12 5.5Z";

type Props = {
  platform: PostingItem["platform"];
  className?: string;
};

/**
 * Premium, brand-coloured platform marks for the content-calendar cards.
 *
 * These are intentionally separate from the monochrome icons in
 * `brand-icons.tsx` (which many other surfaces tint via `currentColor`); here we
 * want each platform rendered as its real, full-colour logo tile so the cards
 * read instantly. Sized via `className` (defaults to 18px).
 */
export function PlatformGlyph({ platform, className = "size-[18px]" }: Props) {
  const base = cn("shrink-0", className);

  switch (platform) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={base} role="img" aria-label="Instagram">
          <defs>
            <linearGradient
              id="cgos-ig"
              x1="3"
              y1="21"
              x2="21"
              y2="3"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FED576" />
              <stop offset=".26" stopColor="#F47133" />
              <stop offset=".61" stopColor="#BC3081" />
              <stop offset="1" stopColor="#4C63D2" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#cgos-ig)" />
          <rect
            x="6.6"
            y="6.6"
            width="10.8"
            height="10.8"
            rx="3.3"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" strokeWidth="1.6" />
          <circle cx="16.2" cy="7.8" r="1.05" fill="#fff" />
        </svg>
      );

    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={base} role="img" aria-label="TikTok">
          <rect x="1" y="1" width="22" height="22" rx="6" fill="#010101" />
          <g transform="translate(4.9 4.9) scale(0.585)">
            <path transform="translate(-1.1 0)" fill="#25F4EE" d={TIKTOK_NOTE} />
            <path transform="translate(1.1 0)" fill="#FE2C55" d={TIKTOK_NOTE} />
            <path fill="#fff" d={TIKTOK_NOTE} />
          </g>
        </svg>
      );

    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={base} role="img" aria-label="YouTube">
          <rect x="1" y="4.5" width="22" height="15" rx="4.6" fill="#FF0000" />
          <path d="M9.6 8.4 16 12l-6.4 3.6z" fill="#fff" />
        </svg>
      );

    case "snapchat":
      return (
        <svg viewBox="0 0 24 24" className={base} role="img" aria-label="Snapchat">
          <rect x="1" y="1" width="22" height="22" rx="6" fill="#FFFC00" />
          <path d={GHOST} fill="#fff" stroke="#fff" strokeWidth=".4" />
        </svg>
      );

    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className={base} role="img" aria-label="LinkedIn">
          <rect x="1" y="1" width="22" height="22" rx="6" fill="#0A66C2" />
          <circle cx="6.6" cy="7" r="1.5" fill="#fff" />
          <rect x="5.3" y="9.3" width="2.6" height="8.4" fill="#fff" />
          <path
            fill="#fff"
            d="M9.6 9.3h2.5v1.15h.04c.35-.64 1.2-1.32 2.48-1.32 2.65 0 3.14 1.66 3.14 3.82v4.75h-2.6v-4.21c0-1-.02-2.3-1.4-2.3-1.4 0-1.62 1.1-1.62 2.23v4.28H9.6z"
          />
        </svg>
      );

    // "multiple" / "other" / null — no single brand mark; show a neutral globe.
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className={base}
          role="img"
          aria-label={platform ?? "Post"}
        >
          <rect x="1" y="1" width="22" height="22" rx="6" fill="#64748B" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="#fff" strokeWidth="1.5" />
          <ellipse
            cx="12"
            cy="12"
            rx="2.7"
            ry="6"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}
