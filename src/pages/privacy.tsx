import Link from 'next/link';

import { AppConfig } from '../config/appConfig';
import { Meta } from '../layout/Meta';
import { Section } from '../layout/Section';
import { CitizenshipNavBar } from '../navigation/CitizenshipNavBar';
import { Footer } from '../templates/Footer';

const TITLE = 'Chính sách bảo mật';
const UPDATED = '2026-11-10';

const PrivacyPage = () => (
  <div className="antialiased text-gray-700 min-h-screen flex flex-col">
    <Meta
      title={`${TITLE} · ${AppConfig.title}`}
      description="Chính sách bảo mật của thiquoctichuc.com — chúng tôi thu thập, lưu trữ và dùng dữ liệu người dùng như thế nào."
    />
    <CitizenshipNavBar />
    <Section>
      <article className="max-w-3xl mx-auto mt-8 prose prose-slate">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {TITLE}
        </h1>
        <p className="text-sm text-gray-500">Cập nhật: {UPDATED}</p>

        <h2 className="mt-8">1. Dữ liệu chúng tôi thu thập</h2>
        <ul>
          <li>
            <strong>Khách ẩn danh:</strong> không cần tạo tài khoản. Tiến độ
            học và đề thi thử miễn phí lưu trong trình duyệt của bạn
            (localStorage). Chúng tôi không đọc được.
          </li>
          <li>
            <strong>Tài khoản đăng ký:</strong> email, tên hiển thị (tuỳ chọn),
            và tiến độ học — lưu tại Supabase (vùng Sydney, Úc).
          </li>
          <li>
            <strong>Phân tích:</strong> Google Analytics 4 ghi nhận các sự kiện
            ẩn danh về cách bạn dùng trang (chỉ chạy ở môi trường production).
          </li>
          <li>
            <strong>Thanh toán:</strong> khi chức năng Premium mở, Stripe xử lý
            thanh toán. Chúng tôi không lưu số thẻ của bạn — chỉ nhận
            xác nhận giao dịch để cấp quyền truy cập.
          </li>
          <li>
            <strong>Yêu cầu Coaching:</strong> tên, email, điện thoại (tuỳ
            chọn) và nội dung bạn gửi qua form ở <code>/coaching</code>.
          </li>
        </ul>

        <h2 className="mt-8">2. Chúng tôi dùng dữ liệu để làm gì</h2>
        <ul>
          <li>Cấp quyền truy cập đúng gói bạn đã đăng ký.</li>
          <li>Hiển thị tiến độ học + lịch sử đề thi thử của bạn.</li>
          <li>Trao đổi với bạn khi bạn chủ động liên hệ (coaching).</li>
          <li>Theo dõi tổng hợp để cải thiện nội dung — không gắn danh tính cá nhân.</li>
        </ul>

        <h2 className="mt-8">3. Chia sẻ dữ liệu</h2>
        <p>
          Chúng tôi không bán dữ liệu cá nhân. Dữ liệu được lưu tại các nhà
          cung cấp hạ tầng tin cậy (Supabase, Vercel, Google Analytics,
          Stripe khi áp dụng). Mỗi bên có chính sách bảo mật riêng.
        </p>

        <h2 className="mt-8">4. Quyền của bạn</h2>
        <p>
          Bạn có thể yêu cầu xoá tài khoản và toàn bộ dữ liệu bất cứ lúc nào
          bằng cách email cho chúng tôi. Lịch sử giao dịch có thể được giữ lại
          theo yêu cầu pháp luật về kế toán.
        </p>

        <h2 className="mt-8">5. Liên hệ</h2>
        <p>
          Mọi thắc mắc về bảo mật, xin gửi về email được công bố trên trang
          chủ.
        </p>

        <hr className="my-8" />
        <p className="text-sm text-gray-500">
          Xem thêm{' '}
          <Link href="/terms" className="text-orange-600 hover:text-orange-800 underline">
            Điều khoản sử dụng
          </Link>
          .
        </p>
      </article>
    </Section>
    <Footer />
  </div>
);

export default PrivacyPage;
