import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { trackCitEvent } from '../../citizenship/analytics';
import { PracticeRunner } from '../../citizenship/PracticeRunner';
import { getPracticeTest } from '../../citizenship/quizBank';
import type { BankQuestion, PracticeAttempt } from '../../citizenship/types';
import {
  clearAttempt,
  loadAttempt,
  saveLastResult,
} from '../../citizenship/useLocalProgress';
import { routes } from '../../config/routes';
import { useTranslation } from '../../context/LanguageContext';
import { Meta } from '../../layout/Meta';

const PracticeRun = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [questions, setQuestions] = useState<BankQuestion[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const attempt: PracticeAttempt | null = loadAttempt();
    if (!attempt || attempt.submitted) {
      setMissing(true);
      return;
    }
    const test = getPracticeTest(attempt.testId);
    if (!test) {
      setMissing(true);
      return;
    }
    setQuestions(test.questions);
  }, []);

  const onSubmit = useCallback(
    (answers: Record<string, string>, timedOut: boolean) => {
      const attempt = loadAttempt();
      if (!attempt) return;
      saveLastResult({ testId: attempt.testId, answers, timedOut });
      trackCitEvent('cit_practice_submit', {
        test_id: attempt.testId,
        timed_out: timedOut ? 1 : 0,
      });
      clearAttempt();
      router.replace(routes.practiceResult);
    },
    [router]
  );

  useEffect(() => {
    if (missing) {
      router.replace(routes.practice);
    }
  }, [missing, router]);

  if (!questions) {
    return (
      <div className="p-8 text-gray-600">
        <Meta title={t('cit_practice_title')} description={t('cit_derived')} />
        {t('cit_loading')}
      </div>
    );
  }

  return (
    <>
      <Meta title={t('cit_practice_title')} description={t('cit_derived')} />
      <PracticeRunner questions={questions} onSubmit={onSubmit} />
    </>
  );
};

export default PracticeRun;
