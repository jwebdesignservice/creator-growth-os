import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Caveat } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base for every relative OG/canonical URL below + in child pages.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — Creator Growth Platform`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: BRAND_NAME,
  category: "technology",
  // Site-wide defaults; public pages refine these, private surfaces
  // (app shell, admin, dev) override robots with noindex.
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    locale: "en_US",
    url: "/",
    title: `${BRAND_NAME} — Creator Growth Platform`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Creator Growth Platform`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
  // Google Search Console ownership — set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  // in Vercel env to the content value from the HTML-tag verification method;
  // when unset the tag is simply omitted.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorant.variable} ${caveat.variable} h-full antialiased`}
      // Browser extensions (eg. password managers, ad-blockers) inject
      // attributes like `data-arp` onto <html> before React hydrates,
      // which produces a noisy "tree hydrated but attributes didn't
      // match" warning. Suppressing on <html> only — children still get
      // full hydration checks.
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
