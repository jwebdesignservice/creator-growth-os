-- =====================================================================
-- Creator Growth OS — Monetization Path
-- Pro feature surface: media kits, brand pitches, deal tracker, revenue.
-- Readiness score is derived in app code from these tables + profile.
-- =====================================================================

-- MEDIA KITS -----------------------------------------------------------
create table if not exists public.media_kits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles(id) on delete cascade,
  headline        text,
  bio             text,
  niche           text,
  audience_stats  jsonb not null default '{}'::jsonb,
  rates           jsonb not null default '{}'::jsonb,
  links           jsonb not null default '[]'::jsonb,
  published       boolean not null default false,
  share_slug      text unique,
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- BRAND PITCH TEMPLATES (system-wide) ----------------------------------
create table if not exists public.pitch_templates (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  subject       text not null,
  body          text not null,
  category      text,
  is_premium    boolean not null default false,
  sort_order    integer not null default 100,
  created_at    timestamptz not null default now()
);

-- BRAND DEAL TRACKER ---------------------------------------------------
create type brand_deal_stage as enum (
  'lead', 'pitched', 'in_negotiation', 'agreed', 'live', 'paid', 'lost'
);

create table if not exists public.brand_deals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  brand_name    text not null,
  contact_name  text,
  contact_email text,
  stage         brand_deal_stage not null default 'lead',
  value_amount  integer,
  value_currency text not null default 'nok',
  deliverables  text,
  due_date      date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_brand_deals_user on public.brand_deals(user_id, updated_at desc);

-- REVENUE ENTRIES ------------------------------------------------------
create table if not exists public.revenue_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  source        text not null,
  category      text,
  amount        integer not null,
  currency      text not null default 'nok',
  received_on   date not null default current_date,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_revenue_user on public.revenue_entries(user_id, received_on desc);

-- TRIGGERS -------------------------------------------------------------
drop trigger if exists trg_media_kits_updated_at on public.media_kits;
create trigger trg_media_kits_updated_at before update on public.media_kits
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_brand_deals_updated_at on public.brand_deals;
create trigger trg_brand_deals_updated_at before update on public.brand_deals
  for each row execute function public.touch_updated_at();

-- RLS ------------------------------------------------------------------
alter table public.media_kits        enable row level security;
alter table public.pitch_templates   enable row level security;
alter table public.brand_deals       enable row level security;
alter table public.revenue_entries   enable row level security;

drop policy if exists "media_kits_self" on public.media_kits;
create policy "media_kits_self" on public.media_kits
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());

-- Published media kits are publicly readable by share_slug (no auth req)
drop policy if exists "media_kits_published_select" on public.media_kits;
create policy "media_kits_published_select" on public.media_kits
  for select using (published = true);

drop policy if exists "pitch_templates_read" on public.pitch_templates;
create policy "pitch_templates_read" on public.pitch_templates
  for select using (auth.role() = 'authenticated');
drop policy if exists "pitch_templates_admin_write" on public.pitch_templates;
create policy "pitch_templates_admin_write" on public.pitch_templates
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brand_deals_self" on public.brand_deals;
create policy "brand_deals_self" on public.brand_deals
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "revenue_self" on public.revenue_entries;
create policy "revenue_self" on public.revenue_entries
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());

-- SEED — pitch templates -----------------------------------------------
insert into public.pitch_templates (slug, title, description, subject, body, category, is_premium, sort_order)
values
  ('cold-intro', 'Cold Intro Pitch',
   'A first-contact email when no prior relationship exists.',
   'Quick idea for {{brand}}',
   E'Hi {{contact}},\n\nI''m {{name}} — I create content around {{niche}} for an audience of {{audience_size}} on {{platform}}.\n\nI''ve been a fan of {{brand}} for a while and put together a quick concept for a collab that I think your audience would love. Happy to share it in a 15-minute call this week — or drop the deck over email if easier.\n\nLet me know what works.\n\n— {{name}}\n{{links}}',
   'outreach', false, 10),

  ('warm-followup', 'Warm Follow-Up',
   'After meeting a brand at an event or being introduced.',
   'Following up — {{brand}} × {{name}}',
   E'Hi {{contact}},\n\nGreat to connect at {{context}}. As promised, here''s a quick summary of how I''d see us working together:\n\n- Platform: {{platform}}\n- Audience: {{audience_size}} engaged followers\n- Angle: {{angle}}\n- Deliverables: {{deliverables}}\n\nFull media kit attached. Happy to jump on a call to map this out.\n\n— {{name}}',
   'outreach', false, 20),

  ('rate-negotiation', 'Rate Negotiation',
   'Used to push back firmly but kindly when offered too little.',
   'RE: {{brand}} collaboration',
   E'Hi {{contact}},\n\nThanks for the offer — I''m excited about the partnership.\n\nThe scope you''ve described (deliverables, usage, exclusivity) sits above my entry rate. Based on similar campaigns I''ve run, my rate for this scope is {{rate}}. That includes:\n\n- {{deliverable_1}}\n- {{deliverable_2}}\n- {{deliverable_3}}\n\nHappy to adjust the scope to hit your budget if needed — let me know which lever to pull.\n\n— {{name}}',
   'negotiation', true, 30),

  ('inbound-reply', 'Inbound Reply',
   'A clean reply when a brand reaches out cold.',
   'RE: Collab — {{name}} × {{brand}}',
   E'Hi {{contact}},\n\nThanks for reaching out — I''d love to learn more.\n\nA few quick questions so I can put together the right proposal:\n\n1. Campaign goal & key message\n2. Required deliverables (platforms, format, count)\n3. Usage rights & exclusivity\n4. Timeline\n5. Budget range\n\nIn the meantime, here''s my media kit: {{media_kit_link}}\n\n— {{name}}',
   'outreach', false, 40),

  ('renewal', 'Renewal Pitch',
   'Pitch a repeat campaign after a successful first one.',
   '{{brand}} × {{name}} — round two?',
   E'Hi {{contact}},\n\nWanted to circle back on our last campaign — final numbers:\n\n- Reach: {{reach}}\n- Engagements: {{engagements}}\n- Saved/shared: {{saves}}\n- Conversions/clicks: {{conversions}}\n\nGiven the performance, I''d love to run a second push. I''ve mapped a 3-post follow-up that builds on the angle that worked best. Want me to send the deck?\n\n— {{name}}',
   'retention', true, 50)
on conflict (slug) do nothing;
