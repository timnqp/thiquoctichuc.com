'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { PracticeRunner } from '@/citizenship/PracticeRunner';
import type { BankQuestion } from '@/citizenship/types';
import {
  clearAttempt,
  loadAttempt,
  saveAttempt,
} from '@/citizenship/useLocalProgress';

import { recordAttempt } from '../../../actions';

const TIME_LIMIT_MS = 45 * 60 * 1000;

type Props = {
  testId: string;
  questions: BankQuestion[];
};

export function PremiumRunner({ testId, questions }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  // Ensure there's an in-progress attempt in localStorage for the runner UI.
  // Reuses the free-tier attempt key (see note in plan/progress.md — future
  // refactor could namespace this per scope).
  useEffect(() => {
    const existing = loadAttempt();
    if (!existing || existing.testId !== testId || existing.submitted) {
      const now = Date.now();
      saveAttempt({
        testId,
        startedAt: now,
        endsAt: now + TIME_LIMIT_MS,
        answers: {},
        reviewLater: [],
        currentIndex: 0,
        submitted: false,
      });
    }
    setReady(true);
  }, [testId]);

  const onSubmit = useCallback(
    (answers: Record<string, string>, timedOut: boolean) => {
      if (submitted) return;
      setSubmitted(true);
      setSubmitError(null);
      startTransition(async () => {
        const result = await recordAttempt(testId, answers, timedOut);
        if (!result.ok) {
          setSubmitError(result.error);
          setSubmitted(false);
          return;
        }
        clearAttempt();
        router.push('/dashboard');
      });
    },
    [router, submitted, testId]
  );

  if (!ready) {
    return <p className="p-8 text-gray-600">Đang tải…</p>;
  }

  return (
    <div>
      <PracticeRunner questions={questions} onSubmit={onSubmit} />
      {pending ? (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow px-4 py-2 text-sm text-gray-700">
          Đang lưu bài làm…
        </div>
      ) : null}
      {submitError ? (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow px-4 py-2 text-sm text-red-800">
          {submitError}
        </div>
      ) : null}
    </div>
  );
}
