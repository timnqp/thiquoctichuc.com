import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. SERVER-ONLY (never imported by client code).
 * Bypasses RLS — use for webhooks, admin scripts, and privileged operations.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — service-role client unavailable.'
    );
  }
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
