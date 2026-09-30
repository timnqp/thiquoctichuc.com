import { useRouter } from 'next/router';

import { trackCitEvent } from '../../citizenship/analytics';
import { PracticeWelcome, startAttempt } from '../../citizenship/PracticeWelcome';
import { getPracticeTest } from '../../citizenship/quizBank';
import { routes } from '../../config/routes';
import { useTranslation } from '../../context/LanguageContext';
import { Meta } from '../../layout/Meta';
import { Section } from '../../layout/Section';
import { CitizenshipNavBar } from '../../navigation/CitizenshipNavBar';
import { Footer } from '../../templates/Footer';

const PracticeIndex = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="antialiased text-gray-600 min-h-screen flex flex-col">
      <Meta title={t('cit_practice_title')} description={t('cit_derived')} />
      <CitizenshipNavBar />
      <Section>
        <div className="mt-8">
          <PracticeWelcome
            onStart={(testId) => {
              const test = getPracticeTest(testId);
              startAttempt(testId);
              trackCitEvent('cit_practice_start', {
                test_id: testId,
                difficulty: test?.difficulty ?? 'unknown',
              });
              router.push(routes.practiceRun);
            }}
          />
        </div>
      </Section>
      <Footer />
    </div>
  );
};

export default PracticeIndex;
