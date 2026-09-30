import Link from 'next/link';
import { useMemo } from 'react';

import { CitizenshipAdBanner } from '../ads/AdUnit';
import { routes } from '../config/routes';
import { useTranslation } from '../context/LanguageContext';
import { BuyMeACoffee } from './BuyMeACoffee';
import { DerivedFromOcb } from './DerivedFromOcb';
import { firstPracticeTestId, quizBank } from './quizBank';
import type { PracticeTest } from './types';
import { saveAttempt } from './useLocalProgress';

const TIME_LIMIT_MS = 45 * 60 * 1000;

type PracticeWelcomeProps = {
  onStart: (testId: string) => void;
};

export function startAttempt(testId: string) {
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

function TestList({
  tests,
  onStart,
  basicLabel,
  advancedLabel,
}: {
  tests: PracticeTest[];
  onStart: (testId: string) => void;
  basicLabel: string;
  advancedLabel: string;
}) {
  return (
    <ul className="divide-y border rounded-lg">
      {tests.map((test) => (
        <li key={test.id}>
          <button
            type="button"
            className="w-full text-left px-4 py-3 hover:bg-orange-50 flex justify-between gap-3"
            onClick={() => onStart(test.id)}
          >
            <span className="text-gray-800">{test.title}</span>
            <span className="text-xs uppercase tracking-wide text-gray-500">
              {test.difficulty === 'basic' ? basicLabel : advancedLabel}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export const PracticeWelcome = ({ onStart }: PracticeWelcomeProps) => {
  const { t } = useTranslation();
  const { basicTests, advancedTests } = useMemo(() => {
    const basic = quizBank.tests.filter((test) => test.difficulty === 'basic');
    const advanced = quizBank.tests.filter(
      (test) => test.difficulty === 'advanced'
    );
    return { basicTests: basic, advancedTests: advanced };
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
        {t('cit_practice_title')}
      </h1>
      <div className="mt-6 space-y-4 text-gray-800 font-light leading-relaxed">
        <p>{t('cit_practice_sample')}</p>
        <p>{t('cit_practice_time')}</p>
        <p className="font-medium text-gray-900">{t('cit_practice_can')}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('cit_practice_can_1')}</li>
          <li>{t('cit_practice_can_2')}</li>
        </ul>
        <p className="font-medium text-gray-900">{t('cit_practice_cannot')}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('cit_practice_cannot_1')}</li>
          <li>{t('cit_practice_cannot_2')}</li>
        </ul>
        <p className="font-medium text-gray-900">{t('cit_practice_pass_title')}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('cit_practice_pass_values')}</li>
          <li>{t('cit_practice_pass_overall')}</li>
        </ul>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-10 rounded-lg transition-colors"
          onClick={() => onStart(firstPracticeTestId())}
        >
          {t('cit_practice_start')}
        </button>
        <Link
          href={routes.study}
          className="text-orange-600 hover:text-orange-800 underline font-medium"
        >
          {t('cit_go_to_study')}
        </Link>
      </div>

      <CitizenshipAdBanner />

      <h2 className="mt-16 mb-4 text-lg font-medium text-gray-800">
        {t('cit_practice_choose')}
      </h2>
      <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
        {t('cit_practice_basic')}
      </h3>
      <TestList
        tests={basicTests}
        onStart={onStart}
        basicLabel={t('cit_practice_basic')}
        advancedLabel={t('cit_practice_advanced')}
      />
      <h3 className="mt-8 mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
        {t('cit_practice_advanced')}
      </h3>
      <TestList
        tests={advancedTests}
        onStart={onStart}
        basicLabel={t('cit_practice_basic')}
        advancedLabel={t('cit_practice_advanced')}
      />
      <div className="mt-12">
        <DerivedFromOcb />
      </div>
      <div className="flex justify-center mt-8">
        <BuyMeACoffee />
      </div>
    </div>
  );
};
