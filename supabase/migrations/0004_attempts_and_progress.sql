-- thiquoctichuc.com — M5 member portal data
-- attempts (per-test submission + score) and lesson_progress (per-lesson tick).
-- Idempotent.

-- 1. attempts ---------------------------------------------------------------

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id text not null references public.tests(id),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  timed_out boolean not null default false,
  score int,                          -- overall % (0-100)
  values_correct int,
  passed boolean,
  answers jsonb not null default '{}'::jsonb  -- {question_id: option_id}
);

create index if not exists attempts_user_started_idx
  on public.attempts (user_id, started_at desc);

create index if not exists attempts_test_submitted_idx
  on public.attempts (test_id, submitted_at desc);

alter table public.attempts enable row level security;

drop policy if exists "attempts: select own" on public.attempts;
create policy "attempts: select own"
  on public.attempts
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "attempts: insert own" on public.attempts;
create policy "attempts: insert own"
  on public.attempts
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "attempts: update own" on public.attempts;
create policy "attempts: update own"
  on public.attempts
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. lesson_progress --------------------------------------------------------

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "lesson_progress: select own" on public.lesson_progress;
create policy "lesson_progress: select own"
  on public.lesson_progress
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "lesson_progress: upsert own" on public.lesson_progress;
create policy "lesson_progress: upsert own"
  on public.lesson_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "lesson_progress: delete own" on public.lesson_progress;
create policy "lesson_progress: delete own"
  on public.lesson_progress
  for delete
  to authenticated
  using (user_id = auth.uid());
