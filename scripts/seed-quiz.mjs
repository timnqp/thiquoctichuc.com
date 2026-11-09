#!/usr/bin/env node
/**
 * Seed Supabase `tests` + `questions` from content/citizenship/quiz-bank.json.
 *
 * Idempotent (upserts on primary key). Safe to re-run after content edits.
 *
 * Free-tier rule (locked in plan/v2-premium.md §1):
 *   first 2 basic + first 2 advanced tests (by order in JSON) are `tier='free'`,
 *   the rest are `tier='premium'`.
 *
 * Usage:
 *   npm run seed-quiz
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Tiny .env.local loader so this works on Node 18+ without a dotenv dep.
function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const bankPath = path.join(
  repoRoot,
  'content',
  'citizenship',
  'quiz-bank.json'
);
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

// Assign tier: first 2 basic + first 2 advanced → free, rest → premium.
let basicSeen = 0;
let advancedSeen = 0;
const FREE_PER_DIFFICULTY = 2;

const testRows = bank.tests.map((test, index) => {
  let tier = 'premium';
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
    sort_order: index,
  };
});

const questionRows = [];
for (const test of bank.tests) {
  test.questions.forEach((q, qIndex) => {
    questionRows.push({
      id: q.id,
      test_id: test.id,
      topic: q.topic,
      part: q.part,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correct: q.correct,
      explain_vi: q.explain_vi ?? null,
      image: q.image ?? null,
      image_alt: q.image_alt ?? null,
      sort_order: qIndex,
    });
  });
}

console.log(
  `Seeding ${testRows.length} tests (${testRows.filter((t) => t.tier === 'free').length} free, ${testRows.filter((t) => t.tier === 'premium').length} premium) and ${questionRows.length} questions…`
);

async function upsertInBatches(table, rows, batchSize = 200) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, {
      onConflict: 'id',
    });
    if (error) {
      console.error(`Failed to upsert into ${table}:`, error);
      process.exit(1);
    }
  }
}

await upsertInBatches('tests', testRows);
console.log('  ✓ tests upserted');

await upsertInBatches('questions', questionRows);
console.log('  ✓ questions upserted');

console.log('Done.');
