import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-fancy text-xl text-orange-600">
            thiquoctichuc.com
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">
            ← Về trang chủ
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
