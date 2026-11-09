# thiquoctichuc.com v2 — Premium + Coaching

**Status:** Planning locked, ready for implementation.
**Goal:** Replace the `/aucitizenshiptest` experiment on `quinstowndotcom` with the production site at `thiquoctichuc.com`, add gated premium access and a coaching lead funnel on top of the current Vietnamese study/practice app.

Read alongside:

- `plan/australian-citizenship-test.md` — original product spec and locked test rules (5/5 values + 15/20 overall, 45 min, English only).
- `AGENTS.md` — current repo architecture and sync-from-quinstowndotcom notes.

---

## 1. Decisions (locked)

| Area | Choice |
|------|--------|
| Backend | **Supabase** (Postgres + Auth + RLS + Edge Functions) |
| Router | **Migrate to App Router** for new auth/dashboard/admin; keep SSG for marketing/study where cheap |
| Free tests | Anonymous (no signup) — **first 2 basic + first 2 advanced** by order in `quiz-bank.json`; same UX as today |
| Study lessons | **All 16 lessons stay free forever** (SEO + lead magnet) |
| Premium | **Stripe Checkout** one-off, **3 months access**, auto-grant via webhook |
| Coaching | Public lead form → admin approves → **bank transfer** → admin grants **6 months access** |
| Access expiry | **Hard cut-off** at `expires_at` |
| Student notes | **Admin-only** (private coaching notes) |
| Questions store | Move to **Supabase tables**; one-off seeder from `quiz-bank.json`; admin CRUD in `/admin/questions` |
| Email | Reuse **appspa**'s provider-agnostic `sendEmail` (Mailjet default / SES via `EMAIL_PROVIDER`); defer transactional content to M7 |
| Language | **Vietnamese only** (unchanged) |

---

## 2. Open (non-blocking) items

- **Stripe pricing** (AUD amount, GST handling, invoice name/ABN) — decide before M7.
- **Multiple admins** — ship single admin; add invite flow later if needed.
- **Supabase region** — recommend **Sydney (`ap-southeast-2`)**.
- **Device limits on premium** — unlimited by default; revisit only if abuse.
- **Pre-expiry reminder email** (7 days) — add in M7 even though expiry is hard.
- **Grace period** — none for v1; grant is strictly `[starts_at, expires_at)`.
- **Signup email verification** — Supabase default (email confirm) is fine for launch.

---

## 3. Architecture

### Stack

- **Next.js 15 App Router** + React 19 + Tailwind (current stack).
- **`@supabase/ssr`** for cookies-based auth in server components / route handlers / middleware.
- **Supabase project** in `ap-southeast-2`:
  - `auth.users` + `public.profiles`
  - Business tables (see §4) with RLS enabled on every table
  - Edge Function for Stripe webhook → inserts `access_grants`
- Keep anonymous `localStorage` for free-tier progress and attempts in progress. On first login, **merge** localStorage into Supabase then clear.
- Reuse appspa's `src/lib/email/` wrapper (Mailjet/SES) for transactional mail.

### Route map

| Route | Access | Notes |
|-------|--------|-------|
| `/` | public | Landing + two cards + **pricing/CTA section** |
| `/study`, `/study/[id]` | public (SSG) | Unchanged |
| `/practice` | public | Lists all tests; **4 free unlocked**, rest locked with upgrade hint |
| `/practice/run`, `/practice/result` | public for free tests | Same UX |
| `/pricing` | public | Pricing table + FAQs + Upgrade / Coaching CTAs |
| `/coaching` | public | Lead form → `coaching_requests` + email to admin |
| `/auth/login`, `/auth/signup`, `/auth/callback` | public | Supabase Auth |
| `/account` | auth | Profile, current plan, expiry, plan history |
| `/dashboard` | auth | Overview: progress, resume, recent attempts |
| `/dashboard/tests` | auth + entitled | Full test list, filters |
| `/dashboard/tests/[id]` | auth + entitled | Premium test runner |
| `/dashboard/review` | auth | Past attempts, mistakes, drill mode |
| `/admin` | admin | KPIs, expiring soon, new coaching requests |
| `/admin/users` | admin | Search/list users by plan |
| `/admin/users/[id]` | admin | Attempts, progress, admin notes, grant/extend/revoke |
| `/admin/coaching-requests` | admin | Inbox + status + "Mark paid & grant 6 months" |
| `/admin/questions`, `/admin/tests` | admin | CRUD for content |

### Entitlement rule

A user is "entitled" at time `t` iff there exists a row in `access_grants` for that user with `starts_at <= t < expires_at`. Expose as a SQL view `public.current_access` and an RPC `public.is_entitled(uid uuid)` used by RLS policies on `questions`/`tests` and by UI guards.

---

## 4. Data model

```sql
-- Supabase manages auth.users.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create type public.plan_kind as enum ('premium','coaching');

create table public.access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan public.plan_kind not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  source text not null check (source in ('stripe','manual','coaching_signup')),
  stripe_session_id text,
  note text,
  created_at timestamptz not null default now()
);
create index on public.access_grants (user_id, expires_at desc);

create view public.current_access as
  select distinct on (user_id) user_id, plan, starts_at, expires_at
  from public.access_grants
  where now() >= starts_at and now() < expires_at
  order by user_id, expires_at desc;

create table public.tests (
  id text primary key,
  title text not null,
  difficulty text not null check (difficulty in ('basic','advanced')),
  tier text not null default 'premium' check (tier in ('free','premium')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.questions (
  id text primary key,
  test_id text not null references public.tests(id) on delete cascade,
  topic text not null check (topic in ('values','general')),
  part int not null check (part between 1 and 4),
  difficulty text not null check (difficulty in ('basic','advanced')),
  question text not null,
  options jsonb not null,            -- [{id,text}, ...]
  correct text not null,
  explain_vi text,
  image text,
  image_alt text,
  sort_order int not null default 0
);
create index on public.questions (test_id, sort_order);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id text not null references public.tests(id),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  timed_out bool not null default false,
  score int,
  values_correct int,
  passed bool,
  answers jsonb not null default '{}'::jsonb  -- {question_id: option_id}
);
create index on public.attempts (user_id, started_at desc);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade, -- about this user
  author_id uuid not null references public.profiles(id),                 -- admin
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coaching_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  timeline text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','paid','granted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);
```

### RLS sketch

- `profiles` — user `select/update` own row; admin all.
- `access_grants` — user `select` own; insert/update only via `service_role` (Edge Function) or admin.
- `tests`, `questions` — anon/public can `select` only where `tier = 'free'` or user is entitled; admin all.
- `attempts`, `lesson_progress` — user CRUD own; admin read all.
- `student_notes` — admin only (user has no select).
- `coaching_requests` — `anon` can `insert`; admin can select/update.
- `audit_log` — admin only.

---

## 5. Payments

### Premium (Stripe)

- One Stripe product **Premium (3 months)** in AUD (price TBD).
- Checkout session includes `metadata = { user_id }`.
- Supabase Edge Function `stripe-webhook`:
  - Verifies signature.
  - On `checkout.session.completed` → insert `access_grants` with `plan='premium'`, `starts_at=now()`, `expires_at=now()+interval '3 months'`, `source='stripe'`, `stripe_session_id=<id>`.
  - Idempotent on `stripe_session_id`.
  - Sends receipt email via `sendEmail`.
- Refunds: admin manually revokes via admin UI (delete or shorten `expires_at`), logged to `audit_log`.

### Coaching (manual)

- `/coaching` form → `coaching_requests` row + admin email.
- Admin reviews → clicks **Contacted** → sends bank details (email template).
- After payment arrives in bank → admin clicks **Mark paid & grant 6 months** → inserts `access_grants` with `plan='coaching'`, `expires_at=now()+interval '6 months'`, `source='coaching_signup'`.

---

## 6. UX notes

- **Free vs premium on `/practice`:** show all tests; locked ones have a padlock + "Chỉ dành cho Premium" + inline CTA. Starting a premium test when not entitled routes to `/pricing` with the test id as `?from=` for return-after-purchase.
- **CTA block** (reusable component):
  - Primary button: **Nâng cấp Premium** → `/pricing`.
  - Secondary: **Đăng ký Coaching** → `/coaching`.
  - Shown on landing, result page (after any test), and dashboard when access expired.
- **Dashboard:** 4 cards — Current plan + expiry, Attempts this week, Pass rate, Weakest Part. Resume-last-attempt link.
- **Expired state:** hard cut-off. Dashboard shows a "Access ended on <date>" banner + re-upgrade CTA. Past attempts remain visible.
- **Account merge on login:** on first authenticated page load, read `citizenship:*` localStorage, upsert into Supabase, then clear.

---

## 7. Content migration

- One-off TS script `scripts/seed-quiz.ts`:
  1. Read `content/citizenship/quiz-bank.json`.
  2. For each test: upsert into `tests` with `sort_order`, and `tier = 'free'` iff it's the **first 2 basic** or **first 2 advanced** by position; otherwise `premium`.
  3. For each question: upsert into `questions` preserving `id`, `topic`, `part`, `difficulty`, `question`, `options`, `correct`, `explain_vi`, image fields.
  4. Idempotent — safe to re-run.
- After seed, the Pages-Router `/practice` reads from Supabase (anon key, only `tier='free'` visible). Premium tests come from `/dashboard/tests` with the authenticated client.
- `quiz-bank.json` stays in repo as a dev-friendly source of truth until the admin editor is stable; then it becomes a historical seed only.

---

## 8. Milestones

> Each milestone ends with a diff review before the next starts.

### M1 — Foundations
- Migrate to App Router (or hybrid: App Router for `/auth`, `/account`, `/dashboard`, `/admin`; keep Pages for the rest if the churn is too big).
- Add `@supabase/ssr` client, server, and middleware helpers.
- Create Supabase project (Sydney), set `.env.example`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- SQL migrations for `profiles`, `role`, RLS, auth trigger that creates a `profiles` row on signup.
- Build login / signup / logout / callback routes.
- Gated `/dashboard` and `/admin` shells (role check via `profiles.role`).

### M2 — Content model + seeding
- SQL migrations for `tests`, `questions`.
- `scripts/seed-quiz.ts` import.
- Rewrite `/practice` to read from Supabase.
- Lock icon + upgrade CTA on premium rows.
- Keep anon attempts in `localStorage` (unchanged flow for free tests).

### M3 — Pricing + CTA
- `/pricing` page (two cards: Premium / Coaching).
- Reusable `<UpgradeCta />` block on landing and `/practice/result`.
- Analytics events: `pricing_view`, `upgrade_click`, `coaching_click`.

### M4 — Coaching lead flow
- `/coaching` form + server action → `coaching_requests` insert.
- Email to admin via `sendEmail` (placeholder template for now).
- `/admin/coaching-requests` inbox: list + status transitions (new → contacted → paid → granted).
- "Mark paid & grant 6 months" action inserts `access_grants` and logs to `audit_log`.

### M5 — Member portal
- `/account` (profile, display name, current plan with expiry).
- `/dashboard` overview + attempts list.
- Premium test runner `/dashboard/tests/[id]` (same UX as `/practice/run`, writes `attempts` to DB).
- localStorage→DB merge on first authenticated page load.

### M6 — Admin portal
- `/admin` KPI tiles: signups 7d/30d, active premium count, access expiring in 7 days, coaching requests pending.
- `/admin/users` list + filters.
- `/admin/users/[id]` detail: attempts, lesson progress, **admin-only notes** editor, grant / extend / revoke buttons.
- `/admin/questions` and `/admin/tests` CRUD.

### M7 — Payments + emails
- Stripe products (Premium 3 months).
- Checkout session route handler.
- Supabase Edge Function `stripe-webhook` with signature verify + idempotency.
- Port `src/lib/email/` from appspa; env wiring; templates:
  - welcome (post-signup)
  - access granted (premium or coaching)
  - access expiring in 7 days
  - coaching request received (to user) + admin notification
- `expires_at` → cron / scheduled Edge Function to send "expires in 7 days" nightly (hard cut-off still applies, this is informational).

### M8 — Polish
- `noindex` + `robots` for `/dashboard/*`, `/admin/*`.
- Privacy and Terms pages.
- Rate limits on `/coaching` and `/auth/signup` (Supabase + simple IP-based throttle).
- `audit_log` entries for grants, revokes, status changes.
- Error monitoring, basic performance pass.

---

## 9. Handoff to dev agent

Copy this to the agent's prompt:

> Read `plan/v2-premium.md`. Implement **M1** only. Stop with a diff and a short summary before touching M2. Do not change existing study/practice markdown or the quiz JSON structure yet. Supabase credentials will be provided via env; use `.env.example` for placeholders.

Each subsequent milestone should be opened in its own prompt: *"Now do M<n> per `plan/v2-premium.md`. Stop before M<n+1>."*
