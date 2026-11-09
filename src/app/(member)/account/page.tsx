import { createClient } from '@/lib/supabase/server';

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

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-medium text-gray-900">Tài khoản</h1>

      <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        <Row label="Email" value={user?.email ?? ''} />
        <Row label="Tên hiển thị" value={profile?.display_name ?? '—'} />
        <Row label="Vai trò" value={profile?.role === 'admin' ? 'Admin' : 'Học viên'} />
        <Row
          label="Ngày tạo"
          value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('vi-VN')
              : '—'
          }
        />
      </dl>

      <p className="text-xs text-gray-500">
        Sửa thông tin cá nhân và đổi mật khẩu sẽ có ở bản sau.
      </p>
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
