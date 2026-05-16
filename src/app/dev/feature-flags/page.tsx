import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Feature Flags · Dev Dashboard" };

export default function DevFeatureFlagsPage() {
  const route = getDevRoute("/dev/feature-flags");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Feature Flags"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
