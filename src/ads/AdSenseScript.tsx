import Script from 'next/script';

import { ADSENSE_CLIENT, isAdSenseEnabled } from './config';

export const AdSenseScript = () => {
  if (!isAdSenseEnabled()) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};
