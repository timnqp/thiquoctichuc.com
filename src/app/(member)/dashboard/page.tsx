import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Bảng điều khiển',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Access info — view may not exist yet (M1 ships schema but not seeded data).
  const { data: access } = await supabase
    .from('current_access')
    .select('plan, expires_at')
    .eq('user_id', user!.id)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-medium text-gray-900">
          Xin chào{user?.email ? `, ${user.email}` : ''}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Bảng điều khiển học viên. Các tính năng cao cấp sẽ mở khi bạn nâng cấp Premium.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <p className="text-xs uppercase tracking-wide text-gray-500">Gói hiện tại</p>
          <p className="mt-2 text-lg font-medium text-gray-900">
            {access?.plan ? planLabel(access.plan) : 'Miễn phí'}
          </p>
          {access?.expires_at ? (
            <p className="mt-1 text-xs text-gray-500">
              Hết hạn: {new Date(access.expires_at).toLocaleDateString('vi-VN')}
            </p>
          ) : (
            <Link
              href="/pricing"
              className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              Nâng cấp Premium →
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <p className="text-xs uppercase tracking-wide text-gray-500">Đề thi thử</p>
          <p className="mt-2 text-lg font-medium text-gray-900">Sắp có</p>
          <p className="mt-1 text-xs text-gray-500">
            Danh sách đề và tiến độ sẽ hiện ở đây.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <p className="text-xs uppercase tracking-wide text-gray-500">Bài học</p>
          <p className="mt-2 text-lg font-medium text-gray-900">16 bài miễn phí</p>
          <Link
            href="/study"
            className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Mở trang bài học →
          </Link>
        </div>
      </section>
    </div>
  );
}

function planLabel(plan: string): string {
  if (plan === 'premium') return 'Premium';
  if (plan === 'coaching') return 'Coaching';
  return plan;
}
