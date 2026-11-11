import Script from 'next/script';

import { GA_MEASUREMENT_ID, isGaEnabled } from './gaConfig';

/**
 * Loads gtag.js once per document. Mount from Pages `_app` and App `layout`.
 */
export function GoogleAnalytics() {
  if (!isGaEnabled()) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
