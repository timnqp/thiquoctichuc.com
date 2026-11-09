export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900">Admin</h1>
      <p className="text-sm text-gray-600">
        Khu vực quản trị — các màn hình quản lý học viên, nội dung, coaching requests sẽ
        được thêm ở các milestone sau (M4–M6).
      </p>

      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        <li>M4 — Coaching inbox</li>
        <li>M5 — Dashboard học viên (tiến độ cá nhân)</li>
        <li>M6 — Quản lý người dùng + nội dung (tests, questions)</li>
      </ul>
    </div>
  );
}
