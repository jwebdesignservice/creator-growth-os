# MASTER — Creator OS Task/Mission Logic

**Product logic · Requirements · Decision map · QA requirements**
**Status:** Specification (target state). Use to verify implementation.
**Last updated:** 2026-05-28
**Companion file:** `TASK-MISSION-DIFF-CHECKLIST.md` (one-page run-sheet)

> This document is a **specification**, not a description of current code. Where useful, **"Current reality"** callouts note what exists today (from an admin audit) so the spec can be diffed against the build. Those notes reflect a moving target — the implementation is under active development.

---

## 0. Guiding principles (read first)

1. **Two layers, never confused:** a **TaskTemplate** (admin's definition) is never shown to users. A **UserTask** (assigned instance) is the only thing a user ever sees on `/missions`.
2. **One assignment path:** every task a user receives — from a video, a tutorial, or an admin mission — is created by **one central function** with **one duplicate rule**. No feature invents its own assignment logic.
3. **Snapshots make tasks stable:** once assigned, a UserTask carries its own copy of title/description so editing or deleting the template never corrupts a user's task.
4. **Idempotent by default:** running assignment twice, refreshing, or re-starting a video must never create a second copy.
5. **Source-aware UX:** a task always knows where it came from and links back there.

> **Current reality:** Today there are **two parallel systems** — admin missions (`mission_templates` → `missions`) and per-lesson tasks (`lesson_task_templates`) — with **no shared assignment function** and **no duplicate guard** on admin bulk-assign. The target below **unifies them**. The single biggest verification question: *did the implementation unify the model, or extend the split?*

---

## STEP 1 — Core concepts

### 1.1 TaskTemplate
The **original, reusable definition** authored by an admin. It is *content*, not an assignment. It has a lifecycle (`draft → active → archived`). It is **never rendered on `/missions`**.

A template belongs to exactly one **source type**:

| Source type | Created where | Attached to | Nature |
|---|---|---|---|
| `program_video` | `/admin/programs/{programId}/curriculum/{videoId}` | a specific lesson (video) | content-based |
| `tutorial` | `/tutorials/{tutorialId}?tab=creator-drill` (admin editor) | a tutorial or its drill | content-based |
| `admin_mission` | `/admin/missions` | nothing (standalone) | strategy/audience-based |

### 1.2 UserTask (a.k.a. Mission, on the user side)
The **actual assigned instance** for **one user**. Created only by the central assignment function. This is the *only* object the `/missions` page reads.

A UserTask carries:
- a link to its template (`task_template_id`)
- **`title_snapshot` / `description_snapshot`** (frozen at assignment time)
- denormalized **`source_type` + `source_id`** (so it still works if the template is later archived/deleted)
- a **status** (`not_started / in_progress / completed / skipped`)
- timestamps (`assigned_at`, `started_at`, `completed_at`), optional `due_date`
- a link to the assignment event that created it (`assignment_id`)

### 1.3 The hard rule
- Users **never** see `task_templates`.
- Users **only** see `user_tasks` assigned to them.
- The `/missions` query is always `WHERE user_id = current_user`. There is no path where a template renders directly.

---

## Recommended data model (the contract to verify against)

> Presented as field shapes, not implementation. This is what makes every later rule concrete.

**`task_templates`**

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source_type | enum | `program_video` \| `tutorial` \| `admin_mission` |
| source_id | uuid null | lesson id for video/tutorial; **null** for admin_mission |
| title | text | required (a template with no title cannot be `active`) |
| description | text | |
| difficulty | enum | `easy` \| `medium` \| `hard` |
| estimated_minutes | int | |
| points | int | |
| due_after_days | int null | drives `due_date` at assignment |
| sort_order | int | ordering within a source |
| status | enum | `draft` \| `active` \| `archived` |
| created_by / created_at / updated_at | | |

**`user_tasks`**

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| task_template_id | uuid | |
| source_type / source_id | enum / uuid | denormalized; survives template deletion |
| title_snapshot / description_snapshot | text | frozen at assignment |
| status | enum | `not_started` \| `in_progress` \| `completed` \| `skipped` |
| assigned_at / started_at / completed_at | timestamptz | |
| due_date | timestamptz null | |
| assignment_id | uuid null | -> `task_assignments` |
| **UNIQUE (user_id, task_template_id)** | | **the duplicate guard** |

**`task_assignments`** (audit log / batch record)

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source_type / source_id | | what triggered it |
| trigger | enum | `video_started` \| `tutorial_started` \| `drill_started` \| `unlock` \| `admin_manual` |
| audience_label | text | e.g. "Plan: pro · Category: growth" (admin missions) |
| assigned_count / skipped_count | int | |
| created_by | uuid/text | admin id or `system` |
| created_at | timestamptz | |

---

## STEP 2 — Program video task logic

**Where created:** `/admin/programs/{programId}/curriculum/{videoId}` (the "Manage tasks" surface on a lesson).

**Rules:**
- **When created:** admin authors them while building the lesson. Creation != assignment.
- **How many per video:** unlimited (0..N). A video with 0 tasks simply assigns nothing.
- **Reorderable:** yes — by `sort_order`; order is preserved when shown on `/missions` (grouped by source).
- **Editable:** yes — edits affect **future** assignments only. Existing UserTasks keep their snapshots (see Step 6).
- **Archivable/deletable:** **Archive** = template stops producing new UserTasks; existing UserTasks remain. **Delete** = template removed; existing UserTasks **survive** via snapshots + denormalized source (their "Go to lesson" link still works as long as the lesson exists).
- **Metadata each task needs:** title, description, difficulty, estimated_minutes, points, optional `due_after_days`, sort_order, status.

**Assignment trigger (DECISION):**
- **Assign when the user STARTS the video / clicks "Start lesson"** (the first time `lesson_progress` transitions to started for that user+lesson).
- Do **not** assign just because the video exists or is visible/unlocked.

**Future-trigger options (documented, not MVP):**

| Trigger | When | Verdict |
|---|---|---|
| On unlock | video becomes available to the user | Later (opt-in per template) |
| **On start** | user begins the video | **MVP default** |
| On complete | user finishes the video | Later (good for "reflection/apply" tasks) |

> **Current reality:** `lesson_task_templates` exists with CRUD in the curriculum editor, but no wiring was found from "video started" -> assignment. Verify a start hook calls the central function.

---

## STEP 3 — Tutorial task logic

**Where created:** the tutorial/drill admin editor — `/tutorials/{tutorialId}?tab=creator-drill` (admin side).

**Rules:**
- **Same system as program video tasks** (DECISION): tutorial tasks are `task_templates` with `source_type = 'tutorial'`. **Same editor, same fields, same assignment function.** No separate code path.
- **Belongs to:** the **tutorial (lesson) as a whole** for MVP. (Tutorials are single lessons today; per-drill/per-step granularity is a **Later** refinement using `source_id` = drill/step id.)
- **Assignment trigger (DECISION):** assign when the user **starts the tutorial / starts the drill / clicks "Start tutorial"** — symmetric with video tasks.
- **On `/missions`:** appear as normal task cards with `source_type = tutorial`, CTA "Open tutorial", linking back to the tutorial/drill.

> **Current reality:** tutorials are stored in the `lessons` table; drills live in `lesson_drills` (one drill per lesson, not a task list). Decide whether tutorial *tasks* reuse `lesson_task_templates` with a source discriminator, or the unified `task_templates`. The spec's answer: **unified `task_templates`**.

---

## STEP 4 — Admin mission logic

**Where:** `/admin/missions`. Admin missions are **audience/strategy-based**, not content-based (`source_type = 'admin_mission'`, `source_id = null`).

**Creation + assignment flow (DECISION — 4 steps):**
1. **Create mission template** (title, description, difficulty, time, points, optional due_after_days).
2. **Select target audience** via filters (any combination):
   - specific users (multi-select)
   - member groups / cohorts / batches
   - signup-quiz answers (category, niche, goal, etc.)
   - user level / platform progress / program progress / tutorial access
   - tags
   - custom filters
3. **Preview** (mandatory): *"This mission will be assigned to **42 users**."* Show the count and a sample of who. **No write happens at this step.**
4. **Confirm** -> central assignment runs -> returns `{ assigned, skipped }` -> records a `task_assignments` row.

**Required behaviors:**
- **0 users match:** block confirm; show *"No users match these filters."* Create nothing.
- **1 user / many users:** same flow; count reflects reality.
- **Some already have it:** **skip** those (duplicate rule), assign the rest; report *"Assigned 30, skipped 12 (already had it)."*
- **Assignment history:** every confirm writes a `task_assignments` audit row (who, filter label, counts, when). Visible as a history list per mission.
- **Mission stats:** per template show assigned / in-progress / completed / skipped counts and completion rate, computed from `user_tasks`.

> **Current reality:** `assignTemplateToCategory` assigns by plan(+category) with a **hardcoded 7-day due**, **no preview**, and **no de-dupe** — clicking twice duplicates. The spec **requires** the preview step and the duplicate skip. High-value verification point.

---

## STEP 5 — `/missions` user experience

`/missions` shows **all** UserTasks for the current user, regardless of source, in one unified list.

**Tabs / filters (DECISION):**
`All` · `Today` · `Active` · `Program` · `Tutorials` · `Admin Missions` · `Completed` · `Overdue` *(only if due dates exist)*

- `Today` = active tasks due today (or assigned today if no due dates yet).
- `Active` = `not_started` + `in_progress`.
- `Program` / `Tutorials` / `Admin Missions` = filter by `source_type`.
- `Overdue` = `due_date < now` AND status not completed/skipped.

**Each task card shows:** Title · Description (snapshot) · **Source type badge** · Related-content link · Due date (if any) · Estimated time · Difficulty · Status · **CTA**.

**CTA logic (DECISION):**

| Source / state | CTA label | Action |
|---|---|---|
| `program_video` | **Go to lesson** | link to `/programs/{slug}/{lessonSlug}` (or player route) |
| `tutorial` | **Open tutorial** | link to `/tutorials/{id}` (drill tab if drill-scoped) |
| `admin_mission` | **Start mission** | open the mission/task flow |
| any, `completed` | **View result** / **View completed task** | read-only completed view |

**Interaction rule:** opening/starting a task transitions `not_started -> in_progress` (and stamps `started_at`). Completing transitions to `completed`.

---

## STEP 6 — Statuses

**TaskTemplate statuses:** `draft` · `active` · `archived`
- `draft` -> **never** assigns.
- `active` -> eligible for assignment.
- `archived` -> **no new** UserTasks; existing ones untouched.

**UserTask statuses:** `not_started` · `in_progress` · `completed` · `skipped`

**Allowed transitions:**
- `not_started -> in_progress` (user opens/starts)
- `in_progress -> completed` (user marks done) — `completed_at` stamped
- `not_started / in_progress -> skipped` (user dismisses, if skipping is enabled)
- `completed` is **terminal** for users (admin-only re-open later)
- `skipped` is terminal for MVP (un-skip = Later)

**Template-vs-instance stability rules:**
- Editing a template **does not** mutate existing UserTasks (they keep snapshots).
- Completing a UserTask must not break if the template is later edited/archived/deleted.
- New assignments always use the **latest active** template.
- A future **"sync to latest"** action (Later) may intentionally refresh snapshots; default is stability.

---

## STEP 7 — Duplicate protection

**The rule:** a user gets a given template **at most once**, unless a template is explicitly flagged `repeatable` (Later).

**Enforcement (two layers):**
1. **DB:** `UNIQUE (user_id, task_template_id)`.
2. **App:** assignment does a pre-check and uses **insert-or-skip** (`ON CONFLICT DO NOTHING`), never blind insert.

**Scenarios -> expected behavior:**

| Scenario | Behavior |
|---|---|
| User starts the same video multiple times | First start assigns; subsequent starts **skip** |
| User refreshes the page mid-assign | No duplicate; the unique constraint absorbs the race |
| Assignment function runs twice (double-fire) | Idempotent — second run reports all `skipped` |
| Admin assigns the same mission twice | Already-assigned users skipped; only new users get it |
| User already has the task | Skip; keep the existing UserTask (and its status) |
| Task already completed | Skip; **do not** reset to `not_started` |
| Template archived after assignment | Existing UserTask remains and stays usable |

---

## STEP 8 — Assignment rules (the one function)

**Everything** flows through one idempotent function:

`assignTasksFromSource(userId, sourceType, sourceId, trigger)` -> `{ assigned: n, skipped: m }`

It must:
1. Find **active** templates for `(sourceType, sourceId)` — for admin missions, the single template id.
2. **Ignore** `draft` and `archived` templates.
3. For each template, **check if the user already has it**.
4. **Create only the missing** UserTasks (insert-or-skip).
5. Copy `title_snapshot` / `description_snapshot` from the template.
6. Set `due_date = now + due_after_days` when `due_after_days` is set.
7. Set denormalized `source_type` / `source_id`.
8. Write a `task_assignments` audit row (with `trigger` and counts).
9. Return `{ assigned, skipped }`.

**Callers (all of them):** video started · tutorial started · drill started · video/module unlocked (Later trigger) · admin mission confirm (wraps a per-user loop over the resolved audience).

**Non-negotiable:** no feature writes to `user_tasks` directly. If a new surface needs to assign, it calls this function.

---

## STEP 9 — MVP scope

**MVP (must ship):**
- `task_templates` + `user_tasks` (unified model)
- Program video task creation
- Tutorial task creation (same editor)
- Admin mission creation **with preview + confirm**
- Auto-assign on video start
- Auto-assign on tutorial/drill start
- Manual admin assignment (audience filter -> preview -> confirm)
- Duplicate protection (DB unique + insert-or-skip)
- `/missions` page (unified list + core tabs + correct CTAs)
- Status updates (start -> complete)
- Complete task
- Basic assignment logs (`task_assignments`)

**Later (explicitly out of MVP):**
Recurring/repeatable missions · AI recommendations · comments/discussion · file submissions · grading/scoring review · advanced notifications · detailed analytics dashboards · complex automations/triggers (on-unlock, on-complete chains) · multi-step mission workflows · "sync existing tasks to latest template."

---

## STEP 10 — Edge cases (with expected behavior)

| # | Edge case | Expected behavior |
|---|---|---|
| 1 | User starts same video multiple times | Assign once; later starts skip |
| 2 | User refreshes during assignment | No duplicate (unique constraint) |
| 3 | Assignment runs twice | Idempotent; second run all-skipped |
| 4 | Admin edits template after users received it | Existing UserTasks unchanged (snapshots); new assignments use new version |
| 5 | Admin archives template after assignment | No new assignments; existing UserTasks remain & completable |
| 6 | User loses access to program | Existing UserTasks remain visible (history); CTA may be disabled if content gated. Do **not** auto-delete |
| 7 | User loses access to tutorial | Same as #6 |
| 8 | Tutorial unpublished | No **new** assignments; existing UserTasks remain; CTA degrades gracefully |
| 9 | Program video deleted | UserTasks survive via snapshots; CTA shows "content no longer available" instead of 404 |
| 10 | Template has no title | Cannot be set `active`; cannot assign. Block at template level |
| 11 | Admin mission matches 0 users | Block confirm; "No users match"; create nothing |
| 12 | Admin mission matches 1 user | Normal flow; count = 1 |
| 13 | Admin mission matches many | Normal flow; batch loop; report assigned/skipped |
| 14 | Some users already have the mission | Skip them; assign the rest; report both counts |
| 15 | User completes task | `completed` + `completed_at`; CTA -> "View result" |
| 16 | User tries to complete twice | No-op; stays completed; no double points |
| 17 | User has overdue task | Shows in `Overdue` (if due dates); still completable |
| 18 | Source content no longer exists | UserTask renders from snapshot; CTA disabled with explanation |

---

## STEP 11 — QA checklist

### Program video tasks
- [ ] Admin creates a task on a video
- [ ] Admin edits the task (existing user copies unchanged; new copies updated)
- [ ] Admin reorders tasks (order persists; reflected on `/missions`)
- [ ] Admin archives a task (no new assignments; existing remain)
- [ ] User starts the video -> task appears on `/missions`
- [ ] User refreshes -> **not** duplicated
- [ ] User starts the same video again -> **not** duplicated
- [ ] User completes the task -> status updates
- [ ] Draft template never assigns

### Tutorial tasks
- [ ] Admin creates a tutorial task (same editor as video tasks)
- [ ] Admin edits the tutorial task
- [ ] User starts tutorial/drill -> task appears on `/missions`
- [ ] User refreshes -> not duplicated
- [ ] User completes -> status updates
- [ ] CTA opens the correct tutorial/drill

### Admin missions
- [ ] Admin creates a mission
- [ ] Assign to one specific user
- [ ] Assign to a group/cohort
- [ ] Assign by level/progress (if that data exists)
- [ ] **Preview shows correct affected-user count**
- [ ] 0 matched users -> blocked + message, nothing created
- [ ] Already-assigned users skipped; counts reported
- [ ] Assignment history row created
- [ ] Mission appears on each targeted user's `/missions`
- [ ] Double-confirm doesn't double-assign

### `/missions`
- [ ] All / Today / Active / Program / Tutorials / Admin Missions / Completed / Overdue filters work
- [ ] Program tasks show `program_video` source + correct link
- [ ] Tutorial tasks show `tutorial` source + correct link
- [ ] Admin missions show `admin_mission` source
- [ ] CTAs link to the correct place per source
- [ ] Completed tasks render via "View result"
- [ ] Overdue tasks appear correctly (if due dates exist)
- [ ] No raw templates ever appear

### Cross-cutting / integrity
- [ ] `UNIQUE (user_id, task_template_id)` exists and is enforced
- [ ] Deleting a template doesn't break existing UserTasks
- [ ] Completing twice doesn't double-count points
- [ ] All assignment paths call the single central function

---

## STEP 12 — Final decision map

**1. Core task model** — Unified `task_templates` + `user_tasks`, discriminated by `source_type`. Users only ever read `user_tasks`. Snapshots on every UserTask.

**2. Program video task decisions** — Created on the lesson; 0..N per video; reorderable; editable (future-only); archive keeps existing; **assign on video start**, not on existence/unlock.

**3. Tutorial task decisions** — Same model/editor/function as video tasks (`source_type='tutorial'`); tutorial-scoped for MVP, drill-scoped Later; **assign on tutorial/drill start**.

**4. Admin mission decisions** — `source_type='admin_mission'`, no content link; **mandatory preview ("N users") -> confirm**; audience via users/groups/quiz/level/progress/tags/cohorts/custom; 0-match blocks; already-assigned skipped; every confirm logs history; stats from `user_tasks`.

**5. User `/missions` decisions** — One unified list; tabs All/Today/Active/Program/Tutorials/Admin Missions/Completed/Overdue; cards show source + metadata + status; source-specific CTAs; opening sets `in_progress`.

**6. Assignment trigger decisions** — MVP triggers: video start, tutorial start, drill start, admin confirm. Later: on-unlock, on-complete. **All** via `assignTasksFromSource(...)`.

**7. Duplicate protection decisions** — `UNIQUE(user_id, task_template_id)` + insert-or-skip. Every retry/refresh/double-fire is idempotent. Completed tasks never reset.

**8. MVP decisions** — Templates, UserTasks, video+tutorial+admin creation, auto-assign (video/tutorial), manual assign (preview/confirm), duplicate protection, `/missions`, status + complete, assignment logs.

**9. Later-feature decisions** — Recurring, AI, comments, submissions, grading, advanced notifications, analytics, complex automations, multi-step workflows, sync-to-latest.

**10. QA checklist** — As in Step 11; the four must-pass gates: (a) start-triggers-assign, (b) no duplicates, (c) snapshots survive template changes, (d) admin preview/confirm + skip-already-assigned.

---

## Top 5 things to verify against the implementation

1. **Unified model vs. two systems** — did they converge `mission_templates`/`missions` and `lesson_task_templates` into one template+usertask contract (or at least a shared assignment function)?
2. **Single `assignTasksFromSource`** — does every trigger funnel through it, or are there ad-hoc inserts?
3. **`UNIQUE(user_id, task_template_id)` + insert-or-skip** — is the duplicate guard at the DB level, not just app level?
4. **Admin mission preview/confirm + skip-already-assigned** — replacing today's no-preview, no-dedupe bulk assign.
5. **Snapshots + denormalized source on `user_tasks`** — so edits/deletes/unpublishes never corrupt or 404 a user's task.
