import { AppConfig } from '../config/appConfig';

const Logo = () => (
  <span className="font-fancy text-2xl md:text-3xl font-bold text-orange-600 whitespace-nowrap">
    {AppConfig.brand_name}
  </span>
);

export { Logo };
