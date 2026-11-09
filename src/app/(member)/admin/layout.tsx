import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@/lib/supabase/server';

const NAV = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/coaching-requests', label: 'Coaching' },
  { href: '/admin/tests', label: 'Đề thi' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-4 text-sm border-b border-gray-200 pb-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-gray-700 hover:text-orange-600"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
