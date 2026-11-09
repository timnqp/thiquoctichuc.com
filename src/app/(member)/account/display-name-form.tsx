'use client';

import { useActionState } from 'react';

import { updateDisplayName, type ActionResult } from '../actions';

type Props = {
  initial: string;
};

export function DisplayNameForm({ initial }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateDisplayName,
    null
  );

  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="display-name" className="block text-sm text-gray-700">
          Tên hiển thị
        </label>
        <input
          id="display-name"
          name="display_name"
          type="text"
          defaultValue={initial}
          maxLength={120}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="VD: Quỳnh"
        />
      </div>
      {state && !state.ok ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-green-700">Đã lưu.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg"
      >
        {pending ? 'Đang lưu…' : 'Lưu'}
      </button>
    </form>
  );
}
