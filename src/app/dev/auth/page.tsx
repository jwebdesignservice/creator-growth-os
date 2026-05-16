import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Auth · Dev Dashboard" };

export default function DevAuthPage() {
  const route = getDevRoute("/dev/auth");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Auth"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
