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

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Email hoặc mật khẩu không đúng.';
  if (m.includes('already registered') || m.includes('user already'))
    return 'Email này đã được đăng ký.';
  if (m.includes('email rate limit')) return 'Vui lòng chờ ít phút rồi thử lại.';
  return message;
}
