import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '../styles/global.css';

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
    <html lang="vi">
      <body className="antialiased text-gray-800 bg-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
