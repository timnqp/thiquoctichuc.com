'use client';

import { useState, useTransition } from 'react';

import {
  addStudentNote,
  deleteStudentNote,
  grantAccess,
  revokeCurrentAccess,
} from '../../actions';

type Props = {
  userId: string;
  hasActiveAccess: boolean;
};

export function UserActions({ userId, hasActiveAccess }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customMonths, setCustomMonths] = useState<number>(3);
  const [customPlan, setCustomPlan] = useState<'premium' | 'coaching'>(
    'premium'
  );
  const [note, setNote] = useState('');

  const run = (
    fn: () => Promise<{ ok: true } | { ok: false; error: string }>
  ) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Cấp quyền nhanh</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => grantAccess(userId, 'premium', 3, 'Manual grant'))}
            className="px-3 py-1.5 rounded border border-orange-300 bg-orange-50 text-orange-900 hover:bg-orange-100 disabled:opacity-60 text-sm"
          >
            Premium +3 tháng
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => grantAccess(userId, 'coaching', 6, 'Manual grant'))}
            className="px-3 py-1.5 rounded border border-green-300 bg-green-50 text-green-900 hover:bg-green-100 disabled:opacity-60 text-sm"
          >
            Coaching +6 tháng
          </button>
          {hasActiveAccess ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => revokeCurrentAccess(userId))}
              className="px-3 py-1.5 rounded border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-60 text-sm"
            >
              Thu hồi quyền hiện tại
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Cấp tuỳ chỉnh</div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            value={customPlan}
            onChange={(e) =>
              setCustomPlan(e.target.value as 'premium' | 'coaching')
            }
            className="border border-gray-300 rounded px-2 py-1.5"
          >
            <option value="premium">Premium</option>
            <option value="coaching">Coaching</option>
          </select>
          <input
            type="number"
            min={1}
            max={36}
            value={customMonths}
            onChange={(e) => setCustomMonths(parseInt(e.target.value, 10) || 1)}
            className="w-20 border border-gray-300 rounded px-2 py-1.5"
          />
          <span className="text-gray-600">tháng</span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() =>
                grantAccess(userId, customPlan, customMonths, 'Manual grant')
              )
            }
            className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            Cấp
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Thêm ghi chú nội bộ</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={10000}
          placeholder="Chỉ admin mới đọc được ghi chú này."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={pending || !note.trim()}
          onClick={() =>
            run(async () => {
              const res = await addStudentNote(userId, note);
              if (res.ok) setNote('');
              return res;
            })
          }
          className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 text-sm"
        >
          Lưu ghi chú
        </button>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {error}
        </div>
      ) : null}
    </div>
  );
}

export function DeleteNoteButton({
  noteId,
  userId,
}: {
  noteId: string;
  userId: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteStudentNote(noteId, userId);
        });
      }}
      className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-60"
    >
      Xoá
    </button>
  );
}
