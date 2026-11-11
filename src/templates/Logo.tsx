import { AppConfig } from '../config/appConfig';

const Logo = () => (
  <span className="font-fancy text-xl text-orange-600 whitespace-nowrap">
    {AppConfig.brand_name}
  </span>
);

export { Logo };
