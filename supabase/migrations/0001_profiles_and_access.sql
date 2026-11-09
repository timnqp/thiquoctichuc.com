-- thiquoctichuc.com — M1 foundations
-- Creates profiles (with role), is_admin() helper, access_grants,
-- current_access view, and the auth-signup trigger that materialises
-- a profiles row. Idempotent (safe to re-run).

-- 1. profiles --------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2. is_admin() helper (security definer, avoids RLS recursion) ------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3. profiles policies -----------------------------------------------------

drop policy if exists "profiles: select own or admin" on public.profiles;
create policy "profiles: select own or admin"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own (role locked)" on public.profiles;
create policy "profiles: update own (role locked)"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  -- Lock the role column — users cannot self-promote. Admin role changes
  -- happen via the service_role key or a dedicated admin RPC.
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

drop policy if exists "profiles: admin update all" on public.profiles;
create policy "profiles: admin update all"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Auto-create profiles row on signup ------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 5. access_grants ---------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_kind') then
    create type public.plan_kind as enum ('premium', 'coaching');
  end if;
end$$;

create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan public.plan_kind not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  source text not null check (source in ('stripe', 'manual', 'coaching_signup')),
  stripe_session_id text unique,
  note text,
  created_at timestamptz not null default now(),
  check (expires_at > starts_at)
);

create index if not exists access_grants_user_expires_idx
  on public.access_grants (user_id, expires_at desc);

alter table public.access_grants enable row level security;

drop policy if exists "access_grants: select own" on public.access_grants;
create policy "access_grants: select own"
  on public.access_grants
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "access_grants: admin write" on public.access_grants;
create policy "access_grants: admin write"
  on public.access_grants
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts/updates by the Stripe webhook use the service_role key, which
-- bypasses RLS by design.

-- 6. current_access view ---------------------------------------------------

create or replace view public.current_access
with (security_invoker = true) as
  select distinct on (user_id)
    user_id,
    plan,
    starts_at,
    expires_at
  from public.access_grants
  where now() >= starts_at and now() < expires_at
  order by user_id, expires_at desc;

-- security_invoker ensures view queries run with the caller's RLS (users see
-- only their own row; admins see all via the access_grants policy).
