import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { loadPracticeCatalog } from '@/citizenship/practiceCatalog';

export const metadata = {
  title: 'Danh sách đề thi',
  robots: { index: false, follow: false },
};

export default async function DashboardTestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: entitled }, catalog] = await Promise.all([
    supabase
      .from('current_access')
      .select('plan, expires_at')
      .eq('user_id', user!.id)
      .maybeSingle(),
    loadPracticeCatalog(),
  ]);

  const isEntitled = Boolean(entitled);
  const basic = catalog.filter((t) => t.difficulty === 'basic');
  const advanced = catalog.filter((t) => t.difficulty === 'advanced');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Danh sách đề thi</h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEntitled
            ? `Bạn đang có quyền truy cập ${
                entitled!.plan === 'coaching' ? 'Coaching' : 'Premium'
              } — tất cả đề đã mở khoá.`
            : 'Đề miễn phí mở sẵn. Đề Premium cần nâng cấp để làm trên tài khoản.'}
        </p>
      </div>

      <Section title="Cơ bản" tests={basic} isEntitled={isEntitled} />
      <Section title="Nâng cao" tests={advanced} isEntitled={isEntitled} />

      <div>
        <Link
          href="/dashboard"
          className="text-sm text-orange-600 hover:text-orange-800 underline"
        >
          ← Về bảng điều khiển
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  tests,
  isEntitled,
}: {
  title: string;
  tests: { id: string; title: string; tier: 'free' | 'premium' }[];
  isEntitled: boolean;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
        {title}
      </h2>
      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {tests.map((t) => {
          const unlocked = t.tier === 'free' || isEntitled;
          const href = unlocked
            ? t.tier === 'free'
              ? '/practice' // free path keeps anonymous UX
              : `/dashboard/tests/${encodeURIComponent(t.id)}`
            : `/pricing?from=${encodeURIComponent(t.id)}`;
          return (
            <li key={t.id}>
              <Link
                href={href}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50"
              >
                <span className="text-gray-900">{t.title}</span>
                <span
                  className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded border ${
                    unlocked
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {unlocked ? 'Mở' : 'Khoá'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
