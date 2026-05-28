# DIFF CHECKLIST — Creator OS Task/Mission System

**Run line-by-line against the implementation.**
`[x]` = pass criteria · `(!)` = red flag · No code changes.
**Companion:** `MASTER-Creator-OS-Task-Mission-Logic.md`

---

### 1. Unified task model
- [ ] One template table + one user-task table back **all three** sources. PASS: `program_video`, `tutorial`, `admin_mission` are rows in the same tables, separated by `source_type`. (!) Still two separate systems (`mission_templates`/`missions` *and* `lesson_task_templates`) with no shared contract.

### 2. Central assignment function
- [ ] Exactly one function creates user tasks (e.g. `assignTasksFromSource(userId, sourceType, sourceId, trigger)`). PASS: video start, tutorial start, drill start, and admin confirm all call it. (!) Any direct `insert into user_tasks` / `insert into missions` outside that function.

### 3. Duplicate protection (DB-level)
- [ ] `UNIQUE (user_id, task_template_id)` exists **in the migration/schema**, not just app code. PASS: insert uses `ON CONFLICT DO NOTHING` or equivalent. (!) Dedup only via a JS `if exists` check, or no unique constraint.

### 4. TaskTemplate vs UserTask separation
- [ ] `/missions` reads **user_tasks only**, `WHERE user_id = current_user`. PASS: no code path renders a template to a user. (!) `/missions` reads `*_templates` directly.

### 5. Snapshots
- [ ] `user_tasks` has `title_snapshot` + `description_snapshot`, written at assignment. PASS: the card reads the snapshot, not a live template join. (!) Card joins the template for title/desc.

### 6. Source tracking
- [ ] `user_tasks` stores **denormalized** `source_type` + `source_id`. PASS: survives template deletion; CTA/link built from these. (!) Source only derivable via template FK.

### 7. Program video assignment trigger
- [ ] Tasks assign on **video start / "Start lesson"** (first `lesson_progress` started). PASS: a start hook calls the central function. (!) Assigned on render/visibility/unlock, or never wired.

### 8. Tutorial assignment
- [ ] Tutorial tasks are `source_type='tutorial'` in the **same** tables/editor as video tasks. PASS: assigned on tutorial/drill start via the same function. (!) A separate tutorial-only assignment path.

### 9. Admin mission assignment
- [ ] **Preview before write** — UI shows "N users", no insert yet. PASS: confirm performs the assign; already-assigned users **skipped**; returns `{assigned, skipped}`; each confirm writes an audit row. (!) Today's `assignTemplateToCategory` (no preview, no dedupe, double-click duplicates) still in use.

### 10. Status logic
- [ ] `draft` templates **never** assign.
- [ ] `archived` templates create **no new** user tasks but leave existing ones intact.
- [ ] Editing/archiving/deleting a template does **not** alter or reset existing `completed` user tasks.

### 11. /missions page
- [ ] Shows only user tasks, with: source badge, status, correct CTA per source ("Go to lesson" / "Open tutorial" / "Start mission" / "View result"), due date (if any), and filters (All/Active/Program/Tutorials/Admin Missions/Completed[/Overdue]). (!) CTA links to wrong place; raw templates leak in.

### 12. Event logs
- [ ] A `task_assignments` / `task_event_logs` table records **trigger, source, counts, by-whom, when** — one row per assignment event (incl. auto-assigns). (!) No audit trail — can't answer "why does this user have this task?"

---

### 13. QA scenarios (run these clicks)
- [ ] **Video task:** admin adds task -> user starts video -> appears on `/missions` with "Go to lesson".
- [ ] **Tutorial task:** admin adds drill task -> user starts tutorial/drill -> appears with "Open tutorial".
- [ ] **Admin mission:** create -> preview shows correct count -> confirm -> appears on targeted users' `/missions`.
- [ ] **Duplicate (auto):** start the same video twice -> still **one** task.
- [ ] **Duplicate (admin):** assign same mission twice -> second run reports all skipped, no dupes.
- [ ] **Refresh:** reload `/missions` mid-assign -> no duplicate, no error.
- [ ] **Completed:** complete a task -> status sticks, CTA -> "View result", completing again is a no-op (no double points).
- [ ] **Archived template:** archive after assignment -> existing task still completable; no new task on next start.
- [ ] **Deleted source:** delete the template/lesson -> existing user task still renders (snapshot) with a graceful/disabled CTA, not a 404.

---

### Fast-fail signals (if any are true, the model needs rework)
1. No `UNIQUE(user_id, task_template_id)` in a migration.
2. More than one place inserts user tasks.
3. `/missions` reads templates directly.
4. No `title_snapshot` on user tasks.
5. Admin assign has no preview/skip and can double-assign.
