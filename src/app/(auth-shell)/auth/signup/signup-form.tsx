'use client';

import { useActionState } from 'react';

import { signUpAction, type AuthActionResult } from '../../../auth/actions';

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthActionResult | null, FormData>(
    signUpAction,
    null
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? '/dashboard'} />

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
          Tên hiển thị (tuỳ chọn)
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          autoComplete="name"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <p className="mt-1 text-xs text-gray-500">Ít nhất 8 ký tự.</p>
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
        {pending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </button>
    </form>
  );
}
