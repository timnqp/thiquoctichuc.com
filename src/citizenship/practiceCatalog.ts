/**
 * Server-side loader for the practice test catalog.
 *
 * Reads from Supabase when env vars are present (post-M2 seeding);
 * falls back to the local quiz-bank.json so dev + builds stay green
 * before the database is seeded.
 *
 * Only metadata is returned — question bodies are fetched elsewhere.
 */
import { createClient } from '@supabase/supabase-js';

import { quizBank } from './quizBank';

export type PracticeTestSummary = {
  id: string;
  title: string;
  difficulty: 'basic' | 'advanced';
  tier: 'free' | 'premium';
};

// Mirror of the seeder's free-tier rule: first 2 basic + first 2 advanced.
const FREE_PER_DIFFICULTY = 2;

function fromLocalBank(): PracticeTestSummary[] {
  let basicSeen = 0;
  let advancedSeen = 0;
  return quizBank.tests.map((test) => {
    let tier: 'free' | 'premium' = 'premium';
    if (test.difficulty === 'basic') {
      if (basicSeen < FREE_PER_DIFFICULTY) tier = 'free';
      basicSeen += 1;
    } else if (test.difficulty === 'advanced') {
      if (advancedSeen < FREE_PER_DIFFICULTY) tier = 'free';
      advancedSeen += 1;
    }
    return {
      id: test.id,
      title: test.title,
      difficulty: test.difficulty,
      tier,
    };
  });
}

export async function loadPracticeCatalog(): Promise<PracticeTestSummary[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return fromLocalBank();
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('tests')
      .select('id, title, difficulty, tier, sort_order')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn(
        '[practiceCatalog] Supabase fetch failed, falling back to local bank:',
        error.message
      );
      return fromLocalBank();
    }
    if (!data || data.length === 0) {
      // Table exists but is unseeded — fall back so the page is still useful.
      return fromLocalBank();
    }
    return data.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      difficulty: row.difficulty as 'basic' | 'advanced',
      tier: row.tier as 'free' | 'premium',
    }));
  } catch (err) {
    console.warn(
      '[practiceCatalog] Unexpected error, falling back to local bank:',
      err
    );
    return fromLocalBank();
  }
}
