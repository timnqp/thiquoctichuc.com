import type { Metadata } from 'next';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

import { ResetPasswordForm } from './reset-form';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // The recovery link flows through /auth/callback, which exchanges the code
  // and lands here with an active session. If the session is missing (link
  // expired or opened in a different browser), send the user back to request
  // a new email.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-medium text-gray-900">
          Link đã hết hạn
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Phiên đặt lại mật khẩu không còn hoạt động. Hãy yêu cầu một email
          khôi phục mới.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-4 inline-block text-sm text-orange-600 hover:text-orange-800 font-medium"
        >
          Gửi lại email →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h1 className="text-2xl font-medium text-gray-900">Đặt lại mật khẩu</h1>
      <p className="mt-1 text-sm text-gray-600">
        Chọn mật khẩu mới cho {user.email}. Ít nhất 8 ký tự.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
