import type { MetadataRoute } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_DESCRIPTION } from "@/lib/seo";

/** Served at /manifest.webmanifest — installability + brand theming. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAF6F2",
    theme_color: "#B9485C",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
