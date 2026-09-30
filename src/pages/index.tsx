import Link from 'next/link';

import { CitizenshipAdBanner } from '../ads/AdUnit';
import { BuyMeACoffee } from '../citizenship/BuyMeACoffee';
import { DerivedFromOcb } from '../citizenship/DerivedFromOcb';
import { trackCitEvent } from '../citizenship/analytics';
import { routes } from '../config/routes';
import { useTranslation } from '../context/LanguageContext';
import { Meta } from '../layout/Meta';
import { Section } from '../layout/Section';
import { CitizenshipNavBar } from '../navigation/CitizenshipNavBar';
import { Footer } from '../templates/Footer';

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="antialiased text-gray-600 min-h-screen flex flex-col">
      <Meta title={t('cit_landing_tab')} description={t('cit_derived')} />
      <CitizenshipNavBar />
      <Section>
        <h1 className="text-black text-center font-fancy text-3xl lg:text-4xl mt-10">
          {t('resources_title')}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link
            href={routes.study}
            className="block rounded-xl border border-gray-200 p-6 hover:bg-[#FBEDE6] transition-colors"
            onClick={() =>
              trackCitEvent('cit_landing_click', { target: 'lessons' })
            }
          >
            <h2 className="text-xl lg:text-2xl font-light text-orange-600 mb-3">
              {t('resources_lessons_card')}
            </h2>
            <p className="text-gray-700 font-light">{t('cit_lessons_desc')}</p>
          </Link>
          <Link
            href={routes.practice}
            className="block rounded-xl border border-gray-200 p-6 hover:bg-[#FBEDE6] transition-colors"
            onClick={() =>
              trackCitEvent('cit_landing_click', { target: 'practice' })
            }
          >
            <h2 className="text-xl lg:text-2xl font-light text-orange-600 mb-3">
              {t('resources_practice_card')}
            </h2>
            <p className="text-gray-700 font-light">{t('cit_practice_sample')}</p>
            <p className="text-gray-700 font-light mt-2">
              {t('cit_practice_has_explanations')}
            </p>
          </Link>
        </div>
        <CitizenshipAdBanner />
        <div className="mt-10">
          <DerivedFromOcb />
        </div>
        <div className="flex justify-center mt-8 mb-4">
          <BuyMeACoffee
            onClick={() =>
              trackCitEvent('cit_landing_click', { target: 'coffee' })
            }
          />
        </div>
      </Section>
      <Footer />
    </div>
  );
};

export default LandingPage;
