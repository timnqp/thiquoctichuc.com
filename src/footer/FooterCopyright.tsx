import { AppConfig } from '../config/appConfig';
import { useTranslation } from '../context/LanguageContext';

const FooterCopyright = () => {
  const { t } = useTranslation();

  return (
    <div className="text-gray-800 font-light text-xs md:text-base">
      {t('footer_copyright_prefix')} {new Date().getFullYear()}{' '}
      {t('footer_copyright_by')} {AppConfig.site_name}.
    </div>
  );
};

export { FooterCopyright };
