import { DevSidebar } from "./dev-sidebar";
import { DevTopbar } from "./dev-topbar";

/**
 * Wraps the entire /dev route group. The `dev-theme` class activates the
 * dark navy / blue token palette defined in `styles/tokens/dev-dashboard.css`.
 */
export function DevShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dev-theme min-h-screen flex">
      <DevSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DevTopbar />
        <main className="flex-1 px-4 lg:px-6 py-5 lg:py-6">
          <div className="max-w-[1480px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
