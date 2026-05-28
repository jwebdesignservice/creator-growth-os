// Seed the "Start Here" onboarding program — the learner's first guided
// mission inside Creator Growth OS.
//
// Creates: 1 free program (sort_order 0 so it leads the Programs list) + 6
// short lessons across 2 modules, each with a "What you'll learn" learning
// point, plus one light task per lesson via the unified task system
// (task_templates, source_type=program_video, on_complete) so completing a
// lesson generates a real onboarding task.
//
// Idempotent: program + lessons upsert by slug; a task_template is inserted
// only when its lesson doesn't already have one. Safe to re-run.
//
// Run: node scripts/seed-start-here.mjs

import { readFileSync } from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const PROGRAM = {
  slug: "start-here",
  title: "Start Here: Platform Introduction",
  description:
    "Your first guided mission — a quick tour of how Creator Growth OS works so you can start growing with confidence.",
  plan_access: "free",
  category_access: ["starter", "growth", "monetization", "scale"],
  total_lessons: 6,
  total_tasks: 6,
  estimated_days: 1,
  sort_order: 0,
  published: true,
};

// Each lesson carries: meta + a "What you'll learn" learning point (feeds the
// program overview) + one light onboarding task.
const LESSONS = [
  {
    slug: "start-here-welcome",
    title: "Welcome to Creator Growth OS",
    description:
      "A 90-second welcome: what this platform is, and how it helps you grow as a creator without the overwhelm.",
    duration_seconds: 90,
    module_number: 1,
    module_title: "Platform Basics",
    sort_order: 1,
    learning_points: [
      {
        id: "sh-welcome-1",
        icon: "sparkles",
        title: "What Creator Growth OS does for you",
        description:
          "How the platform turns your goals into a simple, guided daily growth system.",
        actionStep: null,
      },
    ],
    task: {
      title: "Set your main creator goal",
      description: "Tell us your #1 goal so your missions can be tailored to it.",
      task_type: "setup",
    },
  },
  {
    slug: "start-here-navigation",
    title: "Find Your Way Around",
    description:
      "A quick tour of the layout — the sidebar, top bar and the main areas you'll use every day.",
    duration_seconds: 150,
    module_number: 1,
    module_title: "Platform Basics",
    sort_order: 2,
    learning_points: [
      {
        id: "sh-nav-1",
        icon: "layers",
        title: "Where everything lives",
        description:
          "Dashboard, Programs, Tutorials, Tasks and Performance — and how they connect.",
        actionStep: null,
      },
    ],
    task: {
      title: "Take a 2-minute tour",
      description:
        "Visit your Dashboard, Programs and Tutorials pages so you know where things live.",
      task_type: "explore",
    },
  },
  {
    slug: "start-here-profile-account",
    title: "Your Profile & Account Settings",
    description:
      "Set up your creator profile and learn where to manage your account, including changing your password.",
    duration_seconds: 150,
    module_number: 1,
    module_title: "Platform Basics",
    sort_order: 3,
    learning_points: [
      {
        id: "sh-profile-1",
        icon: "users",
        title: "Set up your creator profile",
        description:
          "Add your photo and details, and manage your password from Settings.",
        actionStep: {
          title: "Complete your profile",
          description: "Add a profile photo and confirm your details in Settings.",
        },
      },
    ],
    task: {
      title: "Complete your profile",
      description: "Add a profile photo and confirm your details in Settings.",
      task_type: "setup",
    },
  },
  {
    slug: "start-here-how-programs-work",
    title: "How Programs Work",
    description:
      "Programs are your structured growth paths. See how modules, lessons and tasks fit together.",
    duration_seconds: 150,
    module_number: 2,
    module_title: "Doing the Work",
    sort_order: 4,
    learning_points: [
      {
        id: "sh-programs-1",
        icon: "book-open",
        title: "How programs guide your growth",
        description:
          "Modules, lessons, and the tasks each lesson unlocks as you progress.",
        actionStep: null,
      },
    ],
    task: {
      title: "Start your first program lesson",
      description: "Open a program that fits your stage and start its first lesson.",
      task_type: "apply",
    },
  },
  {
    slug: "start-here-how-tutorials-work",
    title: "How Tutorials Work",
    description:
      "Tutorials are quick, standalone how-tos you can watch any time to sharpen one specific skill.",
    duration_seconds: 120,
    module_number: 2,
    module_title: "Doing the Work",
    sort_order: 5,
    learning_points: [
      {
        id: "sh-tutorials-1",
        icon: "video",
        title: "On-demand how-to tutorials",
        description:
          "Standalone lessons you can watch any time to sharpen one specific skill.",
        actionStep: null,
      },
    ],
    task: {
      title: "Save a tutorial for later",
      description: "Browse Tutorials and bookmark one to watch when you need it.",
      task_type: "explore",
    },
  },
  {
    slug: "start-here-tasks-and-missions",
    title: "Tasks, Missions & Daily Execution",
    description:
      "Learning only counts when you act. See how lessons generate tasks and how daily missions keep you moving.",
    duration_seconds: 150,
    module_number: 2,
    module_title: "Doing the Work",
    sort_order: 6,
    learning_points: [
      {
        id: "sh-tasks-1",
        icon: "rocket",
        title: "Turn learning into daily action",
        description:
          "How lessons generate tasks, and how daily missions keep you moving forward.",
        actionStep: {
          title: "Complete your first mission",
          description: "Open Today's Missions and check one task off.",
        },
      },
    ],
    task: {
      title: "Complete your first daily mission",
      description: "Open Today's Missions and check one task off your list.",
      task_type: "apply",
    },
  },
];

async function main() {
  // 1. Upsert the program (create or update by slug).
  const progRes = await fetch(`${URL}/rest/v1/programs?on_conflict=slug`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([PROGRAM]),
  });
  const progBody = await progRes.text();
  if (!progRes.ok) {
    console.error(`Program upsert failed (HTTP ${progRes.status}): ${progBody}`);
    process.exit(1);
  }
  const programId = JSON.parse(progBody)[0].id;
  console.log(`  ✓ program "${PROGRAM.slug}" -> ${programId}`);

  // 2. Upsert the lessons (create or update by slug).
  const lessonRows = LESSONS.map((l) => ({
    program_id: programId,
    slug: l.slug,
    title: l.title,
    description: l.description,
    duration_seconds: l.duration_seconds,
    difficulty: "beginner",
    content_type: "video",
    plan_access: "free",
    module_number: l.module_number,
    module_title: l.module_title,
    sort_order: l.sort_order,
    published: true,
    learning_points: l.learning_points,
    action_steps: [],
  }));
  const lessonRes = await fetch(`${URL}/rest/v1/lessons?on_conflict=slug`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(lessonRows),
  });
  const lessonBody = await lessonRes.text();
  if (!lessonRes.ok) {
    console.error(`Lessons upsert failed (HTTP ${lessonRes.status}): ${lessonBody}`);
    process.exit(1);
  }
  const savedLessons = JSON.parse(lessonBody);
  const idBySlug = new Map(savedLessons.map((r) => [r.slug, r.id]));
  console.log(`  ✓ ${savedLessons.length} lessons upserted`);

  // 3. Tasks — only insert for lessons that don't already have one (idempotent).
  const lessonIds = LESSONS.map((l) => idBySlug.get(l.slug)).filter(Boolean);
  const existRes = await fetch(
    `${URL}/rest/v1/task_templates?source_type=eq.program_video&source_id=in.(${lessonIds.join(",")})&select=source_id`,
    { headers: H },
  );
  const existing = existRes.ok ? await existRes.json() : [];
  const haveTask = new Set(existing.map((r) => r.source_id));

  const taskRows = [];
  for (const l of LESSONS) {
    const lessonId = idBySlug.get(l.slug);
    if (!lessonId || haveTask.has(lessonId)) continue;
    taskRows.push({
      title: l.task.title,
      description: l.task.description,
      task_type: l.task.task_type,
      source_type: "program_video",
      source_id: lessonId,
      program_id: programId,
      lesson_id: lessonId,
      status: "active",
      visibility: "default",
      sort_order: l.sort_order,
      difficulty: "easy",
      estimated_minutes: 5,
      due_after_days: null,
      auto_assign_trigger: "on_complete",
      points: 5,
      is_required: true,
    });
  }

  if (taskRows.length > 0) {
    const taskRes = await fetch(`${URL}/rest/v1/task_templates`, {
      method: "POST",
      headers: { ...H, Prefer: "return=representation" },
      body: JSON.stringify(taskRows),
    });
    const taskBody = await taskRes.text();
    if (!taskRes.ok) {
      console.error(`Task insert failed (HTTP ${taskRes.status}): ${taskBody}`);
      process.exit(1);
    }
    console.log(`  ✓ ${JSON.parse(taskBody).length} task templates created`);
  } else {
    console.log("  ✓ task templates already present (skipped)");
  }

  // 4. Verify.
  const cntRes = await fetch(
    `${URL}/rest/v1/lessons?program_id=eq.${programId}&select=id`,
    { headers: { ...H, Prefer: "count=exact" } },
  );
  console.log(`\nStart Here lesson count: ${cntRes.headers.get("content-range")}`);
  console.log("Done.");
}

main();
