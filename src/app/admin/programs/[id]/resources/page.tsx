import { FolderOpen } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Resources · Admin" };

export default function ResourcesPage() {
  return (
    <ProgramPlaceholder
      title="Resources"
      icon={FolderOpen}
      body="Upload and organize worksheets, templates, links, and files for this program. Detailed editor coming next."
    />
  );
}
