#!/usr/bin/env node
/**
 * Run SQL against the linked Supabase Postgres (remote).
 * Uses `supabase db query` + DATABASE_URL from .env.local.
 *
 * Usage:
 *   npm run db:sql -- "select count(*) from public.tests"
 *   npm run db:sql -- --file supabase/adhoc/example.sql
 *   npm run db:sql -- -f path.sql
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireDatabaseUrl } from './load-env-local.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const dbUrl = requireDatabaseUrl(repoRoot);
const argv = process.argv.slice(2);

let filePath;
const rest = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--file' || a === '-f') {
    filePath = argv[++i];
  } else if (a.startsWith('--file=')) {
    filePath = a.slice('--file='.length);
  } else {
    rest.push(a);
  }
}

const args = ['db', 'query', '--db-url', dbUrl, '--workdir', repoRoot];

if (filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }
  args.push('--file', abs);
} else if (rest.length === 0) {
  console.error('Usage: npm run db:sql -- "<SQL>"');
  console.error('       npm run db:sql -- --file path/to/query.sql');
  process.exit(1);
} else {
  args.push(rest.join(' '));
}

const result = spawnSync('supabase', args, {
  stdio: 'inherit',
  cwd: repoRoot,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
