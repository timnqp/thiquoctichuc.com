import { useTranslation } from '../context/LanguageContext';

export const OCB_BOOK_URL =
  'https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond';
export const OCB_PDF_VI =
  'https://immi.homeaffairs.gov.au/citizenship-subsite/files/our-common-bond-testable-vietnamese.pdf';
export const OFFICIAL_PRACTICE_URL =
  'https://citizenshippracticetest.homeaffairs.gov.au';
export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/quinnta';

const linkClass = 'text-orange-600 underline hover:text-orange-800';

export const DerivedFromOcb = () => {
  const { t } = useTranslation();

  return (
    <div className="text-sm leading-relaxed text-gray-500 italic">
      <p>{t('cit_disclaimer')}</p>
      <p className="mt-2">
        <a
          href={OCB_PDF_VI}
          className={linkClass}
          target="_blank"
          rel="noreferrer"
        >
          {t('cit_ocb_vi')}
        </a>
      </p>
    </div>
  );
};
