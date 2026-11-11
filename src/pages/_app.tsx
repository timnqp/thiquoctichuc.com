import { AppProps } from 'next/app';
import { Dancing_Script } from 'next/font/google';

import { GoogleAnalytics } from '../analytics/GoogleAnalytics';
import { AdSenseScript } from '../ads/AdSenseScript';
import { LanguageProvider } from '../context/LanguageContext';

import '../styles/global.css';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-fancy',
  display: 'swap',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <LanguageProvider>
    <GoogleAnalytics />
    <AdSenseScript />
    <div className={dancingScript.variable}>
      <Component {...pageProps} />
    </div>
  </LanguageProvider>
);

export default MyApp;
