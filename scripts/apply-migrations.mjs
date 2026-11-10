#!/usr/bin/env node
/**
 * Apply supabase/migrations/*.sql to the remote database via Supabase CLI.
 *
 * Same pattern as appspa (psql / DATABASE_URL) and appthien (supabase db push).
 *
 * Prerequisites:
 *   - supabase CLI on PATH (brew install supabase/tap/supabase)
 *   - .env.local with DATABASE_URL (Session pooler URI from Supabase dashboard)
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:migrate -- --dry-run
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireDatabaseUrl } from './load-env-local.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const dbUrl = requireDatabaseUrl(repoRoot);

const dryRun = process.argv.includes('--dry-run');
const args = [
  'db',
  'push',
  '--db-url',
  dbUrl,
  '--workdir',
  repoRoot,
  '--yes', // non-interactive (required for agent/CI)
];
if (dryRun) args.push('--dry-run');

console.log(
  dryRun
    ? 'Dry run — migrations that would be applied:'
    : 'Applying migrations via supabase db push…'
);

const result = spawnSync('supabase', args, {
  stdio: 'inherit',
  cwd: repoRoot,
});

if (result.error) {
  console.error(result.error.message);
  console.error('Is the supabase CLI installed? (which supabase)');
  process.exit(1);
}

process.exit(result.status ?? 1);
