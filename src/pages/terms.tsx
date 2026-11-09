import Link from 'next/link';

import { AppConfig } from '../config/appConfig';
import { Meta } from '../layout/Meta';
import { Section } from '../layout/Section';
import { CitizenshipNavBar } from '../navigation/CitizenshipNavBar';
import { Footer } from '../templates/Footer';

const TITLE = 'Điều khoản sử dụng';
const UPDATED = '2026-11-10';

const TermsPage = () => (
  <div className="antialiased text-gray-700 min-h-screen flex flex-col">
    <Meta
      title={`${TITLE} · ${AppConfig.title}`}
      description="Điều khoản sử dụng thiquoctichuc.com — quyền và trách nhiệm khi dùng trang."
    />
    <CitizenshipNavBar />
    <Section>
      <article className="max-w-3xl mx-auto mt-8 prose prose-slate">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {TITLE}
        </h1>
        <p className="text-sm text-gray-500">Cập nhật: {UPDATED}</p>

        <h2 className="mt-8">1. Giới thiệu</h2>
        <p>
          thiquoctichuc.com là công cụ luyện thi quốc tịch Úc <strong>không
          chính thức</strong>. Trang không liên kết với Department of Home
          Affairs. Nội dung được soạn tham khảo từ Australian Citizenship: Our
          Common Bond (Commonwealth of Australia 2020, CC BY 4.0).
        </p>

        <h2 className="mt-8">2. Nội dung chỉ mang tính tham khảo</h2>
        <p>
          Câu hỏi thi thử <em>không phải</em> câu hỏi thi thật. Việc đậu một
          đề trên trang <strong>không đảm bảo</strong> bạn sẽ đậu bài thi
          chính thức. Luôn đọc tài liệu chính thức và luyện tập ở nhiều nguồn.
        </p>

        <h2 className="mt-8">3. Tài khoản</h2>
        <ul>
          <li>Bạn tự chịu trách nhiệm bảo mật mật khẩu của mình.</li>
          <li>Không được dùng tài khoản để lạm dụng, spam, hoặc phá hoại trang.</li>
          <li>Chúng tôi có quyền tạm dừng hoặc xoá tài khoản vi phạm.</li>
        </ul>

        <h2 className="mt-8">4. Gói Premium và Coaching</h2>
        <ul>
          <li>
            Premium: thời hạn 3 tháng kể từ ngày thanh toán. Hết hạn{' '}
            <strong>cứng</strong> — quyền truy cập đề Premium ngừng ngay.
          </li>
          <li>
            Coaching: thời hạn 6 tháng kể từ khi chúng tôi xác nhận thanh
            toán. Lịch học cụ thể trao đổi riêng.
          </li>
          <li>
            Hoàn tiền: chúng tôi xử lý theo từng trường hợp. Gửi yêu cầu qua
            email trong vòng 7 ngày kể từ ngày thanh toán.
          </li>
        </ul>

        <h2 className="mt-8">5. Giới hạn trách nhiệm</h2>
        <p>
          Trang được cung cấp "nguyên trạng". Trong phạm vi pháp luật cho
          phép, chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp phát
          sinh từ việc sử dụng hoặc không sử dụng được trang.
        </p>

        <h2 className="mt-8">6. Thay đổi điều khoản</h2>
        <p>
          Chúng tôi có thể cập nhật điều khoản này theo thời gian. Phiên bản
          mới sẽ ghi ngày cập nhật ở đầu trang.
        </p>

        <hr className="my-8" />
        <p className="text-sm text-gray-500">
          Xem thêm{' '}
          <Link href="/privacy" className="text-orange-600 hover:text-orange-800 underline">
            Chính sách bảo mật
          </Link>
          .
        </p>
      </article>
    </Section>
    <Footer />
  </div>
);

export default TermsPage;
