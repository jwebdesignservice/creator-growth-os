"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { assignForCurrentUser } from "@/lib/tasks/actions";
import type { AssignTrigger, TaskSourceType } from "@/lib/tasks/types";

/* ─────────────────────────────────────────────────────────────────────────
   Fires the central assignment engine for the signed-in learner exactly once
   when a source surface (a program lesson, a tutorial) actually opens in the
   browser — i.e. the "on_start" trigger. Renders nothing.

   Why a client effect (not a server-render call): assignment is a write, and
   running it during server render would also fire on prefetch/hover. A mount
   effect runs only on a real open. It's idempotent regardless, and refreshes
   the route when something new was assigned so the task UI updates in place.
   ───────────────────────────────────────────────────────────────────────── */

export function AssignOnMount({
  sourceType,
  sourceId,
  trigger = "on_start",
}: {
  sourceType: TaskSourceType;
  sourceId: string | null;
  trigger?: AssignTrigger;
}) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !sourceId) return;
    ran.current = true;
    let active = true;
    void (async () => {
      const res = await assignForCurrentUser(sourceType, sourceId, trigger);
      if (active && res.ok && res.assigned.length > 0) router.refresh();
    })();
    return () => {
      active = false;
    };
  }, [sourceType, sourceId, trigger, router]);

  return null;
}
