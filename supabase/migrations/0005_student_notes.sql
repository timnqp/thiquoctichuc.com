-- thiquoctichuc.com — M6 admin-only student notes.
-- Private coaching notes about a user, written by admins. The target user
-- intentionally cannot read them (admin-only).

create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,  -- about this user
  author_id uuid not null references public.profiles(id),                  -- admin who wrote it
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_notes_user_created_idx
  on public.student_notes (user_id, created_at desc);

alter table public.student_notes enable row level security;

drop policy if exists "student_notes: admin select" on public.student_notes;
create policy "student_notes: admin select"
  on public.student_notes
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "student_notes: admin insert" on public.student_notes;
create policy "student_notes: admin insert"
  on public.student_notes
  for insert
  to authenticated
  with check (public.is_admin() and author_id = auth.uid());

drop policy if exists "student_notes: admin update" on public.student_notes;
create policy "student_notes: admin update"
  on public.student_notes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "student_notes: admin delete" on public.student_notes;
create policy "student_notes: admin delete"
  on public.student_notes
  for delete
  to authenticated
  using (public.is_admin());

-- Touch updated_at on UPDATE (reuses the function from 0003).
drop trigger if exists student_notes_touch on public.student_notes;
create trigger student_notes_touch
  before update on public.student_notes
  for each row execute function public.touch_updated_at();
