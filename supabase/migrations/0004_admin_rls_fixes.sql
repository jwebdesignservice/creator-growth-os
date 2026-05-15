-- =====================================================================
-- Creator Growth OS — admin RLS fixes
-- The initial migration only gave announcements a SELECT policy, which
-- blocked admin inserts via the admin console. This migration adds the
-- missing admin-write policy. Idempotent.
-- =====================================================================

-- Announcements: admin can manage all rows.
drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- (Optional belt + braces) Admin can manage admin_users entries.
drop policy if exists "admin_users_admin_write" on public.admin_users;
create policy "admin_users_admin_write" on public.admin_users
  for all
  using (public.is_admin())
  with check (public.is_admin());
