'use client';

import { useState, useTransition } from 'react';

import { setTestTier } from '../actions';

type Props = {
  testId: string;
  initial: 'free' | 'premium';
};

export function TierToggle({ testId, initial }: Props) {
  const [tier, setTier] = useState<'free' | 'premium'>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const next = tier === 'free' ? 'premium' : 'free';

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded border ${
          tier === 'free'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}
      >
        {tier === 'free' ? 'Miễn phí' : 'Premium'}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await setTestTier(testId, next);
            if (res.ok) setTier(next);
            else setError(res.error);
          });
        }}
        className="text-xs text-orange-600 hover:text-orange-800 underline disabled:opacity-60"
      >
        → chuyển thành {next === 'free' ? 'Miễn phí' : 'Premium'}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
