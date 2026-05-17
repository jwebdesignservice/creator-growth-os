import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Database · Dev Dashboard" };

export default function DevDatabasePage() {
  const route = getDevRoute("/dev/database");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Database"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
