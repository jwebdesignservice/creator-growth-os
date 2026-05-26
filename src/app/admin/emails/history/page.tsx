import { HistoryView } from "./history-view";

export const metadata = {
  title: "History · Email · Admin · Creator Growth OS",
};

/**
 * /admin/emails/history — review of sent / scheduled / draft email activity
 * plus delivery insights. Real data goes here once the email backend is
 * wired; today the table is driven by representative mock rows so the
 * surface is fully designed and interactive.
 */
export default function EmailHistoryPage() {
  return <HistoryView />;
}
