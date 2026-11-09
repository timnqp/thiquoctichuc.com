import { createAdminClient } from '@/lib/supabase/admin';

import { TierToggle } from './tier-toggle';

export const metadata = {
  title: 'Đề thi · Admin',
  robots: { index: false, follow: false },
};

export default async function AdminTestsPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('tests')
    .select('id, title, difficulty, tier, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Không tải được danh sách: {error.message}
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Đề thi</h1>
        <p className="text-sm text-gray-600 mt-1">
          {rows.length} đề. Chuyển một đề giữa Miễn phí / Premium để điều chỉnh gating.
          Tạo / xoá đề và chỉnh sửa câu hỏi sẽ dùng `scripts/seed-quiz.mjs` cho đến khi
          editor nội dung được xây dựng.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Chưa có đề nào trong database. Chạy{' '}
          <code className="bg-gray-100 px-1">npm run seed-quiz</code> để nạp dữ liệu.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {rows.map((t) => (
            <li
              key={t.id}
              className="px-5 py-3 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-xs text-gray-500">
                  {t.id} · {t.difficulty === 'basic' ? 'Cơ bản' : 'Nâng cao'}
                </div>
              </div>
              <TierToggle testId={t.id} initial={t.tier as 'free' | 'premium'} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
