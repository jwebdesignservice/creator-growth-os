import {
  getAdminMissionTemplates,
  getMissionSchedulingStats,
} from "@/lib/tasks/queries";
import { MissionsView } from "./missions-view";

export const metadata = { title: "Mission Templates · Admin · Creator Growth OS" };

export default async function AdminMissionsPage() {
  const [rows, stats] = await Promise.all([
    getAdminMissionTemplates(),
    getMissionSchedulingStats(),
  ]);

  return <MissionsView rows={rows} stats={stats} />;
}
