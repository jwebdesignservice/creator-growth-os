import { ReportsView } from "./reports-view";

export const metadata = { title: "Reports · Admin" };

type Params = Promise<{ id: string }>;

/**
 * /admin/programs/[id]/reports — program analytics dashboard.
 *
 * The admin auth gate + program lookup live in the parent layout
 * (`../layout.tsx`), so the page itself just hands the program id down to
 * the client view. Metrics are a seeded snapshot for now; a backend
 * aggregation pass can replace the constants in `reports-view.tsx`
 * without touching this wrapper.
 */
export default async function ReportsPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ReportsView programId={id} />;
}
