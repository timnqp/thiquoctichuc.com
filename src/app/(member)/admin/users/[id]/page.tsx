import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createAdminClient } from '@/lib/supabase/admin';

import { DeleteNoteButton, UserActions } from './user-actions';

export const metadata = {
  title: 'Chi tiết người dùng · Admin',
  robots: { index: false, follow: false },
};

function fmt(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('vi-VN');
  } catch {
    return d;
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(id);
  if (authErr || !authUser?.user) notFound();
  const u = authUser.user;

  const [
    { data: profile },
    { data: access },
    { data: grants },
    { data: attempts },
    { data: lessons },
    { data: notes },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('display_name, role, created_at')
      .eq('id', id)
      .maybeSingle(),
    admin
      .from('current_access')
      .select('plan, starts_at, expires_at')
      .eq('user_id', id)
      .maybeSingle(),
    admin
      .from('access_grants')
      .select('id, plan, source, starts_at, expires_at, note, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('attempts')
      .select('id, test_id, submitted_at, score, values_correct, passed')
      .eq('user_id', id)
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(20),
    admin
      .from('lesson_progress')
      .select('lesson_id, completed_at')
      .eq('user_id', id)
      .order('completed_at', { ascending: false }),
    admin
      .from('student_notes')
      .select('id, body, author_id, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-orange-600 hover:text-orange-800"
        >
          ← Danh sách người dùng
        </Link>
        <h1 className="text-2xl font-medium text-gray-900 mt-2">
          {u.email ?? u.id}
        </h1>
        <p className="text-sm text-gray-600">
          {profile?.display_name ?? '—'}
          {profile?.role === 'admin' ? ' · admin' : ''} · tạo {fmt(u.created_at)}
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Quyền hiện tại
          </div>
          {access ? (
            <>
              <div className="mt-1 text-lg font-medium text-gray-900">
                {access.plan === 'premium' ? 'Premium' : 'Coaching'}
              </div>
              <div className="text-sm text-gray-600">
                {fmt(access.starts_at)} → {fmt(access.expires_at)}
              </div>
            </>
          ) : (
            <div className="mt-1 text-gray-700">Miễn phí</div>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Hoạt động
          </div>
          <div className="mt-1 text-sm text-gray-700">
            {attempts?.length ?? 0} bài làm · {lessons?.length ?? 0} bài học xong
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Thao tác
        </h2>
        <UserActions userId={id} hasActiveAccess={Boolean(access)} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Lịch sử quyền truy cập
        </h2>
        {grants && grants.length ? (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {grants.map((g) => (
              <li key={g.id} className="px-5 py-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-900">
                    {g.plan === 'premium' ? 'Premium' : 'Coaching'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {g.source} · {fmt(g.created_at)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {fmt(g.starts_at)} → {fmt(g.expires_at)}
                </div>
                {g.note ? (
                  <div className="text-xs text-gray-500 mt-1">{g.note}</div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Chưa có.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Bài làm gần đây
        </h2>
        {attempts && attempts.length ? (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {attempts.map((a) => (
              <li key={a.id} className="px-5 py-3 text-sm flex justify-between">
                <span>
                  <span className="font-medium text-gray-900">{a.test_id}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {fmt(a.submitted_at)}
                  </span>
                </span>
                <span
                  className={a.passed ? 'text-green-700' : 'text-red-700'}
                >
                  {a.score ?? 0}% · V {a.values_correct ?? 0}/5
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Chưa có.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Ghi chú nội bộ ({notes?.length ?? 0})
        </h2>
        {notes && notes.length ? (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-gray-500">{fmt(n.created_at)}</span>
                  <DeleteNoteButton noteId={n.id} userId={id} />
                </div>
                <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                  {n.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Chưa có ghi chú.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Bài học đã xong
        </h2>
        {lessons && lessons.length ? (
          <ul className="flex flex-wrap gap-2">
            {lessons.map((l) => (
              <li
                key={l.lesson_id}
                className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-0.5"
                title={fmt(l.completed_at)}
              >
                {l.lesson_id}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Chưa có.</p>
        )}
      </section>
    </div>
  );
}
