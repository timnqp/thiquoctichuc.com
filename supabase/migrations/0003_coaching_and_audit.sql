-- thiquoctichuc.com — M4 coaching lead flow + audit log
-- Creates coaching_requests (public insert, admin read/write) and
-- audit_log (admin + service_role only). Idempotent.
--
-- Note: audit_log was originally scheduled for M8 in plan/v2-premium.md,
-- but M4's grant action needs to log entries, so it ships here.

-- 1. coaching_requests -----------------------------------------------------

create table if not exists public.coaching_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  timeline text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'paid', 'granted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coaching_requests_status_created_idx
  on public.coaching_requests (status, created_at desc);

alter table public.coaching_requests enable row level security;

-- Anyone (signed-in or not) can submit a coaching request.
drop policy if exists "coaching_requests: public insert" on public.coaching_requests;
create policy "coaching_requests: public insert"
  on public.coaching_requests
  for insert
  to anon, authenticated
  with check (true);

-- Only admin can read + update. Users intentionally cannot read back their
-- own request — the public form is one-way; follow-up happens by email.
drop policy if exists "coaching_requests: admin select" on public.coaching_requests;
create policy "coaching_requests: admin select"
  on public.coaching_requests
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "coaching_requests: admin update" on public.coaching_requests;
create policy "coaching_requests: admin update"
  on public.coaching_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Keep updated_at fresh on any UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists coaching_requests_touch on public.coaching_requests;
create trigger coaching_requests_touch
  before update on public.coaching_requests
  for each row execute function public.touch_updated_at();

-- 2. audit_log --------------------------------------------------------------

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx
  on public.audit_log (created_at desc);

create index if not exists audit_log_target_idx
  on public.audit_log (target_table, target_id);

alter table public.audit_log enable row level security;

-- Only admin can read. Writes go through the service_role client (bypasses
-- RLS) from server actions; we also allow admin direct insert for parity.
drop policy if exists "audit_log: admin select" on public.audit_log;
create policy "audit_log: admin select"
  on public.audit_log
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "audit_log: admin insert" on public.audit_log;
create policy "audit_log: admin insert"
  on public.audit_log
  for insert
  to authenticated
  with check (public.is_admin());
