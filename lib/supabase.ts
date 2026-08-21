import { createClient } from '@supabase/supabase-js';

// Same env/process.env dual-read pattern the old lib/firebase.ts used, so
// this module works both under Vite (browser) and plain Node/tsx (test
// scripts), where import.meta.env is never populated.
function envVar(name: string): string | undefined {
  return (import.meta as { env?: Record<string, string> }).env?.[name] ?? process.env[name];
}

const supabaseUrl = envVar('VITE_SUPABASE_URL');
const supabaseAnonKey = envVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set — see .env.example.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
