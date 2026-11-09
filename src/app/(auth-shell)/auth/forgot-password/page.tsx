import type { Metadata } from 'next';
import Link from 'next/link';

import { ForgotPasswordForm } from './forgot-form';

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-medium text-gray-900">Quên mật khẩu</h1>
      <p className="mt-1 text-sm text-gray-600">
        Nhập email tài khoản của bạn. Chúng tôi sẽ gửi link đặt lại mật khẩu.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-sm text-gray-600">
        Nhớ ra mật khẩu rồi?{' '}
        <Link
          href="/auth/login"
          className="text-orange-600 hover:text-orange-800 font-medium"
        >
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}
