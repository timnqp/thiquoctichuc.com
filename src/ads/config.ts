/**
 * Google AdSense helpers.
 * Set NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXX in env (Vercel + local).
 * Optional: NEXT_PUBLIC_ADSENSE_SLOT=1234567890 for manual display units.
 */

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
export const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT || '';

export function isAdSenseEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    ADSENSE_CLIENT.startsWith('ca-pub-')
  );
}

/** Standalone app: every page is citizenship content. */
export function isAdSenseAllowedPath(_pathname: string): boolean {
  return true;
}
