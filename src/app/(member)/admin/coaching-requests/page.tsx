import { createClient } from '@/lib/supabase/server';

import { RowActions } from './row-actions';

export const metadata = {
  title: 'Coaching inbox · Admin',
  robots: { index: false, follow: false },
};

type CoachingRequest = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  timeline: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'paid' | 'granted' | 'declined';
  created_at: string;
  updated_at: string;
};

const STATUS_LABEL: Record<CoachingRequest['status'], string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  paid: 'Đã thanh toán',
  granted: 'Đã cấp quyền',
  declined: 'Từ chối',
};

const STATUS_STYLE: Record<CoachingRequest['status'], string> = {
  new: 'bg-amber-100 text-amber-900 border-amber-200',
  contacted: 'bg-blue-100 text-blue-900 border-blue-200',
  paid: 'bg-purple-100 text-purple-900 border-purple-200',
  granted: 'bg-green-100 text-green-900 border-green-200',
  declined: 'bg-gray-100 text-gray-700 border-gray-200',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default async function CoachingRequestsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coaching_requests')
    .select(
      'id, user_id, name, email, phone, timeline, message, status, created_at, updated_at'
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-medium text-gray-900">Coaching inbox</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được danh sách: {error.message}
        </div>
      </div>
    );
  }

  const requests = (data ?? []) as CoachingRequest[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Coaching inbox</h1>
        <p className="text-sm text-gray-600 mt-1">
          {requests.length} yêu cầu. Quy trình: Mới → Đã liên hệ → (chuyển khoản) → Đã cấp quyền (6 tháng).
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Chưa có yêu cầu coaching nào.
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{req.name}</div>
                  <div className="text-sm text-gray-600">
                    <a
                      href={`mailto:${req.email}`}
                      className="hover:text-orange-600 underline"
                    >
                      {req.email}
                    </a>
                    {req.phone ? ` · ${req.phone}` : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(req.created_at)}
                    {req.user_id ? ' · tài khoản đã liên kết' : ' · chưa liên kết tài khoản'}
                  </div>
                </div>
                <span
                  className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded border ${STATUS_STYLE[req.status]}`}
                >
                  {STATUS_LABEL[req.status]}
                </span>
              </div>

              {req.timeline ? (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="text-gray-500">Mốc thời gian:</span>{' '}
                  {req.timeline}
                </p>
              ) : null}
              {req.message ? (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {req.message}
                </p>
              ) : null}

              <div className="mt-4 border-t border-gray-100 pt-3">
                <RowActions
                  id={req.id}
                  status={req.status}
                  hasUser={Boolean(req.user_id)}
                  defaultEmail={req.email}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
