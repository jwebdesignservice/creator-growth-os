import { ClipboardList, CalendarDays } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

type TabKey = "my_plans" | "calendar";

/**
 * Posting view switcher — uses the global {@link SegmentedTabs} element.
 * Navigation stays URL-driven via the items' `href`.
 */
export function PostingTabs({ active }: { active: TabKey }) {
  return (
    <SegmentedTabs
      ariaLabel="Posting views"
      items={[
        { key: "my_plans", label: "My Plans", icon: ClipboardList, href: "/posting", active: active === "my_plans" },
        { key: "calendar", label: "Content Calendar", icon: CalendarDays, href: "/posting?view=calendar", active: active === "calendar" },
      ]}
    />
  );
}
