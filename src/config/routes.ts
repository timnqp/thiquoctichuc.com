/**
 * Central route paths for this standalone app.
 * Legacy quinstowndotcom paths were `/aucitizenshiptest/*` → now thiquoctichuc.com routes below.
 */
export const routes = {
  home: '/',
  study: '/study',
  studyLesson: (id: string) => `/study/${id}`,
  practice: '/practice',
  practiceRun: '/practice/run',
  practiceResult: '/practice/result',
} as const;

/** Trailing slash matches next.config.js `trailingSlash: true`. */
export function studyLessonHref(id: string): string {
  return `${routes.studyLesson(id)}/`;
}
