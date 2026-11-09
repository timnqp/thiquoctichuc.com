import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

import { LocalMerge } from './local-merge';

export const metadata = {
  title: 'Bảng điều khiển',
  robots: { index: false, follow: false },
};

type AttemptRow = {
  id: string;
  test_id: string;
  submitted_at: string | null;
  score: number | null;
  values_correct: number | null;
  passed: boolean | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: access }, { data: attempts }, { data: lessonsDone }] =
    await Promise.all([
      supabase
        .from('current_access')
        .select('plan, expires_at')
        .eq('user_id', user!.id)
        .maybeSingle(),
      supabase
        .from('attempts')
        .select('id, test_id, submitted_at, score, values_correct, passed')
        .eq('user_id', user!.id)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(10),
      supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user!.id),
    ]);

  const rows = (attempts ?? []) as AttemptRow[];
  const passCount = rows.filter((r) => r.passed).length;
  const passRate = rows.length
    ? Math.round((passCount / rows.length) * 100)
    : null;

  return (
    <div className="space-y-8">
      <LocalMerge />

      <section>
        <h1 className="text-2xl font-medium text-gray-900">
          Xin chào{user?.email ? `, ${user.email}` : ''}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Bảng điều khiển học viên — theo dõi tiến độ và quyền truy cập của bạn.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Gói hiện tại
          </p>
          <p className="mt-2 text-lg font-medium text-gray-900">
            {access?.plan ? planLabel(access.plan) : 'Miễn phí'}
          </p>
          {access?.expires_at ? (
            <p className="mt-1 text-xs text-gray-500">
              Hết hạn:{' '}
              {new Date(access.expires_at).toLocaleDateString('vi-VN')}
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
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Bài làm
          </p>
          <p className="mt-2 text-lg font-medium text-gray-900">
            {rows.length} lần
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {passRate === null
              ? 'Chưa có dữ liệu'
              : `Tỉ lệ đậu: ${passRate}%`}
          </p>
          <Link
            href="/dashboard/tests"
            className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Danh sách đề →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Bài học đã xong
          </p>
          <p className="mt-2 text-lg font-medium text-gray-900">
            {lessonsDone?.length ?? 0} / 16
          </p>
          <Link
            href="/study"
            className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Mở trang bài học →
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Bài làm gần đây
        </h2>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Chưa có bài làm nào.{' '}
            <Link href="/practice" className="text-orange-600 underline">
              Thử một đề miễn phí
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {rows.map((r) => (
              <li
                key={r.id}
                className="px-5 py-3 text-sm flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-gray-900">{r.test_id}</div>
                  <div className="text-xs text-gray-500">
                    {r.submitted_at
                      ? new Date(r.submitted_at).toLocaleString('vi-VN')
                      : '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${
                      r.passed ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {r.score ?? 0}%{r.passed ? ' · Đậu' : ' · Rớt'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Values: {r.values_correct ?? 0}/5
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function planLabel(plan: string): string {
  if (plan === 'premium') return 'Premium';
  if (plan === 'coaching') return 'Coaching';
  return plan;
}
