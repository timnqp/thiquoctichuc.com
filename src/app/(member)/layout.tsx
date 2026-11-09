import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@/lib/supabase/server';

import { LogoutButton } from './logout-button';

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Role is used by /admin — fetch once here so children can re-query cheaply.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-fancy text-xl text-orange-600">
            thiquoctichuc.com
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-700 hover:text-orange-600">
              Bảng điều khiển
            </Link>
            <Link href="/account" className="text-gray-700 hover:text-orange-600">
              Tài khoản
            </Link>
            {isAdmin ? (
              <Link href="/admin" className="text-gray-700 hover:text-orange-600">
                Admin
              </Link>
            ) : null}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
