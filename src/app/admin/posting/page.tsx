import { getAdminPostingOverview } from "@/lib/admin/posting-queries";
import { PostingOverview } from "@/components/admin/posting-overview";

export const metadata = {
  title: "Content Planning Overview · Admin · Creator Growth OS",
};

export default async function AdminPostingPage() {
  const { plans, kpis, ok } = await getAdminPostingOverview();

  return <PostingOverview plans={plans} kpis={kpis} ok={ok} />;
}
