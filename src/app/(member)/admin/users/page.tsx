import Link from 'next/link';

import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = {
  title: 'Người dùng · Admin',
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

type Row = {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'admin';
  plan: 'premium' | 'coaching' | null;
  expires_at: string | null;
  created_at: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const { q = '', filter = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim().toLowerCase();

  const admin = createAdminClient();

  // auth.admin.listUsers for emails + created_at, cross-ref profiles + current_access.
  const { data: usersPage, error } = await admin.auth.admin.listUsers({
    page,
    perPage: PAGE_SIZE,
  });
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Không tải được danh sách: {error.message}
      </div>
    );
  }

  const ids = usersPage.users.map((u) => u.id);
  const [{ data: profiles }, { data: accessRows }] = await Promise.all([
    ids.length
      ? admin.from('profiles').select('id, display_name, role').in('id', ids)
      : Promise.resolve({ data: [] as any[] }),
    ids.length
      ? admin
          .from('current_access')
          .select('user_id, plan, expires_at')
          .in('user_id', ids)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const profById = new Map<string, { display_name: string | null; role: 'user' | 'admin' }>();
  for (const p of profiles ?? []) profById.set(p.id, p);
  const accessById = new Map<string, { plan: 'premium' | 'coaching'; expires_at: string }>();
  for (const a of accessRows ?? []) accessById.set(a.user_id, a);

  const nowIso = new Date().toISOString();
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);

  let rows: Row[] = usersPage.users.map((u) => {
    const prof = profById.get(u.id);
    const acc = accessById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? '(no email)',
      display_name: prof?.display_name ?? null,
      role: prof?.role ?? 'user',
      plan: acc?.plan ?? null,
      expires_at: acc?.expires_at ?? null,
      created_at: u.created_at ?? '',
    };
  });

  if (query) {
    rows = rows.filter(
      (r) =>
        r.email.toLowerCase().includes(query) ||
        (r.display_name ?? '').toLowerCase().includes(query)
    );
  }
  if (filter === 'premium') rows = rows.filter((r) => r.plan === 'premium');
  else if (filter === 'coaching') rows = rows.filter((r) => r.plan === 'coaching');
  else if (filter === 'expiring') {
    rows = rows.filter(
      (r) => r.expires_at && r.expires_at > nowIso && r.expires_at <= in7.toISOString()
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Người dùng</h1>
        <p className="text-sm text-gray-600 mt-1">
          Trang {page} · hiển thị {rows.length} / {usersPage.users.length} trong batch (tối đa {PAGE_SIZE}).
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2 text-sm" action="/admin/users">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Tìm theo email hoặc tên…"
          className="border border-gray-300 rounded px-3 py-1.5 flex-1 min-w-[200px]"
        />
        <select
          name="filter"
          defaultValue={filter}
          className="border border-gray-300 rounded px-2 py-1.5"
        >
          <option value="">Tất cả</option>
          <option value="premium">Premium đang hoạt động</option>
          <option value="coaching">Coaching đang hoạt động</option>
          <option value="expiring">Hết hạn trong 7 ngày</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-700"
        >
          Lọc
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Không có người dùng khớp.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/users/${r.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{r.email}</div>
                  <div className="text-xs text-gray-500">
                    {r.display_name ?? '—'}
                    {r.role === 'admin' ? ' · admin' : ''}
                    {r.created_at
                      ? ` · ${new Date(r.created_at).toLocaleDateString('vi-VN')}`
                      : ''}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {r.plan ? (
                    <>
                      <div className="text-gray-900">{planLabel(r.plan)}</div>
                      <div className="text-xs text-gray-500">
                        hết{' '}
                        {r.expires_at
                          ? new Date(r.expires_at).toLocaleDateString('vi-VN')
                          : '—'}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">Miễn phí</div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 text-sm">
        {page > 1 ? (
          <Link
            href={buildHref({ q, filter, page: page - 1 })}
            className="text-orange-600 underline"
          >
            ← Trang trước
          </Link>
        ) : null}
        {usersPage.users.length === PAGE_SIZE ? (
          <Link
            href={buildHref({ q, filter, page: page + 1 })}
            className="text-orange-600 underline"
          >
            Trang sau →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function buildHref({
  q,
  filter,
  page,
}: {
  q: string;
  filter: string;
  page: number;
}): string {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (filter) params.set('filter', filter);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : '/admin/users';
}

function planLabel(plan: 'premium' | 'coaching'): string {
  return plan === 'premium' ? 'Premium' : 'Coaching';
}
