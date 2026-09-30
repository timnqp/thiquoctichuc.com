import { useTranslation } from '../context/LanguageContext';

export const FLAG_PATHS = {
  australian: '/citizenship/flags/australian-national.svg',
  aboriginal: '/citizenship/flags/aboriginal.svg',
  torres: '/citizenship/flags/torres-strait.svg',
} as const;

type CitizenshipFlagsProps = {
  compact?: boolean;
  /** When true, skip the standalone heading so flags sit inside an existing lesson section */
  embedded?: boolean;
};

export const CitizenshipFlags = ({
  compact = false,
  embedded = false,
}: CitizenshipFlagsProps) => {
  const { t } = useTranslation();

  const flags = [
    {
      src: FLAG_PATHS.australian,
      alt: t('cit_flag_au_alt'),
      caption: t('cit_flag_au_caption'),
    },
    {
      src: FLAG_PATHS.aboriginal,
      alt: t('cit_flag_aboriginal_alt'),
      caption: t('cit_flag_aboriginal_caption'),
    },
    {
      src: FLAG_PATHS.torres,
      alt: t('cit_flag_torres_alt'),
      caption: t('cit_flag_torres_caption'),
    },
  ];

  return (
    <div className={compact ? 'my-4' : 'my-6'}>
      {embedded ? null : (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {t('cit_flags_heading')}
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {flags.map((flag) => (
          <figure key={flag.src} className="m-0">
            <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg">
              <img
                src={flag.src}
                alt={flag.alt}
                className="w-full h-auto max-h-28 object-contain mx-auto"
                loading="lazy"
              />
            </div>
            <figcaption className="mt-2 text-xs text-gray-600 leading-snug">
              {flag.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};

type QuestionFlagProps = {
  src: string;
  alt?: string;
};

export const QuestionFlag = ({ src, alt }: QuestionFlagProps) => (
  <div className="mb-5 max-w-xs border border-gray-200 bg-gray-50 p-3 rounded-lg">
    <img
      src={src}
      alt={alt || ''}
      className="w-full h-auto max-h-32 object-contain mx-auto"
      loading="lazy"
    />
  </div>
);
