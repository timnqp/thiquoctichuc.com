import { useCallback, useEffect, useState } from 'react';

import type { PracticeAttempt, StudyProgress } from './types';

const STUDY_KEY = 'citizenship:study';
const ATTEMPT_KEY = 'citizenship:practice:attempt';
const LAST_RESULT_KEY = 'citizenship:practice:lastResult';

const EMPTY_STUDY: StudyProgress = {
  completedItems: [],
  lastChapterId: '',
  lastItemId: '',
};

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useStudyProgress() {
  const [progress, setProgress] = useState<StudyProgress>(EMPTY_STUDY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(readJson<StudyProgress>(STUDY_KEY) ?? EMPTY_STUDY);
    setReady(true);
  }, []);

  const persist = useCallback((next: StudyProgress) => {
    setProgress(next);
    writeJson(STUDY_KEY, next);
  }, []);

  const isItemCompleted = useCallback(
    (itemId: string) => progress.completedItems.includes(itemId),
    [progress.completedItems]
  );

  const completeItem = useCallback(
    (itemId: string, chapterId: string) => {
      const completedItems = progress.completedItems.includes(itemId)
        ? progress.completedItems
        : [...progress.completedItems, itemId];
      persist({
        completedItems,
        lastChapterId: chapterId,
        lastItemId: itemId,
      });
    },
    [persist, progress.completedItems]
  );

  const savePosition = useCallback(
    (chapterId: string, itemId: string) => {
      persist({
        ...progress,
        lastChapterId: chapterId,
        lastItemId: itemId,
      });
    },
    [persist, progress]
  );

  return {
    progress,
    ready,
    isItemCompleted,
    completeItem,
    savePosition,
  };
}

export function loadAttempt(): PracticeAttempt | null {
  return readJson<PracticeAttempt>(ATTEMPT_KEY);
}

export function saveAttempt(attempt: PracticeAttempt) {
  writeJson(ATTEMPT_KEY, attempt);
}

export function clearAttempt() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ATTEMPT_KEY);
}

export type StoredResult = {
  testId: string;
  answers: Record<string, string>;
  timedOut?: boolean;
};

export function saveLastResult(result: StoredResult) {
  writeJson(LAST_RESULT_KEY, result);
}

export function loadLastResult(): StoredResult | null {
  return readJson<StoredResult>(LAST_RESULT_KEY);
}
