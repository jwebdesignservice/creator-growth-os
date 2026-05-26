import { redirect } from "next/navigation";

/**
 * The `/admin/lessons` surface was replaced by `/admin/tutorials` — a richer
 * grid view of tutorial videos. We keep this route alive only to redirect
 * older bookmarks, so nothing 404s mid-navigation.
 */
export default function AdminLessonsRedirect() {
  redirect("/admin/tutorials");
}
