import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Xác minh email',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ email?: string }>;

export default async function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-medium text-gray-900">Kiểm tra email</h1>
      <p className="mt-3 text-sm text-gray-700">
        Chúng tôi đã gửi liên kết xác minh tới{' '}
        <span className="font-medium">{email ?? 'email của bạn'}</span>. Mở email và bấm vào
        liên kết để hoàn tất đăng ký.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Không thấy email? Kiểm tra thư mục spam hoặc{' '}
        <Link href="/auth/signup" className="text-orange-600 hover:text-orange-800 font-medium">
          đăng ký lại
        </Link>
        .
      </p>
    </div>
  );
}
