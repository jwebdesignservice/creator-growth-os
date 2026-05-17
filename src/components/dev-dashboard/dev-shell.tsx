import { DevSidebar } from "./dev-sidebar";
import { DevTopbar } from "./dev-topbar";
import { DevNotificationsTrigger } from "./dev-notifications-trigger";

/**
 * Wraps the entire /dev route group. The `dev-theme` class activates the
 * dark navy / blue token palette defined in `styles/tokens/dev-dashboard.css`.
 *
 * The bell trigger is composed in here (server-side async fetch) and
 * passed as a slot into the otherwise-client topbar.
 */
export function DevShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dev-theme min-h-screen flex">
      <DevSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DevTopbar notifications={<DevNotificationsTrigger />} />
        <main className="flex-1 px-[var(--mobile-content-x)] py-[var(--mobile-content-y)] lg:px-[var(--space-page-x)] lg:py-[var(--space-page-y)]">
          <div className="max-w-[1480px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
