import type { ReactNode } from 'react';

import { CitizenshipNavBar } from '@/navigation/CitizenshipNavBar';

export default function AuthShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col antialiased text-gray-600 bg-white">
      <CitizenshipNavBar />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
