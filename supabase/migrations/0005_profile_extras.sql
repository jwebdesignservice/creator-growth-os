-- =====================================================================
-- Creator Growth OS — profile extras for /profile + /settings
-- Adds the columns the user-settings UI persists. Idempotent.
-- =====================================================================

alter table public.profiles
  add column if not exists bio          text,
  add column if not exists handle       text,
  add column if not exists notification_preferences jsonb not null default jsonb_build_object(
    'email_updates',     true,
    'task_reminders',    true,
    'posting_alerts',    true,
    'coach_messages',    true,
    'product_announcements', false
  );

-- Useful index for username-style lookups later
create index if not exists idx_profiles_handle on public.profiles (handle) where handle is not null;
