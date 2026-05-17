-- =====================================================================
-- Creator Growth OS — Support / Contact system
-- Adds the schema that powers /support: user-submitted support tickets,
-- per-ticket message thread, and the public help-article library.
--
-- Access model:
--   • Users may insert/select/update only their OWN tickets and messages.
--   • Admins may select/update any ticket and post replies.
--   • Help articles are world-readable (no RLS gate on select).
--
-- The main app's auth flow, billing, and admin tables are NOT modified.
-- Reuses public.is_admin() and public.touch_updated_at() from 0001_init.
-- Safe to re-run.
-- =====================================================================

-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type support_ticket_topic as enum (
    'billing',
    'technical',
    'account',
    'content',
    'posting',
    'community',
    'coaching',
    'feature',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_ticket_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_ticket_status as enum (
    'open',
    'waiting',
    'in_progress',
    'resolved',
    'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_message_author as enum ('user', 'support', 'system');
exception when duplicate_object then null; end $$;


-- TICKETS ---------------------------------------------------------------
-- One row per submitted support request.
-- `public_id` (e.g. "TK-48291") is the human-readable identifier shown
-- in the UI; the uuid `id` is the internal PK / FK target.

create table if not exists public.support_tickets (
  id                  uuid primary key default gen_random_uuid(),
  public_id           text unique not null
                        default ('TK-' || lpad((floor(random()*90000)+10000)::int::text, 5, '0')),
  user_id             uuid not null references public.profiles(id) on delete cascade,

  subject             text not null,
  topic               support_ticket_topic not null,
  page_affected       text,
  priority            support_ticket_priority not null default 'medium',
  device              text,
  description         text not null,
  ticket_ref          text,

  -- Attachment metadata. The actual file (if any) lives in the
  -- `support-attachments` Storage bucket; we record the path so the
  -- UI can request a signed URL when displaying the ticket.
  attachment_path     text,
  attachment_name     text,
  attachment_size     integer,

  status              support_ticket_status not null default 'open',
  assigned_to_email   text,
  resolved_at         timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_support_tickets_user_created   on public.support_tickets (user_id, created_at desc);
create index if not exists idx_support_tickets_user_status    on public.support_tickets (user_id, status);
create index if not exists idx_support_tickets_status_created on public.support_tickets (status, created_at desc);
create index if not exists idx_support_tickets_topic          on public.support_tickets (topic);

-- Updated-at trigger reuses the helper from 0001_init.
drop trigger if exists trg_support_tickets_updated_at on public.support_tickets;
create trigger trg_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.touch_updated_at();


-- MESSAGES --------------------------------------------------------------
-- Conversation thread on a single ticket. The original submission body
-- lives in support_tickets.description; this table holds follow-ups from
-- the user and replies from support.

create table if not exists public.support_ticket_messages (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.support_tickets(id) on delete cascade,
  author        support_message_author not null,
  author_email  text,
  body          text not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_support_ticket_messages_ticket on public.support_ticket_messages (ticket_id, created_at asc);


-- HELP ARTICLES ---------------------------------------------------------
-- Lightweight knowledge-base entries shown in the right rail and on the
-- /help landing. Public read access — RLS allows everyone to SELECT.

create table if not exists public.help_articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  body          text,
  category      text,
  view_count    integer not null default 0,
  is_popular    boolean not null default false,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_help_articles_popular on public.help_articles (is_popular, view_count desc);
create index if not exists idx_help_articles_slug    on public.help_articles (slug);

drop trigger if exists trg_help_articles_updated_at on public.help_articles;
create trigger trg_help_articles_updated_at
  before update on public.help_articles
  for each row execute function public.touch_updated_at();


-- RLS -------------------------------------------------------------------

alter table public.support_tickets         enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.help_articles           enable row level security;

do $$ begin
  drop policy if exists "support_tickets_select_own"      on public.support_tickets;
  drop policy if exists "support_tickets_insert_own"      on public.support_tickets;
  drop policy if exists "support_tickets_update_own_open" on public.support_tickets;
  drop policy if exists "support_tickets_admin_all"       on public.support_tickets;
  drop policy if exists "support_messages_select_own"     on public.support_ticket_messages;
  drop policy if exists "support_messages_insert_own"     on public.support_ticket_messages;
  drop policy if exists "support_messages_admin_all"      on public.support_ticket_messages;
  drop policy if exists "help_articles_select_all"        on public.help_articles;
  drop policy if exists "help_articles_admin_write"       on public.help_articles;
end $$;

-- ── support_tickets ──────────────────────────────────────────────────

-- A user may read their own tickets; admins read everything.
create policy "support_tickets_select_own" on public.support_tickets
  for select using (auth.uid() = user_id or public.is_admin());

-- A user may create a ticket for themselves only.
create policy "support_tickets_insert_own" on public.support_tickets
  for insert with check (auth.uid() = user_id);

-- A user may patch their own ticket only while it is still open/waiting
-- (e.g. add a follow-up, mark as resolved from their side). Admins can
-- update at any stage.
create policy "support_tickets_update_own_open" on public.support_tickets
  for update
  using (
    (auth.uid() = user_id and status in ('open', 'waiting'))
    or public.is_admin()
  )
  with check (
    (auth.uid() = user_id and status in ('open', 'waiting', 'resolved'))
    or public.is_admin()
  );

-- Admin destructive ops (cleanup, GDPR erase).
create policy "support_tickets_admin_all" on public.support_tickets
  for delete using (public.is_admin());

-- ── support_ticket_messages ──────────────────────────────────────────

create policy "support_messages_select_own" on public.support_ticket_messages
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

create policy "support_messages_insert_own" on public.support_ticket_messages
  for insert with check (
    -- A user can post a "user" message on their own ticket; the support
    -- author kind comes from admins (or the service role, which bypasses RLS).
    (author = 'user' and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    ))
    or (public.is_admin())
  );

create policy "support_messages_admin_all" on public.support_ticket_messages
  for delete using (public.is_admin());

-- ── help_articles ────────────────────────────────────────────────────

-- World-readable: no auth filter (signed-in or anon).
create policy "help_articles_select_all" on public.help_articles
  for select using (true);

-- Only admins can manage articles.
create policy "help_articles_admin_write" on public.help_articles
  for all using (public.is_admin()) with check (public.is_admin());


-- SEED HELP ARTICLES ----------------------------------------------------
-- The four "Popular help articles" rendered in the support right rail.
-- Slugs match the placeholder hrefs in src/app/(app)/support/mock-data.ts.

insert into public.help_articles (slug, title, excerpt, category, is_popular, view_count) values
  ('upload-videos',        'How to upload videos to Posting Plans', 'Step-by-step guide to uploading videos and troubleshooting stuck uploads.', 'Posting Plans', true, 4280),
  ('upload-errors',        'Fixing common upload errors',           'The error messages you might see during upload and how to resolve each one.', 'Troubleshooting', true, 2940),
  ('manage-subscription',  'Managing your subscription',            'How to view, change, pause, or cancel your plan from Settings → Billing.', 'Billing', true, 2188),
  ('login-access',         'Account login & access help',           'What to do if you can''t sign in or forgot which email you used.', 'Account', true, 1762)
on conflict (slug) do nothing;


-- STORAGE BUCKET NOTE ---------------------------------------------------
-- Ticket attachments are stored in the `support-attachments` Storage
-- bucket (private, signed-URL access). Create it in the Supabase
-- dashboard (Storage → New bucket) with these settings:
--   name:       support-attachments
--   public:     false
--   file size:  10 MB
--   mime types: image/png, image/jpeg
-- Then add the following Storage RLS policies on storage.objects:
--   • INSERT  with check (bucket_id = 'support-attachments' and auth.uid()::text = (storage.foldername(name))[1])
--   • SELECT      using (bucket_id = 'support-attachments' and auth.uid()::text = (storage.foldername(name))[1])
-- This restricts each user to their own folder inside the bucket.
-- The submitSupportTicket() server action gracefully handles a missing
-- bucket — the ticket still saves; the attachment is just skipped.
