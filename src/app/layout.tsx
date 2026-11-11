import type { Metadata } from 'next';
import { Dancing_Script } from 'next/font/google';
import type { ReactNode } from 'react';

import { GaRouteChange } from '@/analytics/GaRouteChange';
import { GoogleAnalytics } from '@/analytics/GoogleAnalytics';

import '../styles/global.css';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-fancy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'thiquoctichuc.com',
    template: '%s · thiquoctichuc.com',
  },
  description:
    'Tóm tắt học và đề thi thử không chính thức cho bài thi quốc tịch Úc.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={dancingScript.variable}>
      <body className="antialiased text-gray-800 bg-white min-h-screen">
        <GoogleAnalytics />
        <GaRouteChange />
        {children}
      </body>
    </html>
  );
}
