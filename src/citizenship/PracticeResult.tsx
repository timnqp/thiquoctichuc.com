import Link from 'next/link';

import { CitizenshipAdBanner } from '../ads/AdUnit';
import { routes } from '../config/routes';
import { useTranslation } from '../context/LanguageContext';
import { BuyMeACoffee } from './BuyMeACoffee';
import { QuestionFlag } from './CitizenshipFlags';
import { DerivedFromOcb } from './DerivedFromOcb';
import type { BankQuestion, CitizenshipResult } from './types';

const PART_KEYS = {
  1: 'cit_part_1',
  2: 'cit_part_2',
  3: 'cit_part_3',
  4: 'cit_part_4',
} as const;

type PracticeResultViewProps = {
  questions: BankQuestion[];
  answers: Record<string, string>;
  result: CitizenshipResult;
};

export const PracticeResultView = ({
  questions,
  answers,
  result,
}: PracticeResultViewProps) => {
  const { t } = useTranslation();
  const valuesPct =
    result.valuesTotal === 0
      ? 0
      : Math.round((result.valuesCorrect / result.valuesTotal) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`border-l-8 pl-4 py-4 ${
          result.passed
            ? 'border-green-600 bg-green-50'
            : 'border-red-600 bg-red-50'
        }`}
      >
        <p className="text-xl font-semibold">
          {result.passed ? t('cit_result_pass') : t('cit_result_fail')}
        </p>
      </div>

      <p className="mt-6">
        {t('cit_values_score')} {result.valuesCorrect}/{result.valuesTotal} (
        {valuesPct}%)
      </p>
      <p>
        {t('cit_overall_mark')} {result.correctCount}/{result.totalCount} (
        {result.score}%)
      </p>

      <div className="mt-6 space-y-3">
        {([1, 2, 3, 4] as const).map((part) => {
          const total = result.partTotal[part] || 0;
          const correct = result.partCorrect[part] || 0;
          const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
          return (
            <div key={part}>
              <div className="flex justify-between text-sm mb-1">
                <span>{t(PART_KEYS[part])}</span>
                <span>
                  {correct}/{total || 5}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-orange-500 rounded"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-gray-800">
        {t('cit_pass_box')}
      </div>

      <div className="mt-8 space-y-2">
        <div>
          <Link
            href={routes.practice}
            className="text-orange-600 hover:text-orange-800 underline"
          >
            {t('cit_try_another')}
          </Link>
        </div>
        <div>
          <Link
            href={routes.study}
            className="text-orange-600 hover:text-orange-800 underline"
          >
            {t('cit_review_lessons')}
          </Link>
        </div>
      </div>

      <CitizenshipAdBanner />

      <h2 className="mt-10 font-semibold">{t('cit_review_answers')}</h2>
      <ol className="mt-4 space-y-6">
        {questions.map((q, i) => {
          const chosen = answers[q.id];
          const ok = chosen === q.correct;
          const explain = q.explain_vi;
          return (
            <li key={q.id} className="border-b pb-4">
              <p className="font-medium">
                {i + 1}. {q.question}{' '}
                {q.topic === 'values' ? (
                  <span className="text-xs uppercase text-orange-700">
                    {t('cit_values_badge')}
                  </span>
                ) : null}
              </p>
              {q.image ? (
                <div className="mt-3">
                  <QuestionFlag src={q.image} alt={q.image_alt} />
                </div>
              ) : null}
              <ul className="mt-2 space-y-1 text-sm">
                {q.options.map((opt) => {
                  const isCorrect = opt.id === q.correct;
                  const isChosen = opt.id === chosen;
                  return (
                    <li
                      key={opt.id}
                      className={
                        isCorrect
                          ? 'text-green-700'
                          : isChosen
                          ? 'text-red-700'
                          : ''
                      }
                    >
                      {opt.id.toUpperCase()}. {opt.text}
                      {isCorrect ? ' ✓' : ''}
                      {isChosen && !isCorrect ? ' ✗' : ''}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-sm text-gray-600">{explain}</p>
              {!ok && !chosen ? (
                <p className="text-sm text-red-700">{t('cit_no_answer')}</p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-12">
        <DerivedFromOcb />
      </div>
      <div className="mt-8 flex justify-center">
        <BuyMeACoffee />
      </div>
    </div>
  );
};
