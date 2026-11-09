import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next, error } = await searchParams;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-medium text-gray-900">Đăng nhập</h1>
      <p className="mt-1 text-sm text-gray-600">
        Vào tài khoản để xem tiến độ và làm thêm đề thi thử.
      </p>

      <LoginForm next={next} initialError={error} />

      <p className="mt-6 text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link
          href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-orange-600 hover:text-orange-800 font-medium"
        >
          Đăng ký miễn phí
        </Link>
      </p>
      <p className="mt-2 text-sm text-gray-600">
        <Link
          href="/auth/forgot-password"
          className="text-orange-600 hover:text-orange-800"
        >
          Quên mật khẩu?
        </Link>
      </p>
    </div>
  );
}
