import type { ReactNode } from "react";
import { SettingsNav } from "@/components/app-shell/settings-nav";

/**
 * Settings surface layout — drops the inner SettingsNav between the
 * (app) sidebar and the page content. Every page under `/settings/*`
 * shares this chrome.
 *
 * Mirrors the admin program layout's "compact rail + inner panel"
 * idiom. The (app) `<main>` is unpadded (PageShell handles padding
 * per-page), so no negative-margin escape is needed here — the inner
 * nav sits flush against the sidebar naturally.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 min-w-0 min-h-[calc(100vh-68px)]">
      <SettingsNav />
      <div className="flex-1 min-w-0 bg-cream-50/50">{children}</div>
    </div>
  );
}
