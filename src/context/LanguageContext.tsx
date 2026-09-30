import { createContext, ReactNode, useContext, useEffect } from 'react';

import vi from '../locales/vi';

type Translations = typeof vi;

type LanguageContextType = {
  t: (key: keyof Translations) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  t: (key) => vi[key] || key,
});

type LanguageProviderProps = {
  children: ReactNode;
};

const LanguageProvider = ({ children }: LanguageProviderProps) => {
  useEffect(() => {
    document.documentElement.lang = 'vi';
  }, []);

  const t = (key: keyof Translations) => vi[key] || key;

  return (
    <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>
  );
};

const useTranslation = () => useContext(LanguageContext);

export { LanguageProvider, useTranslation };
