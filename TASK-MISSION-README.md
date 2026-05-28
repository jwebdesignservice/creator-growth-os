# Task / Mission System — Start Here

These two documents define the **official** task/mission architecture for Creator OS.

- **[MASTER-Creator-OS-Task-Mission-Logic.md](./MASTER-Creator-OS-Task-Mission-Logic.md)** — the full product logic, data model, assignment rules, statuses, edge cases, MVP scope, and QA requirements.
- **[TASK-MISSION-DIFF-CHECKLIST.md](./TASK-MISSION-DIFF-CHECKLIST.md)** — the one-page checklist to verify any implementation.

## Rules

1. Any implementation of **program video tasks, tutorial tasks, admin missions, or `/missions`** must follow the architecture in the MASTER document.
2. The **diff checklist must be run before approving or merging** any task/mission work.

## The 5 non-negotiables

1. **One unified task system** — program, tutorial, and admin missions share one template + one user-task model (split by `source_type`), not separate systems.
2. **One central assignment function** — all assignments go through it (e.g. `assignTasksFromSource`); no ad-hoc inserts.
3. **DB-level duplicate protection** — `UNIQUE (user_id, task_template_id)`, not just app logic.
4. **`/missions` shows UserTasks only** — never raw templates.
5. **UserTasks store snapshots + source tracking** — `title_snapshot`, `description_snapshot`, `source_type`, `source_id`.
