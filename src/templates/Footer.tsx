import Link from 'next/link';

import { FooterCopyright } from '../footer/FooterCopyright';
import { Section } from '../layout/Section';

const Footer = () => (
  <div className="bg-[#FBEDE6] mt-auto">
    <Section yPadding="py-8">
      <div className="text-center space-y-3">
        <nav className="flex justify-center gap-4 text-xs text-gray-700">
          <Link href="/privacy" className="hover:text-orange-600">
            Chính sách bảo mật
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-orange-600">
            Điều khoản
          </Link>
        </nav>
        <FooterCopyright />
      </div>
    </Section>
  </div>
);

export { Footer };
