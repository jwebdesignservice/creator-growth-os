/* ─────────────────────────────────────────────────────────────────────
   /design — client-side lazy boundary for the gallery.

   design-gallery.tsx statically imports the entire src/design-templates/
   library (~800 KB of source) into a single client chunk. `ssr: false`
   next/dynamic only works inside Client Components, so this thin wrapper
   exists purely to split that chunk out of the route's initial bundle
   and load it lazily in the browser.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import dynamic from "next/dynamic";

export const DesignGalleryLazy = dynamic(
  () => import("./design-gallery").then((m) => m.DesignGallery),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <span className="text-[13px] font-medium text-ink-500">
          Loading design gallery…
        </span>
      </div>
    ),
  },
);
