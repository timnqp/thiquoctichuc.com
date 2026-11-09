import { useEffect, useMemo } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { trackCitEvent } from '../citizenship/analytics';
import { AppConfig } from '../config/appConfig';
import { routes } from '../config/routes';
import { Meta } from '../layout/Meta';
import { Section } from '../layout/Section';
import { CitizenshipNavBar } from '../navigation/CitizenshipNavBar';
import { Footer } from '../templates/Footer';

// Vietnamese copy — premium pages are not synced from quinstowndotcom.
const COPY = {
  title: 'Gói học và luyện thi',
  subtitle:
    'Chọn gói phù hợp với bạn. Mọi bài học trên trang vẫn miễn phí mãi mãi.',
  returnBanner: (testId: string) =>
    `Bạn vừa chọn đề ${testId} (đề Premium). Nâng cấp để mở khoá toàn bộ ngân hàng câu hỏi.`,
  premium: {
    name: 'Premium',
    tagline: 'Luyện thi không giới hạn trong 3 tháng',
    price: 'Liên hệ',
    priceNote: '(giá cụ thể sẽ công bố trước khi mở thanh toán)',
    features: [
      'Mở khoá toàn bộ 14 đề thi thử (cơ bản + nâng cao)',
      'Thời hạn 3 tháng kể từ ngày thanh toán',
      'Lưu lịch sử bài làm và thống kê điểm yếu',
      'Giải thích chi tiết từng câu bằng tiếng Việt',
    ],
    cta: 'Nâng cấp Premium',
    note: 'Thanh toán qua Stripe. Sẽ mở trong thời gian tới.',
  },
  coaching: {
    name: 'Coaching 1-1',
    tagline: 'Được kèm cặp riêng cho đến khi đậu',
    price: 'Theo thoả thuận',
    priceNote: '(chi tiết trao đổi khi bạn đăng ký)',
    features: [
      'Buổi học 1-1 với giáo viên có kinh nghiệm',
      'Truy cập Premium trong 6 tháng đi kèm',
      'Hỗ trợ ôn luyện phần Values và interview',
      'Ưu tiên giải đáp qua tin nhắn',
    ],
    cta: 'Đăng ký tư vấn',
    note: 'Liên hệ qua form đăng ký; chuyển khoản sau khi xác nhận.',
  },
  back: 'Quay lại thi thử',
  faqTitle: 'Câu hỏi thường gặp',
  faqs: [
    {
      q: 'Các bài học có mất phí không?',
      a:
        'Không. Toàn bộ 16 bài tóm tắt tại /study miễn phí mãi mãi, không cần tài khoản.',
    },
    {
      q: 'Đề nào được thi thử miễn phí?',
      a:
        '2 đề cơ bản đầu và 2 đề nâng cao đầu luôn miễn phí (không cần đăng nhập). Các đề còn lại thuộc gói Premium.',
    },
    {
      q: 'Premium hết hạn thì sao?',
      a:
        'Quyền truy cập chấm dứt đúng thời điểm hết hạn (hard cut-off). Bạn vẫn xem được lịch sử bài làm cũ và có thể gia hạn.',
    },
    {
      q: 'Coaching có chắc chắn đậu không?',
      a:
        'Không có cam kết đậu. Coaching tập trung giúp bạn chuẩn bị tốt nhất: nắm chắc nội dung, luyện phản xạ, và tự tin bước vào phòng thi.',
    },
  ],
};

const PricingPage = () => {
  const router = useRouter();
  const fromParam = router.query.from;
  const fromTestId = useMemo(() => {
    if (typeof fromParam === 'string' && fromParam.length > 0) return fromParam;
    return '';
  }, [fromParam]);

  // Fire pricing_view once per navigation and stash `from` for return-after-purchase.
  useEffect(() => {
    if (!router.isReady) return;
    trackCitEvent('pricing_view', { from_test_id: fromTestId });
    if (fromTestId && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('citizenship:pricing_from', fromTestId);
      } catch {
        // sessionStorage unavailable — non-fatal.
      }
    }
  }, [router.isReady, fromTestId]);

  return (
    <div className="antialiased text-gray-600 min-h-screen flex flex-col">
      <Meta
        title={`${COPY.title} · ${AppConfig.title}`}
        description={COPY.subtitle}
      />
      <CitizenshipNavBar />
      <Section>
        <div className="max-w-5xl mx-auto mt-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {COPY.title}
          </h1>
          <p className="mt-2 text-gray-700 font-light">{COPY.subtitle}</p>

          {fromTestId ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {COPY.returnBanner(fromTestId)}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Premium */}
            <div className="rounded-xl border-2 border-orange-300 bg-white p-6 flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {COPY.premium.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {COPY.premium.tagline}
                </p>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-orange-600">
                  {COPY.premium.price}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {COPY.premium.priceNote}
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 mb-6 flex-1">
                {COPY.premium.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled
                className="w-full bg-orange-500 text-white font-medium py-3 px-6 rounded-lg opacity-60 cursor-not-allowed"
                title={COPY.premium.note}
                onClick={() =>
                  trackCitEvent('upgrade_click', {
                    placement: 'pricing_page',
                    from_test_id: fromTestId,
                  })
                }
              >
                {COPY.premium.cta}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {COPY.premium.note}
              </p>
            </div>

            {/* Coaching */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {COPY.coaching.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {COPY.coaching.tagline}
                </p>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {COPY.coaching.price}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {COPY.coaching.priceNote}
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 mb-6 flex-1">
                {COPY.coaching.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={routes.coaching}
                onClick={() =>
                  trackCitEvent('coaching_click', {
                    placement: 'pricing_page',
                    from_test_id: fromTestId,
                  })
                }
                className="w-full inline-flex items-center justify-center bg-white hover:bg-orange-50 text-orange-700 border border-orange-300 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {COPY.coaching.cta}
              </Link>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {COPY.coaching.note}
              </p>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {COPY.faqTitle}
            </h2>
            <dl className="space-y-4">
              {COPY.faqs.map((item) => (
                <div
                  key={item.q}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <dt className="font-medium text-gray-900">{item.q}</dt>
                  <dd className="mt-1 text-gray-700 font-light">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-10">
            <Link
              href={routes.practice}
              className="text-orange-600 hover:text-orange-800 underline font-medium"
            >
              {COPY.back}
            </Link>
          </div>
        </div>
      </Section>
      <Footer />
    </div>
  );
};

export default PricingPage;
