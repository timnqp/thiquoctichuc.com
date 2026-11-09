-- thiquoctichuc.com — M2 content model
-- Creates tests + questions tables, is_entitled() helper, and RLS policies.
-- Idempotent (safe to re-run).

-- 1. is_entitled() helper --------------------------------------------------
-- Returns true iff the user currently has an active access grant.
-- security definer so RLS policies on questions can call it without recursion.

create or replace function public.is_entitled(uid uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.access_grants
    where user_id = uid
      and now() >= starts_at
      and now() <  expires_at
  );
$$;

revoke all on function public.is_entitled(uuid) from public;
grant execute on function public.is_entitled(uuid) to anon, authenticated;

-- 2. tests ------------------------------------------------------------------

create table if not exists public.tests (
  id text primary key,
  title text not null,
  difficulty text not null check (difficulty in ('basic', 'advanced')),
  tier text not null default 'premium' check (tier in ('free', 'premium')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tests_sort_idx
  on public.tests (difficulty, sort_order, id);

alter table public.tests enable row level security;

-- Metadata of every test is public (so the practice list can render lock
-- icons on gated rows). Question bodies are gated separately on `questions`.
drop policy if exists "tests: public select" on public.tests;
create policy "tests: public select"
  on public.tests
  for select
  to anon, authenticated
  using (true);

drop policy if exists "tests: admin write" on public.tests;
create policy "tests: admin write"
  on public.tests
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. questions --------------------------------------------------------------

create table if not exists public.questions (
  id text primary key,
  test_id text not null references public.tests(id) on delete cascade,
  topic text not null check (topic in ('values', 'general')),
  part int not null check (part between 1 and 4),
  difficulty text not null check (difficulty in ('basic', 'advanced')),
  question text not null,
  options jsonb not null,            -- [{id,text}, ...]
  correct text not null,
  explain_vi text,
  image text,
  image_alt text,
  sort_order int not null default 0
);

create index if not exists questions_test_sort_idx
  on public.questions (test_id, sort_order, id);

alter table public.questions enable row level security;

-- Anonymous + authenticated users see questions only for free tests, OR for
-- premium tests when they have an active access grant. Admin sees all.
drop policy if exists "questions: free or entitled" on public.questions;
create policy "questions: free or entitled"
  on public.questions
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.tests t
      where t.id = questions.test_id
        and (t.tier = 'free' or public.is_entitled())
    )
  );

drop policy if exists "questions: admin write" on public.questions;
create policy "questions: admin write"
  on public.questions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Writes by the seeder use the service_role key, which bypasses RLS.
