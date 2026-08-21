import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service-role key, which bypasses
 * Row Level Security entirely — the Postgres equivalent of the Firebase
 * Admin SDK's privileged access. Used by server.ts for the Moodoor API
 * routes. Never import this from client code (components/pages/services
 * that ship to the browser) — the service-role key must never reach it.
 */
export function createSupabaseAdminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — see .env.example.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
