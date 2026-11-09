'use client';

import { useEffect, useRef } from 'react';

import { mergeLocalProgress } from '../actions';

const DONE_KEY = 'citizenship:merge_done_v1';
const STUDY_KEY = 'citizenship:study';
const LAST_RESULT_KEY = 'citizenship:practice:lastResult';

type StudyShape = { completedItems?: unknown } | null;
type ResultShape = {
  testId?: unknown;
  answers?: unknown;
  timedOut?: unknown;
} | null;

/**
 * Runs once after sign-in: ships anonymous localStorage progress into the
 * user's DB rows, then clears it and sets a done flag so we never re-run.
 */
export function LocalMerge() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window === 'undefined') return;

    try {
      if (window.localStorage.getItem(DONE_KEY) === '1') return;

      let study: StudyShape = null;
      let last: ResultShape = null;
      try {
        const rawStudy = window.localStorage.getItem(STUDY_KEY);
        if (rawStudy) study = JSON.parse(rawStudy);
      } catch {
        /* ignore parse errors */
      }
      try {
        const rawLast = window.localStorage.getItem(LAST_RESULT_KEY);
        if (rawLast) last = JSON.parse(rawLast);
      } catch {
        /* ignore parse errors */
      }

      const completedLessons =
        Array.isArray(study?.completedItems)
          ? (study!.completedItems as unknown[]).filter(
              (v): v is string => typeof v === 'string'
            )
          : [];

      const lastResult =
        last && typeof last.testId === 'string'
          ? {
              testId: last.testId,
              answers:
                last.answers && typeof last.answers === 'object'
                  ? (last.answers as Record<string, string>)
                  : {},
              timedOut: Boolean(last.timedOut),
            }
          : undefined;

      if (completedLessons.length === 0 && !lastResult) {
        window.localStorage.setItem(DONE_KEY, '1');
        return;
      }

      mergeLocalProgress({ completedLessons, lastResult })
        .then((res) => {
          if (res.ok) {
            // Keep study key (user may still be reading lessons on same device),
            // but drop the last-result since it's now in DB.
            window.localStorage.removeItem(LAST_RESULT_KEY);
            window.localStorage.setItem(DONE_KEY, '1');
          } else {
            console.warn('[LocalMerge] failed:', res.error);
          }
        })
        .catch((err) => {
          console.warn('[LocalMerge] threw:', err);
        });
    } catch (err) {
      console.warn('[LocalMerge] unexpected:', err);
    }
  }, []);

  return null;
}
