import { FooterCopyright } from '../footer/FooterCopyright';
import { Section } from '../layout/Section';

const Footer = () => (
  <div className="bg-[#FBEDE6] mt-auto">
    <Section yPadding="py-8">
      <div className="text-center">
        <FooterCopyright />
      </div>
    </Section>
  </div>
);

export { Footer };
