'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

type Ok = { ok: true };
type Fail = { ok: false; error: string };
export type AdminActionResult = Ok | Fail;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'Chưa đăng nhập.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return { ok: false as const, error: 'Không có quyền.' };
  }
  return { ok: true as const, user, supabase };
}

async function logAudit(
  admin: ReturnType<typeof createAdminClient>,
  actorId: string,
  action: string,
  targetTable: string,
  targetId: string,
  payload: Record<string, unknown>
) {
  await admin.from('audit_log').insert({
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    payload,
  });
}

/**
 * Grant an access window. Used for manual Premium or Coaching grants.
 * Months: 3 (premium default), 6 (coaching default), or arbitrary.
 */
export async function grantAccess(
  userId: string,
  plan: 'premium' | 'coaching',
  months: number,
  note?: string
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  if (!userId) return { ok: false, error: 'Thiếu user_id.' };
  if (!Number.isFinite(months) || months < 1 || months > 36) {
    return { ok: false, error: 'Số tháng không hợp lệ (1-36).' };
  }

  const admin = createAdminClient();
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + months);

  const { data, error } = await admin
    .from('access_grants')
    .insert({
      user_id: userId,
      plan,
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      source: 'manual',
      note: note?.trim() || null,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };

  await logAudit(admin, auth.user.id, 'access.grant', 'access_grants', data.id, {
    user_id: userId,
    plan,
    months,
    expires_at: expires.toISOString(),
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin');
  return { ok: true };
}

/** Revoke the user's active grant by shortening expires_at to now. */
export async function revokeCurrentAccess(
  userId: string
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  // Find the active grant(s).
  const { data: active } = await admin
    .from('access_grants')
    .select('id, expires_at')
    .eq('user_id', userId)
    .lte('starts_at', new Date().toISOString())
    .gt('expires_at', new Date().toISOString());

  if (!active || active.length === 0) {
    return { ok: false, error: 'Không có quyền đang hoạt động.' };
  }

  const nowIso = new Date().toISOString();
  // expires_at > starts_at is enforced by CHECK — push 1s past starts_at
  // if revoke happened at the exact start second (edge case).
  for (const row of active) {
    const { error } = await admin
      .from('access_grants')
      .update({ expires_at: nowIso })
      .eq('id', row.id);
    if (error) return { ok: false, error: error.message };
    await logAudit(admin, auth.user.id, 'access.revoke', 'access_grants', row.id, {
      user_id: userId,
      previous_expires_at: row.expires_at,
      new_expires_at: nowIso,
    });
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin');
  return { ok: true };
}

/** Admin-only private note on a user. */
export async function addStudentNote(
  userId: string,
  body: string
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const cleanBody = body.trim();
  if (!cleanBody) return { ok: false, error: 'Nội dung trống.' };
  if (cleanBody.length > 10000)
    return { ok: false, error: 'Ghi chú quá dài.' };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('student_notes')
    .insert({ user_id: userId, author_id: auth.user.id, body: cleanBody })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };

  await logAudit(admin, auth.user.id, 'note.add', 'student_notes', data.id, {
    user_id: userId,
  });

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function deleteStudentNote(
  noteId: string,
  userId: string
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from('student_notes').delete().eq('id', noteId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin, auth.user.id, 'note.delete', 'student_notes', noteId, {
    user_id: userId,
  });

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

/** Flip a test between free and premium (used by /admin/tests). */
export async function setTestTier(
  testId: string,
  tier: 'free' | 'premium'
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from('tests')
    .update({ tier })
    .eq('id', testId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin, auth.user.id, 'test.set_tier', 'tests', testId, { tier });

  revalidatePath('/admin/tests');
  revalidatePath('/practice');
  return { ok: true };
}
