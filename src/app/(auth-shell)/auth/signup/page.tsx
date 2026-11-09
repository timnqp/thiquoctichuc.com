import type { Metadata } from 'next';
import Link from 'next/link';

import { SignUpForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Đăng ký',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

export default async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-medium text-gray-900">Đăng ký</h1>
      <p className="mt-1 text-sm text-gray-600">
        Tạo tài khoản miễn phí để lưu tiến độ và mở khoá đề nâng cao sau khi nâng cấp.
      </p>

      <SignUpForm next={next} />

      <p className="mt-6 text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link
          href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-orange-600 hover:text-orange-800 font-medium"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
