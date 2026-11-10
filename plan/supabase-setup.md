# Supabase setup — micro steps (thiquoctichuc.com)

Use this checklist the **first time** you connect a real Supabase project.  
Repo code is at **M6**; without Supabase, auth/practice-from-DB/admin features fall back or stay empty.

**Region:** `ap-southeast-2` (Sydney).

---

## Phase A — Create the project (5–10 min)

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**.
3. **Organization:** pick or create one (e.g. personal).
4. **Name:** `thiquoctichuc` (any name is fine).
5. **Database password:** generate a strong password → **save it in a password manager** (needed for `DATABASE_URL` / CLI).
6. **Region:** **Asia Pacific (Sydney) ap-southeast-2**.
7. Click **Create new project** → wait until status is **Active** (1–2 minutes).

---

## Phase B — Copy API keys into `.env.local` (3 min)

1. In the project: **Project Settings** (gear, bottom left) → **API**.
2. On your machine:

   ```bash
   cd /path/to/thiquoctichuc.com
   cp .env.example .env.local
   ```

3. Fill these in `.env.local`:

   | Variable | Where in Supabase | Notes |
   |----------|-------------------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | API → **Project URL** | e.g. `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API → **anon** `public` | Safe in browser |
   | `SUPABASE_SERVICE_ROLE_KEY` | API → **service_role** `secret` | **Never** commit; server/scripts only |
   | `APP_URL` | — | Local: `http://localhost:3000` (no trailing slash) |

4. Save `.env.local` (already gitignored).

---

## Phase C — Auth URL settings (2 min)

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:**
   - Local only first: `http://localhost:3000`
   - After Vercel: change to `https://thiquoctichuc.com`
3. **Redirect URLs** — click **Add URL** for each:

   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

   Later add production:

   ```
   https://thiquoctichuc.com/auth/callback
   https://thiquoctichuc.com/**
   ```

4. **Authentication** → **Providers** → **Email**:
   - **Enable Email provider** = ON.
   - For faster local testing: **Confirm email** = OFF (signup goes straight to dashboard).
   - For production: turn **Confirm email** ON → users hit `/auth/verify` until they click the link.

---

## Phase D — Run database migrations (10–15 min)

You need tables from `0001` … `0005` in order.

### Option 1 — SQL Editor (no CLI) — recommended first time

For each file in `supabase/migrations/`, in **filename order**:

1. Open the file locally (e.g. `0001_profiles_and_access.sql`).
2. Supabase → **SQL** → **New query**.
3. Paste **entire file** → **Run**.
4. Confirm success (green, no error).
5. Repeat for:
   - `0002_tests_and_questions.sql`
   - `0003_coaching_and_audit.sql`
   - `0004_attempts_and_progress.sql`
   - `0005_student_notes.sql`

**Verify:**

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

You should see at least: `access_grants`, `attempts`, `audit_log`, `coaching_requests`, `lesson_progress`, `profiles`, `questions`, `student_notes`, `tests`.

### Option 2 — Supabase CLI

1. Install CLI: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. `supabase login`
3. `supabase link --project-ref YOUR_PROJECT_REF`  
   (Project ref is in **Settings → General → Reference ID**)
4. Add to `.env.local`:

   Paste the **exact** URI from **Settings → Database → Connection string → URI (Session mode)**.

   **Important:** use the **pooler** host (`*.pooler.supabase.com`), not `db.*.supabase.co` (often IPv6-only and fails from some networks). Newer projects may use `aws-1-<region>` not `aws-0-<region>` — copy from the dashboard, do not guess the region.

   Example shape (your host may differ):

   ```
   postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
   ```
5. From repo root:

   ```bash
   supabase db push
   ```

---

## Phase E — Seed quiz content (2 min)

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

```bash
npm run seed-quiz
```

Expect: **14 tests**, **280 questions** (numbers may vary if JSON changes).  
Free tier in DB: first **2 basic** + first **2 advanced** tests (`test-1`, `test-2`, `test-8`, `test-9` per current seeder).

**Verify in SQL Editor:**

```sql
select id, title, difficulty, tier from public.tests order by sort_order;
```

---

## Phase F — Smoke test locally (5 min)

```bash
npm run dev
```

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `http://localhost:3000/practice` | List shows locks on premium tests (after ISR; refresh or wait if cached) |
| 2 | Start a free test | Same UX as before |
| 3 | `/auth/signup` | Create account |
| 4 | Table Editor → `profiles` | One row, `role = user` |
| 5 | `/dashboard`, `/account` | Load while logged in |
| 6 | `/admin` | Redirect to `/dashboard` (not admin yet) |

---

## Phase G — Make yourself admin (1 min)

**SQL Editor:**

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'YOUR_EMAIL@example.com'
);
```

Refresh → visit `/admin` → KPIs and menus should load.

Optional: grant yourself premium for testing (manual, 3 months):

```sql
insert into public.access_grants (user_id, plan, expires_at, source, note)
select
  id,
  'premium',
  now() + interval '3 months',
  'manual',
  'dev smoke test'
from public.profiles
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

Check `/dashboard` — plan should show Premium + expiry.

---

## Phase H — Vercel (when you deploy)

1. Vercel project → **Settings → Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (sensitive)
   - `APP_URL` = `https://thiquoctichuc.com`
2. Redeploy.
3. Supabase **URL Configuration**:
   - Site URL = `https://thiquoctichuc.com`
   - Add redirect URLs for prod (Phase C).
4. Run seed against production only if DB is empty (same `npm run seed-quiz` with prod keys locally — do not commit prod service role).

---

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| Signup works but no `profiles` row | Re-run `0001` (trigger `on_auth_user_created`) |
| `/practice` still JSON-only | Missing anon key or empty `tests` → run seed |
| "Invalid API key" | Wrong anon key or typo in `.env.local`; restart `npm run dev` |
| OAuth/email link goes to wrong host | Fix Site URL + redirect allowlist; `APP_URL` must match |
| Admin pages 403 / redirect | Run admin SQL; confirm `profiles.role = admin` |
| RLS errors in dashboard | Migrations 0002–0005 not all applied |

---

## Agent access (Cursor runs SQL for you)

Once `.env.local` exists on your machine with **`DATABASE_URL`** (and keys for the app/seed), the agent can:

| Command | What it does |
|---------|----------------|
| `npm run db:migrate` | Apply all pending files in `supabase/migrations/` |
| `npm run db:sql -- "…"` | Run a one-off query |
| `npm run db:sql -- --file path.sql` | Run a SQL file (e.g. under `supabase/adhoc/`) |
| `npm run seed-quiz` | Upsert tests/questions from JSON |

You create the Supabase project and paste secrets into `.env.local` **once**; do not paste passwords in chat. Tell the agent: *“`.env.local` is ready — run migrations and seed.”*

See also `AGENTS.md` → **Agent: run Supabase SQL from the repo**.

---

## What’s next after setup

- **M7:** Stripe (premium) + email (Mailjet/SES) — see `plan/progress.md`.
- Coaching remains **bank transfer + admin grant** (already in `/admin/coaching-requests`).
