-- Ensure admin write policy exists on announcements (idempotent).
drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Insert your account into admin_users if not already present.
-- Replace the email below with your Supabase auth email if different.
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = 'jackwilson9090@gmail.com'
  and not exists (
    select 1 from public.admin_users where user_id = auth.users.id
  );
