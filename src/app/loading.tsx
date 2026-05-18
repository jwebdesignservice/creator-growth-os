import { BrandLoader } from "@/components/app-shell/brand-loader";

/**
 * Root-level loading state. Fires on cold loads and any route
 * transition that doesn't have a more specific loading.tsx —
 * /, /terms, /privacy, /media-kit/[slug], or before the (app)
 * group resolves on first visit.
 */
export default function RootLoading() {
  return <BrandLoader />;
}
