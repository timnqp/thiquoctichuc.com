/** GA4 measurement ID from env (baked at build time on Vercel). */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

export function isGaEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    GA_MEASUREMENT_ID.length > 0 &&
    GA_MEASUREMENT_ID.startsWith('G-')
  );
}
