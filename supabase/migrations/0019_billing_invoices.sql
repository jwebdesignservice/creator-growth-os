-- =====================================================================
-- Billing — invoices table (Stripe-backed)
-- Webhook writes here; UI reads from here for Recent Invoices.
-- =====================================================================

create table if not exists public.invoices (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  stripe_invoice_id   text unique,
  stripe_charge_id    text,
  number              text,
  description         text,
  amount_paid         integer not null default 0,
  currency            text not null default 'nok',
  status              text not null,
  hosted_invoice_url  text,
  invoice_pdf         text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);
create index if not exists idx_invoices_user on public.invoices(user_id, created_at desc);

alter table public.invoices enable row level security;

drop policy if exists "invoices_self_select" on public.invoices;
create policy "invoices_self_select" on public.invoices
  for select using (auth.uid() = user_id or public.is_admin());

-- Service role can write via webhook; admins can write via console.
drop policy if exists "invoices_admin_write" on public.invoices;
create policy "invoices_admin_write" on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());
