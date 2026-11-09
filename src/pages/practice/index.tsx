import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { trackCitEvent } from '../../citizenship/analytics';
import {
  PracticeWelcome,
  startAttempt,
} from '../../citizenship/PracticeWelcome';
import {
  loadPracticeCatalog,
  type PracticeTestSummary,
} from '../../citizenship/practiceCatalog';
import { routes } from '../../config/routes';
import { useTranslation } from '../../context/LanguageContext';
import { Meta } from '../../layout/Meta';
import { Section } from '../../layout/Section';
import { CitizenshipNavBar } from '../../navigation/CitizenshipNavBar';
import { Footer } from '../../templates/Footer';

type PracticeIndexProps = {
  tests: PracticeTestSummary[];
};

const PracticeIndex = ({ tests }: PracticeIndexProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="antialiased text-gray-600 min-h-screen flex flex-col">
      <Meta title={t('cit_practice_title')} description={t('cit_derived')} />
      <CitizenshipNavBar />
      <Section>
        <div className="mt-8">
          <PracticeWelcome
            tests={tests}
            onStart={(testId) => {
              const test = tests.find((item) => item.id === testId);
              startAttempt(testId);
              trackCitEvent('cit_practice_start', {
                test_id: testId,
                difficulty: test?.difficulty ?? 'unknown',
              });
              router.push(routes.practiceRun);
            }}
            onLockedClick={(testId) => {
              trackCitEvent('cit_practice_locked_click', {
                test_id: testId,
              });
              router.push(`/pricing?from=${encodeURIComponent(testId)}`);
            }}
          />
        </div>
      </Section>
      <Footer />
    </div>
  );
};

export const getStaticProps: GetStaticProps<PracticeIndexProps> = async () => {
  const tests = await loadPracticeCatalog();
  return {
    props: { tests },
    // Refresh the catalog hourly so admin changes to tier/title appear
    // without a redeploy (ISR). See plan/v2-premium.md §8 M2.
    revalidate: 3600,
  };
};

export default PracticeIndex;
