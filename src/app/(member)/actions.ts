'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { evaluateCitizenshipTest } from '@/citizenship/evaluateCitizenshipTest';
import type { BankQuestion } from '@/citizenship/types';

type Ok = { ok: true };
type Fail = { ok: false; error: string };
export type ActionResult = Ok | Fail;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'Chưa đăng nhập.' };
  return { ok: true as const, user, supabase };
}

/** Update the signed-in user's display_name. Trim + length cap. */
export async function updateDisplayName(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const raw = String(formData.get('display_name') ?? '').trim();
  if (raw.length > 120) {
    return { ok: false, error: 'Tên hiển thị quá dài (tối đa 120 ký tự).' };
  }

  const { error } = await auth.supabase
    .from('profiles')
    .update({ display_name: raw || null })
    .eq('id', auth.user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/account');
  return { ok: true };
}

/**
 * Record a finished attempt. Loads questions server-side (RLS gates premium),
 * scores server-side, writes the row. Returns the attempt id for the caller
 * to route to a results view (future work — for now it just confirms).
 */
export async function recordAttempt(
  testId: string,
  answers: Record<string, string>,
  timedOut: boolean
): Promise<ActionResult & { attemptId?: string }> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  // Fetch the question bank for this test. RLS will return rows only if the
  // user is entitled (or it's a free test). Admin always sees all.
  const { data: questionRows, error: qErr } = await auth.supabase
    .from('questions')
    .select(
      'id, test_id, topic, part, difficulty, question, options, correct, explain_vi, image, image_alt'
    )
    .eq('test_id', testId)
    .order('sort_order', { ascending: true });

  if (qErr) return { ok: false, error: qErr.message };
  if (!questionRows || questionRows.length === 0) {
    return {
      ok: false,
      error: 'Không truy cập được bộ câu hỏi. Có thể bạn chưa có quyền.',
    };
  }

  const questions = questionRows as unknown as BankQuestion[];
  const result = evaluateCitizenshipTest(questions, answers);

  const { data, error } = await auth.supabase
    .from('attempts')
    .insert({
      user_id: auth.user.id,
      test_id: testId,
      submitted_at: new Date().toISOString(),
      timed_out: timedOut,
      score: result.score,
      values_correct: result.valuesCorrect,
      passed: result.passed,
      answers,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  return { ok: true, attemptId: data.id };
}

/** Mark a study lesson as completed (upsert on composite PK). */
export async function recordLessonCompletion(
  lessonId: string
): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (!lessonId) return { ok: false, error: 'Thiếu lesson_id.' };

  const { error } = await auth.supabase.from('lesson_progress').upsert(
    {
      user_id: auth.user.id,
      lesson_id: lessonId,
    },
    { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * One-shot merge of anonymous localStorage into the user's DB rows.
 * Call once after sign-in.
 * - `lastResult`: optional single most-recent-free-attempt to backfill.
 * - `completedLessons`: list of lesson ids ticked anonymously.
 */
export async function mergeLocalProgress(payload: {
  lastResult?: {
    testId: string;
    answers: Record<string, string>;
    timedOut?: boolean;
  };
  completedLessons?: string[];
}): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  // Lesson progress — bulk upsert.
  const lessons = (payload.completedLessons ?? []).filter(
    (id) => typeof id === 'string' && id.length > 0
  );
  if (lessons.length > 0) {
    const { error } = await auth.supabase.from('lesson_progress').upsert(
      lessons.map((lesson_id) => ({ user_id: auth.user.id, lesson_id })),
      { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
    );
    if (error) return { ok: false, error: error.message };
  }

  // Backfill the single last-free-attempt if present.
  if (payload.lastResult?.testId) {
    const resAttempt = await recordAttempt(
      payload.lastResult.testId,
      payload.lastResult.answers ?? {},
      Boolean(payload.lastResult.timedOut)
    );
    // Non-fatal: locked tests will fail here; swallow that error.
    if (!resAttempt.ok) {
      console.warn('[mergeLocalProgress] skip attempt:', resAttempt.error);
    }
  }

  revalidatePath('/dashboard');
  return { ok: true };
}
