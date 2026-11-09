'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

function safeNext(value: FormDataEntryValue | null): string {
  const v = typeof value === 'string' ? value : '';
  if (!v.startsWith('/') || v.startsWith('//')) return '/dashboard';
  return v;
}

export type AuthActionResult = { ok: false; error: string };

export async function signInAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));

  if (!email || !password) {
    return { ok: false, error: 'Vui lòng nhập email và mật khẩu.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: translateAuthError(error.message) };
  }

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUpAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('display_name') ?? '').trim();
  const next = safeNext(formData.get('next'));

  if (!email || !password) {
    return { ok: false, error: 'Vui lòng nhập email và mật khẩu.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  }

  const supabase = await createClient();
  const origin = process.env.APP_URL || '';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || null },
      emailRedirectTo: origin ? `${origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined,
    },
  });

  if (error) {
    return { ok: false, error: translateAuthError(error.message) };
  }

  // If email confirmations are OFF in Supabase, session is already set → go to dashboard.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect(next);
  }

  // Otherwise send user to a "check your email" state.
  redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Send a password recovery email. Supabase emails a magic link that lands
 * on /auth/callback?code=…&next=/auth/reset-password; the callback exchanges
 * the code and redirects into the reset form with a live session.
 *
 * Always returns ok to avoid leaking which emails exist.
 */
export async function requestPasswordResetAction(
  _prev: AuthActionResult | { ok: true } | null,
  formData: FormData
): Promise<AuthActionResult | { ok: true }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'Vui lòng nhập email.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Email không hợp lệ.' };
  }

  const supabase = await createClient();
  const origin = process.env.APP_URL || '';
  const redirectTo = origin
    ? `${origin}/auth/callback?next=${encodeURIComponent('/auth/reset-password')}`
    : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    // Swallow unknown-email errors; return generic ok for privacy.
    console.warn('[requestPasswordReset] non-fatal:', error.message);
  }

  return { ok: true };
}

/**
 * Update the signed-in user's password. The recovery link in the email lands
 * the user on /auth/reset-password with an active recovery session, so this
 * just calls updateUser.
 */
export async function updatePasswordAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) {
    return { ok: false, error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  }
  if (password !== confirm) {
    return { ok: false, error: 'Mật khẩu nhập lại không khớp.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error:
        'Phiên đặt lại mật khẩu đã hết hạn. Hãy yêu cầu email khôi phục lại.',
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, error: translateAuthError(error.message) };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Email hoặc mật khẩu không đúng.';
  if (m.includes('already registered') || m.includes('user already'))
    return 'Email này đã được đăng ký.';
  if (m.includes('email rate limit')) return 'Vui lòng chờ ít phút rồi thử lại.';
  return message;
}
