import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

import {
  ADSENSE_CLIENT,
  ADSENSE_SLOT,
  isAdSenseAllowedPath,
  isAdSenseEnabled,
} from './config';

type AdUnitProps = {
  /** Override slot; defaults to NEXT_PUBLIC_ADSENSE_SLOT */
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Manual display unit. Renders only on citizenship routes when a slot id is set.
 */
export const AdUnit = ({
  slot = ADSENSE_SLOT,
  format = 'auto',
  className = '',
}: AdUnitProps) => {
  const router = useRouter();
  const pushed = useRef(false);
  const allowed =
    isAdSenseEnabled() &&
    isAdSenseAllowedPath(router.pathname) &&
    Boolean(slot);

  useEffect(() => {
    if (!allowed || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blocker or script not ready
    }
  }, [allowed, slot]);

  if (!allowed) return null;

  return (
    <div className={`adsense-wrap overflow-hidden ${className}`.trim()}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

/** Shared banner used on citizenship landing / study / practice welcome & result. */
export const CitizenshipAdBanner = ({ className = 'my-8' }: { className?: string }) => (
  <AdUnit className={className} format="auto" />
);
