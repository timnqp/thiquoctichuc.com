import { useTranslation } from '../context/LanguageContext';
import { BUY_ME_A_COFFEE_URL } from './DerivedFromOcb';

type BuyMeACoffeeProps = {
  onClick?: () => void;
};

export const BuyMeACoffee = ({ onClick }: BuyMeACoffeeProps) => {
  const { t } = useTranslation();

  return (
    <a
      href={BUY_ME_A_COFFEE_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-[#FFDD00] px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-[#ffd000]"
      onClick={onClick}
    >
      <span aria-hidden>☕</span>
      {t('cit_bmc')}
    </a>
  );
};
