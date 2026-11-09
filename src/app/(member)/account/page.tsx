import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

import { DisplayNameForm } from './display-name-form';

export const metadata = {
  title: 'Tài khoản',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role, created_at')
    .eq('id', user!.id)
    .maybeSingle();

  const { data: access } = await supabase
    .from('current_access')
    .select('plan, expires_at')
    .eq('user_id', user!.id)
    .maybeSingle();

  const { data: history } = await supabase
    .from('access_grants')
    .select('plan, source, starts_at, expires_at, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-medium text-gray-900">Tài khoản</h1>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Thông tin
        </h2>
        <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          <Row label="Email" value={user?.email ?? ''} />
          <Row
            label="Vai trò"
            value={profile?.role === 'admin' ? 'Admin' : 'Học viên'}
          />
          <Row
            label="Ngày tạo"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('vi-VN')
                : '—'
            }
          />
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Cập nhật tên hiển thị
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <DisplayNameForm initial={profile?.display_name ?? ''} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Gói hiện tại
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          {access ? (
            <div>
              <div className="text-lg font-medium text-gray-900">
                {planLabel(access.plan)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Hết hạn:{' '}
                {new Date(access.expires_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-700">Miễn phí</span>
              <Link
                href="/pricing"
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Nâng cấp →
              </Link>
            </div>
          )}
        </div>
      </section>

      {history && history.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Lịch sử quyền truy cập
          </h2>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {history.map((row, i) => (
              <li
                key={i}
                className="px-5 py-3 text-sm flex justify-between gap-3"
              >
                <span className="text-gray-900">{planLabel(row.plan)}</span>
                <span className="text-gray-500">
                  {new Date(row.starts_at).toLocaleDateString('vi-VN')} →{' '}
                  {new Date(row.expires_at).toLocaleDateString('vi-VN')}{' '}
                  <span className="text-gray-400">({row.source})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 px-5 py-3 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="col-span-2 text-gray-900">{value}</dd>
    </div>
  );
}

function planLabel(plan: string): string {
  if (plan === 'premium') return 'Premium';
  if (plan === 'coaching') return 'Coaching';
  return plan;
}
