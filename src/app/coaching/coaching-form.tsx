'use client';

import { useActionState } from 'react';

import {
  submitCoachingRequest,
  type CoachingSubmitResult,
} from './actions';

const COPY = {
  name: 'Họ và tên',
  email: 'Email',
  phone: 'Số điện thoại (tuỳ chọn)',
  timeline: 'Khi nào bạn muốn thi?',
  timelinePlaceholder: 'VD: trong 2 tháng tới',
  message: 'Chia sẻ thêm (tuỳ chọn)',
  messagePlaceholder:
    'Cho chúng tôi biết bạn đang ôn tới đâu, gặp khó khăn gì, v.v.',
  submit: 'Gửi yêu cầu',
  submitting: 'Đang gửi…',
  success:
    'Đã nhận yêu cầu — chúng tôi sẽ liên hệ qua email trong vòng 1–2 ngày làm việc.',
  required: '*',
};

export function CoachingForm() {
  const [state, action, pending] = useActionState<
    CoachingSubmitResult | null,
    FormData
  >(submitCoachingRequest, null);

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-900">
        <p className="font-medium">{COPY.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot: hidden from users, filled by naive bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="coaching-name" className="block text-sm text-gray-700">
          {COPY.name} <span className="text-orange-600">{COPY.required}</span>
        </label>
        <input
          id="coaching-name"
          name="name"
          type="text"
          required
          maxLength={120}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="coaching-email" className="block text-sm text-gray-700">
          {COPY.email} <span className="text-orange-600">{COPY.required}</span>
        </label>
        <input
          id="coaching-email"
          name="email"
          type="email"
          required
          maxLength={200}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="coaching-phone" className="block text-sm text-gray-700">
          {COPY.phone}
        </label>
        <input
          id="coaching-phone"
          name="phone"
          type="tel"
          maxLength={60}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="coaching-timeline" className="block text-sm text-gray-700">
          {COPY.timeline}
        </label>
        <input
          id="coaching-timeline"
          name="timeline"
          type="text"
          maxLength={120}
          placeholder={COPY.timelinePlaceholder}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="coaching-message" className="block text-sm text-gray-700">
          {COPY.message}
        </label>
        <textarea
          id="coaching-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder={COPY.messagePlaceholder}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {state && !state.ok ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        {pending ? COPY.submitting : COPY.submit}
      </button>
    </form>
  );
}
