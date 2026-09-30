import { AppProps } from 'next/app';
import { Dancing_Script } from 'next/font/google';

import { AdSenseScript } from '../ads/AdSenseScript';
import { LanguageProvider } from '../context/LanguageContext';

import '../styles/global.css';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-fancy',
  display: 'swap',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <LanguageProvider>
    <AdSenseScript />
    <div className={dancingScript.variable}>
      <Component {...pageProps} />
    </div>
  </LanguageProvider>
);

export default MyApp;
