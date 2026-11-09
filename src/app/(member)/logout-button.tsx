'use client';

export function LogoutButton() {
  return (
    <form action="/auth/logout" method="POST">
      <button
        type="submit"
        className="text-gray-700 hover:text-orange-600 cursor-pointer"
      >
        Đăng xuất
      </button>
    </form>
  );
}
