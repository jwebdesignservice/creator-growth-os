import { getDevNotificationsForBell } from "@/lib/dev-dashboard/dev-notifications-queries";
import { DevNotificationsDropdown } from "./dev-notifications-dropdown";

/**
 * Server-side fetch + client-dropdown trigger. Sits inside the dev topbar.
 *
 * The fetch happens on every request because the topbar is rendered by
 * /dev/layout.tsx which is `force-dynamic` by virtue of using
 * getDevContext() — so the bell badge is always fresh on initial paint
 * without needing a client-side loading flash.
 */
export async function DevNotificationsTrigger() {
  const bundle = await getDevNotificationsForBell();
  return (
    <DevNotificationsDropdown
      initialItems={bundle.items}
      initialUnreadCount={bundle.unreadCount}
    />
  );
}
