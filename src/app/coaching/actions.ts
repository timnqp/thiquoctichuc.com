'use server';

import { createClient } from '@/lib/supabase/server';

export type CoachingSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_LEN = 2000;

function clean(value: FormDataEntryValue | null, max = 300): string {
  const v = typeof value === 'string' ? value : '';
  return v.trim().slice(0, max);
}

export async function submitCoachingRequest(
  _prev: CoachingSubmitResult | null,
  formData: FormData
): Promise<CoachingSubmitResult> {
  const name = clean(formData.get('name'));
  const email = clean(formData.get('email')).toLowerCase();
  const phone = clean(formData.get('phone'), 60);
  const timeline = clean(formData.get('timeline'), 120);
  const message = clean(formData.get('message'), MAX_LEN);
  const honeypot = clean(formData.get('website'));

  // Honeypot: spam bots fill every field including hidden ones.
  if (honeypot) return { ok: true };

  if (!name || !email) {
    return { ok: false, error: 'Vui lòng nhập tên và email.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Email không hợp lệ.' };
  }
  if (message.length > MAX_LEN) {
    return { ok: false, error: 'Nội dung quá dài.' };
  }

  const supabase = await createClient();

  // If the user is signed in, attach their user_id so the admin grant
  // flow can skip the account-linking step.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('coaching_requests').insert({
    user_id: user?.id ?? null,
    name,
    email,
    phone: phone || null,
    timeline: timeline || null,
    message: message || null,
  });

  if (error) {
    console.error('[coaching] insert failed', error);
    return {
      ok: false,
      error:
        'Không gửi được yêu cầu. Vui lòng thử lại sau hoặc email trực tiếp cho chúng tôi.',
    };
  }

  // TODO(M7): send admin notification email via src/lib/email (ported from appspa).
  console.log('[coaching] new request from', email);

  return { ok: true };
}
