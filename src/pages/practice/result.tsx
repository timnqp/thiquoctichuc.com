import { useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { trackCitEvent } from '../../citizenship/analytics';
import { evaluateCitizenshipTest } from '../../citizenship/evaluateCitizenshipTest';
import { PracticeResultView } from '../../citizenship/PracticeResult';
import { getPracticeTest } from '../../citizenship/quizBank';
import type { StoredResult } from '../../citizenship/useLocalProgress';
import { loadLastResult } from '../../citizenship/useLocalProgress';
import { AppConfig } from '../../config/appConfig';
import { routes } from '../../config/routes';
import { useTranslation } from '../../context/LanguageContext';
import { Meta } from '../../layout/Meta';
import { Section } from '../../layout/Section';
import { CitizenshipNavBar } from '../../navigation/CitizenshipNavBar';
import { Footer } from '../../templates/Footer';

const PracticeResultPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [stored, setStored] = useState<StoredResult | null | undefined>(
    undefined
  );

  const sentResult = useRef(false);

  useEffect(() => {
    setStored(loadLastResult());
  }, []);

  const test = stored ? getPracticeTest(stored.testId) : null;
  const result = useMemo(() => {
    if (!test || !stored) return null;
    return evaluateCitizenshipTest(test.questions, stored.answers);
  }, [stored, test]);

  useEffect(() => {
    if (!stored || !result || sentResult.current) return;
    sentResult.current = true;
    trackCitEvent('cit_practice_result', {
      test_id: stored.testId,
      result: result.passed ? 'pass' : 'fail',
      score: result.score,
      values_correct: result.valuesCorrect,
      timed_out: stored.timedOut ? 1 : 0,
    });
  }, [result, stored]);

  useEffect(() => {
    if (stored === null) {
      router.replace(routes.practice);
    }
  }, [router, stored]);

  if (!stored || !test || !result) {
    return (
      <div className="p-8 text-gray-600">
        <Meta title={t('cit_practice_title')} description={t('cit_derived')} />
        {t('cit_loading')}
      </div>
    );
  }

  return (
    <div className="antialiased text-gray-600 min-h-screen flex flex-col">
      <Meta
        title={`${
          result.passed ? t('cit_result_pass') : t('cit_result_fail')
        } · ${AppConfig.title}`}
        description={t('cit_derived')}
      />
      <CitizenshipNavBar />
      <Section>
        <div className="mt-8">
          <PracticeResultView
            questions={test.questions}
            answers={stored.answers}
            result={result}
          />
        </div>
      </Section>
      <Footer />
    </div>
  );
};

export default PracticeResultPage;
