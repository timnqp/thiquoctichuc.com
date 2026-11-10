import fs from 'node:fs';
import path from 'node:path';

/**
 * Populate process.env from .env.local (does not override existing env vars).
 */
export function loadEnvLocal(repoRoot) {
  const envPath = path.join(repoRoot, '.env.local');
  if (!fs.existsSync(envPath)) return false;
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
  return true;
}

export function requireDatabaseUrl(repoRoot) {
  loadEnvLocal(repoRoot);
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error(
      'Missing DATABASE_URL in .env.local\n' +
        'Supabase → Project Settings → Database → Connection string → URI (Session mode).\n' +
        'Use the pooler host (IPv4). URL-encode special characters in the password.'
    );
    process.exit(1);
  }
  return dbUrl;
}
