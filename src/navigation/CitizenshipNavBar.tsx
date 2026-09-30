import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { routes } from '../config/routes';
import { useTranslation } from '../context/LanguageContext';
import { Section } from '../layout/Section';
import { Logo } from '../templates/Logo';

type NavItem = { name: string; uri: string; match: (pathname: string) => boolean };

const CitizenshipNavBar = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = router.pathname;
  const [open, setOpen] = useState(false);

  const items: NavItem[] = [
    {
      name: t('nav_resources_overview'),
      uri: routes.home,
      match: (p) => p === '/' || p === '/index',
    },
    {
      name: t('nav_resources_lessons'),
      uri: routes.study,
      match: (p) => p.startsWith('/study'),
    },
    {
      name: t('nav_resources_practice'),
      uri: routes.practice,
      match: (p) => p.startsWith('/practice'),
    },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <Section yPadding="py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href={routes.home} className="flex-shrink-0 max-w-[140px]">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-gray-800 font-light">
            {items.map((item) => (
              <Link
                key={item.uri}
                href={item.uri}
                className={
                  item.match(pathname) ? 'text-orange-600 font-medium' : 'hover:text-orange-600'
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <button
              type="button"
              className="p-2 border border-gray-300 rounded-lg"
              aria-expanded={open}
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {open ? (
          <nav className="md:hidden mt-4 flex flex-col gap-2 pb-2">
            {items.map((item) => (
              <Link
                key={item.uri}
                href={item.uri}
                className={`py-2 ${item.match(pathname) ? 'text-orange-600 font-medium' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </Section>
    </header>
  );
};

export { CitizenshipNavBar };
