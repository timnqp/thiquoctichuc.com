# Google Analytics — thiquoctichuc.com

## Env

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
```

Set in **Vercel → Project → Settings → Environment Variables → Production** (and Preview if desired), then **redeploy**. The ID is inlined at **build time**; changing env without redeploy does nothing.

Local: copy from `.env.local` (same value as production).

## Property choice

| Option | When |
|--------|------|
| **New GA4 property** + data stream for `https://thiquoctichuc.com` | Recommended — clean traffic, separate from quinstown. |
| Reuse quinstown `G-WX5L8M3HYE` | Works technically; mixes both sites in one property. Add a **second data stream** for thiquoctichuc.com in GA4 if you do this. |

## Code

- `src/analytics/GoogleAnalytics.tsx` — gtag loader (Pages `_app` + App `layout`).
- `src/analytics/GaRouteChange.tsx` — `page_view` on App Router client navigations (dashboard, auth, coaching).
- `src/citizenship/analytics.ts` — `cit_*`, `pricing_*` custom events (production + valid `G-` ID only).

## Verify production

1. View source or Network tab: `googletagmanager.com/gtag/js?id=G-…`
2. GA4 → **Reports → Realtime** while browsing `/`, `/study`, `/practice`.
3. **Engagement → Events** for `cit_landing_click`, `cit_practice_start`, etc.

Ad blockers block gtag even when the site is correct.

## Custom events (citizenship)

| Event | When |
|-------|------|
| `cit_landing_click` | Landing cards / coffee |
| `cit_lesson_view` / `cit_lesson_complete` / `cit_study_complete` | Study |
| `cit_practice_start` / `cit_practice_submit` / `cit_practice_result` | Practice |
| `cit_practice_locked_click` | Locked test → pricing |
| `pricing_view` / `upgrade_click` / `coaching_click` | Pricing / CTAs |
