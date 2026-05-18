import { PageSkeleton } from "@/components/app-shell/page-skeleton";

/**
 * Default loading state for every page in the (app) group.
 *
 * Next.js renders this instantly during a route transition while the
 * server component is still streaming. Specific routes can override
 * this by dropping their own loading.tsx alongside their page.tsx.
 */
export default function AppLoading() {
  return <PageSkeleton variant="page" />;
}
