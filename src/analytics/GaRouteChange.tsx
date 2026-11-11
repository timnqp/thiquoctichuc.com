'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { GA_MEASUREMENT_ID, isGaEnabled } from './gaConfig';

function GaRouteChangeInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isGaEnabled() || typeof window.gtag !== 'function') return;
    const query = searchParams?.toString() ?? '';
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

/** App Router soft navigations do not fire a full reload — send page_view manually. */
export function GaRouteChange() {
  if (!isGaEnabled()) return null;
  return (
    <Suspense fallback={null}>
      <GaRouteChangeInner />
    </Suspense>
  );
}
