-- ════════════════════════════════════════════════════════════════════════
-- 0030_email_messages_and_templates.sql
--
-- Backs the admin Email surface end-to-end:
--
--   • email_templates — admin-managed library of reusable email templates
--     the Compose page can save into and load from.
--
--   • email_messages — every send / schedule / draft is written here so
--     the History page surfaces real data instead of mocks, and so the
--     row kebab (Resend / Cancel / Delete) has something to act on.
--
-- Both tables follow the existing project pattern:
--   - RLS enabled
--   - Read = any authenticated user (templates) or admin only (messages)
--   - Write = admin only
--   - updated_at managed by the shared set_updated_at() trigger
--     (introduced in 0029)
-- ════════════════════════════════════════════════════════════════════════

-- ── email_templates ─────────────────────────────────────────────────────
create table if not exists public.email_templates (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,                  -- internal name
  subject              text not null,
  body                 text not null,
  use_branded_template boolean not null default false,
  track_opens          boolean not null default true,
  archived             boolean not null default false,
  created_by           uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_email_templates_archived
  on public.email_templates (archived);
create index if not exists idx_email_templates_created_at
  on public.email_templates (created_at desc);

alter table public.email_templates enable row level security;

drop policy if exists "email_templates_read" on public.email_templates;
create policy "email_templates_read" on public.email_templates
  for select using (auth.role() = 'authenticated');

drop policy if exists "email_templates_admin_write" on public.email_templates;
create policy "email_templates_admin_write" on public.email_templates
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_email_templates_updated_at on public.email_templates;
create trigger trg_email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();


-- ── email_messages ──────────────────────────────────────────────────────
do $$ begin
  create type email_message_status as enum (
    'draft','scheduled','sending','sent','failed','canceled'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.email_messages (
  id                    uuid primary key default gen_random_uuid(),

  -- Auth / lineage
  sent_by               uuid references public.profiles(id) on delete set null,
  template_id           uuid references public.email_templates(id) on delete set null,

  -- Audience snapshot at send-time
  audience              text not null default 'all',
  program_id            uuid references public.programs(id) on delete set null,
  audience_label        text,

  -- Counts
  recipients_total      int  not null default 0,
  recipients_delivered  int  not null default 0,
  recipients_opened     int  not null default 0,
  recipients_clicked    int  not null default 0,
  recipients_bounced    int  not null default 0,

  -- Content snapshot (templates evolve; we keep what we actually sent)
  subject               text not null,
  body                  text not null,

  -- Lifecycle
  status                email_message_status not null default 'draft',
  scheduled_for         timestamptz,
  sent_at               timestamptz,
  canceled_at           timestamptz,

  -- Config snapshot
  use_branded_template  boolean not null default false,
  track_opens           boolean not null default true,

  -- Errors
  error_message         text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_email_messages_status
  on public.email_messages (status);
create index if not exists idx_email_messages_sent_by_created
  on public.email_messages (sent_by, created_at desc);
create index if not exists idx_email_messages_scheduled_for
  on public.email_messages (scheduled_for)
  where status = 'scheduled';

alter table public.email_messages enable row level security;

drop policy if exists "email_messages_admin_read" on public.email_messages;
create policy "email_messages_admin_read" on public.email_messages
  for select using (public.is_admin());

drop policy if exists "email_messages_admin_write" on public.email_messages;
create policy "email_messages_admin_write" on public.email_messages
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_email_messages_updated_at on public.email_messages;
create trigger trg_email_messages_updated_at
  before update on public.email_messages
  for each row execute function public.set_updated_at();
