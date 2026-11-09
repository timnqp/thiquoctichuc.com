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
- `0003_coaching_and_audit.sql` — M4: `coaching_requests` (anon insert, admin read/write) + `audit_log` (admin read, admin/service_role insert). `audit_log` was originally scheduled for M8 but M4's grant action needs it.
- `0004_attempts_and_progress.sql` — M5: `attempts` + `lesson_progress`. Owner-only RLS (user CRUDs own rows; admin reads all).
- *(later)* `0005_student_notes.sql` — M6

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
