# Progress log

Running journal of what's done and what's next. **Update at the end of every work session.**

Source of truth for scope: `plan/v2-premium.md`.
Repo status: hosted on GitHub `timnqp/thiquoctichuc.com`, deployed via **Vercel** (planned — not yet linked).

---

## 2026-11-09 → 2026-11-10 (planning + M1)

### Shipped

- **Branding migration to thiquoctichuc.com** — repo name, `AppConfig`, locales, logo alt, docs. (`6953b02` initial commit on this repo)
- **Vietnamese-only app** — removed English locale, English lesson markdown, language toggle; `LanguageProvider` always Vietnamese; study pages receive a single `course` prop; `evaluateCitizenshipTest` unchanged. Study + practice build pass.
- **v2 product plan** (`plan/v2-premium.md`, `9163df3`) — premium + coaching, Supabase, App Router migration, Stripe for premium, manual bank-transfer + admin grant for coaching, hard expiry, admin-only student notes, questions in Supabase tables, email via appspa pattern. 8 milestones M1–M8.
- **M1 foundations** (`7c4ad24`) — Supabase SSR auth + hybrid Pages/App Router:
  - `@supabase/ssr` + `@supabase/supabase-js`
  - `src/lib/supabase/{client,server,admin,middleware}.ts`
  - `src/middleware.ts` — session refresh + gate `/dashboard`, `/admin`, `/account`; bounce signed-in users away from `/auth/login|signup`
  - App Router routes (Vietnamese UI):
    - `/auth/login`, `/auth/signup`, `/auth/verify` (under `(auth-shell)` layout)
    - `/auth/callback` (code exchange), `/auth/logout` (POST → sign out)
    - `/dashboard`, `/account`, `/admin` (under `(member)` layout; admin role-check in nested layout)
    - Server actions in `src/app/auth/actions.ts` — email+password sign in / sign up with translated error messages
  - Pages Router untouched for `/`, `/study`, `/study/[id]`, `/practice/*`
  - `CitizenshipNavBar` gains **“Đăng nhập”** link
  - SQL: `supabase/migrations/0001_profiles_and_access.sql` — `profiles(+role)`, `is_admin()` security-definer helper, RLS (self + admin, role column locked against self-escalation), auth-signup trigger, `access_grants`, `current_access` view
  - `.env.example` updated, `tsconfig` `@/*` alias, `.gitignore` adds `tsconfig.tsbuildinfo`
  - `AGENTS.md` updated with Supabase setup and hybrid routing map
  - Build green: 32 App Router pages + Pages Router SSG for study/practice, middleware 95 kB

### Deployment / hosting

- Target: **Vercel** (unchanged).
- Not yet linked to the Vercel project for this repo (user action).
- When linking: set env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `APP_URL=https://thiquoctichuc.com`, keep existing `NEXT_PUBLIC_GA_MEASUREMENT_ID` + AdSense vars.
- Supabase Auth → URL Configuration: Site URL = `APP_URL`; allowlist `${APP_URL}/auth/callback`.

### Decisions locked (from `plan/v2-premium.md`)

| Area | Choice |
|------|--------|
| Backend | Supabase (Postgres + Auth + RLS + Edge Functions) |
| Router | Hybrid — Pages for public SSG, App Router for auth/dashboard/admin |
| Free tests | Anonymous, first 2 basic + first 2 advanced by order in `quiz-bank.json` |
| Study lessons | All 16 free forever |
| Premium | Stripe Checkout one-off, 3 months, auto-grant via webhook |
| Coaching | Lead form → admin approves → bank transfer → admin grants 6 months |
| Expiry | Hard cut-off |
| Student notes | Admin-only |
| Questions store | Move to Supabase; one-off seeder from `quiz-bank.json`; admin CRUD later |
| Email | Reuse appspa `sendEmail` lib (Mailjet default / SES switch); defer to M7 |
| Supabase region | Sydney (`ap-southeast-2`) |

### Open items (not blocking)

- Stripe pricing numbers (AUD, GST, invoice name/ABN) — before M7
- Device limits on premium — currently unlimited, revisit if abuse
- Pre-expiry reminder email (7 days) — part of M7
- Multiple admins — single admin for now
- Password reset flow — not built yet; can patch before M2 if needed, else roll into M5
- Google OAuth as alternative sign-in — later, additive

---

## Next session — start here

### To resume

1. `cd /Users/quinnta/gh/thiquoctichuc.com`
2. `git pull && npm install` (if dependencies changed)
3. Read `plan/v2-premium.md` → §8 milestone list
4. Read this file for latest state

### Suggested next step: **M2 — Content model + seeding**

Scope (from `plan/v2-premium.md` §8 M2):

1. SQL migration `0002_tests_and_questions.sql`:
   - `tests(id text pk, title, difficulty check (basic|advanced), tier check (free|premium), sort_order, created_at)`
   - `questions(id text pk, test_id fk, topic check (values|general), part int 1–4, difficulty, question, options jsonb, correct, explain_vi, image, image_alt, sort_order)`
   - RLS: public read for `tier='free'`; authenticated read for `tier='premium'` **only if `public.is_entitled()`** (new helper); admin full access.
   - Helper `public.is_entitled(uid uuid default auth.uid())` → boolean via `current_access`.
2. Seeder `scripts/seed-quiz.ts` (Node, uses `SUPABASE_SERVICE_ROLE_KEY`):
   - Read `content/citizenship/quiz-bank.json`.
   - Sort tests as they appear in JSON; mark **first 2 basic + first 2 advanced** as `tier='free'`, rest `premium`.
   - Upsert tests then questions. Idempotent on `id`.
   - Add `npm run seed-quiz` script.
3. Rewrite `/practice` (Pages Router, SSG → ISR or server-side) to **read from Supabase**:
   - List all tests, show lock icon + "Chỉ dành cho Premium" on gated rows.
   - Clicking a gated row → `/pricing?from=<test_id>`.
   - Free tests continue to work anonymously (same UX as today).
4. Pre-render cost: if moving away from SSG is too much churn, allow `/practice` to be SSG with `revalidate` and still fetch from Supabase at build-time + hourly.
5. Keep `src/citizenship/quizBank.ts` for now (used by `/practice/run` + `/practice/result`), swap after everything reads from DB.

### Handoff prompt for the dev agent

> Read `plan/progress.md` then `plan/v2-premium.md`. Implement **M2 only**. Stop with a diff and short summary before M3. Do not touch M1 files unless strictly required. Use `@supabase/supabase-js` service-role client in `scripts/seed-quiz.ts`.

---

## 2026-11-10 (M2)

### Shipped

- **M2 content model + seeding:**
  - SQL migration `supabase/migrations/0002_tests_and_questions.sql` — `tests`, `questions`, `is_entitled(uid uuid default auth.uid())` helper, RLS. `tests` metadata is publicly readable so the practice list can render lock icons; `questions` select is gated to `tier='free'` OR `is_entitled()`. Admin has full access via `is_admin()`.
  - Seeder `scripts/seed-quiz.mjs` (`npm run seed-quiz`) — reads `content/citizenship/quiz-bank.json`, assigns `tier='free'` to the first 2 basic + first 2 advanced tests (test-1, test-2, test-8, test-9), rest `premium`. Idempotent upsert on `id`. Loads env from `.env.local` (no dotenv dep).
  - `/practice` rewritten as ISR (`revalidate: 3600`) — `getStaticProps` calls `loadPracticeCatalog()` which reads from Supabase (anon key, `select` on `tests`) and **falls back to local `quiz-bank.json`** if env is missing or the table is unseeded, so dev + current prod stay green.
  - `PracticeWelcome` now takes `tests: PracticeTestSummary[]` + `onLockedClick`. Premium rows render a lock icon + "Chỉ dành cho Premium" badge and route to `/pricing?from=<test_id>` (page itself ships in M3). "Bắt đầu với đề 1" button auto-targets the first **free** test.
  - New analytics event `cit_practice_locked_click`.
  - `src/citizenship/quizBank.ts` untouched — still powers `/practice/run` + `/practice/result` per plan.
  - Build green: `/practice` now 4.31 kB (ISR 1h), 32 App Router + Pages SSG pages, middleware 95.1 kB.

### To seed a Supabase project

1. Apply `supabase/migrations/0002_tests_and_questions.sql` (via `supabase db push` or SQL Editor).
2. Set `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. `npm run seed-quiz` — upserts 14 tests + 280 questions.
4. `/practice` picks up the DB rows on next ISR refresh (or next build).

### Next session — M3 (Pricing + CTA)

Per `plan/v2-premium.md` §8 M3:

1. `/pricing` page (Pages Router static OK) — two cards: Premium (3 months) and Coaching (6 months). Pull copy from plan.
2. Reusable `<UpgradeCta />` block — place on landing and `/practice/result`.
3. Analytics events: `pricing_view`, `upgrade_click`, `coaching_click`.
4. Accept `?from=<test_id>` on `/pricing` and stash it for return-after-purchase (M7 will consume it).

Stripe price numbers still open — leave as "Liên hệ" or TBD, do not block M3.

---

## Changelog pointers

- `6953b02` initial import (Vietnamese-only, thiquoctichuc.com branding)
- `9163df3` plan/v2-premium.md
- `7c4ad24` M1 — Supabase SSR + App Router hybrid
- *(this session)* M2 — tests/questions tables, seeder, `/practice` ISR with lock gating
