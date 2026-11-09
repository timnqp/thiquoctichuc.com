import Link from 'next/link';

import { routes } from '../config/routes';
import { trackCitEvent } from './analytics';

type UpgradeCtaProps = {
  /** Where the block is shown — used for analytics attribution. */
  placement: 'landing' | 'result' | 'dashboard_expired';
  /** Optional test id to carry into the pricing flow (for return-after-purchase). */
  fromTestId?: string;
  /** Compact variant — no heading, tighter spacing (used on result page). */
  compact?: boolean;
};

// Inline Vietnamese copy — premium strings are not synced from quinstowndotcom.
const COPY = {
  heading: 'Mở khoá toàn bộ đề thi thử',
  body:
    'Nâng cấp Premium để làm tất cả 14 đề (cơ bản + nâng cao), hoặc đăng ký Coaching 1-1 nếu bạn muốn được kèm cặp.',
  premium: 'Nâng cấp Premium',
  coaching: 'Đăng ký Coaching',
};

export function UpgradeCta({ placement, fromTestId, compact }: UpgradeCtaProps) {
  const pricingHref = fromTestId
    ? `${routes.pricing}?from=${encodeURIComponent(fromTestId)}`
    : routes.pricing;

  return (
    <div
      className={`rounded-xl border border-orange-200 bg-orange-50 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {compact ? null : (
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          {COPY.heading}
        </h2>
      )}
      <p className="text-gray-700 font-light mb-4">{COPY.body}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={pricingHref}
          onClick={() =>
            trackCitEvent('upgrade_click', {
              placement,
              from_test_id: fromTestId ?? '',
            })
          }
          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          {COPY.premium}
        </Link>
        <Link
          href={routes.coaching}
          onClick={() =>
            trackCitEvent('coaching_click', {
              placement,
              from_test_id: fromTestId ?? '',
            })
          }
          className="inline-flex items-center justify-center bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          {COPY.coaching}
        </Link>
      </div>
    </div>
  );
}
