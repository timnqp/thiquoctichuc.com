import Link from 'next/link';

import { CoachingForm } from './coaching-form';

export const metadata = {
  title: 'Coaching 1-1 · thiquoctichuc.com',
  description:
    'Đăng ký coaching 1-1 cho kỳ thi quốc tịch Úc. Chúng tôi sẽ liên hệ trong 1–2 ngày làm việc.',
};

const COPY = {
  title: 'Coaching 1-1',
  intro:
    'Điền vào mẫu dưới đây để đăng ký coaching. Sau khi nhận yêu cầu, chúng tôi sẽ liên hệ qua email để trao đổi lịch học, chi phí và hướng dẫn thanh toán.',
  included: 'Gói coaching đi kèm:',
  items: [
    'Buổi học 1-1 với giáo viên có kinh nghiệm',
    'Truy cập Premium trong 6 tháng',
    'Hỗ trợ ôn luyện phần Values và interview',
    'Ưu tiên giải đáp qua tin nhắn',
  ],
  back: '← Quay lại trang Gói học',
};

export default function CoachingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-fancy text-xl text-orange-600">
            thiquoctichuc.com
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-600 hover:text-orange-600"
          >
            {COPY.back}
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
          {COPY.title}
        </h1>
        <p className="text-gray-700 font-light">{COPY.intro}</p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-medium text-gray-900 mb-2">{COPY.included}</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {COPY.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <CoachingForm />
        </div>
      </main>
    </div>
  );
}
