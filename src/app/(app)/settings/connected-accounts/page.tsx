import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getSocialConnections } from "@/lib/social/queries";
import { PageShell } from "@/components/app-shell/page-shell";
import { ConnectSocialCard } from "@/components/performance/connect-social-card";
import { AutoSyncOnMount } from "@/components/performance/auto-sync-on-mount";

export const metadata = {
  title: "Connected accounts · Settings",
};

/**
 * Connected accounts — surfaces the same `ConnectSocialCard` that powers
 * `/performance`, wired to the existing `getSocialConnections` query and
 * OAuth flow. Reuses the component verbatim (no fork) so any backend or
 * connector work stays in one place.
 *
 * `AutoSyncOnMount` is included so visiting this page also nudges any
 * connected platform whose `last_synced_at` is stale (>6h), keeping the
 * connection list current without an explicit refresh.
 */
export default async function ConnectedAccountsSettingsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const socialConnections = await getSocialConnections();

  return (
    <PageShell>
      <div className="container-app">
        <ConnectSocialCard connections={socialConnections} />

        {/* Silently re-syncs any connected platform whose last_synced_at
            is older than 6h, so the connection list stays fresh. */}
        <AutoSyncOnMount connections={socialConnections} />
      </div>
    </PageShell>
  );
}
