import { CheckSquare } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Tasks · Admin" };

export default function TasksPage() {
  return (
    <ProgramPlaceholder
      title="Tasks"
      icon={CheckSquare}
      body="Manage program-related tasks and mission templates. Detailed editor coming next — for now you can build core content from the Curriculum tab."
    />
  );
}
