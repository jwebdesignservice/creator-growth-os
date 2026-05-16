import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Billing · Dev Dashboard" };

export default function DevBillingPage() {
  const route = getDevRoute("/dev/billing");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Billing"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
