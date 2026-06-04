import {
  BookOpen,
  CalendarDays,
  Files,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

/**
 * Lesson section tabs — kept in a plain (non-"use client") module so the
 * server-rendered tutorial page can import the value to build its left rail,
 * while the client LessonContent imports the type. Importing a value out of a
 * "use client" module into a server component would turn it into a client
 * reference and break at runtime.
 */

export type LessonTabKey = "overview" | "path" | "resources" | "notes";

export const LESSON_TABS: {
  key: LessonTabKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "overview", label: "Overview", icon: BookOpen },
  { key: "path", label: "Lesson Path", icon: CalendarDays },
  { key: "resources", label: "Resources", icon: Files },
  { key: "notes", label: "Notes", icon: NotebookPen },
];
