export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900">Admin</h1>
      <p className="text-sm text-gray-600">Khu vực quản trị.</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <li>
          <Link
            href="/admin/coaching-requests"
            className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-orange-300"
          >
            <div className="font-medium text-gray-900">Coaching inbox</div>
            <div className="text-xs text-gray-500 mt-1">
              Danh sách yêu cầu coaching + cấp quyền 6 tháng
            </div>
          </Link>
        </li>
      </ul>

      <div className="text-xs text-gray-500">
        Sắp có: M5 — tiến độ học viên · M6 — quản lý người dùng + nội dung.
      </div>
    </div>
  );
}
