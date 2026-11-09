import Link from 'next/link';

import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = {
  title: 'Admin · Tổng quan',
  robots: { index: false, follow: false },
};

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
};

function KpiCard({ label, value, hint, href }: KpiCardProps) {
  const inner = (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:border-orange-300">
      {inner}
    </Link>
  ) : (
    inner
  );
}

async function loadKpis() {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const d7 = new Date();
  d7.setDate(d7.getDate() - 7);
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);

  const [
    signups7,
    signups30,
    activePremium,
    activeCoaching,
    expiringSoon,
    coachingPending,
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', d7.toISOString()),
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', d30.toISOString()),
    admin
      .from('current_access')
      .select('user_id', { count: 'exact', head: true })
      .eq('plan', 'premium'),
    admin
      .from('current_access')
      .select('user_id', { count: 'exact', head: true })
      .eq('plan', 'coaching'),
    admin
      .from('access_grants')
      .select('id', { count: 'exact', head: true })
      .gt('expires_at', nowIso)
      .lte('expires_at', in7.toISOString()),
    admin
      .from('coaching_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'contacted']),
  ]);

  return {
    signups7: signups7.count ?? 0,
    signups30: signups30.count ?? 0,
    activePremium: activePremium.count ?? 0,
    activeCoaching: activeCoaching.count ?? 0,
    expiringSoon: expiringSoon.count ?? 0,
    coachingPending: coachingPending.count ?? 0,
  };
}

export default async function AdminHome() {
  let kpis: Awaited<ReturnType<typeof loadKpis>>;
  try {
    kpis = await loadKpis();
  } catch (err) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-medium text-gray-900">Admin</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được số liệu:{' '}
          {err instanceof Error ? err.message : String(err)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-600 mt-1">
          Thống kê nhanh. Dữ liệu được đọc trực tiếp từ Supabase bằng service-role.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Đăng ký (7 ngày)" value={kpis.signups7} href="/admin/users" />
        <KpiCard label="Đăng ký (30 ngày)" value={kpis.signups30} href="/admin/users" />
        <KpiCard
          label="Premium đang hoạt động"
          value={kpis.activePremium}
          href="/admin/users?filter=premium"
        />
        <KpiCard
          label="Coaching đang hoạt động"
          value={kpis.activeCoaching}
          href="/admin/users?filter=coaching"
        />
        <KpiCard
          label="Sắp hết hạn trong 7 ngày"
          value={kpis.expiringSoon}
          href="/admin/users?filter=expiring"
        />
        <KpiCard
          label="Coaching chờ xử lý"
          value={kpis.coachingPending}
          hint="trạng thái: Mới hoặc Đã liên hệ"
          href="/admin/coaching-requests"
        />
      </section>
    </div>
  );
}
