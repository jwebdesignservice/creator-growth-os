import { MessageSquare } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Comments · Admin" };

export default function CommentsPage() {
  return <ProgramPlaceholder title="Comments" icon={MessageSquare} />;
}
