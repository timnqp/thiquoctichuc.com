# Supabase migrations

Plain SQL files applied in order (filename-sorted). Each file is idempotent.

## Running

Local dev (Supabase CLI):

```bash
supabase db push          # apply new migrations to the linked project
```

Or paste the SQL into Supabase Studio → SQL Editor for a one-off.

## Milestone map

- `0001_profiles_and_access.sql` — M1: `profiles` + role, auth-signup trigger, `access_grants`, `current_access` view.
- `0002_tests_and_questions.sql` — M2: `tests`, `questions`, `is_entitled()` helper, RLS (public reads free tests; premium gated by `is_entitled()`).
- *(later)* `0003_attempts_and_progress.sql` — M5
- *(later)* `0004_student_notes_and_coaching.sql` — M4 / M6
- *(later)* `0005_audit_log.sql` — M8

## Making a user admin

After the first user signs up:

```sql
update public.profiles set role = 'admin' where id = '<auth.users.id>';
```

Or by email:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```
