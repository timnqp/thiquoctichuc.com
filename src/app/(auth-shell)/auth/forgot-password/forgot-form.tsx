'use client';

import { useActionState } from 'react';

import {
  requestPasswordResetAction,
  type AuthActionResult,
} from '../../../auth/actions';

type State = AuthActionResult | { ok: true } | null;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    requestPasswordResetAction,
    null
  );

  if (state?.ok) {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        Nếu email có đăng ký, chúng tôi vừa gửi link đặt lại mật khẩu. Hãy
        kiểm tra hộp thư (và thư mục spam).
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {state && !state.ok ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Đang gửi…' : 'Gửi link đặt lại'}
      </button>
    </form>
  );
}
