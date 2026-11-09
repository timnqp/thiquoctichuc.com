import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { BankQuestion } from '@/citizenship/types';

import { PremiumRunner } from './runner';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PremiumTestRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the test metadata to check tier.
  const { data: test, error: testErr } = await supabase
    .from('tests')
    .select('id, title, tier')
    .eq('id', id)
    .maybeSingle();

  if (testErr) {
    return <ErrorShell message={testErr.message} />;
  }
  if (!test) notFound();

  // Free tests live on the public /practice flow — don't duplicate here.
  if (test.tier === 'free') {
    redirect('/practice');
  }

  // Attempt to load questions. RLS returns rows only if user is entitled
  // (or test is free). If empty → treat as locked and bounce to pricing.
  const { data: questionRows, error: qErr } = await supabase
    .from('questions')
    .select(
      'id, test_id, topic, part, difficulty, question, options, correct, explain_vi, image, image_alt'
    )
    .eq('test_id', id)
    .order('sort_order', { ascending: true });

  if (qErr) return <ErrorShell message={qErr.message} />;
  if (!questionRows || questionRows.length === 0) {
    redirect(`/pricing?from=${encodeURIComponent(id)}`);
  }

  const questions = questionRows as unknown as BankQuestion[];

  return <PremiumRunner testId={id} questions={questions} />;
}

function ErrorShell({ message }: { message: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Đề thi thử</h1>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {message}
      </div>
      <Link href="/dashboard/tests" className="text-orange-600 underline">
        ← Danh sách đề
      </Link>
    </div>
  );
}
