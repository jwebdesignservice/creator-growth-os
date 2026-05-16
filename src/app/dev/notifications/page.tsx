import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Notifications · Dev Dashboard" };

export default function DevNotificationsPage() {
  const route = getDevRoute("/dev/notifications");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Notifications"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
