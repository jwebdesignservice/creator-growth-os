-- =====================================================================
-- 0027_referrals.sql
-- Referral program: per-user referral codes, signup tracking, and
-- milestone rewards (1 month free at 3 qualified referrals, 3 months
-- free at 9). Reward grant happens server-side from the Stripe
-- invoice.paid webhook — schema below stores the audit trail.
-- =====================================================================

-- ── referral_code on profiles ────────────────────────────────────────
-- The UNIQUE constraint creates an implicit btree index, so no explicit
-- index is needed — duplicating it would just slow down writes.
alter table public.profiles
  add column if not exists referral_code text unique;

-- Short base32-ish code generator (8 chars, ambiguous chars removed).
-- SECURITY DEFINER so it can be called from the handle_new_user trigger
-- without the new auth user owning execute privs on its own.
create or replace function public.generate_referral_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet  constant text := '23456789abcdefghjkmnpqrstuvwxyz';
  candidate text;
  attempts  int := 0;
begin
  loop
    candidate := '';
    for i in 1..8 loop
      candidate := candidate ||
        substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    -- Collision check; loop until unique. Practically near-zero collisions
    -- against ~31^8 = ~852B space, but be defensive.
    exit when not exists (
      select 1 from public.profiles where referral_code = candidate
    );
    attempts := attempts + 1;
    if attempts > 8 then
      raise exception 'generate_referral_code: too many collisions';
    end if;
  end loop;
  return candidate;
end $$;

-- Backfill existing rows that have no code yet.
update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null;

-- ── referrals: one row per (referrer, referee) pair ──────────────────
create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references auth.users(id) on delete cascade,
  referee_id    uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'qualified', 'reverted')),
  qualified_at  timestamptz,
  created_at    timestamptz not null default now(),
  -- A given user can only be referred by one person, ever.
  unique (referee_id),
  -- No self-referrals.
  constraint referrals_no_self check (referrer_id <> referee_id)
);

create index if not exists referrals_referrer_id_idx
  on public.referrals(referrer_id);
create index if not exists referrals_status_idx
  on public.referrals(status);

-- ── referral_rewards: milestone grants (audit trail) ─────────────────
create table if not exists public.referral_rewards (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  milestone                int  not null check (milestone in (3, 9)),
  months_free              int  not null check (months_free > 0),
  stripe_coupon_id         text,
  applied_to_subscription  boolean not null default false,
  granted_at               timestamptz not null default now(),
  -- Each milestone is grantable exactly once per user.
  unique (user_id, milestone)
);

create index if not exists referral_rewards_user_id_idx
  on public.referral_rewards(user_id);

-- ── handle_new_user: generate referral_code on signup ────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, display_name, avatar_url, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    public.generate_referral_code()
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end $$;

-- ── RLS ──────────────────────────────────────────────────────────────
alter table public.referrals        enable row level security;
alter table public.referral_rewards enable row level security;

-- Referrers see their own referrals. Referees do NOT (privacy: a referee
-- shouldn't be able to discover who referred them via this table).
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own"
  on public.referrals
  for select
  using (auth.uid() = referrer_id);

-- Users see their own rewards.
drop policy if exists "referral_rewards_select_own" on public.referral_rewards;
create policy "referral_rewards_select_own"
  on public.referral_rewards
  for select
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — only service role writes (signup
-- action + Stripe webhook), which bypasses RLS.
