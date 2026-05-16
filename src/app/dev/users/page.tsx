import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Users · Dev Dashboard" };

export default function DevUsersPage() {
  const route = getDevRoute("/dev/users");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Users"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
