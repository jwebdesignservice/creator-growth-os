import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

/**
 * Legacy route. The real, full tutorial editor lives at
 * /admin/tutorials/[id]; this page used to be a "development" placeholder.
 * Anything still linking to /edit (old bookmarks, the list kebab before it
 * was repointed) is forwarded to the real editor so there are no
 * dead-ends.
 */
export default async function TutorialEditRedirect({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  redirect(`/admin/tutorials/${id}`);
}
