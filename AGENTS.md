# thiquoctichuc.com — agent handoff

Standalone Next.js app for **https://thiquoctichuc.com** — unofficial Australian citizenship study and practice (**Vietnamese only**). Extracted from `quinstowndotcom` (`/aucitizenshiptest/*`). This repo is the source of truth for the dedicated site. The main site can later redirect to this deployment.

## Quick start

```bash
cd thiquoctichuc.com
npm install
npm run dev    # http://localhost:3000
npm run build
```

## Route map

| thiquoctichuc.com | Was on quinstowndotcom |
|-------------------|-------------------------|
| `/` | `/aucitizenshiptest` |
| `/study` | `/aucitizenshiptest/study` |
| `/study/[id]` | `/aucitizenshiptest/study/[id]` |
| `/practice` | `/aucitizenshiptest/practice` |
| `/practice/run` | `/aucitizenshiptest/practice/run` |
| `/practice/result` | `/aucitizenshiptest/practice/result` |

Central path constants: `src/config/routes.ts`. Prefer `routes.*` and `studyLessonHref()` over hardcoded URLs.

## Architecture

```
content/citizenship/          Lesson markdown (vi only) + quiz-bank.json
public/citizenship/flags/     Flag SVGs for lessons + quiz
src/citizenship/              Feature logic (quiz, progress, practice UI)
src/course/                   InfoView + CourseSidebar + types (study player)
src/pages/                    Next.js routes (landing, study, practice)
src/locales/                  Vietnamese UI strings (`vi.ts` only)
src/ads/                      AdSense script + CitizenshipAdBanner
src/navigation/               CitizenshipNavBar (no blog/courses/auth)
```

**No** next-auth, MongoDB, or paid courses — public static study + client-side practice only.

### Study flow

- `loadStudyCourse()` reads `content/citizenship/lessons/vi/*.md` at build time → `getStaticProps` on study pages.
- Progress: `useLocalProgress.ts` → `localStorage` keys `citizenship:study`, etc.
- Lesson UI: `InfoView` renders markdown; lessons `2d` and `6` inject `CitizenshipFlags`.

### Practice flow

- `quizBank.ts` imports `content/citizenship/quiz-bank.json` (14 tests).
- Welcome → `startAttempt` → `/practice/run` → submit → `/practice/result`.
- Scoring: `evaluateCitizenshipTest.ts` (75% overall + values questions rule).

### Analytics

- `src/citizenship/analytics.ts` → `gtag` events (`cit_*`) in production only.
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in env (use a **new** GA4 property for thiquoctichuc.com).

### Ads

- `NEXT_PUBLIC_ADSENSE_CLIENT` + optional `NEXT_PUBLIC_ADSENSE_SLOT`.
- `public/ads.txt` must match publisher on thiquoctichuc.com after deploy.

## Syncing from quinstowndotcom

When content or copy changes on the main site submodule:

1. **Lessons / quiz:** copy `quinstowndotcom/content/citizenship/` → `content/citizenship/`.
2. **Flags:** copy `quinstowndotcom/public/citizenship/`.
3. **Feature code:** diff `quinstowndotcom/src/citizenship/` and `src/course/{InfoView,CourseSidebar,types}.tsx`; merge manually (URLs here use `routes.ts`).
4. **Translations:** from this folder run `npm run sync-locales` (writes `src/locales/vi.ts` from `../quinstowndotcom/src/locales/vi.ts`). Re-apply thiquoctichuc.com overrides (`site_name`, `site_title`, `cit_loading`, etc.) if needed.

Plan doc (product spec): `plan/australian-citizenship-test.md` (includes historical quinstowndotcom nav notes).

## Launch checklist

1. Vercel project rooted at this repo; custom domain **thiquoctichuc.com**.
2. Env: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, AdSense vars.
3. Replace `public/assets/icons/logo.png` and favicons for the brand.
4. SEO defaults: `src/config/appConfig.ts` and `src/locales/*` (`site_name`, `site_title`).
5. Deploy and verify all static paths build (study lesson IDs from `STUDY_ITEM_IDS`).

## Redirect from quinstowndotcom (later)

On `quinstowndotcom`, replace citizenship pages with 308 redirects to thiquoctichuc.com, e.g.:

- `/aucitizenshiptest` → `https://thiquoctichuc.com/`
- `/aucitizenshiptest/study` → `https://thiquoctichuc.com/study`
- (map each path using the table above)

Or use Vercel redirects in `quinstowndotcom/next.config.js`. Keep old URLs working until search/console updates.

## Scripts

- `scripts/test-citizenship-scorer.py` — validate quiz scoring against JSON bank.
- `scripts/generate-locales.mjs` — `npm run sync-locales`.
