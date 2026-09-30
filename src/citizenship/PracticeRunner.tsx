import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { routes } from '../config/routes';
import { useTranslation } from '../context/LanguageContext';
import { CitizenshipAdBanner } from '../ads/AdUnit';
import { BuyMeACoffee } from './BuyMeACoffee';
import { QuestionFlag } from './CitizenshipFlags';
import { DerivedFromOcb } from './DerivedFromOcb';
import type { BankQuestion, PracticeAttempt } from './types';
import { loadAttempt, saveAttempt } from './useLocalProgress';

const PART_KEYS = {
  1: 'cit_part_1',
  2: 'cit_part_2',
  3: 'cit_part_3',
  4: 'cit_part_4',
} as const;

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

type PracticeRunnerProps = {
  questions: BankQuestion[];
  onSubmit: (answers: Record<string, string>, timedOut: boolean) => void;
};

export const PracticeRunner = ({ questions, onSubmit }: PracticeRunnerProps) => {
  const { t } = useTranslation();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [warnOpen, setWarnOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    setAttempt(loadAttempt());
  }, []);

  const persist = useCallback((next: PracticeAttempt) => {
    setAttempt(next);
    saveAttempt(next);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const remaining = attempt ? attempt.endsAt - now : 0;
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!attempt || attempt.submitted || submittedRef.current) return;
    if (remaining > 0) return;
    submittedRef.current = true;
    onSubmit(attempt.answers, true);
  }, [attempt, onSubmit, remaining]);

  if (!attempt) {
    return <p className="p-8 text-gray-600">{t('cit_loading')}</p>;
  }

  const index = Math.min(attempt.currentIndex, questions.length - 1);
  const question = questions[index];
  if (!question) {
    return <p className="p-8 text-gray-600">{t('cit_no_questions')}</p>;
  }

  const answeredCount = questions.filter((q) => attempt.answers[q.id]).length;
  const unansweredCount = questions.length - answeredCount;
  const selected = attempt.answers[question.id];
  const isLast = index >= questions.length - 1;
  const navBtnClass =
    'bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded';

  const goTo = (nextIndex: number) => {
    persist({ ...attempt, currentIndex: nextIndex });
  };

  const choose = (optionId: string) => {
    persist({
      ...attempt,
      answers: { ...attempt.answers, [question.id]: optionId },
    });
  };

  const questionNav = (layout: 'mobile' | 'desktop') => (
    <ol
      className={
        layout === 'mobile'
          ? 'flex flex-wrap gap-1.5 px-3 py-3'
          : 'flex flex-col'
      }
    >
      {questions.map((q, i) => {
        const answered = Boolean(attempt.answers[q.id]);
        const current = i === index;
        return (
          <li key={q.id}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={current ? 'step' : undefined}
              className={
                layout === 'mobile'
                  ? `w-9 h-9 rounded text-xs font-medium border ${
                      answered
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-gray-700 border-gray-300'
                    } ${current ? 'ring-2 ring-orange-500 ring-offset-1' : ''}`
                  : `w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                      current
                        ? 'bg-white border-l-4 border-orange-500'
                        : 'border-l-4 border-transparent hover:bg-gray-100'
                    }`
              }
            >
              {layout === 'desktop' ? (
                <>
                  <span
                    className={`inline-block w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                      answered
                        ? 'bg-neutral-800'
                        : 'border border-dashed border-neutral-500 bg-white'
                    }`}
                  />
                  <span>
                    {t('cit_question')} {i + 1}
                  </span>
                </>
              ) : (
                <span>{`Q${i + 1}`}</span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <div className="bg-[#FBEDE6] border-b border-gray-200 px-4 py-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="font-fancy text-xl">Quins Town</span>
          <p className="text-sm text-gray-700 mt-1">
            Australian Citizenship practice
          </p>
        </div>
        <button
          type="button"
          className="border border-gray-400 rounded px-2 py-1 text-sm hover:bg-white"
          onClick={() => setLargeText((v) => !v)}
          aria-pressed={largeText}
        >
          A+
        </button>
      </div>

      <div className="md:hidden border-b border-gray-200 bg-gray-50">
        {questionNav('mobile')}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-0">
        <aside className="hidden md:block border-r border-gray-200 bg-gray-50 overflow-y-auto">
          {questionNav('desktop')}
        </aside>

        <main className={`p-4 md:p-8 ${largeText ? 'text-lg' : ''}`}>
          <p className="text-gray-500 mb-4">{t(PART_KEYS[question.part])}</p>
          {question.image ? (
            <QuestionFlag src={question.image} alt={question.image_alt} />
          ) : null}
          <div className="flex items-start gap-2 mb-6">
            <h2 className="font-semibold text-gray-900">{question.question}</h2>
            {question.topic === 'values' ? (
              <span className="flex-shrink-0 text-xs uppercase tracking-wide bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                {t('cit_values_badge')}
              </span>
            ) : null}
          </div>
          <fieldset className="space-y-3">
            {question.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.id}
                  checked={selected === opt.id}
                  onChange={() => choose(opt.id)}
                  className="mt-1"
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </fieldset>

          <div className="mt-10 flex items-center justify-between gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                className={`${navBtnClass} ${
                  index > 0 ? '' : 'invisible pointer-events-none'
                }`}
                onClick={() => goTo(index - 1)}
                tabIndex={index > 0 ? 0 : -1}
                aria-hidden={index === 0}
              >
                {t('cit_previous')}
              </button>
              <button
                type="button"
                className={`${navBtnClass} ${
                  !isLast ? '' : 'invisible pointer-events-none'
                }`}
                onClick={() => goTo(index + 1)}
                tabIndex={!isLast ? 0 : -1}
                aria-hidden={isLast}
              >
                {t('cit_next')}
              </button>
            </div>
            <button
              type="button"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded"
              onClick={() => setWarnOpen(true)}
            >
              {t('cit_submit')}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-gray-700">
            <span>
              {answeredCount} {t('cit_answered')}
            </span>
            <span>
              {t('cit_time_remaining')} {formatRemaining(remaining)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              href={routes.study}
              className="text-orange-600 hover:text-orange-800 underline"
            >
              {t('cit_back_to_lessons')}
            </Link>
            <Link
              href={routes.practice}
              className="text-orange-600 hover:text-orange-800 underline"
            >
              {t('cit_choose_another_test')}
            </Link>
          </div>

          <CitizenshipAdBanner className="mt-8 mb-2" />
        </main>
      </div>

      <footer className="border-t border-gray-200 px-4 py-3 space-y-4">
        <DerivedFromOcb />
        <div className="flex justify-center">
          <BuyMeACoffee />
        </div>
      </footer>

      {warnOpen ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <p className="mb-2">{t('cit_ready_submit')}</p>
            {unansweredCount > 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                {unansweredCount} {t('cit_unanswered_warn')}
              </p>
            ) : (
              <div className="mb-4" />
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => setWarnOpen(false)}
              >
                {t('cit_no')}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-neutral-800 text-white rounded"
                onClick={() => {
                  setWarnOpen(false);
                  onSubmit(attempt.answers, false);
                }}
              >
                {t('cit_yes')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
