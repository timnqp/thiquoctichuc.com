'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const COACHING_MONTHS = 6;

type ActionResult = { ok: true } | { ok: false; error: string };

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

/** Simple status transitions: new ↔ contacted ↔ declined. */
export async function updateCoachingStatus(
  requestId: string,
  nextStatus: 'new' | 'contacted' | 'declined'
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: before } = await admin
    .from('coaching_requests')
    .select('status')
    .eq('id', requestId)
    .maybeSingle();

  const { error } = await admin
    .from('coaching_requests')
    .update({ status: nextStatus })
    .eq('id', requestId);

  if (error) return { ok: false, error: error.message };

  await logAudit(admin, auth.user.id, 'coaching.status_change', 'coaching_requests', requestId, {
    from: before?.status ?? null,
    to: nextStatus,
  });

  revalidatePath('/admin/coaching-requests');
  return { ok: true };
}

/**
 * Look up an existing auth user by email and attach their user_id to the
 * coaching_request so grant can proceed. Does NOT create the user — the
 * requester must sign up first.
 */
export async function attachUserByEmail(
  requestId: string,
  email: string
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { ok: false, error: 'Vui lòng nhập email.' };

  const admin = createAdminClient();

  // auth.admin.listUsers() has no filter; iterate the (small) user set.
  // At scale, replace with a DB function that SELECTs from auth.users by email.
  let found: { id: string } | null = null;
  let page = 1;
  // Cap iterations to avoid runaway for large user tables.
  for (let i = 0; i < 20 && !found; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return { ok: false, error: error.message };
    found =
      data.users.find((u) => (u.email ?? '').toLowerCase() === cleanEmail) ??
      null;
    if (!data.users.length || data.users.length < 200) break;
    page += 1;
  }

  if (!found) {
    return {
      ok: false,
      error:
        'Không tìm thấy tài khoản với email này. Hãy yêu cầu người dùng đăng ký trước.',
    };
  }

  const { error } = await admin
    .from('coaching_requests')
    .update({ user_id: found.id })
    .eq('id', requestId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin, auth.user.id, 'coaching.attach_user', 'coaching_requests', requestId, {
    user_id: found.id,
    email: cleanEmail,
  });

  revalidatePath('/admin/coaching-requests');
  return { ok: true };
}

/**
 * Mark paid & grant 6 months access. Inserts into access_grants with
 * plan='coaching' and sets request status to 'granted'.
 */
export async function grantCoachingAccess(
  requestId: string,
  note?: string
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: req, error: readErr } = await admin
    .from('coaching_requests')
    .select('id, user_id, email, status')
    .eq('id', requestId)
    .maybeSingle();

  if (readErr) return { ok: false, error: readErr.message };
  if (!req) return { ok: false, error: 'Không tìm thấy yêu cầu.' };
  if (!req.user_id) {
    return {
      ok: false,
      error:
        'Chưa liên kết tài khoản. Hãy gắn email tài khoản trước khi cấp quyền.',
    };
  }

  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + COACHING_MONTHS);

  const { data: grant, error: grantErr } = await admin
    .from('access_grants')
    .insert({
      user_id: req.user_id,
      plan: 'coaching',
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      source: 'coaching_signup',
      note: note?.trim() || `Granted from coaching request ${req.id}`,
    })
    .select('id')
    .single();
  if (grantErr) return { ok: false, error: grantErr.message };

  const { error: updateErr } = await admin
    .from('coaching_requests')
    .update({ status: 'granted' })
    .eq('id', requestId);
  if (updateErr) return { ok: false, error: updateErr.message };

  await logAudit(admin, auth.user.id, 'coaching.grant', 'coaching_requests', requestId, {
    user_id: req.user_id,
    email: req.email,
    grant_id: grant.id,
    plan: 'coaching',
    months: COACHING_MONTHS,
    expires_at: expires.toISOString(),
  });

  revalidatePath('/admin/coaching-requests');
  return { ok: true };
}
