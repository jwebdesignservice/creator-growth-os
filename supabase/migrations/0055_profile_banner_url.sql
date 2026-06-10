-- 0055_profile_banner_url.sql
-- Profile cover/banner image.
--
-- Stores the public URL of a user-uploaded banner shown behind the avatar on
-- the Settings / profile header. Banner files live in the EXISTING public
-- `community-media` Storage bucket under {user_id}/ — the same bucket + RLS the
-- avatar upload uses, so no new bucket or storage policy is required here.
--
-- To apply: run this in Supabase Studio → SQL editor (or via your migration
-- tooling). It is idempotent and safe to re-run.

alter table public.profiles
  add column if not exists banner_url text;
