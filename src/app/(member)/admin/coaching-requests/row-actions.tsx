'use client';

import { useState, useTransition } from 'react';

import {
  attachUserByEmail,
  grantCoachingAccess,
  updateCoachingStatus,
} from './actions';

type RowActionsProps = {
  id: string;
  status: 'new' | 'contacted' | 'paid' | 'granted' | 'declined';
  hasUser: boolean;
  defaultEmail: string;
};

export function RowActions({ id, status, hasUser, defaultEmail }: RowActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [attachEmail, setAttachEmail] = useState(defaultEmail);

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-2">
        {status === 'new' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => updateCoachingStatus(id, 'contacted'))}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            Đánh dấu đã liên hệ
          </button>
        ) : null}

        {status === 'contacted' ? (
          <button
            type="button"
            disabled={pending || !hasUser}
            title={hasUser ? '' : 'Cần gắn tài khoản trước'}
            onClick={() => run(() => grantCoachingAccess(id))}
            className="px-3 py-1 rounded border border-green-300 bg-green-50 text-green-900 hover:bg-green-100 disabled:opacity-60"
          >
            Đã thanh toán — cấp 6 tháng
          </button>
        ) : null}

        {status !== 'granted' && status !== 'declined' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => updateCoachingStatus(id, 'declined'))}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-60"
          >
            Từ chối
          </button>
        ) : null}

        {status === 'declined' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => updateCoachingStatus(id, 'new'))}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            Mở lại
          </button>
        ) : null}
      </div>

      {!hasUser && status !== 'granted' && status !== 'declined' ? (
        <div className="flex flex-wrap gap-2 items-center pt-1">
          <input
            type="email"
            value={attachEmail}
            onChange={(e) => setAttachEmail(e.target.value)}
            placeholder="email tài khoản"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            type="button"
            disabled={pending || !attachEmail}
            onClick={() => run(() => attachUserByEmail(id, attachEmail))}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            Gắn tài khoản
          </button>
        </div>
      ) : null}

      {error ? <div className="text-red-700 text-xs">{error}</div> : null}
    </div>
  );
}
